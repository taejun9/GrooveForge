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
  const legacyFrameCount = Math.floor(original.length / drumSampleRate * drumSampleRate);
  assert.equal(importWavSample(source,"Same rate.wav").pcm,createDrumSample(original.subarray(0,legacyFrameCount),"Same rate.wav").pcm,"Same-rate samples must preserve the pre-resampling PCM conversion");
}
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
