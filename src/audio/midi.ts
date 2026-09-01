/**
 * 편곡된 음악 이벤트를 표준 MIDI 파일(Type 1) 바이트로 변환한다.
 * 드럼·베이스·신스·코드를 별도 트랙에 기록하고 스윙, 미세 타이밍, 확률 게이트, 뮤트, 에너지를 반영하며,
 * 파일 생성은 순수 계산으로 끝내고 사용자가 내보내기를 요청한 경우에만 다운로드 부작용을 일으킨다.
 */
import {
  arrangementBlockMutesTrack,
  arrangementEnergyGain,
  arrangementTotalBars,
  chordEventShouldPlay,
  chordPitches,
  drumStepShouldPlay,
  drumStepTimingMs,
  drumStepVelocity,
  hatRepeatCount,
  noteEventShouldPlay,
  normalizeArrangementBars,
  normalizePatternEventCollections,
  normalizePatternEventLength,
  normalizeProjectPitch,
  projectBpm,
  projectFileStem,
  projectKey,
  projectPitchMidiNumber,
  projectStepDurationSeconds,
  projectSwingOffsetSteps,
  stepsPerBar
} from "../domain/workstation";
import type { ArrangementBlock, ArrangementMuteTrack, DrumLane, ProjectState } from "../domain/workstation";
import { downloadBlob } from "../platform/downloads";

const ticksPerQuarter = 480;
// GrooveForge의 한 스텝은 16분음표이므로 4분음표 tick의 1/4을 사용한다.
const ticksPerStep = ticksPerQuarter / 4;
// General MIDI에서 채널 번호는 0부터 세므로 9가 일반적으로 쓰이는 10번 드럼 채널이다.
const drumChannel = 9;

type MidiTrackEvent = {
  tick: number;
  order: number;
  bytes: number[];
};

type MidiTrack = {
  channel: number;
  name: string;
  program?: number;
  events: MidiTrackEvent[];
};

const drumNotes: Record<DrumLane, number> = {
  kick: 36,
  clap: 39,
  hat: 42,
  perc: 75
};

function arrangementBarCount(project: ProjectState): number {
  return Math.max(1, arrangementTotalBars(project));
}

function arrangementBlockForBar(project: ProjectState, bar: number): ArrangementBlock | undefined {
  let cursor = 0;
  for (const block of project.arrangement) {
    const blockBars = normalizeArrangementBars(block.bars);
    if (bar < cursor + blockBars) {
      return block;
    }
    cursor += blockBars;
  }
  return project.arrangement.at(-1);
}

function trackMuted(block: ArrangementBlock | undefined, track: ArrangementMuteTrack): boolean {
  return block ? arrangementBlockMutesTrack(block, track) : false;
}

function noteNameToMidi(note: string): number | null {
  return projectPitchMidiNumber(normalizeProjectPitch(note));
}

function clampMidiNote(note: number): number {
  return Math.max(0, Math.min(127, Math.round(note)));
}

function midiVelocity(value: number): number {
  return Math.max(1, Math.min(127, Math.round(value * 127)));
}

function timingMsToTicks(project: ProjectState, timingMs: number): number {
  // 프로젝트 BPM에 따라 같은 밀리초 오프셋이 차지하는 MIDI tick 수가 달라진다.
  const secondsPerTick = projectStepDurationSeconds(project) / ticksPerStep;
  return Math.round((timingMs / 1000) / secondsPerTick);
}

function addNote(track: MidiTrack, tick: number, durationTicks: number, midiNote: number, velocity: number): void {
  const start = Math.max(0, Math.round(tick));
  const end = Math.max(start + 1, Math.round(start + durationTicks));
  const note = clampMidiNote(midiNote);
  const channel = track.channel & 0x0f;
  // 같은 tick에서 기존 음의 Note Off(order 0)가 새 Note On(order 1)보다 먼저 정렬되어 겹친 음이 붙지 않게 한다.
  track.events.push({ tick: start, order: 1, bytes: [0x90 + channel, note, midiVelocity(velocity)] });
  track.events.push({ tick: end, order: 0, bytes: [0x80 + channel, note, 0] });
}

function writeVarLength(value: number): number[] {
  // MIDI delta time은 7비트 단위 가변 길이 값이며 마지막 바이트를 제외한 앞 바이트에 continuation bit를 세운다.
  let buffer = Math.max(0, Math.round(value)) & 0x7f;
  const bytes = [buffer];
  let remaining = Math.max(0, Math.round(value)) >> 7;
  while (remaining > 0) {
    buffer = (remaining & 0x7f) | 0x80;
    bytes.unshift(buffer);
    remaining >>= 7;
  }
  return bytes;
}

function textBytes(text: string): number[] {
  return Array.from(text, (char) => char.charCodeAt(0) & 0x7f);
}

function numberToBytes(value: number, length: number): number[] {
  return Array.from({ length }, (_, index) => (value >> ((length - index - 1) * 8)) & 0xff);
}

function stringBytes(value: string): number[] {
  return Array.from(value, (char) => char.charCodeAt(0));
}

function trackNameEvent(name: string): number[] {
  const bytes = textBytes(name);
  return [0xff, 0x03, ...writeVarLength(bytes.length), ...bytes];
}

function metaTextEvent(text: string): number[] {
  const bytes = textBytes(text);
  return [0xff, 0x01, ...writeVarLength(bytes.length), ...bytes];
}

function encodeTrack(name: string, events: MidiTrackEvent[], endTick: number, program?: number, channel = 0): number[] {
  // 절대 tick으로 수집한 이벤트를 정렬한 뒤 앞 이벤트와의 차이(delta time)로 변환한다.
  const ordered = [
    { tick: 0, order: -2, bytes: trackNameEvent(name) },
    ...(program === undefined ? [] : [{ tick: 0, order: -1, bytes: [0xc0 + (channel & 0x0f), program] }]),
    ...events
  ].sort((first, second) => first.tick - second.tick || first.order - second.order);

  const bytes: number[] = [];
  let previousTick = 0;
  for (const event of ordered) {
    const tick = Math.max(0, Math.min(endTick, event.tick));
    bytes.push(...writeVarLength(tick - previousTick), ...event.bytes);
    previousTick = tick;
  }
  bytes.push(...writeVarLength(Math.max(0, endTick - previousTick)), 0xff, 0x2f, 0x00);
  return [...stringBytes("MTrk"), ...numberToBytes(bytes.length, 4), ...bytes];
}

function encodeTempoTrack(project: ProjectState, endTick: number): number[] {
  // MIDI 템포 메타 이벤트는 4분음표당 마이크로초 단위다. 4/4 박자와 키는 별도 메타 이벤트로 남긴다.
  const tempo = Math.round(60_000_000 / projectBpm(project));
  const events: MidiTrackEvent[] = [
    { tick: 0, order: -1, bytes: [0xff, 0x51, 0x03, ...numberToBytes(tempo, 3)] },
    { tick: 0, order: 0, bytes: [0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08] },
    { tick: 0, order: 1, bytes: metaTextEvent(`Key: ${projectKey(project)}`) }
  ];
  return encodeTrack("GrooveForge Tempo", events, endTick);
}

function createTracks(): Record<"drums" | "bass" | "synth" | "chords", MidiTrack> {
  return {
    drums: { name: "GrooveForge Drums", channel: drumChannel, events: [] },
    bass: { name: "GrooveForge Bass", channel: 0, program: 38, events: [] },
    synth: { name: "GrooveForge Synth", channel: 1, program: 80, events: [] },
    chords: { name: "GrooveForge Chords", channel: 2, program: 88, events: [] }
  };
}

export function createMidiFile(project: ProjectState): Uint8Array {
  const bars = arrangementBarCount(project);
  const totalTicks = bars * stepsPerBar * ticksPerStep;
  const tracks = createTracks();
  const normalizedPatterns = {
    A: normalizePatternEventCollections(project.patterns.A),
    B: normalizePatternEventCollections(project.patterns.B),
    C: normalizePatternEventCollections(project.patterns.C)
  };

  for (let bar = 0; bar < bars; bar += 1) {
    // 각 마디가 속한 편곡 블록을 찾아 Pattern, 에너지, 트랙 뮤트를 그 마디의 모든 MIDI 이벤트에 적용한다.
    const block = arrangementBlockForBar(project, bar);
    const pattern = normalizedPatterns[block?.pattern ?? project.selectedPattern];
    const energy = block ? arrangementEnergyGain(block.energy) : 1;
    const barTick = bar * stepsPerBar * ticksPerStep;
    const barStepOffset = bar * stepsPerBar;

    if (!trackMuted(block, "drum_rack")) {
      for (const lane of Object.keys(drumNotes) as DrumLane[]) {
        for (let step = 0; step < stepsPerBar; step += 1) {
          const absoluteStep = barStepOffset + step;
          if (!drumStepShouldPlay(pattern, lane, step, absoluteStep)) {
            continue;
          }
          const repeatCount = lane === "hat" ? hatRepeatCount(pattern, step) : 1;
          const baseTick =
            barTick +
            step * ticksPerStep +
            projectSwingOffsetSteps(project, absoluteStep) * ticksPerStep +
            timingMsToTicks(project, drumStepTimingMs(pattern, lane, step));
          const velocity = drumStepVelocity(pattern, lane, step) * energy;
          // 하이햇 롤은 한 스텝 안을 균등 분할하고 후속 타격을 낮춰 한 번의 강한 타격처럼 들리지 않게 한다.
          for (let repeat = 0; repeat < repeatCount; repeat += 1) {
            addNote(
              tracks.drums,
              baseTick + (repeat * ticksPerStep) / repeatCount,
              Math.max(12, ticksPerStep / Math.max(2, repeatCount)),
              drumNotes[lane],
              velocity * (repeat === 0 ? 1 : 0.72)
            );
          }
        }
      }
    }

    if (!trackMuted(block, "bass_808")) {
      for (const note of pattern.bassNotes) {
        const absoluteStep = barStepOffset + note.step;
        const midiNote = noteNameToMidi(note.pitch);
        if (midiNote === null || !noteEventShouldPlay("bass", note, absoluteStep)) {
          continue;
        }
        addNote(
          tracks.bass,
          barTick + note.step * ticksPerStep + projectSwingOffsetSteps(project, absoluteStep) * ticksPerStep,
          normalizePatternEventLength(note.length, note.step) * ticksPerStep,
          midiNote,
          note.velocity * energy
        );
      }
    }

    if (!trackMuted(block, "synth")) {
      for (const note of pattern.melodyNotes) {
        const absoluteStep = barStepOffset + note.step;
        const midiNote = noteNameToMidi(note.pitch);
        if (midiNote === null || !noteEventShouldPlay("melody", note, absoluteStep)) {
          continue;
        }
        addNote(
          tracks.synth,
          barTick + note.step * ticksPerStep + projectSwingOffsetSteps(project, absoluteStep) * ticksPerStep,
          normalizePatternEventLength(note.length, note.step) * ticksPerStep,
          midiNote,
          note.velocity * energy
        );
      }
    }

    if (!trackMuted(block, "chord")) {
      for (const chord of pattern.chordEvents) {
        const absoluteStep = barStepOffset + chord.step;
        if (!chordEventShouldPlay(chord, absoluteStep)) {
          continue;
        }
        for (const pitch of chordPitches(chord)) {
          const midiNote = noteNameToMidi(pitch);
          if (midiNote !== null) {
            addNote(
              tracks.chords,
              barTick + chord.step * ticksPerStep + projectSwingOffsetSteps(project, absoluteStep) * ticksPerStep,
              normalizePatternEventLength(chord.length, chord.step) * ticksPerStep,
              midiNote,
              chord.velocity * energy
            );
          }
        }
      }
    }
  }

  const trackChunks = [
    encodeTempoTrack(project, totalTicks),
    encodeTrack(tracks.drums.name, tracks.drums.events, totalTicks, tracks.drums.program, tracks.drums.channel),
    encodeTrack(tracks.bass.name, tracks.bass.events, totalTicks, tracks.bass.program, tracks.bass.channel),
    encodeTrack(tracks.synth.name, tracks.synth.events, totalTicks, tracks.synth.program, tracks.synth.channel),
    encodeTrack(tracks.chords.name, tracks.chords.events, totalTicks, tracks.chords.program, tracks.chords.channel)
  ];
  const header = [
    // Type 1은 템포 트랙과 악기 트랙을 독립 청크로 유지해 DAW에서 편집하기 쉽다.
    ...stringBytes("MThd"),
    ...numberToBytes(6, 4),
    ...numberToBytes(1, 2),
    ...numberToBytes(trackChunks.length, 2),
    ...numberToBytes(ticksPerQuarter, 2)
  ];
  return new Uint8Array([...header, ...trackChunks.flat()]);
}

export function midiFileName(project: ProjectState): string {
  return `${projectFileStem(project)}-arrangement.mid`;
}

export function exportMidi(project: ProjectState): string {
  const bytes = createMidiFile(project);
  const payload = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(payload).set(bytes);
  const blob = new Blob([payload], { type: "audio/midi" });
  const fileName = midiFileName(project);
  // 생성과 다운로드를 분리해 테스트에서는 createMidiFile의 바이트만 검증할 수 있다.
  downloadBlob(blob, fileName);
  return fileName;
}
