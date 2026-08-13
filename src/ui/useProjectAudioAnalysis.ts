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
 * Keeps exact offline-render meters off the renderer thread after first paint.
 * The previous exact snapshot remains visible while a new audio identity is
 * analyzed, so project editing, tabs, and disclosure controls never wait for a
 * multi-bar PCM render. Non-audio project edits do not enqueue analysis at all.
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

    // A new identity makes any held exact response obsolete before the next
    // request is posted, even if focus has not left its metadata editor yet.
    if (deferredResponseRef.current?.identity !== identity) {
      deferredResponseRef.current = null;
    }

    const retryForced =
      retryRequest.identity === identity &&
      retryRequest.generation > consumedRetryGenerationRef.current;

    // Compose and Arrange keep the renderer responsive by postponing offline
    // PCM work as well as its React commit. A deliberate Retry is the only
    // override; Mix/Deliver otherwise request only the latest musical identity.
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
    // A newer musical edit supersedes only an in-flight meter job. An idle
    // worker is warm and safe to reuse, avoiding module startup on every edit.
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
        // Exact meters can invalidate many diagnostic summaries. Keep their
        // commit interruptible so native text, tabs, and playback controls win
        // if the worker finishes while the user is interacting.
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
