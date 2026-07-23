import {
  createStylePatternSet,
  getStyle,
  patternSlots,
  soundPresetDesign,
  soundPresetLabel,
  styleProfiles,
  styleSoundPreset,
  type PatternData,
  type PatternSlot,
  type ProjectState,
  type StyleId
} from "../domain/workstation";

export type StyleChangePatternPreview = {
  slot: PatternSlot;
  beforeEvents: number;
  afterEvents: number;
};

export type StyleChangePreview = {
  currentStyleId: StyleId;
  currentStyleName: string;
  targetStyleId: StyleId;
  targetStyleName: string;
  currentBpm: number;
  targetBpm: number;
  currentSwingPercent: number;
  targetSwingPercent: number;
  currentSoundLabel: string;
  targetSoundLabel: string;
  selectedPatternBefore: PatternSlot;
  patterns: StyleChangePatternPreview[];
  beforeEventTotal: number;
  afterEventTotal: number;
};

function patternEventCount(pattern: PatternData): number {
  const drumEvents = Object.values(pattern.drumPattern).reduce(
    (total, lane) => total + lane.filter(Boolean).length,
    0
  );
  return drumEvents + pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length;
}

function styleSwingPercent(swing: number): number {
  return Math.round(swing * 100);
}

export function createStyleChangePreview(
  project: ProjectState,
  styleId: StyleId
): StyleChangePreview | null {
  const targetStyle = styleProfiles.find((candidate) => candidate.id === styleId);
  if (!targetStyle) {
    return null;
  }

  const currentStyle = getStyle(project);
  const targetPatterns = createStylePatternSet(styleId, project.key);
  const patterns = patternSlots.map((slot) => ({
    slot,
    beforeEvents: patternEventCount(project.patterns[slot]),
    afterEvents: patternEventCount(targetPatterns[slot])
  }));

  return {
    currentStyleId: project.styleId,
    currentStyleName: currentStyle.name,
    targetStyleId: styleId,
    targetStyleName: targetStyle.name,
    currentBpm: project.bpm,
    targetBpm: targetStyle.defaultBpm,
    currentSwingPercent: styleSwingPercent(project.swing),
    targetSwingPercent: styleSwingPercent(targetStyle.defaultSwing),
    currentSoundLabel: soundPresetLabel(project.sound.preset),
    targetSoundLabel: soundPresetLabel(styleSoundPreset(styleId)),
    selectedPatternBefore: project.selectedPattern,
    patterns,
    beforeEventTotal: patterns.reduce((total, pattern) => total + pattern.beforeEvents, 0),
    afterEventTotal: patterns.reduce((total, pattern) => total + pattern.afterEvents, 0)
  };
}

export function applyStyleChange(project: ProjectState, styleId: StyleId): ProjectState {
  const targetStyle = styleProfiles.find((candidate) => candidate.id === styleId);
  if (!targetStyle) {
    return project;
  }

  const soundPreset = styleSoundPreset(styleId);
  return {
    ...project,
    styleId,
    selectedPattern: "A",
    bpm: targetStyle.defaultBpm,
    swing: targetStyle.defaultSwing,
    sound: soundPresetDesign(soundPreset),
    patterns: createStylePatternSet(styleId, project.key)
  };
}
