/// <reference lib="webworker" />

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
  self.postMessage({ id, identity, analysis: analyzeProjectAudio(project) });
};

export {};
