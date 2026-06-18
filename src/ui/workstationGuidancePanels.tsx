import {
  ArrowRight,
  Download,
  Drum,
  Gauge,
  ListChecks,
  Music2,
  SlidersHorizontal
} from "lucide-react";
import type { ReactElement } from "react";
import type {
  FirstBeatPathStepId,
  FirstBeatPathSummary,
  FirstBeatPathTarget,
  MixCoachTone,
  ModeFocusCard,
  ModeFocusSummary,
  SessionPassCard,
  SessionPassSummary,
  WorkflowNavigatorItem,
  WorkflowSpotlightSummary,
  WorkflowZoneId
} from "./workstationUiModel";

export function ModeFocus({ onFocus, summary }: { summary: ModeFocusSummary; onFocus: (card: ModeFocusCard) => void }): ReactElement {
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
    </section>
  );
}

export function FirstBeatPath({
  onJump,
  summary
}: {
  summary: FirstBeatPathSummary;
  onJump: (target: FirstBeatPathTarget) => void;
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
              onClick={() => onJump(step.target)}
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
    </section>
  );
}

export function SessionPass({
  onFocus,
  summary
}: {
  summary: SessionPassSummary;
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
    </section>
  );
}

export function WorkflowNavigator({
  items,
  onJump
}: {
  items: WorkflowNavigatorItem[];
  onJump: (zone: WorkflowZoneId) => void;
}): ReactElement {
  const spotlight = createWorkflowSpotlightSummary(items);

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
        disabled={!spotlight.zoneId}
        onClick={() => {
          if (spotlight.zoneId) {
            onJump(spotlight.zoneId);
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
            onClick={() => onJump(item.id)}
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
    </nav>
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
