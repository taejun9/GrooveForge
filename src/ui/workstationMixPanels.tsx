import { Copy, Gauge, RotateCcw, Save, SlidersHorizontal, Target, X } from "lucide-react";
import type { ReactElement } from "react";
import type { ExportAnalysis, StemTrackId } from "../audio/render";
import type {
  MasterAutomationPadId,
  MasterAutomationPadOption,
  MasterAutomationResult,
  MasterFinishPadId,
  MasterFinishPadOption,
  MasterFinishPreviewSummary,
  MasterFinishResult,
  MixBalancePadId,
  MixBalancePadOption,
  MixBalancePreviewSummary,
  MixBalanceResult,
  MixCoachCheck,
  MixCoachFocusResult,
  MixCoachFocusSummary,
  MixFixAction,
  MixFixPreset,
  MixFixPreviewSummary,
  MixFixResult,
  MixSnapshot,
  MixSnapshotComparisonSummary,
  MixSnapshotSlotId,
  MixSnapshotSlotMap,
  SpaceFxPadId,
  SpaceFxPadOption,
  SpaceFxResult,
  StemAuditionPadId,
  StemAuditionPadOption
} from "./workstationUiModel";
import { exportDynamicsDb, formatDb, formatPercent, meterPercent } from "./workstationPatternTools";

export function MixBalancePads({
  pads,
  preview,
  result,
  onApply
}: {
  pads: MixBalancePadOption[];
  preview: MixBalancePreviewSummary;
  result: MixBalanceResult | null;
  onApply: (pad: MixBalancePadId) => void;
}): ReactElement {
  return (
    <div className="mix-balance-panel" data-testid="mix-balance-pads">
      <div className="mix-balance-heading">
        <span>Mix Balance</span>
        <strong>Rough posture</strong>
      </div>
      <div
        className={`mix-balance-preview ${preview.tone}`}
        data-preview-mix-balance={preview.padId}
        data-testid="mix-balance-preview"
        title={preview.detailTitle}
      >
        <span data-testid="mix-balance-preview-status">{preview.statusLabel}</span>
        <strong data-testid="mix-balance-preview-label">{preview.padLabel}</strong>
        <small data-testid="mix-balance-preview-channels">{preview.channelLabel}</small>
        <small data-testid="mix-balance-preview-audition">{preview.auditionLabel}</small>
        <small data-testid="mix-balance-preview-moves">{preview.moveLabel}</small>
      </div>
      {result && <MixBalanceResultStrip result={result} />}
      <div className="mix-balance-row" aria-label="Mix Balance Pads">
        {pads.map((pad) => (
          <button
            data-testid={`mix-balance-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.changedCount} moves / {pad.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function MixBalanceResultStrip({ result }: { result: MixBalanceResult }): ReactElement {
  return (
    <div
      className={`mix-balance-result ${result.tone}`}
      data-result-mix-balance={result.padId}
      data-testid="mix-balance-result"
      aria-live="polite"
    >
      <div className="mix-balance-result-main">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>
          <strong data-testid="mix-balance-result-title">{result.title}</strong>
          <small data-testid="mix-balance-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="mix-balance-result-meta">
        <span data-testid="mix-balance-result-status">{result.status}</span>
        <span data-testid="mix-balance-result-scope">{result.scope}</span>
        <span data-testid="mix-balance-result-impact">{result.impact}</span>
      </div>
      <div className="mix-balance-result-metrics" data-testid="mix-balance-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`mix-balance-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="mix-balance-result-followup" data-testid="mix-balance-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="mix-balance-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="mix-balance-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SpaceFxPads({
  pads,
  result,
  onApply
}: {
  pads: SpaceFxPadOption[];
  result: SpaceFxResult | null;
  onApply: (pad: SpaceFxPadId) => void;
}): ReactElement {
  return (
    <div className="space-fx-panel" data-testid="space-fx-pads">
      <div className="space-fx-heading">
        <span>Space FX</span>
        <strong>Built-in send</strong>
      </div>
      {result && <SpaceFxResultStrip result={result} />}
      <div className="space-fx-row" aria-label="Space FX Pads">
        {pads.map((pad) => (
          <button
            data-testid={`space-fx-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.changedCount} sends / {pad.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function SpaceFxResultStrip({ result }: { result: SpaceFxResult }): ReactElement {
  return (
    <div
      className={`space-fx-result ${result.tone}`}
      data-result-space-fx={result.padId}
      data-testid="space-fx-result"
      aria-live="polite"
    >
      <div className="space-fx-result-main">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>
          <strong data-testid="space-fx-result-title">{result.title}</strong>
          <small data-testid="space-fx-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="space-fx-result-meta">
        <span data-testid="space-fx-result-status">{result.status}</span>
        <span data-testid="space-fx-result-scope">{result.scope}</span>
        <span data-testid="space-fx-result-impact">{result.impact}</span>
      </div>
      <div className="space-fx-result-metrics" data-testid="space-fx-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`space-fx-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="space-fx-result-followup" data-testid="space-fx-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="space-fx-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="space-fx-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function StemAuditionPads({
  pads,
  onApply
}: {
  pads: StemAuditionPadOption[];
  onApply: (pad: StemAuditionPadId) => void;
}): ReactElement {
  return (
    <div className="stem-audition-panel" data-testid="stem-audition-pads">
      <div className="stem-audition-heading">
        <span>Stem Audition</span>
        <strong>Solo check</strong>
      </div>
      <div className="stem-audition-row" aria-label="Stem Audition Pads">
        {pads.map((pad) => (
          <button
            className={pad.active ? "active" : ""}
            data-testid={`stem-audition-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.changedCount} moves / {pad.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MixSnapshotAB({
  snapshots,
  summary,
  onCapture,
  onRecall,
  onClear
}: {
  snapshots: MixSnapshotSlotMap;
  summary: MixSnapshotComparisonSummary;
  onCapture: (slot: MixSnapshotSlotId) => void;
  onRecall: (slot: MixSnapshotSlotId) => void;
  onClear: () => void;
}): ReactElement {
  const slotIds: MixSnapshotSlotId[] = ["A", "B"];

  return (
    <div className={`mix-snapshot-ab ${summary.tone}`} data-testid="mix-snapshot-ab">
      <div className="mix-snapshot-head">
        <span>Mix Snapshot A/B</span>
        <strong>Safer pass</strong>
        <div className="mix-snapshot-actions" aria-label="Mix Snapshot A/B actions">
          <button
            data-testid="mix-snapshot-capture-a"
            onClick={() => onCapture("A")}
            title="Capture current mix as Snapshot A"
            type="button"
          >
            <Save size={13} aria-hidden="true" />
            <span>Capture A</span>
          </button>
          <button
            data-testid="mix-snapshot-capture-b"
            onClick={() => onCapture("B")}
            title="Capture current mix as Snapshot B"
            type="button"
          >
            <Copy size={13} aria-hidden="true" />
            <span>Capture B</span>
          </button>
          <button
            data-testid="mix-snapshot-recall-a"
            disabled={!snapshots.A}
            onClick={() => onRecall("A")}
            title={snapshots.A ? "Recall Snapshot A into the current mix" : "Capture Snapshot A before recall"}
            type="button"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Recall A</span>
          </button>
          <button
            data-testid="mix-snapshot-recall-b"
            disabled={!snapshots.B}
            onClick={() => onRecall("B")}
            title={snapshots.B ? "Recall Snapshot B into the current mix" : "Capture Snapshot B before recall"}
            type="button"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Recall B</span>
          </button>
          <button data-testid="mix-snapshot-clear" onClick={onClear} title="Clear Mix Snapshot A/B" type="button">
            <X size={13} aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>
      <div className={`mix-snapshot-status ${summary.tone}`} data-testid="mix-snapshot-status-card" title={summary.detailTitle}>
        <span data-testid="mix-snapshot-status">{summary.statusLabel}</span>
        <strong data-testid="mix-snapshot-winner">{summary.winnerLabel}</strong>
        <small data-testid="mix-snapshot-detail">{summary.detailLabel}</small>
      </div>
      <div className={`mix-snapshot-decision ${summary.tone}`} data-testid="mix-snapshot-decision" title={summary.decisionTitle}>
        <span data-testid="mix-snapshot-decision-status">{summary.decisionStatus}</span>
        <strong data-testid="mix-snapshot-decision-label">{summary.decisionLabel}</strong>
        <small data-testid="mix-snapshot-decision-detail">{summary.decisionDetail}</small>
      </div>
      <div className="mix-snapshot-slots">
        {slotIds.map((slot) => (
          <MixSnapshotSlotCard key={slot} snapshot={snapshots[slot]} slot={slot} />
        ))}
      </div>
      <div className="mix-snapshot-metrics" data-testid="mix-snapshot-metrics">
        {summary.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`mix-snapshot-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em data-testid={`mix-snapshot-metric-${metric.id}-a`}>A {metric.aLabel}</em>
            <em data-testid={`mix-snapshot-metric-${metric.id}-b`}>B {metric.bLabel}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function MixSnapshotSlotCard({
  snapshot,
  slot
}: {
  snapshot: MixSnapshot | null;
  slot: MixSnapshotSlotId;
}): ReactElement {
  const testSlot = slot.toLowerCase();
  if (!snapshot) {
    return (
      <div className="mix-snapshot-slot empty" data-testid={`mix-snapshot-slot-${testSlot}`}>
        <span data-testid={`mix-snapshot-slot-${testSlot}-time`}>Mix {slot}</span>
        <strong data-testid={`mix-snapshot-slot-${testSlot}-export`}>Empty slot</strong>
        <small data-testid={`mix-snapshot-slot-${testSlot}-master`}>No master pass</small>
        <small data-testid={`mix-snapshot-slot-${testSlot}-balance`}>No balance pass</small>
        <small data-testid={`mix-snapshot-slot-${testSlot}-stems`}>No stem pass</small>
      </div>
    );
  }

  return (
    <div className={`mix-snapshot-slot ${snapshot.tone}`} data-testid={`mix-snapshot-slot-${testSlot}`}>
      <span data-testid={`mix-snapshot-slot-${testSlot}-time`}>Mix {slot} / {snapshot.capturedAtLabel}</span>
      <strong data-testid={`mix-snapshot-slot-${testSlot}-export`}>{snapshot.exportLabel}</strong>
      <small data-testid={`mix-snapshot-slot-${testSlot}-master`}>{snapshot.masterLabel}</small>
      <small data-testid={`mix-snapshot-slot-${testSlot}-balance`}>{snapshot.balanceLabel}</small>
      <small data-testid={`mix-snapshot-slot-${testSlot}-stems`}>{snapshot.stemLabel}</small>
    </div>
  );
}

export function MasterFinishPads({
  pads,
  preview,
  result,
  onApply
}: {
  pads: MasterFinishPadOption[];
  preview: MasterFinishPreviewSummary;
  result: MasterFinishResult | null;
  onApply: (pad: MasterFinishPadId) => void;
}): ReactElement {
  return (
    <div className="master-finish-panel" data-testid="master-finish-pads">
      <div className="master-finish-heading">
        <span>Master Finish</span>
        <strong>Output posture</strong>
      </div>
      <div
        className={`master-finish-preview ${preview.tone}`}
        data-preview-pad={preview.padId}
        data-testid="master-finish-preview"
        title={preview.detailTitle}
      >
        <span data-testid="master-finish-preview-status">{preview.statusLabel}</span>
        <strong data-testid="master-finish-preview-pad">{preview.padLabel}</strong>
        <small data-testid="master-finish-preview-preset">{preview.presetLabel}</small>
        <small data-testid="master-finish-preview-ceiling">{preview.ceilingLabel}</small>
        <small data-testid="master-finish-preview-output">{preview.outputLabel}</small>
        <small data-testid="master-finish-preview-changes">{preview.changeLabel}</small>
      </div>
      {result && <MasterFinishResultStrip result={result} />}
      <div className="master-finish-row" aria-label="Master Finish Pads">
        {pads.map((pad) => (
          <button
            data-testid={`master-finish-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.preview}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.changedCount} moves / {pad.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function MasterFinishResultStrip({ result }: { result: MasterFinishResult }): ReactElement {
  return (
    <div
      className={`master-finish-result ${result.tone}`}
      data-result-master-finish={result.padId}
      data-testid="master-finish-result"
      aria-live="polite"
    >
      <div className="master-finish-result-main">
        <Gauge size={14} aria-hidden="true" />
        <span>
          <strong data-testid="master-finish-result-title">{result.title}</strong>
          <small data-testid="master-finish-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="master-finish-result-meta">
        <span data-testid="master-finish-result-status">{result.status}</span>
        <span data-testid="master-finish-result-scope">{result.scope}</span>
        <span data-testid="master-finish-result-impact">{result.impact}</span>
      </div>
      <div className="master-finish-result-metrics" data-testid="master-finish-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`master-finish-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="master-finish-result-followup" data-testid="master-finish-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="master-finish-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="master-finish-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function MasterAutomationPads({
  pads,
  result,
  onApply
}: {
  pads: MasterAutomationPadOption[];
  result: MasterAutomationResult | null;
  onApply: (pad: MasterAutomationPadId) => void;
}): ReactElement {
  const activePad = pads.find((pad) => pad.active) ?? pads[0];

  return (
    <div className="master-finish-panel master-automation-panel" data-testid="master-automation-pads">
      <div className="master-finish-heading master-automation-heading">
        <span>Master Automation</span>
        <strong>Fade lane</strong>
      </div>
      <div
        className="master-finish-preview master-automation-preview good"
        data-preview-pad={activePad?.id ?? "none"}
        data-testid="master-automation-status"
        title={activePad ? `${activePad.label}: ${activePad.description}` : "Master automation"}
      >
        <span data-testid="master-automation-active">{activePad?.label ?? "None"}</span>
        <strong data-testid="master-automation-range">{activePad?.preview ?? "No fade"}</strong>
        <small>{activePad?.detail ?? "manual"}</small>
        <small>{activePad?.changedCount ?? 0} event moves</small>
        <small>Realtime</small>
        <small>Export</small>
      </div>
      {result && <MasterAutomationResultStrip result={result} />}
      <div className="master-finish-row master-automation-row" aria-label="Master Automation Pads">
        {pads.map((pad) => (
          <button
            className={pad.active ? "active" : ""}
            data-testid={`master-automation-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label} ${pad.description}`}
            type="button"
          >
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.changedCount} events / {pad.detail}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function MasterAutomationResultStrip({ result }: { result: MasterAutomationResult }): ReactElement {
  return (
    <div
      className={`master-finish-result master-automation-result ${result.tone}`}
      data-result-master-automation={result.padId}
      data-testid="master-automation-result"
      aria-live="polite"
    >
      <div className="master-finish-result-main master-automation-result-main">
        <Gauge size={14} aria-hidden="true" />
        <span>
          <strong data-testid="master-automation-result-title">{result.title}</strong>
          <small data-testid="master-automation-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="master-finish-result-meta master-automation-result-meta">
        <span data-testid="master-automation-result-status">{result.status}</span>
        <span data-testid="master-automation-result-scope">{result.scope}</span>
        <span data-testid="master-automation-result-impact">{result.impact}</span>
      </div>
      <div className="master-finish-result-metrics master-automation-result-metrics" data-testid="master-automation-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`master-automation-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="master-finish-result-followup master-automation-result-followup" data-testid="master-automation-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="master-automation-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="master-automation-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function ExportMeter({ analysis }: { analysis: ExportAnalysis }): ReactElement {
  const peakPercent = meterPercent(analysis.peakDb, analysis.ceilingDb);
  const rmsPercent = meterPercent(analysis.rmsDb, analysis.ceilingDb);
  const dynamicsDb = exportDynamicsDb(analysis);
  return (
    <div className="export-meter" data-testid="export-meter">
      <div className={`meter-status ${analysis.status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
        <span>Export meter</span>
        <strong data-testid="export-meter-status">{analysis.status}</strong>
      </div>
      <div className="meter-bars">
        <MeterBar label="Peak" percent={peakPercent} value={formatDb(analysis.peakDb)} testId="export-peak-db" />
        <MeterBar label="RMS" percent={rmsPercent} value={formatDb(analysis.rmsDb)} testId="export-rms-db" />
      </div>
      <div className="meter-stats">
        <span data-testid="export-headroom-db">Headroom {formatDb(analysis.headroomDb)}</span>
        <span data-testid="export-dynamics-db">Dynamics {formatDb(dynamicsDb)}</span>
        <span data-testid="export-limiter-percent">Limiter {formatPercent(analysis.limitedPercent)}</span>
        <span>{analysis.durationSeconds.toFixed(1)} sec</span>
      </div>
    </div>
  );
}

export function MixCoach({
  checks,
  focusedCheckId,
  focusSummary,
  focusResult,
  fixPreview,
  fixes,
  result,
  onApplyFix,
  onFocusCheck
}: {
  checks: MixCoachCheck[];
  focusedCheckId: string | null;
  focusSummary: MixCoachFocusSummary;
  focusResult: MixCoachFocusResult | null;
  fixPreview: MixFixPreviewSummary;
  fixes: MixFixAction[];
  result: MixFixResult | null;
  onApplyFix: (preset: MixFixPreset) => void;
  onFocusCheck: (check: MixCoachCheck) => void;
}): ReactElement {
  return (
    <div className="mix-coach" data-testid="mix-coach">
      <div className="mix-coach-heading">
        <span>Mix Coach</span>
        <strong data-testid="mix-coach-summary">{mixCoachSummary(checks)}</strong>
      </div>
      <div
        className={`mix-coach-focus-readout ${focusSummary.tone}`}
        data-testid="mix-coach-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="mix-coach-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="mix-coach-focus-label">{focusSummary.roleLabel}</strong>
        <small data-testid="mix-coach-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      {focusResult && <MixCoachFocusResultStrip result={focusResult} />}
      <div
        className={`mix-fix-preview ${fixPreview.tone}`}
        data-preview-fix={fixPreview.fixId}
        data-testid="mix-fix-preview"
        title={fixPreview.detailTitle}
      >
        <span data-testid="mix-fix-preview-status">{fixPreview.statusLabel}</span>
        <strong data-testid="mix-fix-preview-label">{fixPreview.fixLabel}</strong>
        <small data-testid="mix-fix-preview-scope">{fixPreview.scopeLabel}</small>
        <small data-testid="mix-fix-preview-detail">{fixPreview.detailLabel}</small>
        <small data-testid="mix-fix-preview-changes">{fixPreview.changeLabel}</small>
      </div>
      {result && <MixFixResultStrip result={result} />}
      <div className="mix-coach-list">
        {checks.map((check) => {
          const focused = focusedCheckId !== null && check.id === focusSummary.checkId;
          return (
            <div
              className={["mix-coach-card", check.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`mix-coach-check-${check.id}`}
              key={check.id}
            >
              <span>{check.label}</span>
              <strong>{check.status}</strong>
              <p>{check.detail}</p>
              <div className="mix-coach-card-actions">
                <button
                  aria-pressed={focused}
                  className="mix-coach-focus-button"
                  data-testid={`mix-coach-focus-${check.id}`}
                  onClick={() => onFocusCheck(check)}
                  title={`Focus ${check.label}: ${check.status}`}
                  type="button"
                >
                  <Target size={13} aria-hidden="true" />
                  <span>{focused ? "Focused" : "Focus"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mix-fix-row" aria-label="Mix fixes">
        {fixes.map((fix) => (
          <button
            className={fix.tone}
            data-testid={`mix-fix-${fix.preset}`}
            key={fix.preset}
            onClick={() => onApplyFix(fix.preset)}
            title={fix.detail}
            type="button"
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span>{fix.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MixCoachFocusResultStrip({ result }: { result: MixCoachFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`mix-coach-result ${result.tone}`}
      data-result-mix-coach={result.checkId}
      data-testid="mix-coach-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="mix-coach-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="mix-coach-result-title">{result.title}</strong>
          <small data-testid="mix-coach-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="mix-coach-result-destination" data-testid="mix-coach-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="mix-coach-result-metric" data-testid="mix-coach-result-metric">
        <span data-testid="mix-coach-result-status">{result.metricLabel}</span>
        <strong data-testid="mix-coach-result-value">{result.metricValue}</strong>
      </div>
      <div className="mix-coach-result-followup" data-testid="mix-coach-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

function MixFixResultStrip({ result }: { result: MixFixResult }): ReactElement {
  return (
    <div
      className={`mix-fix-result ${result.tone}`}
      data-result-mix-fix={result.fixId}
      data-testid="mix-fix-result"
      aria-live="polite"
    >
      <div className="mix-fix-result-main">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>
          <strong data-testid="mix-fix-result-title">{result.title}</strong>
          <small data-testid="mix-fix-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="mix-fix-result-meta">
        <span data-testid="mix-fix-result-status">{result.status}</span>
        <span data-testid="mix-fix-result-scope">{result.scope}</span>
        <span data-testid="mix-fix-result-impact">{result.impact}</span>
      </div>
      <div className="mix-fix-result-metrics" data-testid="mix-fix-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`mix-fix-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="mix-fix-result-followup" data-testid="mix-fix-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="mix-fix-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="mix-fix-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function StemLevelMeter({
  trackId,
  analysis
}: {
  trackId: StemTrackId;
  analysis: ExportAnalysis;
}): ReactElement {
  const peakPercent = meterPercent(analysis.peakDb, analysis.ceilingDb);
  const rmsPercent = meterPercent(analysis.rmsDb, analysis.ceilingDb);
  const statusClass = analysis.status.toLowerCase().replace(/[^a-z]+/g, "-");

  return (
    <div className="stem-meter" data-testid={`stem-level-meter-${trackId}`}>
      <div className={`stem-meter-status ${statusClass}`}>
        <span>Stem</span>
        <strong data-testid={`stem-status-${trackId}`}>{analysis.status}</strong>
      </div>
      <div className="stem-meter-bars">
        <MeterBar label="Pk" percent={peakPercent} value={formatDb(analysis.peakDb)} testId={`stem-peak-db-${trackId}`} />
        <MeterBar label="RMS" percent={rmsPercent} value={formatDb(analysis.rmsDb)} testId={`stem-rms-db-${trackId}`} />
      </div>
      <div className="stem-meter-stats">
        <span data-testid={`stem-headroom-db-${trackId}`}>Headroom {formatDb(analysis.headroomDb)}</span>
      </div>
    </div>
  );
}

function MeterBar({
  label,
  percent,
  value,
  testId
}: {
  label: string;
  percent: number;
  value: string;
  testId: string;
}): ReactElement {
  return (
    <div className="meter-bar">
      <span>{label}</span>
      <i>
        <b style={{ inlineSize: `${percent}%` }} />
      </i>
      <strong data-testid={testId}>{value}</strong>
    </div>
  );
}

function mixCoachSummary(checks: MixCoachCheck[]): string {
  const warningCount = checks.filter((check) => check.tone !== "good").length;
  if (warningCount === 0) {
    return "Ready checks";
  }
  return `${warningCount} check${warningCount === 1 ? "" : "s"} to review`;
}
