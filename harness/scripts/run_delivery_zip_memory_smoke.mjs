#!/usr/bin/env node
/**
 * 역할: 긴 오디오 전달 ZIP 생성 시 전체 파일 크기의 불필요한 JavaScript 버퍼 복사가 되돌아오지 않게 검사한다.
 * 흐름: 기존 ZIP의 고정 바이트 해시·부분 배열·공유 메모리·Blob 스냅샷을 확인하고 큰 합성 입력의 명시적 할당을 계측한다.
 * 안전 경계: 합성 메모리만 사용하며 실제 사용자 오디오·파일 저장·네트워크·앱 실행은 사용하지 않는다.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createStoredZip } from "../../src/audio/deliveryBundle.ts";

const backing = new Uint8Array([99, 1, 2, 3, 88]);
const entries = [
  { path: "서울/beat.wav", bytes: backing.subarray(1, 4) },
  { path: "서울/empty.txt", bytes: new Uint8Array() },
  { path: "서울/info.txt", bytes: new TextEncoder().encode("직접 만든 비트\n") }
];
const originalHash = "85a8c4aa788aeeb91ee4cb24e637476d630068603b68646a6b5a6fd8f43239ba";
const zip = createStoredZip(entries);
backing.fill(0);
assert.equal(zip.type, "application/zip");
assert.equal(zip.size, 366);
assert.equal(createHash("sha256").update(new Uint8Array(await zip.arrayBuffer())).digest("hex"), originalHash);

const shared = new Uint8Array(new SharedArrayBuffer(5));
shared.set([99, 1, 2, 3, 88]);
const sharedZip = createStoredZip([{ ...entries[0], bytes: shared.subarray(1, 4) }, ...entries.slice(1)]);
shared.fill(0);
assert.equal(createHash("sha256").update(new Uint8Array(await sharedZip.arrayBuffer())).digest("hex"), originalHash);

const audio = new Uint8Array(16 * 1024 * 1024);
audio[0] = 1;
audio[audio.length - 1] = 2;
const OriginalUint8Array = globalThis.Uint8Array;
let largestExplicitAllocation = 0;
let longZip;
try {
  // 실제 생성 함수의 새 버퍼 할당을 관측한다. 기존 버퍼의 byteOffset view는 새 메모리를 할당하지 않는다.
  globalThis.Uint8Array = new Proxy(OriginalUint8Array, {
    construct(target, args) {
      if (typeof args[0] === "number") {
        largestExplicitAllocation = Math.max(largestExplicitAllocation, args[0]);
      } else if (ArrayBuffer.isView(args[0])) {
        largestExplicitAllocation = Math.max(largestExplicitAllocation, args[0].byteLength);
      }
      return Reflect.construct(target, args);
    }
  });
  longZip = createStoredZip([{ path: "long/full-mix.wav", bytes: audio }]);
} finally {
  globalThis.Uint8Array = OriginalUint8Array;
}
assert.ok(longZip.size > audio.length);
assert.ok(largestExplicitAllocation < 64 * 1024, `ZIP assembly allocated an unnecessary ${largestExplicitAllocation}-byte JavaScript buffer`);
console.log("GrooveForge delivery ZIP memory smoke passed: byte-identical ZIP, immutable subarray/shared snapshots, and no full-audio-size assembly buffers.");
