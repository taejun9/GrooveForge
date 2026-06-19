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
import type { ReactElement } from "react";
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

export function modeLabel(mode: ProjectState["mode"]): string {
  return mode === "guided" ? "Guided" : "Studio";
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
  const focusLine = modeFocus.cards
    .slice(0, 2)
    .map((card) => `${card.label}: ${card.value}`)
    .join(" / ");
  const resultTone = changed
    ? modeSwitchWeakestTone([modeFocus.tone, sessionPass.tone, firstBeatPath.tone, activePass?.tone ?? "good"])
    : "warn";

  return {
    mode,
    title: `${label} mode ${changed ? "active" : "already active"}`,
    status: changed ? "Switched" : "Held",
    detail:
      mode === "guided"
        ? `${firstBeatPath.headline} / ${activePass?.detail ?? sessionPass.detail}`
        : `${modeFocus.headline} / ${activePass?.detail ?? sessionPass.detail}`,
    metric: {
      id: "mode-switch",
      label: "Mode",
      before: modeLabel(beforeProject.mode),
      after: modeLabel(afterProject.mode),
      tone: changed ? "good" : "warn"
    },
    auditionCue:
      mode === "guided"
        ? "Use First Beat Path to move through setup, compose, arrange, mix, and deliver."
        : "Use Mode Focus, Review Queue, and Export Preflight for faster producer-level scans.",
    nextCheck: `${mode === "guided" ? firstBeatPath.countLabel : modeFocus.detail} / ${focusLine || sessionPass.headline}`,
    tone: resultTone
  };
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
    const passCard = sessionPassSummary.cards.find((card) => card.id === mode);
    const detail =
      mode === "guided"
        ? `${firstBeatPathSummary.headline} / ${passCard?.value ?? sessionPassSummary.headline} / ${
            passCard?.detail ?? sessionPassSummary.detail
          }`
        : `${modeFocusSummary.headline} / ${passCard?.value ?? sessionPassSummary.headline} / ${
            passCard?.detail ?? sessionPassSummary.detail
          }`;

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
      <div className="mode-focus-grid" data-testid="mode-focus-grid">
        {summary.cards.map((card) => (
          <div className={`mode-focus-card ${card.tone}`} data-testid={`mode-focus-${card.id}`} key={card.id}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <button
              className="mode-focus-jump"
              data-testid={`mode-focus-jump-${card.id}`}
              onClick={() => onFocus(card)}
              title={`Jump to ${card.focusLabel}: ${card.value}`}
              type="button"
            >
              <ArrowRight size={13} aria-hidden="true" />
              <span>{card.focusLabel}</span>
            </button>
            <small>{card.detail}</small>
          </div>
        ))}
      </div>
      {result && <ModeFocusJumpResultStrip result={result} />}
    </section>
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
      <div className="first-beat-path-steps" data-testid="first-beat-path-steps">
        {summary.steps.map((step) => {
          const next = step.id === summary.nextStepId;
          return (
            <button
              className={["first-beat-path-step", step.tone, next ? "next" : ""].filter(Boolean).join(" ")}
              data-next={next ? "true" : "false"}
              data-testid={`first-beat-path-${step.id}`}
              key={step.id}
              onClick={() => onJump(step)}
              title={`Jump to ${step.jumpLabel}: ${step.detail}`}
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
      <div className="session-pass-grid" data-testid="session-pass-grid">
        {summary.cards.map((card) => (
          <div className={`session-pass-card ${card.tone}`} data-testid={`session-pass-${card.id}`} key={card.id}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <button
              className="session-pass-focus"
              data-testid={`session-pass-focus-${card.id}`}
              onClick={() => onFocus(card)}
              title={`Focus ${card.focusLabel}: ${card.value}`}
              type="button"
            >
              <ArrowRight size={13} aria-hidden="true" />
              <span>{card.focusLabel}</span>
            </button>
            <small>{card.detail}</small>
          </div>
        ))}
      </div>
      {result && <SessionPassFocusResultStrip result={result} />}
    </section>
  );
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
      tone: "warn"
    };
  }

  const statusLabel = focusItem.tone === "danger" ? "Next blocker" : focusItem.tone === "warn" ? "Next review" : "Workflow clear";
  const detailLabel = `Jump target: ${focusItem.label} / ${focusItem.detail}`;

  return {
    zoneId: focusItem.id,
    statusLabel,
    zoneLabel: `${focusItem.label}: ${focusItem.value}`,
    detailLabel,
    countLabel,
    detailTitle: `${statusLabel} / ${focusItem.label}: ${focusItem.value} / ${focusItem.detail} / ${countLabel}`,
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
