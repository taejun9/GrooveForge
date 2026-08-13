import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import type { ProjectSnapshot, ProjectState } from "../domain/workstation";
import {
  projectAudioAnalysisIdentity,
  shouldAcceptProjectAudioAnalysisResponse
} from "../audio/projectAudioAnalysis";
import type { ProjectAudioAnalysis } from "../audio/projectAudioAnalysis";

type SavedSnapshotAnalysisWorkerResponse = {
  id: number;
  identity: string;
  analysis: ProjectAudioAnalysis;
};

export type SavedSnapshotAudioAnalysisStatus = "idle" | "pending" | "ready" | "error";

export type SavedSnapshotAudioAnalysisEntry = {
  identity: string;
  status: SavedSnapshotAudioAnalysisStatus;
  analysis: ProjectAudioAnalysis | null;
  error: string | null;
};

export type SavedSnapshotAudioAnalysisSeed = {
  identity: string;
  analysis: ProjectAudioAnalysis;
  exact: boolean;
};

export type SavedSnapshotAudioAnalysisTask = {
  identity: string;
  project: ProjectState;
};

export type SavedSnapshotAudioAnalysesState = {
  byIdentity: Readonly<Record<string, SavedSnapshotAudioAnalysisEntry>>;
  pending: boolean;
};

const savedSnapshotAnalysisCacheLimit = 24;
const savedSnapshotAnalysisCache = new Map<string, ProjectAudioAnalysis>();

function rememberSavedSnapshotAnalysis(identity: string, analysis: ProjectAudioAnalysis): void {
  savedSnapshotAnalysisCache.delete(identity);
  savedSnapshotAnalysisCache.set(identity, analysis);
  while (savedSnapshotAnalysisCache.size > savedSnapshotAnalysisCacheLimit) {
    const oldestIdentity = savedSnapshotAnalysisCache.keys().next().value;
    if (typeof oldestIdentity !== "string") {
      break;
    }
    savedSnapshotAnalysisCache.delete(oldestIdentity);
  }
}

export function createSavedSnapshotAudioAnalysisTasks(
  snapshots: readonly ProjectSnapshot[]
): SavedSnapshotAudioAnalysisTask[] {
  const tasks = new Map<string, SavedSnapshotAudioAnalysisTask>();
  snapshots.forEach((snapshot) => {
    const project: ProjectState = {
      ...snapshot.project,
      snapshots: []
    };
    const identity = projectAudioAnalysisIdentity(project);
    if (!tasks.has(identity)) {
      tasks.set(identity, { identity, project });
    }
  });
  return [...tasks.values()];
}

export function shouldAcceptSavedSnapshotAudioAnalysisResponse(
  responseId: number,
  currentRequestId: number,
  responseIdentity: string,
  expectedIdentity: string,
  responseRunId: number,
  currentRunId: number
): boolean {
  return (
    responseRunId === currentRunId &&
    shouldAcceptProjectAudioAnalysisResponse(
      responseId,
      currentRequestId,
      responseIdentity,
      expectedIdentity
    )
  );
}

/**
 * Analyzes saved Project Snapshot PCM away from React's renderer thread.
 *
 * Snapshot slots are grouped and cached by the same audio identity as the
 * current-project meter worker, so names, dates, delivery notes, selected
 * Pattern posture, and other metadata never enqueue duplicate PCM work. The
 * queue is deliberately sequential and only active while Snapshot Compare is
 * visible; closing the Guide terminates the current worker immediately.
 */
export function useSavedSnapshotAudioAnalyses(
  snapshots: readonly ProjectSnapshot[],
  enabled: boolean,
  seed: SavedSnapshotAudioAnalysisSeed | null = null
): SavedSnapshotAudioAnalysesState {
  const tasks = useMemo(() => createSavedSnapshotAudioAnalysisTasks(snapshots), [snapshots]);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const runIdRef = useRef(0);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const [entries, setEntries] = useState<Record<string, SavedSnapshotAudioAnalysisEntry>>({});

  const byIdentity = useMemo(() => {
    const nextEntries: Record<string, SavedSnapshotAudioAnalysisEntry> = {};
    tasks.forEach((task) => {
      if (seed?.exact && seed.identity === task.identity) {
        nextEntries[task.identity] = {
          identity: task.identity,
          status: "ready",
          analysis: seed.analysis,
          error: null
        };
        return;
      }
      const cached = savedSnapshotAnalysisCache.get(task.identity);
      if (cached) {
        nextEntries[task.identity] = {
          identity: task.identity,
          status: "ready",
          analysis: cached,
          error: null
        };
        return;
      }
      const entry = entries[task.identity];
      nextEntries[task.identity] = entry ?? {
        identity: task.identity,
        status: enabled ? "pending" : "idle",
        analysis: null,
        error: null
      };
    });
    return nextEntries;
  }, [enabled, entries, seed, tasks]);

  useEffect(() => {
    const runId = ++runIdRef.current;
    requestIdRef.current += 1;
    workerRef.current?.terminate();
    workerRef.current = null;

    if (!enabled || typeof Worker === "undefined") {
      if (enabled && typeof Worker === "undefined") {
        const unavailableEntries = Object.fromEntries(
          tasksRef.current.map((task) => [
            task.identity,
            {
              identity: task.identity,
              status: "error" as const,
              analysis: null,
              error: "Local audio analysis worker is unavailable."
            }
          ])
        );
        setEntries((current) => ({ ...current, ...unavailableEntries }));
      }
      return;
    }

    if (seed?.exact) {
      rememberSavedSnapshotAnalysis(seed.identity, seed.analysis);
    }

    const queuedTasks = tasksRef.current.filter(
      (task) => task.identity !== (seed?.exact ? seed.identity : null) && !savedSnapshotAnalysisCache.has(task.identity)
    );
    if (queuedTasks.length === 0) {
      return;
    }

    setEntries((current) => {
      const next = { ...current };
      queuedTasks.forEach((task) => {
        next[task.identity] = {
          identity: task.identity,
          status: "pending",
          analysis: null,
          error: null
        };
      });
      return next;
    });

    let canceled = false;

    const runNext = (taskIndex: number): void => {
      if (canceled || runId !== runIdRef.current || taskIndex >= queuedTasks.length) {
        return;
      }

      const task = queuedTasks[taskIndex];
      const requestId = ++requestIdRef.current;
      let worker: Worker;
      try {
        worker = new Worker(new URL("../audio/projectAudioAnalysisWorker.ts", import.meta.url), {
          name: "grooveforge-saved-snapshot-audio-analysis",
          type: "module"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setEntries((current) => ({
          ...current,
          [task.identity]: {
            identity: task.identity,
            status: "error",
            analysis: null,
            error: message
          }
        }));
        runNext(taskIndex + 1);
        return;
      }

      workerRef.current = worker;
      let settled = false;
      const finish = (
        status: "ready" | "error",
        analysis: ProjectAudioAnalysis | null,
        error: string | null
      ): void => {
        if (settled) {
          return;
        }
        settled = true;
        worker.terminate();
        if (workerRef.current === worker) {
          workerRef.current = null;
        }
        if (canceled || runId !== runIdRef.current) {
          return;
        }
        if (status === "ready" && analysis) {
          rememberSavedSnapshotAnalysis(task.identity, analysis);
        }
        startTransition(() => {
          if (canceled || runId !== runIdRef.current) {
            return;
          }
          setEntries((current) => ({
            ...current,
            [task.identity]: {
              identity: task.identity,
              status,
              analysis,
              error
            }
          }));
        });
        runNext(taskIndex + 1);
      };

      worker.onmessage = (event: MessageEvent<SavedSnapshotAnalysisWorkerResponse>) => {
        const response = event.data;
        if (!shouldAcceptSavedSnapshotAudioAnalysisResponse(
          response.id,
          requestIdRef.current,
          response.identity,
          task.identity,
          runId,
          runIdRef.current
        )) {
          return;
        }
        finish("ready", response.analysis, null);
      };
      worker.onerror = (event) => {
        event.preventDefault();
        finish("error", null, event.message || "Saved snapshot audio analysis failed.");
      };
      worker.onmessageerror = () => {
        finish("error", null, "Saved snapshot audio analysis returned an unreadable response.");
      };

      try {
        worker.postMessage({ id: requestId, identity: task.identity, project: task.project });
      } catch (error) {
        finish("error", null, error instanceof Error ? error.message : String(error));
      }
    };

    runNext(0);

    return () => {
      canceled = true;
      runIdRef.current += 1;
      requestIdRef.current += 1;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [enabled, seed?.analysis, seed?.exact, seed?.identity, tasks]);

  useEffect(
    () => () => {
      runIdRef.current += 1;
      requestIdRef.current += 1;
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    []
  );

  return {
    byIdentity,
    pending: enabled && Object.values(byIdentity).some((entry) => entry.status === "pending")
  };
}
