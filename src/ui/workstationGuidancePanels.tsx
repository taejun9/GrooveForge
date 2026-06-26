import {
  ArrowRight,
  Download,
  Drum,
  Gauge,
  ListChecks,
  Music2,
  SlidersHorizontal,
  Target
} from "lucide-react";
import { useEffect, useState, type ReactElement } from "react";
import type { ProjectState } from "../domain/workstation";
import type {
  FirstBeatPathStepId,
  FirstBeatPathStep,
  FirstBeatPathJumpResult,
  FirstBeatPathSummary,
  MixCoachTone,
  ModeFocusCard,
  ModeFocusJumpResult,
  ModeFocusSummary,
  ModeSwitchResult,
  QuickAction,
  ReferenceAlignmentCard,
  ReferenceAlignmentCardId,
  ReferenceAlignmentFocusResult,
  ReferenceAlignmentSummary,
  SessionPassCard,
  SessionPassFocusResult,
  SessionPassSummary,
  WorkflowNavigatorItem,
  WorkflowNavigatorJumpResult,
  WorkflowSpotlightSummary,
  WorkflowZoneId
} from "./workstationUiModel";

type GuideQuickStartResult = {
  source: "path" | "session" | "workflow";
  status: string;
  title: string;
  detail: string;
  destination: string;
  metricLabel: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

type GuideQuickStartDecision = {
  source: "path" | "session" | "workflow";
  statusLabel: string;
  laneLabel: string;
  metricLabel: string;
  detailLabel: string;
  title: string;
  tone: MixCoachTone;
};

type GuideQuickStartPriority = {
  source: "path" | "session" | "workflow";
  statusLabel: string;
  reasonLabel: string;
  metricLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

type GuideQuickStartCompletionScore = {
  percent: number;
  statusLabel: string;
  scoreLabel: string;
  metricLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

export type GuideQuickStartCompletionBreakdownItem = {
  id: "path" | "session" | "workflow";
  percent: number;
  statusLabel: string;
  scoreLabel: string;
  metricLabel: string;
  detailLabel: string;
  title: string;
  tone: MixCoachTone;
};

type GuideQuickStartContextItem = {
  id: "path" | "session" | "workflow";
  statusLabel: string;
  laneLabel: string;
  metricLabel: string;
  detailLabel: string;
  title: string;
  tone: MixCoachTone;
};

export function modeLabel(mode: ProjectState["mode"]): string {
  return mode === "guided" ? "Guided" : "Studio";
}

export function createModeSwitchButtonContext({
  firstBeatPathSummary,
  mode,
  modeFocusSummary,
  projectMode,
  sessionPassSummary
}: {
  firstBeatPathSummary: FirstBeatPathSummary;
  mode: ProjectState["mode"];
  modeFocusSummary: ModeFocusSummary;
  projectMode: ProjectState["mode"];
  sessionPassSummary: SessionPassSummary;
}): string {
  const label = modeLabel(mode);
  const active = projectMode === mode;

  return [
    active ? `${label} mode already active` : `Switch to ${label} mode`,
    `Destination ${modeSwitchDestinationLabel(mode)}`,
    `Current ${modeLabel(projectMode)}`,
    `Mode ${modeLabel(projectMode)} -> ${label}`,
    `Context ${modeSwitchDetail(mode, modeFocusSummary, sessionPassSummary, firstBeatPathSummary)}`,
    `Audition ${modeSwitchAuditionCue(mode)}`,
    `Next ${modeSwitchNextCheck(mode, modeFocusSummary, sessionPassSummary, firstBeatPathSummary)}`
  ].join(" / ");
}

export function createModeSwitchResult(
  mode: ProjectState["mode"],
  beforeProject: ProjectState,
  afterProject: ProjectState,
  modeFocus: ModeFocusSummary,
  sessionPass: SessionPassSummary,
  firstBeatPath: FirstBeatPathSummary,
  changed: boolean
): ModeSwitchResult {
  const label = modeLabel(mode);
  const activePass = sessionPass.cards.find((card) => card.id === mode) ?? sessionPass.cards[0] ?? null;
  const resultTone = changed
    ? modeSwitchWeakestTone([modeFocus.tone, sessionPass.tone, firstBeatPath.tone, activePass?.tone ?? "good"])
    : "warn";

  return {
    mode,
    title: `${label} mode ${changed ? "active" : "already active"}`,
    status: changed ? "Switched" : "Held",
    detail: modeSwitchDetail(mode, modeFocus, sessionPass, firstBeatPath),
    metric: {
      id: "mode-switch",
      label: "Mode",
      before: modeLabel(beforeProject.mode),
      after: modeLabel(afterProject.mode),
      tone: changed ? "good" : "warn"
    },
    auditionCue: modeSwitchAuditionCue(mode),
    nextCheck: modeSwitchNextCheck(mode, modeFocus, sessionPass, firstBeatPath),
    tone: resultTone
  };
}

function modeSwitchDestinationLabel(mode: ProjectState["mode"]): string {
  return mode === "guided" ? "Guided first-beat workflow" : "Studio producer scan workflow";
}

function modeSwitchDetail(
  mode: ProjectState["mode"],
  modeFocus: ModeFocusSummary,
  sessionPass: SessionPassSummary,
  firstBeatPath: FirstBeatPathSummary
): string {
  const activePass = sessionPass.cards.find((card) => card.id === mode) ?? sessionPass.cards[0] ?? null;

  return mode === "guided"
    ? `${firstBeatPath.headline} / ${activePass?.detail ?? sessionPass.detail}`
    : `${modeFocus.headline} / ${activePass?.detail ?? sessionPass.detail}`;
}

function modeSwitchAuditionCue(mode: ProjectState["mode"]): string {
  return mode === "guided"
    ? "Use First Beat Path to move through setup, compose, arrange, mix, and deliver."
    : "Use Mode Focus, Review Queue, and Export Preflight for faster producer-level scans.";
}

function modeSwitchNextCheck(
  mode: ProjectState["mode"],
  modeFocus: ModeFocusSummary,
  sessionPass: SessionPassSummary,
  firstBeatPath: FirstBeatPathSummary
): string {
  const focusLine = modeFocus.cards
    .slice(0, 2)
    .map((card) => `${card.label}: ${card.value}`)
    .join(" / ");

  return `${mode === "guided" ? firstBeatPath.countLabel : modeFocus.detail} / ${
    focusLine || sessionPass.headline
  }`;
}

export function ModeSwitchResultStrip({ result }: { result: ModeSwitchResult }): ReactElement {
  return (
    <div
      className={`mode-switch-result ${result.tone}`}
      data-mode-switch-result={result.mode}
      data-testid="mode-switch-result"
      aria-live="polite"
    >
      <div className="mode-switch-result-main">
        <SlidersHorizontal size={15} aria-hidden="true" />
        <span>
          <strong data-testid="mode-switch-result-title">{result.title}</strong>
          <small data-testid="mode-switch-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className={`mode-switch-result-metric ${result.metric.tone}`} data-testid="mode-switch-result-metric">
        <span data-testid="mode-switch-result-status">{result.status}</span>
        <strong data-testid="mode-switch-result-metric-value">
          {result.metric.before} -&gt; {result.metric.after}
        </strong>
      </div>
      <div className="mode-switch-result-followup" data-testid="mode-switch-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ReferenceAlignmentReadout({
  focusedCardId,
  onFocus,
  result,
  summary
}: {
  focusedCardId: ReferenceAlignmentCardId | null;
  onFocus: (card: ReferenceAlignmentCard) => void;
  result: ReferenceAlignmentFocusResult | null;
  summary: ReferenceAlignmentSummary;
}): ReactElement {
  return (
    <div
      aria-label={`${summary.headline}: ${summary.detail}`}
      className={`reference-alignment ${summary.tone}`}
      data-testid="reference-alignment"
      title={`${summary.headline}: ${summary.detail}`}
    >
      <div className="reference-alignment-heading">
        <span>Reference Alignment</span>
        <strong data-testid="reference-alignment-headline">{summary.headline}</strong>
        <small data-testid="reference-alignment-detail">{summary.detail}</small>
      </div>
      {result && <ReferenceAlignmentFocusResultStrip result={result} />}
      <div className="reference-alignment-grid" data-testid="reference-alignment-grid">
        {summary.cards.map((card) => {
          const focused = focusedCardId === card.id;
          return (
            <div
              className={["reference-alignment-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`reference-alignment-card-${card.id}`}
              key={card.id}
              title={`${card.label}: ${card.value}. ${card.nextCheck}`}
            >
              <span data-testid={`reference-alignment-card-${card.id}-label`}>{card.label}</span>
              <strong data-testid={`reference-alignment-card-${card.id}-value`}>{card.value}</strong>
              <button
                aria-pressed={focused}
                className="reference-alignment-focus-button"
                data-testid={`reference-alignment-focus-${card.id}`}
                onClick={() => onFocus(card)}
                title={`${card.focusLabel}: ${card.nextCheck}`}
                type="button"
              >
                <Target size={12} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small data-testid={`reference-alignment-card-${card.id}-detail`}>{card.detail}</small>
              <em data-testid={`reference-alignment-card-${card.id}-next`}>{card.nextCheck}</em>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReferenceAlignmentFocusResultStrip({ result }: { result: ReferenceAlignmentFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`reference-alignment-result ${result.tone}`}
      data-result-reference-alignment={result.cardId}
      data-testid="reference-alignment-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="reference-alignment-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="reference-alignment-result-title">{result.title}</strong>
          <small data-testid="reference-alignment-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="reference-alignment-result-destination" data-testid="reference-alignment-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="reference-alignment-result-metric" data-testid="reference-alignment-result-metric">
        <span data-testid="reference-alignment-result-status">{result.metricLabel}</span>
        <strong data-testid="reference-alignment-result-value">{result.metricValue}</strong>
      </div>
      <div className="reference-alignment-result-followup" data-testid="reference-alignment-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function createModeSwitchQuickActions({
  firstBeatPathSummary,
  modeFocusSummary,
  onSwitchMode,
  projectMode,
  sessionPassSummary
}: {
  firstBeatPathSummary: FirstBeatPathSummary;
  modeFocusSummary: ModeFocusSummary;
  onSwitchMode: (mode: ProjectState["mode"]) => void;
  projectMode: ProjectState["mode"];
  sessionPassSummary: SessionPassSummary;
}): QuickAction[] {
  const modeSwitchDefinitions: Array<{ mode: ProjectState["mode"]; id: string }> = [
    { mode: "guided", id: "mode-switch-guided" },
    { mode: "studio", id: "mode-switch-studio" }
  ];

  return modeSwitchDefinitions.map(({ mode, id }) => {
    const label = modeLabel(mode);
    const active = projectMode === mode;
    const detail = createModeSwitchButtonContext({
      firstBeatPathSummary,
      mode,
      modeFocusSummary,
      projectMode,
      sessionPassSummary
    });

    return {
      id,
      title: active ? `${label} mode already active` : `Switch to ${label} mode`,
      detail,
      group: "Project",
      keywords: `mode switch ${mode} ${label} guided studio orientation first beat path mode focus session pass command palette beginner producer`,
      disabled: active,
      run: () => onSwitchMode(mode)
    };
  });
}

export function ModeFocus({
  onFocus,
  result,
  summary
}: {
  summary: ModeFocusSummary;
  result: ModeFocusJumpResult | null;
  onFocus: (card: ModeFocusCard) => void;
}): ReactElement {
  const activeCard = summary.cards.find((card) => card.id === summary.activeCardId) ?? null;
  const decisionActionDisabled = activeCard === null;
  const decisionActionContext = activeCard ? modeFocusButtonContext(activeCard, summary) : summary.decisionTitle;

  return (
    <section className={`mode-focus ${summary.tone}`} data-testid="mode-focus" aria-label="Mode focus">
      <div className="mode-focus-heading">
        <div>
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span data-testid="mode-focus-mode">{summary.mode === "guided" ? "Guided Focus" : "Studio Focus"}</span>
        </div>
        <strong data-testid="mode-focus-headline">{summary.headline}</strong>
        <small data-testid="mode-focus-detail">{summary.detail}</small>
      </div>
      <div
        className={`mode-focus-decision ${summary.decisionTone}`}
        data-mode-focus-decision={summary.activeCardId}
        data-testid="mode-focus-decision"
        title={summary.decisionTitle}
      >
        <span data-testid="mode-focus-decision-status">{summary.decisionStatus}</span>
        <strong data-testid="mode-focus-decision-label">{summary.decisionLabel}</strong>
        <small data-testid="mode-focus-decision-detail">{summary.decisionDetail}</small>
        <button
          aria-label={decisionActionContext}
          className="mode-focus-decision-action"
          data-mode-focus-decision-action={activeCard?.id ?? "none"}
          data-testid="mode-focus-decision-run"
          disabled={decisionActionDisabled}
          onClick={() => {
            if (activeCard) {
              onFocus(activeCard);
            }
          }}
          title={decisionActionContext}
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>{summary.decisionLabel}</span>
        </button>
      </div>
      <div className="mode-focus-grid" data-testid="mode-focus-grid">
        {summary.cards.map((card) => {
          const buttonContext = modeFocusButtonContext(card, summary);
          return (
            <div className={`mode-focus-card ${card.tone}`} data-testid={`mode-focus-${card.id}`} key={card.id}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <button
                aria-label={buttonContext}
                className="mode-focus-jump"
                data-testid={`mode-focus-jump-${card.id}`}
                onClick={() => onFocus(card)}
                title={buttonContext}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small>{card.detail}</small>
            </div>
          );
        })}
      </div>
      {result && <ModeFocusJumpResultStrip result={result} />}
    </section>
  );
}

function modeFocusButtonContext(card: ModeFocusCard, summary: ModeFocusSummary): string {
  return [
    `Jump to ${card.focusLabel}: ${card.value}`,
    `Destination ${card.focusLabel}`,
    `Mode ${modeFocusButtonMetric(summary)}`,
    `Context ${card.detail}`,
    `Audition ${modeFocusButtonAuditionCue(card, summary)}`,
    `Next ${modeFocusButtonNextCheck(card, summary)}`
  ].join(" / ");
}

function modeFocusButtonMetric(summary: ModeFocusSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;
  const modeLabel = summary.mode === "guided" ? "Guided" : "Studio";
  return `${modeLabel} / ${readyCount}/${summary.cards.length} ready / ${reviewCount} review / ${blockerCount} blocker`;
}

function modeFocusButtonAuditionCue(card: ModeFocusCard, summary: ModeFocusSummary): string {
  if (summary.mode === "guided") {
    switch (card.id) {
      case "stage":
        return "Use the focused workstation panel to move the current beat-making stage forward.";
      case "focus":
        return "Use the focused writing lane for drums, 808/bass, harmony, melody, arrangement, or finish work.";
      case "check":
        return "Use the local check target before changing mix, master, handoff, or export decisions.";
      default:
        return "Use the Guided focus card as the next direct beat-making checkpoint.";
    }
  }

  switch (card.id) {
    case "session":
      return "Use the focused studio pass to inspect mix, finish, and session readiness.";
    case "issue":
      return "Use the focused issue panel before choosing an explicit review fix.";
    case "handoff":
      return "Use the focused handoff target before WAV, stems, MIDI, or sheet export.";
    default:
      return "Use the Studio focus card as the next producer-level session checkpoint.";
  }
}

function modeFocusButtonNextCheck(card: ModeFocusCard, summary: ModeFocusSummary): string {
  if (summary.mode === "guided") {
    switch (card.id) {
      case "stage":
        return "Return to Mode Focus after the current stage is ready or intentionally deferred.";
      case "focus":
        return "Return after the writing lane has a usable musical event or a clear reason to defer.";
      case "check":
        return "Return after the local check no longer blocks the first beat path.";
      default:
        return "Return to Mode Focus for the next Guided orientation card.";
    }
  }

  switch (card.id) {
    case "session":
      return "Return after the session scan is ready for the selected delivery target.";
    case "issue":
      return "Return after the top studio issue is reviewed or fixed explicitly.";
    case "handoff":
      return "Return after handoff context and deliverables match the selected target.";
    default:
      return "Return to Mode Focus for the next Studio orientation card.";
  }
}

export function GuideQuickStart({
  firstBeatPathSummary,
  onFocusSessionPass,
  onJumpFirstBeatPath,
  onJumpWorkflowSpotlight,
  sessionPassSummary,
  workflowNavigatorItems
}: {
  firstBeatPathSummary: FirstBeatPathSummary;
  sessionPassSummary: SessionPassSummary;
  workflowNavigatorItems: WorkflowNavigatorItem[];
  onJumpFirstBeatPath: (step: FirstBeatPathStep) => void;
  onFocusSessionPass: (card: SessionPassCard) => void;
  onJumpWorkflowSpotlight: (item: WorkflowNavigatorItem) => void;
}): ReactElement {
  const nextStep =
    firstBeatPathSummary.steps.find((step) => step.id === firstBeatPathSummary.nextStepId) ??
    firstBeatPathSummary.steps[0] ??
    null;
  const sessionCard =
    sessionPassSummary.cards.find((card) => card.id === sessionPassSummary.mode) ??
    sessionPassSummary.cards[0] ??
    null;
  const workflowSpotlight = createWorkflowSpotlightSummary(workflowNavigatorItems);
  const workflowSpotlightItem = workflowSpotlight.zoneId
    ? workflowNavigatorItems.find((item) => item.id === workflowSpotlight.zoneId) ?? null
    : null;
  const decision = createGuideQuickStartDecision({
    firstBeatPathSummary,
    nextStep,
    sessionCard,
    sessionPassSummary,
    workflowSpotlight,
    workflowSpotlightItem
  });
  const priority = createGuideQuickStartPriority({
    decision,
    firstBeatPathSummary,
    sessionPassSummary,
    workflowSpotlight
  });
  const completionScore = createGuideQuickStartCompletionScore({
    firstBeatPathSummary,
    sessionPassSummary,
    workflowNavigatorItems,
    workflowSpotlight
  });
  const completionBreakdownItems = createGuideQuickStartCompletionBreakdownItems({
    firstBeatPathSummary,
    sessionPassSummary,
    workflowNavigatorItems,
    workflowSpotlight
  });
  const completionBottleneckItem = createGuideQuickStartCompletionBottleneckItem(completionBreakdownItems);
  const completionBottleneckLabel = createGuideQuickStartCompletionBottleneckLabel(completionBreakdownItems);
  const contextItems = createGuideQuickStartContextItems({
    firstBeatPathSummary,
    nextStep,
    sessionCard,
    sessionPassSummary,
    workflowSpotlight,
    workflowSpotlightItem
  });
  const tone = modeSwitchWeakestTone([
    firstBeatPathSummary.tone,
    sessionPassSummary.tone,
    workflowSpotlight.tone,
    nextStep?.tone ?? "good",
    sessionCard?.tone ?? "good"
  ]);
  const [result, setResult] = useState<GuideQuickStartResult | null>(null);
  const decisionActionDisabled =
    (decision.source === "path" && !nextStep) ||
    (decision.source === "session" && !sessionCard) ||
    (decision.source === "workflow" && !workflowSpotlightItem);
  const bottleneckActionDisabled =
    !completionBottleneckItem ||
    (completionBottleneckItem.id === "path" && !nextStep) ||
    (completionBottleneckItem.id === "session" && !sessionCard) ||
    (completionBottleneckItem.id === "workflow" && !workflowSpotlightItem);
  const pathButtonContext = nextStep
    ? guideQuickStartButtonContext({
        source: "path",
        nextStep,
        sessionCard,
        firstBeatPathSummary,
        sessionPassSummary,
        workflowSpotlight,
        workflowSpotlightItem
      })
    : "No First Beat Path target";
  const sessionButtonContext = sessionCard
    ? guideQuickStartButtonContext({
        source: "session",
        nextStep,
        sessionCard,
        firstBeatPathSummary,
        sessionPassSummary,
        workflowSpotlight,
        workflowSpotlightItem
      })
    : "No Session Pass target";
  const workflowButtonContext = workflowSpotlightItem
    ? guideQuickStartButtonContext({
        source: "workflow",
        nextStep,
        sessionCard,
        firstBeatPathSummary,
        sessionPassSummary,
        workflowSpotlight,
        workflowSpotlightItem
      })
    : "No Workflow Spotlight target";
  const decisionActionContext = !decisionActionDisabled
    ? guideQuickStartButtonContext({
        source: decision.source,
        nextStep,
        sessionCard,
        firstBeatPathSummary,
        sessionPassSummary,
        workflowSpotlight,
        workflowSpotlightItem,
        prefix: `Run ${guideQuickStartSourceLabel(decision.source)} decision`
      })
    : decision.title;
  const bottleneckActionContext =
    completionBottleneckItem && !bottleneckActionDisabled
      ? guideQuickStartButtonContext({
          source: completionBottleneckItem.id,
          nextStep,
          sessionCard,
          firstBeatPathSummary,
          sessionPassSummary,
          workflowSpotlight,
          workflowSpotlightItem,
          prefix: `Focus ${guideQuickStartCompletionBreakdownName(completionBottleneckItem.id)} bottleneck`
        })
      : "No Guide Quick Start bottleneck target";

  function runGuideQuickStartPath(): void {
    if (nextStep) {
      setResult(createGuideQuickStartPathResult(nextStep, firstBeatPathSummary));
      onJumpFirstBeatPath(nextStep);
    }
  }

  function runGuideQuickStartSession(): void {
    if (sessionCard) {
      setResult(createGuideQuickStartSessionResult(sessionCard, sessionPassSummary));
      onFocusSessionPass(sessionCard);
    }
  }

  function runGuideQuickStartWorkflow(): void {
    if (workflowSpotlightItem) {
      setResult(createGuideQuickStartWorkflowResult(workflowSpotlight, workflowSpotlightItem));
      onJumpWorkflowSpotlight(workflowSpotlightItem);
    }
  }

  function runGuideQuickStartDecision(): void {
    switch (decision.source) {
      case "path":
        runGuideQuickStartPath();
        return;
      case "session":
        runGuideQuickStartSession();
        return;
      case "workflow":
        runGuideQuickStartWorkflow();
        return;
    }
  }

  function runGuideQuickStartBottleneck(): void {
    switch (completionBottleneckItem?.id) {
      case "path":
        runGuideQuickStartPath();
        return;
      case "session":
        runGuideQuickStartSession();
        return;
      case "workflow":
        runGuideQuickStartWorkflow();
        return;
    }
  }

  useEffect(() => {
    setResult(null);
  }, [
    completionBottleneckItem?.id,
    firstBeatPathSummary.countLabel,
    firstBeatPathSummary.nextStepId,
    sessionPassSummary.headline,
    sessionPassSummary.mode,
    workflowSpotlight.countLabel,
    workflowSpotlight.zoneId
  ]);

  return (
    <section
      className={`guide-quick-start ${tone}`}
      data-testid="guide-quick-start"
      aria-label="Guide quick start"
      title={`${firstBeatPathSummary.headline}: ${firstBeatPathSummary.detail}`}
    >
      <div className="guide-quick-start-heading">
        <div>
          <ListChecks size={16} aria-hidden="true" />
          <span data-testid="guide-quick-start-status">{firstBeatPathSummary.statusLabel}</span>
        </div>
        <strong data-testid="guide-quick-start-headline">Guide Quick Start</strong>
        <small data-testid="guide-quick-start-detail">
          {firstBeatPathSummary.countLabel} / {sessionPassSummary.headline} / {workflowSpotlight.countLabel}
        </small>
      </div>
      <div className="guide-quick-start-body">
        <div
          className={`guide-quick-start-decision ${decision.tone}`}
          data-guide-quick-start-decision={decision.source}
          data-testid="guide-quick-start-decision"
          title={decision.title}
        >
          <span data-testid="guide-quick-start-decision-status">{decision.statusLabel}</span>
          <strong data-testid="guide-quick-start-decision-lane">{decision.laneLabel}</strong>
          <small data-testid="guide-quick-start-decision-metric">{decision.metricLabel}</small>
          <small data-testid="guide-quick-start-decision-detail">{decision.detailLabel}</small>
          <button
            aria-label={decisionActionContext}
            className="guide-quick-start-decision-action"
            data-guide-quick-start-decision-action={decision.source}
            data-testid="guide-quick-start-decision-run"
            disabled={decisionActionDisabled}
            onClick={runGuideQuickStartDecision}
            title={decisionActionContext}
            type="button"
          >
            <ArrowRight size={13} aria-hidden="true" />
            <span>Run {decision.source}</span>
          </button>
        </div>
        <div
          className={`guide-quick-start-priority ${priority.tone}`}
          data-guide-quick-start-priority={priority.source}
          data-testid="guide-quick-start-priority"
          title={priority.title}
        >
          <span data-testid="guide-quick-start-priority-status">{priority.statusLabel}</span>
          <strong data-testid="guide-quick-start-priority-reason">{priority.reasonLabel}</strong>
          <small data-testid="guide-quick-start-priority-metric">{priority.metricLabel}</small>
          <small data-testid="guide-quick-start-priority-next-check">{priority.nextCheckLabel}</small>
        </div>
        <div
          aria-label="Beat Completion Score"
          className={`guide-quick-start-completion ${completionScore.tone}`}
          data-guide-quick-start-completion={completionScore.percent}
          data-testid="guide-quick-start-completion"
          title={completionScore.title}
        >
          <Gauge size={14} aria-hidden="true" />
          <span data-testid="guide-quick-start-completion-status">{completionScore.statusLabel}</span>
          <strong data-testid="guide-quick-start-completion-score">{completionScore.scoreLabel}</strong>
          <small data-testid="guide-quick-start-completion-metric">{completionScore.metricLabel}</small>
          <small data-testid="guide-quick-start-completion-next-check">{completionScore.nextCheckLabel}</small>
        </div>
        <div
          className={`guide-quick-start-completion-bottleneck ${completionScore.tone}`}
          data-testid="guide-quick-start-completion-bottleneck"
          title={completionBottleneckLabel}
        >
          <span data-testid="guide-quick-start-completion-bottleneck-status">Lowest lane</span>
          <strong data-testid="guide-quick-start-completion-bottleneck-label">{completionBottleneckLabel}</strong>
          <button
            className="guide-quick-start-completion-bottleneck-focus"
            data-guide-quick-start-completion-bottleneck-focus={completionBottleneckItem?.id ?? "none"}
            data-testid="guide-quick-start-completion-bottleneck-focus"
            disabled={bottleneckActionDisabled}
            onClick={runGuideQuickStartBottleneck}
            aria-label={bottleneckActionContext}
            title={bottleneckActionContext}
            type="button"
          >
            <ArrowRight size={13} aria-hidden="true" />
            <span>
              Focus {completionBottleneckItem ? guideQuickStartCompletionBreakdownName(completionBottleneckItem.id) : "lane"}
            </span>
          </button>
        </div>
        <div
          aria-label="Beat Completion Score breakdown"
          className="guide-quick-start-completion-breakdown"
          data-testid="guide-quick-start-completion-breakdown"
        >
          {completionBreakdownItems.map((item) => (
            <div
              className={`guide-quick-start-completion-breakdown-item ${item.tone}`}
              data-guide-quick-start-completion-breakdown={item.id}
              data-testid={`guide-quick-start-completion-breakdown-${item.id}`}
              key={item.id}
              title={item.title}
            >
              <span data-testid={`guide-quick-start-completion-breakdown-${item.id}-status`}>{item.statusLabel}</span>
              <strong data-testid={`guide-quick-start-completion-breakdown-${item.id}-score`}>{item.scoreLabel}</strong>
              <small data-testid={`guide-quick-start-completion-breakdown-${item.id}-metric`}>{item.metricLabel}</small>
              <small data-testid={`guide-quick-start-completion-breakdown-${item.id}-detail`}>{item.detailLabel}</small>
            </div>
          ))}
        </div>
        <div className="guide-quick-start-context" data-testid="guide-quick-start-context" aria-label="Guide Quick Start context">
          {contextItems.map((item) => (
            <div
              className={`guide-quick-start-context-item ${item.tone}`}
              data-guide-quick-start-context={item.id}
              data-testid={`guide-quick-start-context-${item.id}`}
              key={item.id}
              title={item.title}
            >
              <span data-testid={`guide-quick-start-context-${item.id}-status`}>{item.statusLabel}</span>
              <strong data-testid={`guide-quick-start-context-${item.id}-lane`}>{item.laneLabel}</strong>
              <small data-testid={`guide-quick-start-context-${item.id}-metric`}>{item.metricLabel}</small>
              <small data-testid={`guide-quick-start-context-${item.id}-detail`}>{item.detailLabel}</small>
            </div>
          ))}
        </div>
        <div className="guide-quick-start-actions" data-testid="guide-quick-start-actions">
          <button
            className={["guide-quick-start-action", "path", nextStep?.tone ?? "warn"].join(" ")}
            data-testid="guide-quick-start-path"
            disabled={!nextStep}
            onClick={runGuideQuickStartPath}
            aria-label={pathButtonContext}
            title={pathButtonContext}
            type="button"
          >
            <Target size={14} aria-hidden="true" />
            <span>Next path</span>
            <strong>{nextStep ? `${nextStep.label}: ${nextStep.value}` : "No path target"}</strong>
            <small>{nextStep?.detail ?? firstBeatPathSummary.detail}</small>
          </button>
          <button
            className={["guide-quick-start-action", "session", sessionCard?.tone ?? "warn"].join(" ")}
            data-testid="guide-quick-start-session"
            disabled={!sessionCard}
            onClick={runGuideQuickStartSession}
            aria-label={sessionButtonContext}
            title={sessionButtonContext}
            type="button"
          >
            <ArrowRight size={14} aria-hidden="true" />
            <span>{sessionPassSummary.mode === "guided" ? "Guided pass" : "Studio pass"}</span>
            <strong>{sessionCard ? `${sessionCard.label}: ${sessionCard.value}` : sessionPassSummary.headline}</strong>
            <small>{sessionCard?.detail ?? sessionPassSummary.detail}</small>
          </button>
          <button
            className={["guide-quick-start-action", "workflow", workflowSpotlight.tone].join(" ")}
            data-testid="guide-quick-start-workflow"
            disabled={!workflowSpotlightItem}
            onClick={runGuideQuickStartWorkflow}
            aria-label={workflowButtonContext}
            title={workflowButtonContext}
            type="button"
          >
            <ArrowRight size={14} aria-hidden="true" />
            <span>{workflowSpotlight.statusLabel}</span>
            <strong>{workflowSpotlight.zoneLabel}</strong>
            <small>{workflowSpotlight.detailLabel}</small>
          </button>
        </div>
      </div>
      {result && <GuideQuickStartResultStrip result={result} />}
    </section>
  );
}

function guideQuickStartButtonContext({
  firstBeatPathSummary,
  nextStep,
  prefix,
  sessionCard,
  sessionPassSummary,
  source,
  workflowSpotlight,
  workflowSpotlightItem
}: {
  source: GuideQuickStartDecision["source"];
  nextStep: FirstBeatPathStep | null;
  sessionCard: SessionPassCard | null;
  firstBeatPathSummary: FirstBeatPathSummary;
  sessionPassSummary: SessionPassSummary;
  workflowSpotlight: WorkflowSpotlightSummary;
  workflowSpotlightItem: WorkflowNavigatorItem | null;
  prefix?: string;
}): string {
  switch (source) {
    case "path": {
      const label = nextStep ? `${nextStep.label}: ${nextStep.value}` : firstBeatPathSummary.headline;
      const destination = nextStep?.jumpLabel ?? "First Beat Path";
      const detail = nextStep?.detail ?? firstBeatPathSummary.detail;

      return guideQuickStartButtonContextLine({
        prefix: prefix ?? `Run Path: ${label}`,
        destination,
        metric: firstBeatPathSummary.countLabel,
        detail,
        auditionCue: "Use the focused workstation area to handle this direct beat-making step.",
        nextCheck: "Return to Guide Quick Start after the step is ready or intentionally deferred."
      });
    }
    case "session": {
      const label = sessionCard ? `${sessionCard.label}: ${sessionCard.value}` : sessionPassSummary.headline;
      const destination = sessionCard?.focusLabel ?? "Session Pass";
      const detail = sessionCard?.detail ?? sessionPassSummary.detail;

      return guideQuickStartButtonContextLine({
        prefix: prefix ?? `Run Session: ${label}`,
        destination,
        metric: sessionCard ? `${sessionPassSummary.headline} / ${sessionCard.value}` : sessionPassSummary.headline,
        detail,
        auditionCue: "Use the focused panel to inspect this session pass before changing the beat.",
        nextCheck: "Return to Guide Quick Start for the next guided or studio pass target."
      });
    }
    case "workflow": {
      const detail = workflowSpotlightItem?.detail ?? workflowSpotlight.detailLabel;

      return guideQuickStartButtonContextLine({
        prefix: prefix ?? `Run Workflow: ${workflowSpotlight.zoneLabel}`,
        destination: workflowSpotlightItem?.label ?? workflowSpotlight.zoneLabel,
        metric: workflowSpotlight.countLabel,
        detail,
        auditionCue: "Use the highlighted workstation zone to resolve the current workflow target.",
        nextCheck: "Return to Guide Quick Start after the zone looks ready or needs another pass."
      });
    }
  }
}

function guideQuickStartButtonContextLine({
  auditionCue,
  destination,
  detail,
  metric,
  nextCheck,
  prefix
}: {
  prefix: string;
  destination: string;
  metric: string;
  detail: string;
  auditionCue: string;
  nextCheck: string;
}): string {
  return [
    prefix,
    `Destination ${destination}`,
    `Metric ${metric}`,
    `Context ${detail}`,
    `Audition ${auditionCue}`,
    `Next ${nextCheck}`
  ].join(" / ");
}

function guideQuickStartSourceLabel(source: GuideQuickStartDecision["source"]): string {
  switch (source) {
    case "path":
      return "Path";
    case "session":
      return "Session";
    case "workflow":
      return "Workflow";
  }
}

function createGuideQuickStartPriority({
  decision,
  firstBeatPathSummary,
  sessionPassSummary,
  workflowSpotlight
}: {
  decision: GuideQuickStartDecision;
  firstBeatPathSummary: FirstBeatPathSummary;
  sessionPassSummary: SessionPassSummary;
  workflowSpotlight: WorkflowSpotlightSummary;
}): GuideQuickStartPriority {
  const sourceLabel =
    decision.source === "path" ? "Path priority" : decision.source === "session" ? "Session priority" : "Workflow priority";
  const reasonLabel =
    decision.source === "path"
      ? "First unfinished beat-making step"
      : decision.source === "session"
        ? `${modeLabel(sessionPassSummary.mode)} session lane is active`
        : "Workflow zone needs attention";
  const metricLabel =
    decision.source === "path"
      ? firstBeatPathSummary.countLabel
      : decision.source === "session"
        ? sessionPassSummary.headline
        : workflowSpotlight.countLabel;
  const nextCheckLabel =
    decision.source === "path"
      ? "Next: jump, finish the step, then return."
      : decision.source === "session"
        ? "Next: focus the pass before editing."
        : "Next: clear the highlighted zone.";

  return {
    source: decision.source,
    statusLabel: sourceLabel,
    reasonLabel,
    metricLabel,
    nextCheckLabel,
    title: `${sourceLabel}: ${reasonLabel} / ${decision.detailLabel} / ${nextCheckLabel}`,
    tone: decision.tone
  };
}

export function createGuideQuickStartCompletionScore({
  firstBeatPathSummary,
  sessionPassSummary,
  workflowNavigatorItems,
  workflowSpotlight
}: {
  firstBeatPathSummary: FirstBeatPathSummary;
  sessionPassSummary: SessionPassSummary;
  workflowNavigatorItems: WorkflowNavigatorItem[];
  workflowSpotlight: WorkflowSpotlightSummary;
}): GuideQuickStartCompletionScore {
  const workflowTones = workflowNavigatorItems.length > 0 ? workflowNavigatorItems.map((item) => item.tone) : [workflowSpotlight.tone];
  const tones = [
    ...firstBeatPathSummary.steps.map((step) => step.tone),
    ...sessionPassSummary.cards.map((card) => card.tone),
    ...workflowTones
  ];
  const possible = Math.max(tones.length, 1);
  const achieved = tones.reduce((total, tone) => total + guideQuickStartToneValue(tone), 0);
  const percent = Math.round((achieved / possible) * 100);
  const readyCount = tones.filter((tone) => tone === "good").length;
  const reviewCount = tones.filter((tone) => tone === "warn").length;
  const blockerCount = tones.filter((tone) => tone === "danger").length;
  const tone = modeSwitchWeakestTone(tones);
  const statusLabel =
    tone === "danger" ? "Completion blocker" : tone === "warn" ? "Completion review" : "Completion ready";
  const nextCheckLabel =
    tone === "danger"
      ? "Next: clear the blocker before export."
      : tone === "warn"
        ? "Next: review the lowest-scoring lane."
        : "Next: audition and export deliberately.";
  const metricLabel = `${readyCount}/${possible} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
  const scoreLabel = `${percent}% complete`;

  return {
    percent,
    statusLabel,
    scoreLabel,
    metricLabel,
    nextCheckLabel,
    title: `${statusLabel}: ${scoreLabel} / ${metricLabel} / ${nextCheckLabel}`,
    tone
  };
}

export function createGuideQuickStartCompletionBottleneckLabel(
  breakdownItems: ReturnType<typeof createGuideQuickStartCompletionBreakdownItems>
): string {
  const bottleneck = createGuideQuickStartCompletionBottleneckItem(breakdownItems);

  if (!bottleneck) {
    return "Bottleneck: not scored";
  }
  const scoreLabel = bottleneck.scoreLabel.replace(` ${bottleneck.id}`, "");
  const metricLabel = bottleneck.metricLabel.split(" / ").join("; ");

  return `Bottleneck ${guideQuickStartCompletionBreakdownName(bottleneck.id)}: ${scoreLabel} (${metricLabel})`;
}

export function createGuideQuickStartCompletionBottleneckItem(
  breakdownItems: ReturnType<typeof createGuideQuickStartCompletionBreakdownItems>
): GuideQuickStartCompletionBreakdownItem | null {
  if (breakdownItems.length === 0) {
    return null;
  }

  return breakdownItems.reduce((selected, item) => {
    if (item.percent < selected.percent) {
      return item;
    }
    if (item.percent === selected.percent && guideQuickStartDecisionToneRank(item.tone) > guideQuickStartDecisionToneRank(selected.tone)) {
      return item;
    }
    return selected;
  });
}

function guideQuickStartCompletionBreakdownName(id: GuideQuickStartCompletionBreakdownItem["id"]): string {
  switch (id) {
    case "path":
      return "Path";
    case "session":
      return "Session";
    case "workflow":
      return "Workflow";
  }
}

export function createGuideQuickStartCompletionBreakdownItems({
  firstBeatPathSummary,
  sessionPassSummary,
  workflowNavigatorItems,
  workflowSpotlight
}: {
  firstBeatPathSummary: FirstBeatPathSummary;
  sessionPassSummary: SessionPassSummary;
  workflowNavigatorItems: WorkflowNavigatorItem[];
  workflowSpotlight: WorkflowSpotlightSummary;
}): GuideQuickStartCompletionBreakdownItem[] {
  const workflowTones = workflowNavigatorItems.length > 0 ? workflowNavigatorItems.map((item) => item.tone) : [workflowSpotlight.tone];

  return [
    createGuideQuickStartCompletionBreakdownItem({
      id: "path",
      statusLabel: "Path readiness",
      detailLabel: "First Beat Path steps",
      tones: firstBeatPathSummary.steps.map((step) => step.tone)
    }),
    createGuideQuickStartCompletionBreakdownItem({
      id: "session",
      statusLabel: "Session readiness",
      detailLabel: `${modeLabel(sessionPassSummary.mode)} pass cards`,
      tones: sessionPassSummary.cards.map((card) => card.tone)
    }),
    createGuideQuickStartCompletionBreakdownItem({
      id: "workflow",
      statusLabel: "Workflow readiness",
      detailLabel: "Workflow Navigator zones",
      tones: workflowTones
    })
  ];
}

function createGuideQuickStartCompletionBreakdownItem({
  detailLabel,
  id,
  statusLabel,
  tones
}: {
  id: GuideQuickStartCompletionBreakdownItem["id"];
  statusLabel: string;
  detailLabel: string;
  tones: MixCoachTone[];
}): GuideQuickStartCompletionBreakdownItem {
  const possible = Math.max(tones.length, 1);
  const achieved = tones.reduce((total, tone) => total + guideQuickStartToneValue(tone), 0);
  const percent = Math.round((achieved / possible) * 100);
  const readyCount = tones.filter((tone) => tone === "good").length;
  const reviewCount = tones.filter((tone) => tone === "warn").length;
  const blockerCount = tones.filter((tone) => tone === "danger").length;
  const tone = tones.length > 0 ? modeSwitchWeakestTone(tones) : "warn";
  const scoreLabel = `${percent}% ${id}`;
  const metricLabel = `${readyCount}/${possible} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;

  return {
    id,
    percent,
    statusLabel,
    scoreLabel,
    metricLabel,
    detailLabel,
    title: `${statusLabel}: ${scoreLabel} / ${metricLabel} / ${detailLabel}`,
    tone
  };
}

function guideQuickStartToneValue(tone: MixCoachTone): number {
  if (tone === "good") {
    return 1;
  }
  if (tone === "warn") {
    return 0.5;
  }
  return 0;
}

function createGuideQuickStartContextItems({
  firstBeatPathSummary,
  nextStep,
  sessionCard,
  sessionPassSummary,
  workflowSpotlight,
  workflowSpotlightItem
}: {
  firstBeatPathSummary: FirstBeatPathSummary;
  nextStep: FirstBeatPathStep | null;
  sessionCard: SessionPassCard | null;
  sessionPassSummary: SessionPassSummary;
  workflowSpotlight: WorkflowSpotlightSummary;
  workflowSpotlightItem: WorkflowNavigatorItem | null;
}): GuideQuickStartContextItem[] {
  const pathTone = nextStep?.tone ?? firstBeatPathSummary.tone;
  const pathLane = nextStep ? `${nextStep.label}: ${nextStep.value}` : firstBeatPathSummary.headline;
  const pathDetail = nextStep ? nextStep.detail : firstBeatPathSummary.detail;
  const sessionTone = sessionCard?.tone ?? sessionPassSummary.tone;
  const sessionLane = sessionCard ? `${sessionCard.label}: ${sessionCard.value}` : sessionPassSummary.headline;
  const sessionDetail = sessionCard ? sessionCard.detail : sessionPassSummary.detail;
  const workflowLane = workflowSpotlight.zoneLabel;
  const workflowDetail = workflowSpotlightItem ? workflowSpotlightItem.detail : workflowSpotlight.detailLabel;

  return [
    {
      id: "path",
      statusLabel: guideQuickStartDecisionStatus("Path", pathTone),
      laneLabel: pathLane,
      metricLabel: firstBeatPathSummary.countLabel,
      detailLabel: pathDetail,
      title: `Path context: ${pathLane} / ${firstBeatPathSummary.countLabel} / ${pathDetail}`,
      tone: pathTone
    },
    {
      id: "session",
      statusLabel: guideQuickStartDecisionStatus("Session", sessionTone),
      laneLabel: sessionLane,
      metricLabel: sessionPassSummary.headline,
      detailLabel: sessionDetail,
      title: `Session context: ${sessionLane} / ${sessionPassSummary.headline} / ${sessionDetail}`,
      tone: sessionTone
    },
    {
      id: "workflow",
      statusLabel: workflowSpotlight.statusLabel,
      laneLabel: workflowLane,
      metricLabel: workflowSpotlight.countLabel,
      detailLabel: workflowDetail,
      title: `Workflow context: ${workflowLane} / ${workflowSpotlight.countLabel} / ${workflowDetail}`,
      tone: workflowSpotlight.tone
    }
  ];
}

function createGuideQuickStartDecision({
  firstBeatPathSummary,
  nextStep,
  sessionCard,
  sessionPassSummary,
  workflowSpotlight,
  workflowSpotlightItem
}: {
  firstBeatPathSummary: FirstBeatPathSummary;
  nextStep: FirstBeatPathStep | null;
  sessionCard: SessionPassCard | null;
  sessionPassSummary: SessionPassSummary;
  workflowSpotlight: WorkflowSpotlightSummary;
  workflowSpotlightItem: WorkflowNavigatorItem | null;
}): GuideQuickStartDecision {
  const candidates: GuideQuickStartDecision[] = [];

  if (nextStep) {
    candidates.push({
      source: "path",
      statusLabel: guideQuickStartDecisionStatus("Path", nextStep.tone),
      laneLabel: `${nextStep.label}: ${nextStep.value}`,
      metricLabel: firstBeatPathSummary.countLabel,
      detailLabel: `Jump to ${nextStep.jumpLabel}; ${nextStep.detail}`,
      title: `Guide Quick Start recommends the First Beat Path lane: ${nextStep.detail}`,
      tone: nextStep.tone
    });
  }

  if (sessionCard) {
    candidates.push({
      source: "session",
      statusLabel: guideQuickStartDecisionStatus("Session", sessionCard.tone),
      laneLabel: `${sessionCard.label}: ${sessionCard.value}`,
      metricLabel: sessionPassSummary.headline,
      detailLabel: `Focus ${sessionCard.focusLabel}; ${sessionCard.detail}`,
      title: `Guide Quick Start recommends the Session Pass lane: ${sessionCard.detail}`,
      tone: sessionCard.tone
    });
  }

  if (workflowSpotlightItem) {
    candidates.push({
      source: "workflow",
      statusLabel: guideQuickStartDecisionStatus("Workflow", workflowSpotlight.tone),
      laneLabel: workflowSpotlight.zoneLabel,
      metricLabel: workflowSpotlight.countLabel,
      detailLabel: `${workflowSpotlight.statusLabel}; ${workflowSpotlight.detailLabel}`,
      title: `Guide Quick Start recommends the Workflow Spotlight lane: ${workflowSpotlightItem.detail}`,
      tone: workflowSpotlight.tone
    });
  }

  return (
    candidates.reduce<GuideQuickStartDecision | null>((selected, candidate) => {
      if (!selected) {
        return candidate;
      }
      return guideQuickStartDecisionToneRank(candidate.tone) > guideQuickStartDecisionToneRank(selected.tone)
        ? candidate
        : selected;
    }, null) ?? {
      source: "path",
      statusLabel: "Guide ready",
      laneLabel: "No blocker",
      metricLabel: firstBeatPathSummary.countLabel,
      detailLabel: firstBeatPathSummary.detail,
      title: "Guide Quick Start has no current blocker target.",
      tone: "good"
    }
  );
}

function guideQuickStartDecisionStatus(label: string, tone: MixCoachTone): string {
  if (tone === "danger") {
    return `${label} blocker`;
  }
  if (tone === "warn") {
    return `${label} review`;
  }
  return `${label} ready`;
}

function guideQuickStartDecisionToneRank(tone: MixCoachTone): number {
  switch (tone) {
    case "danger":
      return 3;
    case "warn":
      return 2;
    case "good":
      return 1;
  }
}

function createGuideQuickStartPathResult(step: FirstBeatPathStep, summary: FirstBeatPathSummary): GuideQuickStartResult {
  return {
    source: "path",
    status: "Jumped",
    title: `Next path: ${step.label}`,
    detail: step.detail,
    destination: step.jumpLabel,
    metricLabel: "Path",
    metricValue: summary.countLabel,
    auditionCue: "Use the focused workstation area to handle this direct beat-making step.",
    nextCheck: "Return to Guide Quick Start after the step is ready or intentionally deferred.",
    tone: step.tone
  };
}

function createGuideQuickStartSessionResult(card: SessionPassCard, summary: SessionPassSummary): GuideQuickStartResult {
  return {
    source: "session",
    status: "Focused",
    title: `${modeLabel(summary.mode)} pass: ${card.label}`,
    detail: card.detail,
    destination: card.focusLabel,
    metricLabel: "Session",
    metricValue: card.value,
    auditionCue: "Use the focused panel to inspect this session pass before changing the beat.",
    nextCheck: "Return to Guide Quick Start for the next guided or studio pass target.",
    tone: card.tone
  };
}

function createGuideQuickStartWorkflowResult(
  spotlight: WorkflowSpotlightSummary,
  item: WorkflowNavigatorItem
): GuideQuickStartResult {
  return {
    source: "workflow",
    status: "Jumped",
    title: spotlight.statusLabel,
    detail: item.detail,
    destination: item.label,
    metricLabel: "Workflow",
    metricValue: spotlight.countLabel,
    auditionCue: "Use the highlighted workstation zone to resolve the current workflow target.",
    nextCheck: "Return to Guide Quick Start after the zone looks ready or needs another pass.",
    tone: spotlight.tone
  };
}

function GuideQuickStartResultStrip({ result }: { result: GuideQuickStartResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`guide-quick-start-result ${result.tone}`}
      data-result-guide-quick-start={result.source}
      data-testid="guide-quick-start-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="guide-quick-start-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="guide-quick-start-result-title">{result.title}</strong>
          <small data-testid="guide-quick-start-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="guide-quick-start-result-destination" data-testid="guide-quick-start-result-destination">
        <span data-testid="guide-quick-start-result-status">{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="guide-quick-start-result-metric" data-testid="guide-quick-start-result-metric">
        <span>{result.metricLabel}</span>
        <strong data-testid="guide-quick-start-result-value">{result.metricValue}</strong>
      </div>
      <div className="guide-quick-start-result-followup" data-testid="guide-quick-start-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

function ModeFocusJumpResultStrip({ result }: { result: ModeFocusJumpResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`mode-focus-result ${result.tone}`}
      data-result-mode-focus={result.cardId}
      data-testid="mode-focus-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="mode-focus-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="mode-focus-result-title">{result.title}</strong>
          <small data-testid="mode-focus-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="mode-focus-result-metric" data-testid="mode-focus-result-metric">
        <span data-testid="mode-focus-result-status">{result.status}</span>
        <strong data-testid="mode-focus-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="mode-focus-result-followup" data-testid="mode-focus-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function FirstBeatPath({
  onJump,
  result,
  summary
}: {
  summary: FirstBeatPathSummary;
  result: FirstBeatPathJumpResult | null;
  onJump: (step: FirstBeatPathStep) => void;
}): ReactElement {
  const nextStep = summary.steps.find((step) => step.id === summary.nextStepId) ?? summary.steps[0] ?? null;
  const checkHint = nextStep ? firstBeatPathCheckHint(nextStep, summary) : null;

  return (
    <section className={`first-beat-path ${summary.tone}`} data-testid="first-beat-path" aria-label="First beat path">
      <div className="first-beat-path-heading">
        <div>
          <ListChecks size={16} aria-hidden="true" />
          <span data-testid="first-beat-path-status">{summary.statusLabel}</span>
        </div>
        <strong data-testid="first-beat-path-headline">{summary.headline}</strong>
        <small data-testid="first-beat-path-detail">{summary.detail}</small>
      </div>
      <div className="first-beat-path-count" data-next-step={summary.nextStepId} data-testid="first-beat-path-count">
        <span>Path</span>
        <strong>{summary.countLabel}</strong>
        <small>{firstBeatPathToneLabel(summary.tone)}</small>
      </div>
      <div
        className={`first-beat-path-decision ${summary.tone}`}
        data-first-beat-path-decision={summary.nextStepId}
        data-testid="first-beat-path-decision"
        title={summary.decisionTitle}
      >
        <span data-testid="first-beat-path-decision-status">{summary.decisionStatus}</span>
        <strong data-testid="first-beat-path-decision-label">{summary.decisionLabel}</strong>
        <small data-testid="first-beat-path-decision-detail">{summary.decisionDetail}</small>
        {checkHint && (
          <em
            className="first-beat-path-check-hint"
            data-first-beat-path-check={checkHint.stepId}
            data-testid="first-beat-path-check-hint"
            title={checkHint.title}
          >
            {checkHint.label}
          </em>
        )}
      </div>
      <div className="first-beat-path-steps" data-testid="first-beat-path-steps">
        {summary.steps.map((step) => {
          const next = step.id === summary.nextStepId;
          const buttonContext = firstBeatPathButtonContext(step, summary);
          return (
            <button
              aria-label={buttonContext}
              className={["first-beat-path-step", step.tone, next ? "next" : ""].filter(Boolean).join(" ")}
              data-next={next ? "true" : "false"}
              data-testid={`first-beat-path-${step.id}`}
              key={step.id}
              onClick={() => onJump(step)}
              title={buttonContext}
              type="button"
            >
              {firstBeatPathIcon(step.id)}
              <span>{step.label}</span>
              <strong>{step.value}</strong>
              <small>{step.detail}</small>
            </button>
          );
        })}
      </div>
      {result && <FirstBeatPathJumpResultStrip result={result} />}
    </section>
  );
}

function firstBeatPathButtonContext(step: FirstBeatPathStep, summary: FirstBeatPathSummary): string {
  return [
    `Jump to ${step.jumpLabel}: ${step.detail}`,
    `Path ${summary.countLabel}`,
    `Audition ${firstBeatPathButtonAuditionCue(step)}`,
    firstBeatPathCheckHint(step, summary).label
  ].join(" / ");
}

function firstBeatPathButtonAuditionCue(step: FirstBeatPathStep): string {
  switch (step.id) {
    case "setup":
      return "Use Transport loop to confirm tempo, key, style, and the 8-bar writing range.";
    case "compose":
      return "Loop the selected Pattern while editing drums, 808/bass, chords, and melody.";
    case "arrange":
      return "Use Song or Block playback to hear section flow and hook contrast.";
    case "mix":
      return "Use stem and full-mix listening before choosing a mix move.";
    case "deliver":
      return "Read Export Preflight and Handoff posture before exporting.";
  }
}

function firstBeatPathCheckHint(
  step: FirstBeatPathStep,
  summary: FirstBeatPathSummary
): { stepId: FirstBeatPathStepId; label: string; title: string } {
  const label = (() => {
    switch (step.id) {
      case "setup":
        return "Next check: tempo, key, style, and loop before writing events.";
      case "compose":
        return "Next check: write drums, 808/bass, chords, and melody as editable events.";
      case "arrange":
        return "Next check: place Pattern A/B/C into sections with hook contrast.";
      case "mix":
        return "Next check: balance stems and headroom after the beat layers exist.";
      case "deliver":
        return "Next check: run preflight, then export or hand off explicitly.";
    }
  })();

  return {
    stepId: step.id,
    label,
    title: `${step.label}: ${step.detail} / ${summary.countLabel}`
  };
}

function FirstBeatPathJumpResultStrip({ result }: { result: FirstBeatPathJumpResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`first-beat-path-result ${result.tone}`}
      data-result-first-beat-path={result.stepId}
      data-testid="first-beat-path-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="first-beat-path-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="first-beat-path-result-title">{result.title}</strong>
          <small data-testid="first-beat-path-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="first-beat-path-result-metric" data-testid="first-beat-path-result-metric">
        <span data-testid="first-beat-path-result-status">{result.status}</span>
        <strong data-testid="first-beat-path-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="first-beat-path-result-followup" data-testid="first-beat-path-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function SessionPass({
  onFocus,
  result,
  summary
}: {
  summary: SessionPassSummary;
  result: SessionPassFocusResult | null;
  onFocus: (card: SessionPassCard) => void;
}): ReactElement {
  const activeCard = summary.cards.find((card) => card.id === summary.activeCardId) ?? null;
  const decisionActionDisabled = activeCard === null;
  const decisionActionContext = activeCard ? sessionPassButtonContext(activeCard, summary) : summary.decisionTitle;

  return (
    <section className={`session-pass ${summary.tone}`} data-testid="session-pass" aria-label="Session pass">
      <div className="session-pass-heading">
        <div>
          <ListChecks size={16} aria-hidden="true" />
          <span data-testid="session-pass-mode">{summary.mode === "guided" ? "Guided Session Pass" : "Studio Session Pass"}</span>
        </div>
        <strong data-testid="session-pass-headline">{summary.headline}</strong>
        <small data-testid="session-pass-detail">{summary.detail}</small>
      </div>
      <div
        className={`session-pass-decision ${summary.decisionTone}`}
        data-session-pass-decision={summary.activeCardId}
        data-testid="session-pass-decision"
        title={summary.decisionTitle}
      >
        <span data-testid="session-pass-decision-status">{summary.decisionStatus}</span>
        <strong data-testid="session-pass-decision-label">{summary.decisionLabel}</strong>
        <small data-testid="session-pass-decision-detail">{summary.decisionDetail}</small>
        <button
          aria-label={decisionActionContext}
          className="session-pass-decision-action"
          data-session-pass-decision-action={activeCard?.id ?? "none"}
          data-testid="session-pass-decision-run"
          disabled={decisionActionDisabled}
          onClick={() => {
            if (activeCard) {
              onFocus(activeCard);
            }
          }}
          title={decisionActionContext}
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>{summary.decisionLabel}</span>
        </button>
      </div>
      <div className="session-pass-grid" data-testid="session-pass-grid">
        {summary.cards.map((card) => {
          const buttonContext = sessionPassButtonContext(card, summary);
          return (
            <div className={`session-pass-card ${card.tone}`} data-testid={`session-pass-${card.id}`} key={card.id}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <button
                aria-label={buttonContext}
                className="session-pass-focus"
                data-testid={`session-pass-focus-${card.id}`}
                onClick={() => onFocus(card)}
                title={buttonContext}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small>{card.detail}</small>
            </div>
          );
        })}
      </div>
      {result && <SessionPassFocusResultStrip result={result} />}
    </section>
  );
}

function sessionPassButtonContext(card: SessionPassCard, summary: SessionPassSummary): string {
  return [
    `Focus ${card.focusLabel}: ${card.value}`,
    `Destination ${card.focusLabel}`,
    `Session ${sessionPassButtonMetric(summary)}`,
    `Context ${card.detail}`,
    `Audition ${sessionPassButtonAuditionCue(card)}`,
    `Next ${sessionPassButtonNextCheck(card)}`
  ].join(" / ");
}

function sessionPassButtonMetric(summary: SessionPassSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;
  return `${readyCount}/${summary.cards.length} ready / ${reviewCount} review / ${blockerCount} blocker`;
}

function sessionPassButtonAuditionCue(card: SessionPassCard): string {
  switch (card.id) {
    case "guided":
      return "Use First Beat Path and Beat Spine to move through the next direct beat-making step.";
    case "studio":
      return "Use Review Queue, Production Snapshot, and Workflow Navigator before choosing a fix.";
    case "finish":
      return "Use Finish Checklist, Mix Coach, and Master controls before final moves.";
    case "deliver":
      return "Use Export Preflight and Handoff Pack before explicit WAV, stems, MIDI, or sheet export.";
  }
}

function sessionPassButtonNextCheck(card: SessionPassCard): string {
  switch (card.id) {
    case "guided":
      return "Return after the guided step is ready or intentionally deferred.";
    case "studio":
      return "Return after the top studio issue is reviewed or fixed explicitly.";
    case "finish":
      return "Return after compose, arrange, mix, master, automation, and handoff checks are ready.";
    case "deliver":
      return "Return after deliverables and handoff context match the selected target.";
  }
}

function SessionPassFocusResultStrip({ result }: { result: SessionPassFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`session-pass-result ${result.tone}`}
      data-result-session-pass={result.cardId}
      data-testid="session-pass-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="session-pass-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="session-pass-result-title">{result.title}</strong>
          <small data-testid="session-pass-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="session-pass-result-metric" data-testid="session-pass-result-metric">
        <span data-testid="session-pass-result-status">{result.status}</span>
        <strong data-testid="session-pass-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="session-pass-result-followup" data-testid="session-pass-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function WorkflowNavigator({
  items,
  onJump,
  result
}: {
  items: WorkflowNavigatorItem[];
  result: WorkflowNavigatorJumpResult | null;
  onJump: (item: WorkflowNavigatorItem) => void;
}): ReactElement {
  const spotlight = createWorkflowSpotlightSummary(items);
  const spotlightItem = spotlight.zoneId ? items.find((item) => item.id === spotlight.zoneId) ?? null : null;

  return (
    <nav className="workflow-navigator" data-testid="workflow-navigator" aria-label="Workflow navigator">
      <div className="workflow-navigator-heading">
        <div>
          <ArrowRight size={16} aria-hidden="true" />
          <span>Workflow</span>
        </div>
        <strong>Compose to deliver</strong>
        <small>Jump across the workstation</small>
      </div>
      <div
        className={`workflow-spotlight-decision ${spotlight.tone}`}
        data-workflow-spotlight-decision={spotlight.zoneId ?? "none"}
        data-testid="workflow-spotlight-decision"
        title={spotlight.decisionTitle}
      >
        <span data-testid="workflow-spotlight-decision-status">{spotlight.decisionStatus}</span>
        <strong data-testid="workflow-spotlight-decision-label">{spotlight.decisionLabel}</strong>
        <small data-testid="workflow-spotlight-decision-detail">{spotlight.decisionDetail}</small>
        <button
          className="workflow-spotlight-decision-action"
          data-workflow-spotlight-decision-action={spotlightItem?.id ?? "none"}
          data-testid="workflow-spotlight-decision-run"
          disabled={!spotlightItem}
          onClick={() => {
            if (spotlightItem) {
              onJump(spotlightItem);
            }
          }}
          title={spotlightItem ? `Jump to ${spotlightItem.label}: ${spotlightItem.detail}` : spotlight.detailTitle}
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>{spotlight.decisionLabel}</span>
        </button>
      </div>
      <button
        aria-label={spotlight.detailTitle}
        className={`workflow-spotlight ${spotlight.tone}`}
        data-spotlight-zone={spotlight.zoneId ?? "none"}
        data-testid="workflow-spotlight"
        disabled={!spotlightItem}
        onClick={() => {
          if (spotlightItem) {
            onJump(spotlightItem);
          }
        }}
        title={spotlight.zoneId ? `Jump to ${spotlight.zoneLabel}` : spotlight.detailTitle}
        type="button"
      >
        <span data-testid="workflow-spotlight-status">{spotlight.statusLabel}</span>
        <strong data-testid="workflow-spotlight-zone">{spotlight.zoneLabel}</strong>
        <small data-testid="workflow-spotlight-detail">{spotlight.detailLabel}</small>
        <small data-testid="workflow-spotlight-count">{spotlight.countLabel}</small>
      </button>
      <div className="workflow-navigator-grid">
        {items.map((item) => (
          <button
            className={`workflow-navigator-card ${item.tone}`}
            data-testid={`workflow-jump-${item.id}`}
            key={item.id}
            onClick={() => onJump(item)}
            title={`Jump to ${item.label}`}
            type="button"
          >
            {workflowNavigatorIcon(item.id)}
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </button>
        ))}
      </div>
      {result && <WorkflowNavigatorJumpResultStrip result={result} />}
    </nav>
  );
}

function WorkflowNavigatorJumpResultStrip({ result }: { result: WorkflowNavigatorJumpResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`workflow-navigator-result ${result.tone}`}
      data-result-workflow-zone={result.zoneId}
      data-testid="workflow-navigator-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="workflow-navigator-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="workflow-navigator-result-title">{result.title}</strong>
          <small data-testid="workflow-navigator-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="workflow-navigator-result-metric" data-testid="workflow-navigator-result-metric">
        <span data-testid="workflow-navigator-result-status">{result.status}</span>
        <strong data-testid="workflow-navigator-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="workflow-navigator-result-followup" data-testid="workflow-navigator-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function createWorkflowSpotlightSummary(items: WorkflowNavigatorItem[]): WorkflowSpotlightSummary {
  const blockerCount = items.filter((item) => item.tone === "danger").length;
  const reviewCount = items.filter((item) => item.tone === "warn").length;
  const readyCount = items.filter((item) => item.tone === "good").length;
  const countLabel = `${readyCount} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
  const focusItem = items.find((item) => item.tone === "danger") ?? items.find((item) => item.tone === "warn") ?? items[0] ?? null;

  if (!focusItem) {
    return {
      zoneId: null,
      statusLabel: "No workflow zones",
      zoneLabel: "No jump target",
      detailLabel: "Workflow Navigator has no visible zones",
      countLabel,
      detailTitle: `No workflow zones / ${countLabel}`,
      decisionStatus: "Workflow empty",
      decisionLabel: "No jump target",
      decisionDetail: "Add visible workflow zones before navigating",
      decisionTitle: `Workflow Spotlight has no visible zones: ${countLabel}`,
      tone: "warn"
    };
  }

  const statusLabel = focusItem.tone === "danger" ? "Next blocker" : focusItem.tone === "warn" ? "Next review" : "Workflow clear";
  const detailLabel = `Jump target: ${focusItem.label} / ${focusItem.detail}`;
  const decisionStatus =
    focusItem.tone === "danger" ? "Workflow blocker" : focusItem.tone === "warn" ? "Workflow review" : "Workflow ready";
  const decisionLabel = `Jump ${focusItem.label}`;
  const decisionDetail = `${focusItem.value}: ${focusItem.detail}`;
  const decisionTitle = `Workflow Spotlight recommends ${decisionLabel}: ${focusItem.detail}`;

  return {
    zoneId: focusItem.id,
    statusLabel,
    zoneLabel: `${focusItem.label}: ${focusItem.value}`,
    detailLabel,
    countLabel,
    detailTitle: `${statusLabel} / ${focusItem.label}: ${focusItem.value} / ${focusItem.detail} / ${countLabel}`,
    decisionStatus,
    decisionLabel,
    decisionDetail,
    decisionTitle,
    tone: focusItem.tone
  };
}

function firstBeatPathIcon(stepId: FirstBeatPathStepId): ReactElement {
  switch (stepId) {
    case "setup":
      return <Gauge size={15} aria-hidden="true" />;
    case "compose":
      return <Drum size={15} aria-hidden="true" />;
    case "arrange":
      return <Music2 size={15} aria-hidden="true" />;
    case "mix":
      return <SlidersHorizontal size={15} aria-hidden="true" />;
    case "deliver":
      return <Download size={15} aria-hidden="true" />;
  }
}

function firstBeatPathToneLabel(tone: MixCoachTone): string {
  if (tone === "good") {
    return "Ready to finish";
  }
  if (tone === "warn") {
    return "Review the highlighted step";
  }
  return "Fix the highlighted blocker";
}

function workflowNavigatorIcon(zone: WorkflowZoneId): ReactElement {
  switch (zone) {
    case "compose":
      return <Drum size={15} aria-hidden="true" />;
    case "arrange":
      return <Music2 size={15} aria-hidden="true" />;
    case "mix":
      return <SlidersHorizontal size={15} aria-hidden="true" />;
    case "deliver":
      return <Download size={15} aria-hidden="true" />;
  }
}

function workflowCountLabel(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function modeSwitchWeakestTone(tones: MixCoachTone[]): MixCoachTone {
  if (tones.includes("danger")) {
    return "danger";
  }
  if (tones.includes("warn")) {
    return "warn";
  }
  return "good";
}
