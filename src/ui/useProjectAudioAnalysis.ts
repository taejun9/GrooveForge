/**
 * 현재 프로젝트의 정확 오디오 분석을 Web Worker에서 실행하고 pending/ready/error 상태를 React에 제공한다.
 * 프로젝트 정체성, 요청 id, 재시도 세대를 함께 추적해 빠른 편집 중 도착한 오래된 응답을 버리고 최근 정확 결과를 캐시한다.
 * Worker 생성·종료와 startTransition 커밋이 주요 부수효과이며, 근사 분석은 정확 결과가 준비될 때까지만 안전한 자리표시자로 쓴다.
 */
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProjectState } from "../domain/workstation";
import {
  analyzeProjectAudio,
  pendingProjectAudioAnalysis,
  projectAudioAnalysisIdentity,
  shouldHoldProjectAudioAnalysisCommit,
  shouldAcceptProjectAudioAnalysisResponse
} from "../audio/projectAudioAnalysis";
import type { ProjectAudioAnalysis } from "../audio/projectAudioAnalysis";

type AnalysisWorkerResponse = {
  id: number;
  identity: string;
  analysis: ProjectAudioAnalysis;
};

type AnalysisSnapshot = {
  identity: string;
  analysis: ProjectAudioAnalysis;
  exact: boolean;
};

type AnalysisFailure = {
  id: number;
  identity: string;
  message: string;
};

type AnalysisRetryRequest = {
  identity: string;
  generation: number;
};

type InFlightAnalysisRequest = {
  id: number;
  identity: string;
  worker: Worker;
};

export type ProjectAudioAnalysisStatus = "pending" | "ready" | "error";

export type ProjectAudioAnalysisState = ProjectAudioAnalysis & {
  error: string | null;
  identity: string;
  pending: boolean;
  retry: () => void;
  status: ProjectAudioAnalysisStatus;
};

export function shouldAcceptProjectAudioAnalysisFailure(
  failureId: number,
  currentRequestId: number,
  failureIdentity: string,
  currentIdentity: string
): boolean {
  return shouldAcceptProjectAudioAnalysisResponse(
    failureId,
    currentRequestId,
    failureIdentity,
    currentIdentity
  );
}

export function projectAudioAnalysisStatus(
  snapshotIdentity: string,
  snapshotExact: boolean,
  currentIdentity: string,
  failureIdentity: string | null
): ProjectAudioAnalysisStatus {
  if (snapshotExact && snapshotIdentity === currentIdentity) {
    return "ready";
  }
  return failureIdentity === currentIdentity ? "error" : "pending";
}

function canAnalyzeOffMainThread(): boolean {
  return typeof Worker !== "undefined";
}

function analysisCommitTargetTestId(target: EventTarget | null): string | null {
  return target instanceof HTMLElement ? target.closest<HTMLElement>("[data-testid]")?.dataset.testid ?? null : null;
}

/**
 * 첫 화면 이후 정확한 오프라인 렌더 미터 계산을 렌더러 스레드 밖에서 유지한다.
 * 새 오디오 정체성을 분석하는 동안 이전 정확 스냅샷을 유지해 편집·탭·접기/펼치기 컨트롤이 여러 마디 PCM 렌더를 기다리지 않게 한다.
 * 음악 신호에 영향을 주지 않는 메타데이터 편집은 분석 작업을 새로 등록하지 않는다.
 */
export function useProjectAudioAnalysis(
  project: ProjectState,
  commitEnabled: boolean
): ProjectAudioAnalysisState {
  const identity = useMemo(() => projectAudioAnalysisIdentity(project), [project]);
  const workerRef = useRef<Worker | null>(null);
  const inFlightRequestRef = useRef<InFlightAnalysisRequest | null>(null);
  const deferredResponseRef = useRef<AnalysisWorkerResponse | null>(null);
  const requestIdRef = useRef(0);
  const consumedRetryGenerationRef = useRef(0);
  const projectRef = useRef(project);
  projectRef.current = project;
  const commitEnabledRef = useRef(commitEnabled);
  commitEnabledRef.current = commitEnabled;
  const latestIdentityRef = useRef(identity);
  latestIdentityRef.current = identity;
  const [snapshot, setSnapshot] = useState<AnalysisSnapshot>(() => ({
    identity,
    analysis: canAnalyzeOffMainThread()
      ? pendingProjectAudioAnalysis(project)
      : analyzeProjectAudio(project),
    exact: !canAnalyzeOffMainThread()
  }));
  const [failure, setFailure] = useState<AnalysisFailure | null>(null);
  const [retryRequest, setRetryRequest] = useState<AnalysisRetryRequest>({
    identity,
    generation: 0
  });

  const commitExactResponse = (response: AnalysisWorkerResponse): void => {
    startTransition(() => {
      if (!shouldAcceptProjectAudioAnalysisResponse(
        response.id,
        requestIdRef.current,
        response.identity,
        latestIdentityRef.current
      )) {
        return;
      }
      setFailure((current) => current?.identity === response.identity ? null : current);
      setSnapshot({ identity: response.identity, analysis: response.analysis, exact: true });
    });
  };

  const commitAnalysisFailure = (
    failedRequestId: number,
    failedIdentity: string,
    failedWorker: Worker | null,
    message: string
  ): void => {
    if (!shouldAcceptProjectAudioAnalysisFailure(
      failedRequestId,
      requestIdRef.current,
      failedIdentity,
      latestIdentityRef.current
    )) {
      return;
    }
    const inFlight = inFlightRequestRef.current;
    if (failedWorker && inFlight?.worker !== failedWorker) {
      return;
    }
    if (!failedWorker || workerRef.current === failedWorker) {
      inFlightRequestRef.current = null;
      workerRef.current = null;
      failedWorker?.terminate();
    }
    deferredResponseRef.current = null;
    startTransition(() => {
      if (!shouldAcceptProjectAudioAnalysisFailure(
        failedRequestId,
        requestIdRef.current,
        failedIdentity,
        latestIdentityRef.current
      )) {
        return;
      }
      setFailure({ id: failedRequestId, identity: failedIdentity, message });
    });
  };

  const retry = useCallback(() => {
    const retryIdentity = latestIdentityRef.current;
    deferredResponseRef.current = null;
    setFailure((current) => current?.identity === retryIdentity ? null : current);
    setRetryRequest((current) => ({
      identity: retryIdentity,
      generation: current.generation + 1
    }));
  }, []);

  useEffect(() => {
    if (!canAnalyzeOffMainThread()) {
      if (snapshot.identity !== identity) {
        setSnapshot({ identity, analysis: analyzeProjectAudio(projectRef.current), exact: true });
      }
      return;
    }

    // 새 음악 정체성이 생기면 메타데이터 입력 포커스가 남아 있어도 보류 중인 이전 정확 응답부터 폐기한다.
    if (deferredResponseRef.current?.identity !== identity) {
      deferredResponseRef.current = null;
    }

    const retryForced =
      retryRequest.identity === identity &&
      retryRequest.generation > consumedRetryGenerationRef.current;

    // Compose/Arrange에서는 오프라인 PCM 계산과 React 커밋을 함께 미뤄 편집 반응성을 지킨다.
    // 명시적인 재시도만 이를 우회하며 Mix/Deliver도 항상 최신 음악 정체성만 요청한다.
    if (!commitEnabled && !retryForced) {
      const inFlight = inFlightRequestRef.current;
      if (workerRef.current && inFlight) {
        requestIdRef.current += 1;
        workerRef.current.terminate();
        workerRef.current = null;
        inFlightRequestRef.current = null;
      }
      return;
    }

    if (
      !retryForced &&
      (
        deferredResponseRef.current?.identity === identity ||
        (snapshot.identity === identity && snapshot.exact)
      )
    ) {
      return;
    }
    if (retryForced) {
      consumedRetryGenerationRef.current = retryRequest.generation;
    }

    let worker = workerRef.current;
    // 새 음악 편집은 진행 중인 미터 작업만 대체한다. 유휴 Worker는 재사용해 매 편집마다 모듈을 다시 시작하지 않는다.
    if (worker && inFlightRequestRef.current) {
      requestIdRef.current += 1;
      worker.terminate();
      workerRef.current = null;
      inFlightRequestRef.current = null;
      worker = null;
    }

    const requestId = ++requestIdRef.current;
    if (!worker) {
      try {
        worker = new Worker(new URL("../audio/projectAudioAnalysisWorker.ts", import.meta.url), {
          name: "grooveforge-project-audio-analysis",
          type: "module"
        });
      } catch (error) {
        commitAnalysisFailure(
          requestId,
          identity,
          null,
          error instanceof Error ? error.message : String(error)
        );
        return;
      }
      const createdWorker = worker;
      workerRef.current = createdWorker;
      createdWorker.onmessage = (event: MessageEvent<AnalysisWorkerResponse>) => {
        const response = event.data;
        const inFlight = inFlightRequestRef.current;
        if (
          !response ||
          typeof response.id !== "number" ||
          typeof response.identity !== "string" ||
          !response.analysis
        ) {
          if (inFlight?.worker === createdWorker) {
            commitAnalysisFailure(
              inFlight.id,
              inFlight.identity,
              createdWorker,
              "Audio analysis worker returned an unreadable response."
            );
          }
          return;
        }
        if (response.id === inFlight?.id && inFlight.worker === createdWorker) {
          inFlightRequestRef.current = null;
        }
        if (!shouldAcceptProjectAudioAnalysisResponse(
          response.id,
          requestIdRef.current,
          response.identity,
          latestIdentityRef.current
        )) {
          return;
        }
        const activeTestId = analysisCommitTargetTestId(document.activeElement);
        if (!commitEnabledRef.current || shouldHoldProjectAudioAnalysisCommit(activeTestId)) {
          deferredResponseRef.current = response;
          return;
        }
        // 정확 미터는 많은 진단 요약을 바꾸므로 커밋을 중단 가능한 전환으로 둔다.
        // 사용 중 Worker가 끝나도 네이티브 텍스트·탭·재생 컨트롤 입력이 우선한다.
        commitExactResponse(response);
      };
      createdWorker.onerror = (event) => {
        event.preventDefault();
        const inFlight = inFlightRequestRef.current;
        if (inFlight?.worker !== createdWorker) {
          return;
        }
        commitAnalysisFailure(
          inFlight.id,
          inFlight.identity,
          createdWorker,
          event.message || "Audio analysis worker failed."
        );
      };
      createdWorker.onmessageerror = () => {
        const inFlight = inFlightRequestRef.current;
        if (inFlight?.worker !== createdWorker) {
          return;
        }
        commitAnalysisFailure(
          inFlight.id,
          inFlight.identity,
          createdWorker,
          "Audio analysis worker returned an unreadable response."
        );
      };
    }
    inFlightRequestRef.current = { id: requestId, identity, worker };
    setFailure((current) => current?.identity === identity ? null : current);
    try {
      worker.postMessage({ id: requestId, identity, project: projectRef.current });
    } catch (error) {
      commitAnalysisFailure(
        requestId,
        identity,
        worker,
        error instanceof Error ? error.message : String(error)
      );
    }
  }, [identity, commitEnabled, retryRequest.generation, retryRequest.identity]);

  useEffect(() => {
    const releaseDeferredResponse = (event: FocusEvent): void => {
      const response = deferredResponseRef.current;
      if (
        !commitEnabledRef.current ||
        !response ||
        shouldHoldProjectAudioAnalysisCommit(analysisCommitTargetTestId(event.relatedTarget))
      ) {
        return;
      }
      deferredResponseRef.current = null;
      commitExactResponse(response);
    };
    document.addEventListener("focusout", releaseDeferredResponse);
    return () => document.removeEventListener("focusout", releaseDeferredResponse);
  }, []);

  useEffect(() => {
    if (
      !commitEnabled ||
      shouldHoldProjectAudioAnalysisCommit(analysisCommitTargetTestId(document.activeElement))
    ) {
      return;
    }
    const response = deferredResponseRef.current;
    if (!response) {
      return;
    }
    deferredResponseRef.current = null;
    commitExactResponse(response);
  }, [commitEnabled]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      inFlightRequestRef.current = null;
      deferredResponseRef.current = null;
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    []
  );

  const status = projectAudioAnalysisStatus(
    snapshot.identity,
    snapshot.exact,
    identity,
    failure?.identity ?? null
  );

  return {
    ...snapshot.analysis,
    error: status === "error" ? failure?.message ?? "Audio analysis failed." : null,
    identity,
    pending: status !== "ready",
    retry,
    status
  };
}
