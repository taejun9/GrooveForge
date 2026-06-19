import { ArrowRight, CircleHelp, Copy, KeyboardMusic, Pin, PinOff, Play, Save, Trash2, Undo2, X } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import type { PatternSlot, ProjectState } from "../domain/workstation";
import { arrangementTotalBars, maxProjectSnapshotNameLength, maxProjectSnapshots, projectSnapshotSummary } from "../domain/workstation";
import type { PlaybackMode } from "../audio/scheduler";
import type { BeatReadinessCheck, BeatReadinessCheckId, LayerStarterId, LayerStarterOption, LocalDraftRecovery, PatternCompareSummary, QuickAction, QuickActionRecent, QuickActionResult, QuickActionScopeId, QuickActionScopeOption, QuickActionSpotlightSummary, SnapshotCompareFocusId, SnapshotCompareFocusItem, SnapshotCompareFocusSummary, SnapshotCompareSummary, SnapshotSlotRoleSummary } from "./workstationUiModel";
import { maxQuickActionPins, snapshotCompareFocusItem } from "./workstationUiModel";
import { barCountLabel, formatLocalDraftSavedAt } from "./workstationPatternTools";

type CommandReferenceItem = {
  id: string;
  command: string;
  shortcut: string;
  target: string;
};

type CommandReferenceSection = {
  id: string;
  title: string;
  items: CommandReferenceItem[];
};

type BeatTermItem = {
  id: string;
  term: string;
  meaning: string;
  target: string;
};

const commandReferenceSections: CommandReferenceSection[] = [
  {
    id: "desktop-shortcuts",
    title: "Desktop",
    items: [
      { id: "reference", command: "Command Reference", shortcut: "? / CmdOrCtrl+/", target: "Help" },
      { id: "actions", command: "Quick Actions", shortcut: "CmdOrCtrl+K", target: "Command palette" },
      { id: "playback", command: "Play / Stop", shortcut: "Space", target: "Selected loop" },
      { id: "patterns", command: "Pattern A/B/C", shortcut: "1 / 2 / 3", target: "Edit focus" },
      { id: "delete", command: "Delete selected event", shortcut: "Backspace / Delete", target: "Selected event" }
    ]
  },
  {
    id: "project-edit",
    title: "Project",
    items: [
      { id: "save", command: "Save project", shortcut: "CmdOrCtrl+S", target: ".grooveforge.json" },
      { id: "open", command: "Open project", shortcut: "CmdOrCtrl+O", target: "Project file" },
      { id: "undo", command: "Undo", shortcut: "CmdOrCtrl+Z", target: "Edit history" },
      { id: "redo", command: "Redo", shortcut: "Shift+CmdOrCtrl+Z / CmdOrCtrl+Y", target: "Edit history" }
    ]
  },
  {
    id: "compose-fast-path",
    title: "Create",
    items: [
      { id: "keyboard-capture", command: "Keyboard Capture", shortcut: "Quick Actions", target: "808 / Synth notes" },
      { id: "capture-step-mode", command: "Capture Step Mode", shortcut: "Quick Actions", target: "Next / Replace" },
      { id: "midi-input", command: "MIDI Input", shortcut: "Quick Actions", target: "Controller notes" },
      { id: "editor-audition", command: "Editor Audition", shortcut: "Quick Actions", target: "Selected events" },
      { id: "blueprints", command: "Beat Blueprints", shortcut: "Quick Actions", target: "Sample-free starts" },
      { id: "layer-starter", command: "Layer Starter", shortcut: "Quick Actions", target: "Drums / 808 / Chords / Synth" },
      { id: "audible-pattern-follow", command: "Audible Pattern Follow", shortcut: "Quick Actions", target: "Heard Pattern" }
    ]
  },
  {
    id: "finish-fast-path",
    title: "Finish",
    items: [
      { id: "pattern-chain", command: "Pattern Chain", shortcut: "Quick Actions", target: "Arrangement sketch" },
      { id: "audible-arrangement-follow", command: "Audible Arrangement Follow", shortcut: "Quick Actions", target: "Heard Block" },
      { id: "mix-coach", command: "Mix Coach", shortcut: "Quick Actions", target: "Headroom / balance" },
      { id: "master-finish", command: "Master Finish", shortcut: "Quick Actions", target: "Output posture" },
      { id: "master-automation", command: "Master Automation", shortcut: "Quick Actions", target: "Fade in / out" },
      { id: "handoff-pack", command: "Handoff Pack", shortcut: "Quick Actions", target: "WAV / stems / MIDI / sheet" }
    ]
  }
];

const beatTermItems: BeatTermItem[] = [
  { id: "pattern", term: "Pattern", meaning: "A/B/C loop with editable drum, 808, chord, and synth events.", target: "Compose" },
  { id: "drums", term: "Drums", meaning: "Kick, clap/snare, hats, perc, timing, chance, and pocket.", target: "Groove" },
  { id: "bass-808", term: "808/Bass", meaning: "Synth low-end notes with glide, drive, decay, and kick duck.", target: "Low end" },
  { id: "chords", term: "Chords", meaning: "Harmony bed, cadence, voicing, rhythm, velocity, and chance.", target: "Harmony" },
  { id: "sound", term: "Sound", meaning: "Preset, kit, focus, timbre, and A/B tone passes.", target: "Tone" },
  { id: "arrangement", term: "Arrangement", meaning: "Song sections, pattern blocks, energy, mutes, and transitions.", target: "Song" },
  { id: "mix-master", term: "Mix / Master", meaning: "Channel balance, space, headroom, dynamics, fades, and output.", target: "Finish" },
  { id: "handoff", term: "Handoff", meaning: "WAV, stems, MIDI, session notes, target, and delivery order.", target: "Deliver" }
];

export function PanelTitle({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }): ReactElement {
  return (
    <div className="panel-title">
      <div>
        {icon}
        <h2>{title}</h2>
      </div>
      <span>{meta}</span>
    </div>
  );
}

export function PatternCompareStrip({
  onCue,
  onUse,
  playbackMode,
  selectedBlockPattern,
  selectedPattern,
  summaries
}: {
  onCue: (pattern: PatternSlot) => void;
  onUse: (pattern: PatternSlot) => void;
  playbackMode: PlaybackMode;
  selectedBlockPattern: PatternSlot;
  selectedPattern: PatternSlot;
  summaries: PatternCompareSummary[];
}): ReactElement {
  return (
    <div className="pattern-compare" data-testid="pattern-compare" aria-label="Pattern compare">
      {summaries.map((summary) => {
        const selected = selectedPattern === summary.slot;
        const cued = selected && playbackMode === "pattern";
        const usedInBlock = selectedBlockPattern === summary.slot;
        return (
          <div
            className={["pattern-compare-card", selected ? "selected" : "", cued ? "cued" : ""]
              .filter(Boolean)
              .join(" ")}
            data-testid={`pattern-compare-${summary.slot}`}
            key={summary.slot}
          >
            <div className="pattern-compare-head">
              <span>Pattern {summary.slot}</span>
              <strong>{summary.eventCount} events</strong>
            </div>
            <div className="pattern-compare-metrics">
              <span>{summary.drumHits} drums</span>
              <span>{summary.bassNotes + summary.melodyNotes} notes</span>
              <span>{summary.chordEvents} chords</span>
            </div>
            <small>
              {barCountLabel(summary.arrangedBars)} / {summary.arrangedBlocks} block{summary.arrangedBlocks === 1 ? "" : "s"}
            </small>
            <div className="pattern-compare-actions">
              <button
                className={cued ? "selected" : ""}
                data-testid={`pattern-cue-${summary.slot}`}
                onClick={() => onCue(summary.slot)}
                title={`Cue Pattern ${summary.slot} for preview`}
                type="button"
              >
                <Play size={13} aria-hidden="true" />
                <span>Cue</span>
              </button>
              <button
                className={usedInBlock ? "selected" : ""}
                data-testid={`pattern-use-${summary.slot}`}
                disabled={usedInBlock}
                onClick={() => onUse(summary.slot)}
                title={`Use Pattern ${summary.slot} in selected block`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{usedInBlock ? "Used" : "Use"}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LayerStarterPads({
  options,
  onApply
}: {
  options: LayerStarterOption[];
  onApply: (starterId: LayerStarterId) => void;
}): ReactElement {
  return (
    <div className="layer-starter-panel" data-testid="layer-starter-pads">
      <div className="layer-starter-heading">
        <span>Layer Starter</span>
        <strong>Selected Pattern</strong>
      </div>
      <div className="layer-starter-row" aria-label="Layer Starter Pads">
        {options.map((option) => (
          <button
            className={option.tone}
            data-testid={`layer-starter-${option.id}`}
            key={option.id}
            onClick={() => onApply(option.id)}
            title={`${option.label}: ${option.detail}`}
            type="button"
          >
            <span>{option.status}</span>
            <strong>{option.label}</strong>
            <small>{option.actionLabel}</small>
            <em>{option.countLabel} / {option.targetLabel}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LocalDraftRecoveryBanner({
  draft,
  onClear,
  onRestore
}: {
  draft: LocalDraftRecovery;
  onClear: () => void;
  onRestore: () => void;
}): ReactElement {
  const bars = arrangementTotalBars(draft.project);

  return (
    <section className="local-draft-recovery" data-testid="local-draft-recovery" aria-label="Local draft recovery">
      <div>
        <strong data-testid="local-draft-title">Local draft found: {draft.project.title}</strong>
        <span data-testid="local-draft-detail">
          {formatLocalDraftSavedAt(draft.savedAt)} / {draft.project.bpm} BPM / {draft.project.key} / {barCountLabel(bars)} / local only
        </span>
      </div>
      <div className="local-draft-actions">
        <button className="icon-button primary" data-testid="restore-local-draft" onClick={onRestore} title="Restore local draft" type="button">
          <Undo2 size={16} aria-hidden="true" />
          <span>Restore Draft</span>
        </button>
        <button className="icon-button" data-testid="clear-local-draft" onClick={onClear} title="Clear local draft recovery" type="button">
          <Trash2 size={16} aria-hidden="true" />
          <span>Clear Draft</span>
        </button>
      </div>
    </section>
  );
}

export function QuickActions({
  actions,
  inspectedPinnedActionId,
  open,
  pinnedActionIds,
  query,
  recentActionSource,
  recents,
  scope,
  scopeOptions,
  onClose,
  onInspectPinnedAction,
  onQueryChange,
  onRun,
  onScopeChange,
  onTogglePin
}: {
  actions: QuickAction[];
  inspectedPinnedActionId: string | null;
  open: boolean;
  pinnedActionIds: string[];
  query: string;
  recentActionSource: QuickAction[];
  recents: QuickActionRecent[];
  scope: QuickActionScopeId;
  scopeOptions: QuickActionScopeOption[];
  onClose: () => void;
  onInspectPinnedAction: (actionId: string | null) => void;
  onQueryChange: (query: string) => void;
  onRun: (action: QuickAction) => void;
  onScopeChange: (scope: QuickActionScopeId) => void;
  onTogglePin: (action: QuickAction) => void;
}): ReactElement | null {
  if (!open) {
    return null;
  }

  const firstRunnableAction = actions.find((action) => !action.disabled);
  const spotlight = createQuickActionSpotlightSummary(actions, firstRunnableAction, scope, scopeOptions, query);
  const pinnedActions = createQuickActionPinnedOptions(pinnedActionIds, recentActionSource);
  const recentActions = createQuickActionRecentOptions(recents, recentActionSource);
  const inspectedPinnedAction = pinnedActions.find((action) => action.id === inspectedPinnedActionId) ?? null;

  return (
    <div
      className="quick-actions-overlay"
      data-testid="quick-actions"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="quick-actions-panel" role="dialog" aria-modal="true" aria-label="Quick Actions">
        <div className="quick-actions-heading">
          <div>
            <KeyboardMusic size={18} aria-hidden="true" />
            <span>Quick Actions</span>
          </div>
          <button data-testid="quick-actions-close" onClick={onClose} title="Close Quick Actions" type="button">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <input
          aria-label="Search Quick Actions"
          autoFocus
          data-testid="quick-actions-search"
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            }
            if (event.key === "Enter" && firstRunnableAction) {
              event.preventDefault();
              onRun(firstRunnableAction);
            }
          }}
          placeholder="Search commands"
          type="search"
          value={query}
        />
        <div className="quick-actions-scope-bar" data-testid="quick-actions-scope-bar" aria-label="Quick Action scopes">
          {scopeOptions.map((option) => (
            <button
              aria-pressed={scope === option.id}
              data-testid={`quick-actions-scope-${option.id}`}
              key={option.id}
              onClick={() => onScopeChange(option.id)}
              title={`${option.label}: ${option.count} matching command${option.count === 1 ? "" : "s"}`}
              type="button"
            >
              <span>{option.label}</span>
              <strong data-testid={`quick-actions-scope-count-${option.id}`}>{option.count}</strong>
            </button>
          ))}
        </div>
        <div className="quick-actions-count" data-testid="quick-actions-count">
          {actions.length} shown / {scopeOptions.find((option) => option.id === scope)?.count ?? 0} matching
        </div>
        <div
          aria-label={spotlight.detailTitle}
          className={`quick-actions-spotlight ${spotlight.tone}`}
          data-spotlight-action={spotlight.actionId ?? "none"}
          data-testid="quick-actions-spotlight"
          title={spotlight.detailTitle}
        >
          <span data-testid="quick-actions-spotlight-status">{spotlight.statusLabel}</span>
          <strong data-testid="quick-actions-spotlight-title">{spotlight.titleLabel}</strong>
          <small data-testid="quick-actions-spotlight-detail">{spotlight.detailLabel}</small>
          <small data-testid="quick-actions-spotlight-context">{spotlight.contextLabel}</small>
        </div>
        <div className="quick-actions-pinned" data-testid="quick-actions-pinned" aria-label="Pinned Quick Actions">
          <div className="quick-actions-pinned-head">
            <span data-testid="quick-actions-pinned-status">
              {pinnedActions.length}/{maxQuickActionPins} pinned
            </span>
            <strong data-testid="quick-actions-pinned-title">Pinned commands</strong>
            <small data-testid="quick-actions-pinned-detail">
              {pinnedActions.length > 0 ? "Explicit run only" : "Pin visible commands for reuse"}
            </small>
          </div>
          <div className="quick-actions-pinned-list" data-testid="quick-actions-pinned-list">
            {pinnedActions.length === 0 ? (
              <span className="quick-actions-pinned-empty" data-testid="quick-actions-pinned-empty">
                No pinned commands in this session
              </span>
            ) : (
              pinnedActions.map((action) => (
                <div className="quick-actions-pinned-card" data-testid={`quick-actions-pinned-card-${action.id}`} key={action.id}>
                  <button
                    data-testid={`quick-actions-pinned-${action.id}`}
                    disabled={action.disabled}
                    onClick={() => onRun(action)}
                    title={`Run pinned: ${action.detail}`}
                    type="button"
                  >
                    <span>{action.group}</span>
                    <strong>{action.title}</strong>
                    <small>{action.disabled ? "Unavailable now" : "Pinned"}</small>
                  </button>
                  <button
                    aria-label={`Inspect ${action.title}`}
                    aria-pressed={inspectedPinnedAction?.id === action.id}
                    className={`quick-action-pin-toggle ${inspectedPinnedAction?.id === action.id ? "selected" : ""}`}
                    data-testid={`quick-actions-pinned-inspect-${action.id}`}
                    onClick={() => onInspectPinnedAction(inspectedPinnedAction?.id === action.id ? null : action.id)}
                    title={`Inspect ${action.title}`}
                    type="button"
                  >
                    <CircleHelp size={14} aria-hidden="true" />
                    <span>Info</span>
                  </button>
                  <button
                    aria-label={`Unpin ${action.title}`}
                    className="quick-action-pin-toggle selected"
                    data-testid={`quick-actions-pinned-unpin-${action.id}`}
                    onClick={() => onTogglePin(action)}
                    title={`Unpin ${action.title}`}
                    type="button"
                  >
                    <PinOff size={14} aria-hidden="true" />
                    <span>Unpin</span>
                  </button>
                </div>
              ))
            )}
          </div>
          {inspectedPinnedAction && (
            <div
              className={`quick-actions-pinned-inspector ${inspectedPinnedAction.disabled ? "warn" : "good"}`}
              data-inspected-action={inspectedPinnedAction.id}
              data-testid="quick-actions-pinned-inspector"
            >
              <div>
                <span data-testid="quick-actions-pinned-inspector-status">
                  {inspectedPinnedAction.disabled ? "Unavailable pinned command" : "Pinned command ready"}
                </span>
                <strong data-testid="quick-actions-pinned-inspector-title">{inspectedPinnedAction.title}</strong>
                <small data-testid="quick-actions-pinned-inspector-detail">
                  {inspectedPinnedAction.group} / {inspectedPinnedAction.detail}
                </small>
              </div>
              <button
                data-testid="quick-actions-pinned-inspector-run"
                disabled={inspectedPinnedAction.disabled}
                onClick={() => onRun(inspectedPinnedAction)}
                title={`Run inspected pinned command: ${inspectedPinnedAction.detail}`}
                type="button"
              >
                <Play size={14} aria-hidden="true" />
                <span>Run</span>
              </button>
            </div>
          )}
        </div>
        <div className="quick-actions-recents" data-testid="quick-actions-recents" aria-label="Recent Quick Actions">
          <div className="quick-actions-recents-head">
            <span data-testid="quick-actions-recents-status">
              {recentActions.length > 0 ? `${recentActions.length} recent` : "No recent"}
            </span>
            <strong data-testid="quick-actions-recents-title">Recent commands</strong>
            <small data-testid="quick-actions-recents-detail">
              {recentActions.length > 0 ? "Explicit rerun only" : "Run a command to fill this row"}
            </small>
          </div>
          <div className="quick-actions-recents-list" data-testid="quick-actions-recents-list">
            {recentActions.length === 0 ? (
              <span className="quick-actions-recent-empty" data-testid="quick-actions-recent-empty">
                No command history in this session
              </span>
            ) : (
              recentActions.map(({ action, recent }) => (
                <button
                  className={recent.tone}
                  data-testid={`quick-actions-recent-${action.id}`}
                  disabled={action.disabled}
                  key={action.id}
                  onClick={() => onRun(action)}
                  title={`${recent.status}: ${action.detail}`}
                  type="button"
                >
                  <span>{action.group}</span>
                  <strong>{action.title}</strong>
                  <small>{recent.status}</small>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="quick-actions-list" data-testid="quick-actions-list">
          {actions.length === 0 ? (
            <div className="quick-action-empty" data-testid="quick-actions-empty">
              No matching actions
            </div>
          ) : (
            actions.map((action) => {
              const pinned = pinnedActionIds.includes(action.id);
              return (
                <div className={`quick-action-row ${pinned ? "pinned" : ""}`} key={action.id}>
                  <button
                    className="quick-action-run"
                    data-testid={`quick-action-${action.id}`}
                    disabled={action.disabled}
                    onClick={() => onRun(action)}
                    title={action.detail}
                    type="button"
                  >
                    <span>{action.group}</span>
                    <strong>{action.title}</strong>
                    <small>{action.detail}</small>
                  </button>
                  <button
                    aria-label={`${pinned ? "Unpin" : "Pin"} ${action.title}`}
                    aria-pressed={pinned}
                    className={`quick-action-pin-toggle ${pinned ? "selected" : ""}`}
                    data-testid={`quick-action-${pinned ? "unpin" : "pin"}-${action.id}`}
                    onClick={() => onTogglePin(action)}
                    title={`${pinned ? "Unpin" : "Pin"} ${action.title}`}
                    type="button"
                  >
                    {pinned ? <PinOff size={14} aria-hidden="true" /> : <Pin size={14} aria-hidden="true" />}
                    <span>{pinned ? "Unpin" : "Pin"}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export function CommandReferenceDialog({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement | null {
  if (!open) {
    return null;
  }

  return (
    <div
      className="quick-actions-overlay command-reference-overlay"
      data-testid="command-reference"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="command-reference-panel" role="dialog" aria-modal="true" aria-label="Command Reference">
        <div className="quick-actions-heading command-reference-heading">
          <div>
            <CircleHelp size={18} aria-hidden="true" />
            <span>Command Reference</span>
          </div>
          <button data-testid="command-reference-close" onClick={onClose} title="Close Command Reference" type="button">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="command-reference-body" data-testid="command-reference-body">
          <div className="command-reference-grid" data-testid="command-reference-grid">
            {commandReferenceSections.map((section) => (
              <div
                className="command-reference-section"
                data-testid={`command-reference-section-${section.id}`}
                key={section.id}
              >
                <div className="command-reference-section-title">
                  <span>{section.title}</span>
                  <strong>{section.items.length}</strong>
                </div>
                <div className="command-reference-items">
                  {section.items.map((item) => (
                    <div className="command-reference-item" data-testid={`command-reference-item-${item.id}`} key={item.id}>
                      <kbd>{item.shortcut}</kbd>
                      <strong>{item.command}</strong>
                      <small>{item.target}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="command-reference-terms" data-testid="command-reference-terms" aria-label="Beat terms">
            <div className="command-reference-section-title">
              <span>Beat Terms</span>
              <strong>{beatTermItems.length}</strong>
            </div>
            <div className="command-reference-terms-grid">
              {beatTermItems.map((item) => (
                <div className="command-reference-term" data-testid={`command-reference-term-${item.id}`} key={item.id}>
                  <span>{item.target}</span>
                  <strong>{item.term}</strong>
                  <small>{item.meaning}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function QuickActionResultStrip({ result }: { result: QuickActionResult }): ReactElement {
  return (
    <section className={`quick-action-result ${result.tone}`} data-testid="quick-action-result" aria-live="polite">
      <div className="quick-action-result-main">
        <span data-testid="quick-action-result-status">{result.status}</span>
        <strong data-testid="quick-action-result-title">{result.title}</strong>
        <small data-testid="quick-action-result-detail">{result.group} / {result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.metric.tone}`} data-testid="quick-action-result-metric">
        <span>{result.metric.label}</span>
        <strong data-testid="quick-action-result-metric-value">
          {result.metric.before} -&gt; {result.metric.after}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="quick-action-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="quick-action-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="quick-action-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </section>
  );
}

export function ProjectSnapshots({
  nameDrafts,
  project,
  onDelete,
  onNameCommit,
  onNameDraftChange,
  onNameDraftReset,
  onRestore,
  onSave
}: {
  nameDrafts: Record<string, string>;
  project: ProjectState;
  onDelete: (snapshotId: string) => void;
  onNameCommit: (snapshotId: string, name: string) => void;
  onNameDraftChange: (snapshotId: string, name: string) => void;
  onNameDraftReset: (snapshotId: string) => void;
  onRestore: (snapshotId: string) => void;
  onSave: () => void;
}): ReactElement {
  const roleSummary = createSnapshotSlotRoleSummary(project);

  return (
    <section className="snapshot-row" data-testid="project-snapshots" aria-label="Project snapshots">
      <div className="snapshot-heading">
        <div>
          <Save size={17} aria-hidden="true" />
          <span>Snapshots</span>
        </div>
        <strong data-testid="snapshot-count">
          {project.snapshots.length}/{maxProjectSnapshots} slots
        </strong>
        <div
          className={`snapshot-slot-role-readout ${roleSummary.tone}`}
          data-testid="snapshot-slot-role-readout"
          title={roleSummary.detailTitle}
        >
          <span data-testid="snapshot-slot-role-status">{roleSummary.statusLabel}</span>
          <strong data-testid="snapshot-slot-role-label">{roleSummary.roleLabel}</strong>
          <small data-testid="snapshot-slot-role-detail">{roleSummary.detailLabel}</small>
        </div>
        <button data-testid="snapshot-save" onClick={onSave} title="Save current project snapshot" type="button">
          <Save size={14} aria-hidden="true" />
          <span>Save Slot</span>
        </button>
      </div>
      <div className="snapshot-list">
        {project.snapshots.length === 0 ? (
          <div className="snapshot-empty" data-testid="snapshot-empty">
            <span>No slots saved</span>
          </div>
        ) : (
          project.snapshots.map((snapshot) => {
            const displayName = nameDrafts[snapshot.id] ?? snapshot.name;
            return (
              <div className="snapshot-item" data-testid={`snapshot-item-${snapshot.id}`} key={snapshot.id}>
                <div>
                  <input
                    aria-label={`Rename ${snapshot.name}`}
                    className="snapshot-name-input"
                    data-testid={`snapshot-name-${snapshot.id}`}
                    maxLength={maxProjectSnapshotNameLength}
                    onBlur={(event) => onNameCommit(snapshot.id, event.currentTarget.value)}
                    onChange={(event) => onNameDraftChange(snapshot.id, event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        onNameCommit(snapshot.id, event.currentTarget.value);
                        event.currentTarget.blur();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        onNameDraftReset(snapshot.id);
                      }
                    }}
                    title={`Rename ${snapshot.name}`}
                    type="text"
                    value={displayName}
                  />
                  <span>{projectSnapshotSummary(snapshot)}</span>
                </div>
                <div className="snapshot-actions">
                  <button data-testid={`snapshot-restore-${snapshot.id}`} onClick={() => onRestore(snapshot.id)} title={`Restore ${snapshot.name}`} type="button">
                    <Undo2 size={14} aria-hidden="true" />
                    <span>Restore</span>
                  </button>
                  <button className="danger" data-testid={`snapshot-delete-${snapshot.id}`} onClick={() => onDelete(snapshot.id)} title={`Delete ${snapshot.name}`} type="button">
                    <Trash2 size={14} aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export function SnapshotCompare({
  focusedMetricId,
  focusSummary,
  onFocus,
  summary
}: {
  focusedMetricId: SnapshotCompareFocusId | null;
  focusSummary: SnapshotCompareFocusSummary;
  onFocus: (item: SnapshotCompareFocusItem) => void;
  summary: SnapshotCompareSummary;
}): ReactElement {
  return (
    <section className={`snapshot-compare ${summary.tone}`} data-testid="snapshot-compare" aria-label="Snapshot compare">
      <div className="snapshot-compare-heading">
        <div>
          <Copy size={16} aria-hidden="true" />
          <span>Snapshot Compare</span>
        </div>
        <strong data-testid="snapshot-compare-headline">{summary.headline}</strong>
        <small data-testid="snapshot-compare-detail">{summary.detail}</small>
      </div>
      <div className={`snapshot-compare-focus-readout ${focusSummary.tone}`} data-testid="snapshot-compare-focus-readout" title={focusSummary.detailTitle}>
        <span data-testid="snapshot-compare-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="snapshot-compare-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="snapshot-compare-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      {summary.cards.length === 0 ? (
        <div className="snapshot-compare-empty" data-testid="snapshot-compare-empty">
          <span>Save a slot to compare takes</span>
        </div>
      ) : (
        <div className="snapshot-compare-grid" data-testid="snapshot-compare-grid">
          {summary.cards.map((card) => (
            <div className={`snapshot-compare-card ${card.tone}`} data-testid={`snapshot-compare-${card.id}`} key={card.id}>
              <div className="snapshot-compare-card-heading">
                <strong>{card.name}</strong>
                <small>{card.detail}</small>
              </div>
              <div className="snapshot-compare-metrics">
                {card.metrics.map((metric) => {
                  const focusItem = snapshotCompareFocusItem(card, metric);
                  const focused = focusedMetricId === focusItem.focusId;

                  return (
                    <div
                      className={["snapshot-compare-metric", metric.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
                      data-focused={focused ? "true" : "false"}
                      data-testid={`snapshot-compare-${card.id}-${metric.id}`}
                      key={metric.id}
                    >
                      <span>{metric.label}</span>
                      <strong>{metric.snapshot}</strong>
                      <button
                        aria-pressed={focused}
                        className="snapshot-compare-focus-button"
                        data-testid={`snapshot-compare-focus-${card.id}-${metric.id}`}
                        onClick={() => onFocus(focusItem)}
                        title={`Focus ${metric.focusLabel}: ${metric.snapshot}`}
                        type="button"
                      >
                        <ArrowRight size={13} aria-hidden="true" />
                        <span>{metric.focusLabel}</span>
                      </button>
                      <small>{metric.detail}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function BeatReadiness({
  checks,
  focusedCheckId,
  onFocus
}: {
  checks: BeatReadinessCheck[];
  focusedCheckId: BeatReadinessCheckId | null;
  onFocus: (check: BeatReadinessCheck) => void;
}): ReactElement {
  const readyCount = checks.filter((check) => check.tone === "good").length;

  return (
    <section className="beat-readiness" data-testid="beat-readiness" aria-label="Beat readiness">
      <div className="beat-readiness-heading">
        <span>Beat Readiness</span>
        <strong data-testid="beat-readiness-summary">
          {readyCount}/{checks.length} ready
        </strong>
      </div>
      <div className="beat-readiness-list">
        {checks.map((check) => {
          const focused = focusedCheckId === check.id;
          return (
            <div
              className={`beat-readiness-card ${check.tone} ${focused ? "focused" : ""}`}
              data-testid={`beat-readiness-check-${check.id}`}
              key={check.id}
            >
              <span>{check.label}</span>
              <strong>{check.status}</strong>
              <button
                aria-pressed={focused}
                className="beat-readiness-focus-button"
                data-testid={`beat-readiness-focus-${check.id}`}
                onClick={() => onFocus(check)}
                title={`Focus ${check.label}: ${check.detail}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{check.focusLabel}</span>
              </button>
              <p>{check.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
function createQuickActionSpotlightSummary(
  actions: QuickAction[],
  firstRunnableAction: QuickAction | undefined,
  scope: QuickActionScopeId,
  scopeOptions: QuickActionScopeOption[],
  query: string
): QuickActionSpotlightSummary {
  const scopeLabel = scopeOptions.find((option) => option.id === scope)?.label ?? "All";
  const matchingCount = scopeOptions.find((option) => option.id === scope)?.count ?? 0;
  const queryLabel = query.trim().length > 0 ? `Search "${query.trim()}"` : "No search";
  const contextLabel = `${scopeLabel} scope / ${actions.length} shown / ${matchingCount} matching / ${queryLabel}`;

  if (!firstRunnableAction) {
    const detailLabel =
      actions.length > 0 ? "Visible commands are disabled in the current state" : "No visible command matches the current scope and search";
    return {
      actionId: null,
      statusLabel: "No Enter target",
      titleLabel: "No command ready",
      detailLabel,
      contextLabel,
      detailTitle: `No Enter target / ${detailLabel} / ${contextLabel}`,
      tone: "warn"
    };
  }

  const detailLabel = `${firstRunnableAction.group} / ${firstRunnableAction.detail}`;
  return {
    actionId: firstRunnableAction.id,
    statusLabel: "Enter target",
    titleLabel: firstRunnableAction.title,
    detailLabel,
    contextLabel,
    detailTitle: `Enter target / ${firstRunnableAction.title} / ${detailLabel} / ${contextLabel}`,
    tone: "good"
  };
}

function createQuickActionRecentOptions(
  recents: QuickActionRecent[],
  actions: QuickAction[]
): Array<{ recent: QuickActionRecent; action: QuickAction }> {
  return recents.flatMap((recent) => {
    const action = actions.find((candidate) => candidate.id === recent.actionId);
    return action ? [{ recent, action }] : [];
  });
}

function normalizeShellQuickActionPinnedIds(pinnedIds: string[], actions: QuickAction[]): string[] {
  const actionIds = new Set(actions.map((action) => action.id));
  return pinnedIds.filter((id, index) => actionIds.has(id) && pinnedIds.indexOf(id) === index).slice(0, maxQuickActionPins);
}

function createQuickActionPinnedOptions(pinnedIds: string[], actions: QuickAction[]): QuickAction[] {
  const normalizedIds = normalizeShellQuickActionPinnedIds(pinnedIds, actions);
  return normalizedIds.flatMap((id) => {
    const action = actions.find((candidate) => candidate.id === id);
    return action ? [action] : [];
  });
}

function createSnapshotSlotRoleSummary(project: ProjectState): SnapshotSlotRoleSummary {
  const savedCount = project.snapshots.length;
  const statusLabel = `${savedCount}/${maxProjectSnapshots} slots`;
  const latestSnapshot = project.snapshots[0];

  if (savedCount === 0) {
    return {
      roleLabel: "Save first take",
      statusLabel,
      detailLabel: "Next Save Slot",
      detailTitle: `${statusLabel} / Save a local version before major edits`,
      tone: "warn"
    };
  }

  if (savedCount >= maxProjectSnapshots) {
    return {
      roleLabel: "Slot bank full",
      statusLabel,
      detailLabel: "Compare or clear",
      detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Delete a stale slot before saving more`,
      tone: "warn"
    };
  }

  if (savedCount === 1) {
    return {
      roleLabel: "Compare ready",
      statusLabel,
      detailLabel: latestSnapshot ? latestSnapshot.name : "1 saved take",
      detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Use Snapshot Compare before big edits`,
      tone: "good"
    };
  }

  return {
    roleLabel: "Version bank",
    statusLabel,
    detailLabel: `${savedCount} takes ready`,
    detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Compare takes before restore or delete`,
    tone: "good"
  };
}
