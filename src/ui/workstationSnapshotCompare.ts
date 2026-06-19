import type { ProjectSnapshot, ProjectState } from "../domain/workstation";
import { maxProjectSnapshots } from "../domain/workstation";
import type {
  MixCoachTone,
  SnapshotCompareCard,
  SnapshotCompareFocusId,
  SnapshotCompareFocusItem,
  SnapshotCompareFocusResult,
  SnapshotCompareFocusSummary,
  SnapshotCompareMetric,
  SnapshotCompareMetricId,
  SnapshotCompareSummary
} from "./workstationUiModel";
import { snapshotCompareFocusItems } from "./workstationUiModel";

export type SnapshotCompareProjectProfile = {
  setup: string;
  targetName: string;
  bars: number;
  length: string;
  readyCount: number;
  readiness: string;
  readinessTone: MixCoachTone;
  exportStatus: string;
  exportDetail: string;
  exportTone: MixCoachTone;
  stemCount: number;
  stemGoal: number;
  stems: string;
  stemTone: MixCoachTone;
  master: string;
  masterDetail: string;
};

type CreateSnapshotCompareProjectProfile = (project: ProjectState) => SnapshotCompareProjectProfile;

export function createSnapshotCompareSummary(
  project: ProjectState,
  createProjectProfile: CreateSnapshotCompareProjectProfile
): SnapshotCompareSummary {
  const current = createProjectProfile(project);

  if (project.snapshots.length === 0) {
    return {
      headline: "No saved takes yet",
      detail: `${current.setup} / ${current.length} / ${current.targetName}`,
      tone: "warn",
      cards: []
    };
  }

  const cards = project.snapshots.map((snapshot) => createSnapshotCompareCard(current, snapshot, createProjectProfile));
  const tone = weakestSnapshotCompareTone(cards.map((card) => card.tone));

  return {
    headline: `${project.snapshots.length} saved take${project.snapshots.length === 1 ? "" : "s"} to compare`,
    detail: `${project.snapshots.length}/${maxProjectSnapshots} slots / current ${current.length} / ${current.targetName}`,
    tone,
    cards
  };
}

export function createSnapshotCompareFocusSummary(
  summary: SnapshotCompareSummary,
  focusedMetricId: SnapshotCompareFocusId | null
): SnapshotCompareFocusSummary {
  const items = snapshotCompareFocusItems(summary);
  const focusedItem = focusedMetricId ? items.find((item) => item.focusId === focusedMetricId) ?? null : null;
  const item = focusedItem ?? items.find((candidate) => candidate.tone !== "good") ?? items[0] ?? null;

  if (!item) {
    return {
      focusId: null,
      statusLabel: "Compare empty",
      areaLabel: "No saved take focus",
      detailLabel: "Save a Project Snapshot before comparing versions",
      detailTitle: "Snapshot Compare has no focusable saved takes yet.",
      tone: "warn"
    };
  }

  const statusLabel = focusedItem ? "Focused Compare" : "Compare Focus";
  const detailLabel = `${item.focusLabel} panel / ${item.detail}`;

  return {
    focusId: item.focusId,
    statusLabel,
    areaLabel: `${item.cardName} ${item.label}: ${item.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${item.cardName} / ${item.label}: ${item.value} / ${detailLabel}`,
    tone: item.tone
  };
}

export function activeSnapshotCompareQuickActionItem(summary: SnapshotCompareSummary): SnapshotCompareFocusItem | null {
  const items = snapshotCompareFocusItems(summary);
  return items.find((item) => item.tone !== "good") ?? items[0] ?? null;
}

export function snapshotCompareDirectMetricItems(summary: SnapshotCompareSummary): SnapshotCompareFocusItem[] {
  const items = snapshotCompareFocusItems(summary);

  return snapshotCompareMetricOrder.flatMap((metricId) => {
    const matchingItems = items.filter((item) => item.metricId === metricId);
    const item = matchingItems.find((candidate) => candidate.tone !== "good") ?? matchingItems[0] ?? null;
    return item ? [item] : [];
  });
}

export function createSnapshotCompareFocusResult(
  item: SnapshotCompareFocusItem,
  summary: SnapshotCompareSummary
): SnapshotCompareFocusResult {
  const summaryItem = snapshotCompareFocusItems(summary).find((candidate) => candidate.focusId === item.focusId) ?? null;
  const resultItem = summaryItem ?? item;

  return {
    focusId: item.focusId,
    cardId: item.cardId,
    metricId: item.metricId,
    status: "Focused",
    title: `${item.cardName} ${item.label} focused`,
    detail: `${item.value} saved / current ${item.currentValue}`,
    destination: `${item.focusLabel} panel`,
    metricLabel: "Compare",
    metricValue: snapshotCompareFocusResultMetric(resultItem),
    auditionCue: snapshotCompareFocusResultAudition(item),
    nextCheck: snapshotCompareFocusResultNextCheck(item),
    tone: resultItem.tone
  };
}

const snapshotCompareMetricOrder: SnapshotCompareMetricId[] = ["setup", "length", "readiness", "export", "stems", "master"];

function snapshotCompareFocusResultMetric(item: SnapshotCompareFocusItem): string {
  return `${item.label}: saved ${item.value} / current ${item.currentValue}`;
}

function snapshotCompareFocusResultAudition(item: SnapshotCompareFocusItem): string {
  switch (item.metricId) {
    case "setup":
      return "Inspect Compose setup before restoring or rewriting the saved take.";
    case "length":
      return "Use Song or Block loop audition to compare the saved arrangement length against the current beat.";
    case "readiness":
      return "Check the focused Compose lane against Beat Readiness before changing musical layers.";
    case "export":
      return "Inspect Deliver and Export Preflight before exporting or restoring the saved take.";
    case "stems":
      return "Check Deliver stem posture against the current handoff target before sending files.";
    case "master":
      return "Play the Full Mix through Master and compare output posture before changing master settings.";
  }
}

function snapshotCompareFocusResultNextCheck(item: SnapshotCompareFocusItem): string {
  switch (item.metricId) {
    case "setup":
      return "Return to Snapshot Compare after the saved setup is understood or intentionally ignored.";
    case "length":
      return "Return to Snapshot Compare after section length or selected-block intent is clear.";
    case "readiness":
      return "Return to Snapshot Compare after the saved readiness lane is matched, improved, or deferred.";
    case "export":
      return "Return to Snapshot Compare after export posture is ready or no longer needed.";
    case "stems":
      return "Return to Snapshot Compare after stem coverage matches the delivery target.";
    case "master":
      return "Return to Snapshot Compare after master posture is ready or intentionally different.";
  }
}

function createSnapshotCompareCard(
  current: SnapshotCompareProjectProfile,
  snapshot: ProjectSnapshot,
  createProjectProfile: CreateSnapshotCompareProjectProfile
): SnapshotCompareCard {
  const snapshotProject: ProjectState = {
    ...snapshot.project,
    snapshots: []
  };
  const saved = createProjectProfile(snapshotProject);
  const metrics: SnapshotCompareMetric[] = [
    {
      id: "setup",
      label: "Setup",
      current: current.setup,
      snapshot: saved.setup,
      detail: saved.setup === current.setup ? "Matches current setup" : `Current ${current.setup}`,
      tone: saved.setup === current.setup ? "good" : "warn",
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    {
      id: "length",
      label: "Length",
      current: current.length,
      snapshot: saved.length,
      detail: saved.length === current.length ? "Same arrangement length" : `Current ${current.length}`,
      tone: saved.bars < 8 ? "danger" : saved.length === current.length ? "good" : "warn",
      focusTarget: "arrange",
      focusLabel: "Arrange"
    },
    {
      id: "readiness",
      label: "Ready",
      current: current.readiness,
      snapshot: saved.readiness,
      detail: `Current ${current.readiness} / ${saved.readyCount - current.readyCount >= 0 ? "+" : ""}${saved.readyCount - current.readyCount}`,
      tone:
        saved.readinessTone === "danger"
          ? "danger"
          : saved.readyCount >= current.readyCount && saved.readinessTone === "good"
            ? "good"
            : "warn",
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    {
      id: "export",
      label: "Export",
      current: current.exportStatus,
      snapshot: saved.exportStatus,
      detail: `Current ${current.exportStatus} / ${saved.exportDetail}`,
      tone: saved.exportTone === "danger" ? "danger" : saved.exportStatus === current.exportStatus ? saved.exportTone : "warn",
      focusTarget: "deliver",
      focusLabel: "Deliver"
    },
    {
      id: "stems",
      label: "Stems",
      current: current.stems,
      snapshot: saved.stems,
      detail: `Current ${current.stems} / ${saved.stemCount}/${saved.stemGoal} target`,
      tone: saved.stemTone,
      focusTarget: "deliver",
      focusLabel: "Deliver"
    },
    {
      id: "master",
      label: "Master",
      current: current.master,
      snapshot: saved.master,
      detail: saved.masterDetail === current.masterDetail ? "Same master posture" : `Current ${current.master} / ${saved.masterDetail}`,
      tone: saved.master === current.master && saved.masterDetail === current.masterDetail ? "good" : "warn",
      focusTarget: "master",
      focusLabel: "Master"
    }
  ];

  return {
    id: snapshot.id,
    name: snapshot.name,
    detail: `${snapshotSavedDateLabel(snapshot.createdAt)} / ${saved.targetName} / ${saved.length}`,
    tone: weakestSnapshotCompareTone(metrics.map((metric) => metric.tone)),
    metrics
  };
}

function snapshotSavedDateLabel(createdAt: string): string {
  const datePart = createdAt.trim().slice(0, 10);
  return datePart.length === 10 ? datePart : "saved slot";
}

function weakestSnapshotCompareTone(tones: MixCoachTone[]): MixCoachTone {
  if (tones.includes("danger")) {
    return "danger";
  }
  if (tones.includes("warn")) {
    return "warn";
  }
  return "good";
}
