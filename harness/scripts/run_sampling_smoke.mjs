#!/usr/bin/env node
/**
 * 원샷 가져오기·프로젝트 저장·스냅샷·실시간 예약·결정적 WAV를 함께 검증한다.
 * 짧은 원본 합성 fixture만 사용하며 네트워크나 설치 앱은 실행하지 않는다.
 */
import assert from "node:assert/strict";
import { runSamplingActivityLifecycleSmoke } from "./run_sampling_activity_smoke.mjs";
import { createHash } from "node:crypto";
import { importWavSample, readWavSample } from "../../src/audio/sampleImport.ts";
import { createDrumSample, decodedDrumSample, drumSampleRate, maxDrumSampleFrames, replaceDrumSample } from "../../src/domain/sampling.ts";
import { parseProjectFile, serializeProjectFile, starterProject, saveProjectSnapshot, restoreProjectSnapshot } from "../../src/domain/workstation.ts";
import { createMixWavBlob, createStemWavBlob, analyzeExport, analyzeProjectExports } from "../../src/audio/render.ts";
import { analyzeProjectAudio, projectAudioAnalysisIdentity } from "../../src/audio/projectAudioAnalysis.ts";
import { createSavedSnapshotAudioAnalysisTasks } from "../../src/ui/useSavedSnapshotAudioAnalyses.ts";
import { playEditorAudition, startRealtimePlayback } from "../../src/audio/scheduler.ts";
import { createSoundCloudUploadSheet } from "../../src/audio/soundcloud.ts";

function fixture(seconds = 0.2, rate = 44100) {
  const frames = Math.round(seconds * rate), bytes = new ArrayBuffer(44 + frames * 2), view = new DataView(bytes);
  const text = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  text(0,"RIFF"); view.setUint32(4, bytes.byteLength - 8, true); text(8,"WAVE"); text(12,"fmt ");
  view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true); view.setUint32(24,rate,true);
  view.setUint32(28,rate*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true); text(36,"data"); view.setUint32(40,frames*2,true);
  for (let i=0;i<frames;i++) view.setInt16(44+i*2,Math.round(Math.sin(i/rate*Math.PI*2*730)*Math.exp(-i/frames*4)*18000),true);
  return bytes;
}
// 리샘플러 내부 구현 대신 실제 WAV의 통과 대역과 접힘 대역 PCM 진폭을 측정한다.
function toneWav(rate, frequency, seconds = 0.2, channels = 1, float = true) {
  const frames = Math.round(rate * seconds), width = float ? 4 : 2;
  const bytes = new ArrayBuffer(44 + frames * channels * width), view = new DataView(bytes);
  const text = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  text(0,"RIFF"); view.setUint32(4,bytes.byteLength-8,true); text(8,"WAVE"); text(12,"fmt ");
  view.setUint32(16,16,true); view.setUint16(20,float ? 3 : 1,true); view.setUint16(22,channels,true); view.setUint32(24,rate,true);
  view.setUint32(28,rate*channels*width,true); view.setUint16(32,channels*width,true); view.setUint16(34,width*8,true);
  text(36,"data"); view.setUint32(40,frames*channels*width,true);
  for (let frame=0;frame<frames;frame++) for (let channel=0;channel<channels;channel++) {
    const value = 0.5 * Math.sin(2 * Math.PI * frequency * frame / rate);
    const offset = 44 + (frame * channels + channel) * width;
    if (float) view.setFloat32(offset,value,true); else view.setInt16(offset,Math.round(value*32767),true);
  }
  return bytes;
}
function interiorAmplitude(sample) {
  const data = decodedDrumSample(sample), edge = Math.round(drumSampleRate * 0.02);
  let squares = 0;
  for (let index=edge;index<data.length-edge;index++) squares += data[index] ** 2;
  return Math.sqrt(2 * squares / (data.length - edge * 2));
}
const resamplingEvidence = { passband: [], stopband: [], sameRatePcmUnchanged: true, allFloatFramesValidated: true, performance: [] };
for (const rate of [44100,48000,192000]) {
  for (const frequency of [1000,8000]) {
    const imported = importWavSample(toneWav(rate,frequency),"Passband.wav");
    const amplitude = interiorAmplitude(imported), relativeDb = 20 * Math.log10(amplitude / 0.5);
    assert(Math.abs(relativeDb) < 0.05, `${rate}Hz/${frequency}Hz passband gain changed by ${relativeDb}dB`);
    resamplingEvidence.passband.push({ rate, frequency, amplitude, relativeDb });
  }
  for (const frequency of (rate === 192000 ? [12000,18000,22000,50000,80000] : [12000,18000,22000])) {
    const imported = importWavSample(toneWav(rate,frequency),"Stopband.wav");
    const amplitude = interiorAmplitude(imported);
    assert(amplitude < 0.5 * 10 ** (-60 / 20), `${rate}Hz/${frequency}Hz alias remains above -60dB: ${amplitude}`);
    const aliasHz = Math.abs((frequency + drumSampleRate / 2) % drumSampleRate - drumSampleRate / 2);
    resamplingEvidence.stopband.push({ rate, frequency, aliasHz, amplitude, attenuationDb: 20 * Math.log10(Math.max(amplitude,1/32768) / 0.5), belowOnePcmLsb: amplitude < 1/32768 });
  }
}
for (const float of [false,true]) for (const channels of [1,2]) for (const frames of [225,227,4410]) {
  const source = toneWav(drumSampleRate,8000,frames / drumSampleRate,channels,float), view = new DataView(source), width = float ? 4 : 2;
  const original = new Float32Array((source.byteLength-44) / width / channels);
  for (let frame=0;frame<original.length;frame++) for (let channel=0;channel<channels;channel++) {
    const offset = 44 + (frame*channels+channel)*width;
    original[frame] += (float ? view.getFloat32(offset,true) : view.getInt16(offset,true)/32768) / channels;
  }
  const imported = importWavSample(source,"Same rate.wav");
  assert.equal(imported.frames,original.length,"Same-rate import must preserve every original frame");
  assert.equal(imported.pcm,createDrumSample(original,"Same rate.wav").pcm,"Same-rate samples must preserve the PCM conversion");
}
// 안내에 표시한 10ms 최소 길이는 지원하는 모든 rate에서 가져와야 하며 한 프레임 짧으면 거절한다.
for (const rate of [8000,22050,44100,48000,191999,192000]) {
  const frames = Math.ceil(rate * 0.01);
  const imported = importWavSample(fixture(frames / rate,rate),"Minimum length.wav");
  assert.equal(imported.frames,Math.round(frames * drumSampleRate / rate));
  assert.throws(()=>importWavSample(fixture((frames - 1) / rate,rate),"Too short.wav"),/0.01–2/);
}
// RIFF 전체 크기가 맞아도 마지막 청크 헤더나 홀수 청크 패딩이 잘리면 손상된 파일이다.
for (const tailLength of [1,7,9]) {
  const valid = fixture(), malformed = new Uint8Array(valid.byteLength + tailLength);
  malformed.set(new Uint8Array(valid));
  const view = new DataView(malformed.buffer);
  view.setUint32(4,malformed.byteLength - 8,true);
  if (tailLength === 9) {
    malformed.set(new TextEncoder().encode("JUNK"),valid.byteLength);
    view.setUint32(valid.byteLength + 4,1,true);
  }
  assert.throws(()=>importWavSample(malformed.buffer,"Truncated chunk.wav"),/chunk is truncated/);
}
const paddedSource = fixture(), paddedChunk = new Uint8Array(paddedSource.byteLength + 10);
paddedChunk.set(new Uint8Array(paddedSource));
paddedChunk.set(new TextEncoder().encode("JUNK"),paddedSource.byteLength);
new DataView(paddedChunk.buffer).setUint32(4,paddedChunk.byteLength - 8,true);
new DataView(paddedChunk.buffer).setUint32(paddedSource.byteLength + 4,1,true);
assert.equal(importWavSample(paddedChunk.buffer,"Padded chunk.wav").pcm,importWavSample(paddedSource,"Plain.wav").pcm);
for (const badValue of [NaN,Infinity,-Infinity]) {
  const source = toneWav(192000,1000,0.2,2), view = new DataView(source);
  // 기존 선형 변환의 첫 출력은 입력 0·1번만 읽고 다음 출력은 8·9번부터 읽어 이 위치를 놓쳤다.
  view.setFloat32(44 + (4 * 2 + 1) * 4,badValue,true);
  assert.throws(()=>importWavSample(source,"Hidden invalid frame.wav"),/non-finite/);
}
for (const rate of [192000,191999]) {
  const source = toneWav(rate,1000,2), before = performance.now();
  const imported = importWavSample(source,"Maximum bounded import.wav");
  const elapsedMs = performance.now() - before;
  assert.equal(imported.frames,maxDrumSampleFrames);
  assert(elapsedMs < 1500, `${rate}Hz/2sec import blocked for ${elapsedMs}ms`);
  assert(Math.abs(20 * Math.log10(interiorAmplitude(imported)/0.5)) < 0.05);
  resamplingEvidence.performance.push({ rate, seconds: 2, sourceBytes: source.byteLength, elapsedMs });
}
const sample = importWavSample(fixture(), "/private/audio/Original.wav");
assert.equal(sample.sourceName,"Original.wav"); assert.equal(sample.frames,4410);
assert(decodedDrumSample(sample).some((value)=>Math.abs(value)>0.1));
assert.throws(()=>importWavSample(fixture(2.01),"long.wav"), /0.01–2/);
assert.throws(()=>importWavSample(new ArrayBuffer(44),"invalid.wav"), /valid uncompressed/);
let read = false;
await assert.rejects(readWavSample({size:2_000_001,name:"big.wav",arrayBuffer:async()=>{read=true;return fixture();}}),/2 MB/);
assert.equal(read,false);
const maximum = createDrumSample(new Float32Array(maxDrumSampleFrames),"full.wav");
assert.throws(()=>replaceDrumSample({kick:maximum},"hat",sample),/2 seconds in total/);
const base = structuredClone(starterProject); base.arrangement=[{section:"Verse",pattern:"A",energy:0.8,bars:1,mutedTracks:[]}]; base.snapshots=[];
const sampled = {...base,drumSamples:{perc:sample}};
sampled.patterns.A.drumPattern.perc[0]=true;
// 원샷에 음성이나 외부 저작물이 포함될 수 있으므로 업로드 초안이 원곡·연주곡임을 추정하지 않는다.
const sampleFreeUploadSheet = createSoundCloudUploadSheet(starterProject);
assert.equal(createHash("sha256").update(sampleFreeUploadSheet).digest("hex"),"32fe58eaef480ff70e159e6308e9cb1809fbf5ff30e95abdf00c86b522fe3cb7","Sample-free upload metadata must remain byte-identical");
for (const drumSamples of [undefined,{}, {perc:undefined}, {perc:{}}]) {
  assert.equal(createSoundCloudUploadSheet({...starterProject,drumSamples}),sampleFreeUploadSheet,"Empty or stale sample banks must not label synthesis-only projects as sampled");
}
for (const lane of ["kick","clap","hat","perc"]) {
  const sheet = createSoundCloudUploadSheet({...base,drumSamples:{[lane]:sample}});
  const tags = sheet.split("\n").find((line)=>line.startsWith("- Tags (English):"));
  assert.match(tags,/Sample-based/);
  assert.doesNotMatch(tags,/\bOriginal\b|\bInstrumental\b/);
  assert.match(sheet,/sample-based track at/);
  assert.match(sheet,/imported audio samples/);
  assert.doesNotMatch(sheet,/original instrumental|built-in synthesis\./);
  assert(!sheet.includes(sample.sourceName),"Upload draft must not expose imported source filenames");
  assert(sheet.includes("Initial privacy: Private") && sheet.includes("Downloads: Off"));
}
const customBriefSheet = createSoundCloudUploadSheet({...sampled,sessionBrief:{...sampled.sessionBrief,vibe:"Late-night texture",notes:"User-provided production credits."}});
assert(customBriefSheet.includes("Mood: Late-night texture") && customBriefSheet.includes("User-provided production credits."),"Explicit user brief metadata must remain intact for sampled projects");
const serialized=serializeProjectFile(sampled), reopened=parseProjectFile(serialized);
assert.deepEqual(reopened.drumSamples,sampled.drumSamples);
assert.equal(sampled.drumSamples.perc.trimStart,0);
const repaired=parseProjectFile(JSON.stringify({...sampled,drumSamples:{perc:{...sample,trimStart:-20,trimEnd:300,gainDb:300}}}));
assert.equal(repaired.drumSamples.perc.trimStart,0); assert.equal(repaired.drumSamples.perc.trimEnd,0.2); assert.equal(repaired.drumSamples.perc.gainDb,6);
assert.throws(()=>parseProjectFile(JSON.stringify({...sampled,drumSamples:{perc:{...sample,pcm:"bad"}}})),/Invalid/);
let snapshots={...base,drumSamples:{perc:maximum}};
for(let index=0;index<6;index++) snapshots=saveProjectSnapshot(snapshots,`Sample ${index}`);
assert.equal(snapshots.snapshots.length,6);
const snapshotText=serializeProjectFile(snapshots);
assert(snapshotText.length<1_500_000);
assert(JSON.stringify({version:1,savedAt:new Date().toISOString(),contents:snapshotText}).length<1_500_000);
assert.equal(parseProjectFile(snapshotText).snapshots[0].project.drumSamples.perc.pcm,maximum.pcm);
const restored=restoreProjectSnapshot({...sampled,drumSamples:undefined,snapshots:snapshots.snapshots},snapshots.snapshots[0].id);
assert.equal(restored.drumSamples.perc.pcm,maximum.pcm);
// 샘플만 바뀌어도 실제 미터 캐시와 저장 스냅샷 작업의 정체성이 갱신되어야 한다.
const identity = projectAudioAnalysisIdentity;
assert.notEqual(identity(base), identity(sampled), "Sample import must invalidate audio analysis identity");
const trimmed = {...sampled,drumSamples:{perc:{...sample,trimStart:0.05,trimEnd:0.15}}};
const gained = {...sampled,drumSamples:{perc:{...sample,gainDb:-12}}};
const renamed = {...sampled,drumSamples:{perc:{...sample,sourceName:"Renamed.wav"}}};
assert.notEqual(identity(sampled),identity(trimmed)); assert.notEqual(identity(sampled),identity(gained));
assert.equal(identity(sampled),identity(renamed));
assert.equal(identity(base),identity({...sampled,drumSamples:undefined}));
const baseAnalysis = analyzeProjectAudio(base), sampledAnalysis = analyzeProjectAudio(sampled);
assert.notStrictEqual(baseAnalysis,sampledAnalysis);
assert.strictEqual(sampledAnalysis,analyzeProjectAudio(renamed));
assert.notStrictEqual(sampledAnalysis,analyzeProjectAudio(trimmed));
assert.notStrictEqual(analyzeProjectAudio(trimmed),analyzeProjectAudio(gained));
assert.deepEqual(analyzeProjectAudio({...sampled,drumSamples:undefined}),baseAnalysis);
const sampleSnapshotTasks = createSavedSnapshotAudioAnalysisTasks([
  {id:"original",name:"Original",createdAt:"2026-09-18",project:sampled},
  {id:"trimmed",name:"Trimmed",createdAt:"2026-09-18",project:trimmed},
  {id:"renamed",name:"Renamed",createdAt:"2026-09-18",project:renamed}
]);
assert.equal(sampleSnapshotTasks.length,2,"Snapshot analysis must separate sample edits and reuse source-name-only edits");
const bytes = async (project)=>Buffer.from(await createMixWavBlob(project).arrayBuffer());
const hash = (value)=>createHash("sha256").update(value).digest("hex");
const originalBytes=await bytes(base), sampledBytes=await bytes(sampled);
assert.equal(hash(originalBytes),"2f9ab6b4ddd40e759ecb58392021d45c600e3d2e4cb97eb34de08a0280fd0a0e","Sample-free renderer PCM must retain its pre-resampler fingerprint");
assert.notEqual(hash(originalBytes),hash(sampledBytes));
assert.equal(hash(sampledBytes),hash(await bytes(reopened)));
assert.equal(hash(sampledBytes),hash(await bytes(sampled)));
assert.equal(hash(originalBytes),hash(await bytes({...sampled,drumSamples:replaceDrumSample(sampled.drumSamples,"perc")})));
assert.notEqual(hash(sampledBytes),hash(await bytes({...sampled,drumSamples:{perc:{...sample,trimStart:0.05,trimEnd:0.15,gainDb:-12}}})));
const bassA=Buffer.from(await createStemWavBlob(base,"bass_808").arrayBuffer()),bassB=Buffer.from(await createStemWavBlob(sampled,"bass_808").arrayBuffer());
assert.deepEqual(bassA,bassB);
assert.deepEqual(analyzeProjectExports(sampled),analyzeProjectExports(sampled,{forceBoundedSequential:true}));
assert.equal(analyzeExport(sampled).status==="Silent",false);
// 실제 AudioContext 대신 연결과 시작 노드를 기록해 합성음 대신 PCM 원샷을 예약했는지 확인한다.
const sources=[];
const param=()=>({setValueAtTime(){},setTargetAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}});
const node=()=>({connect(next){return next;},gain:param(),frequency:param(),Q:param(),pan:param(),delayTime:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),start(){},stop(){}});
class AudioContextMock {
  currentTime=0; sampleRate=44100; destination=node();
  resume(){return Promise.resolve();} close(){return Promise.resolve();}
  createGain(){return node();} createDelay(){return node();} createBiquadFilter(){return node();} createWaveShaper(){return node();} createStereoPanner(){return node();} createDynamicsCompressor(){return node();} createOscillator(){return node();}
  createBuffer(channels,frames,rate){const data=new Float32Array(frames);return {length:frames,sampleRate:rate,getChannelData(){return data;}};}
  createBufferSource(){const source={...node(),buffer:null,start(time){sources.push({time,buffer:this.buffer});}};return source;}
}
globalThis.window={AudioContext:AudioContextMock,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){}};
const controller=playEditorAudition(sampled,{kind:"drum",lane:"perc",step:0});
assert(sources.some((source)=>source.buffer?.sampleRate===drumSampleRate&&source.buffer.getChannelData(0).some((value)=>Math.abs(value)>0.1)));
controller.stop();
sources.length=0; startRealtimePlayback(sampled,{mode:"pattern"}).stop();
assert(sources.some((source)=>source.buffer?.sampleRate===drumSampleRate));
const lifecycle = await runSamplingActivityLifecycleSmoke();
console.log(JSON.stringify({status:"passed",lifecycle,resamplingEvidence,importedFrames:sample.frames,maxSampleSnapshotProjectCharacters:snapshotText.length,sampledWavSha256:hash(sampledBytes),snapshotCount:6,realtimeSampleScheduled:true},null,2));
