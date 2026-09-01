/// <reference lib="webworker" />

/**
 * 무거운 오프라인 PCM 분석을 렌더러 메인 스레드 밖에서 실행하는 전용 Web Worker 진입점이다.
 * 요청의 id와 identity를 결과에 그대로 돌려보내 UI가 오래된 응답을 폐기할 수 있게 하며,
 * 프로젝트를 분석하는 것 외에는 저장·다운로드·네트워크 부작용을 만들지 않는다.
 */
import type { ProjectState } from "../domain/workstation";
import { analyzeProjectAudio } from "./projectAudioAnalysis";

type AnalysisRequest = {
  id: number;
  identity: string;
  project: ProjectState;
};

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<AnalysisRequest>) => {
  const { id, identity, project } = event.data;
  // structured clone으로 받은 프로젝트를 순수 분석한 뒤 상관관계 키와 함께 한 번만 응답한다.
  self.postMessage({ id, identity, analysis: analyzeProjectAudio(project) });
};

// 전역 스크립트로 합쳐지는 것을 막아 Worker 전용 선언이 다른 번들과 충돌하지 않게 한다.
export {};
