import { analyzeExport, analyzeStemExports } from "../audio/render";
import type { ProjectState } from "../domain/workstation";
import type {
  NextMoveAction,
  QuickAction,
  QuickActionPinnedResult,
  QuickActionPinnedResultKind,
  QuickActionRecent,
  QuickActionRecentResult,
  QuickActionResult,
  QuickActionScopeId,
  QuickActionScopeOption,
  QuickActionScopeResult,
  QuickActionSearchHintResult,
  QuickActionSearchRecoveryResult,
  QuickActionSearchResult,
  QuickActionSpotlightSummary
} from "./workstationUiModel";
import {
  createBeatMapActions,
  createStructureLensActions
} from "./workstationAppHelpers";
import { composerActionQuickActionArea } from "./workstationAppHelpers";
import { createBeatReadinessChecks } from "./workstationAppDerivations";

const maxQuickActionPins = 5;

export type NextMoveQuickActionSource = "beat-map" | "structure-lens";

export const quickActionScopeDefinitions: Array<Omit<QuickActionScopeOption, "count">> = [
  { id: "all", label: "All" },
  { id: "transport", label: "Transport" },
  { id: "guide", label: "Guide" },
  { id: "compose", label: "Compose" },
  { id: "create", label: "Create" },
  { id: "sound", label: "Sound" },
  { id: "arrange", label: "Arrange" },
  { id: "mix", label: "Mix" },
  { id: "master", label: "Master" },
  { id: "finish", label: "Finish" },
  { id: "deliver", label: "Deliver" },
  { id: "project", label: "Project" },
  { id: "export", label: "Export" }
];

const guideScopeTerms = [
  "guide",
  "first beat",
  "session pass",
  "workflow",
  "mode focus",
  "beat spine",
  "beat readiness",
  "beat passport",
  "production snapshot",
  "reference alignment",
  "composer guide",
  "key compass",
  "groove compass",
  "hook readiness",
  "topline space",
  "listening pass",
  "next move"
];

const soundScopeTerms = [
  "sound",
  "drum kit",
  "drum-kit",
  "style inspector",
  "style goal",
  "style quick",
  "sound preset",
  "sound focus",
  "sound snapshot",
  "space fx",
  "space-fx",
  "tone"
];

const finishScopeTerms = [
  "finish",
  "master finish",
  "master-finish",
  "master automation",
  "master-automation",
  "export meter",
  "master output",
  "limiter",
  "fade"
];

const deliverScopeTerms = [
  "deliver",
  "delivery",
  "handoff",
  "export preflight",
  "export-preflight",
  "direct export",
  "wav",
  "stems",
  "midi",
  "sheet",
  "send order",
  "package"
];

export function createNextMoveSourceQuickActions(
  source: NextMoveQuickActionSource,
  actions: NextMoveAction[],
  onRunNextMove: (action: NextMoveAction) => void
): QuickAction[] {
  const sourceLabel = nextMoveQuickActionSourceLabel(source);
  const sourceGroup = source === "beat-map" ? "Project" : "Arrange";

  return actions.map((action) => ({
    id: nextMoveSourceQuickActionId(source, action.id),
    title: `${sourceLabel}: ${action.buttonLabel}`,
    detail: `${action.title} / ${action.detail}`,
    group: sourceGroup,
    keywords: `${sourceLabel} quick action workflow overview structure lens beat map next move ${action.id} ${action.buttonLabel} ${action.title} ${action.detail} ${action.command.kind} beginner producer direct beat composition`,
    run: () => onRunNextMove(action)
  }));
}

export function nextMoveSourceQuickActionId(source: NextMoveQuickActionSource, actionId: string): string {
  return `${source}-action-${actionId}`;
}

export function nextMoveQuickActionSourceLabel(source: NextMoveQuickActionSource): string {
  return source === "beat-map" ? "Beat Map" : "Structure Lens";
}

export function nextMoveQuickActionSource(actionId: string): NextMoveQuickActionSource | null {
  if (actionId.startsWith("beat-map-action-")) {
    return "beat-map";
  }
  if (actionId.startsWith("structure-lens-action-")) {
    return "structure-lens";
  }
  return null;
}

export function nextMoveQuickActionTargetId(actionId: string, source: NextMoveQuickActionSource): string {
  return actionId.slice(`${source}-action-`.length);
}

export function nextMoveQuickActionForProject(project: ProjectState, action: QuickAction): NextMoveAction | null {
  const source = nextMoveQuickActionSource(action.id);
  if (!source) {
    return null;
  }

  const targetId = nextMoveQuickActionTargetId(action.id, source);
  if (source === "structure-lens") {
    return createStructureLensActions(project).find((candidate) => candidate.id === targetId) ?? null;
  }

  const analysis = analyzeExport(project);
  const stemState = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, analysis);
  return createBeatMapActions(project, checks, analysis, stemState).find((candidate) => candidate.id === targetId) ?? null;
}

export function filterQuickActions(actions: QuickAction[], query: string, scope: QuickActionScopeId): QuickAction[] {
  return actions
    .filter((action) => quickActionMatchesQuery(action, query) && quickActionMatchesScope(action, scope))
    .slice(0, 12);
}

export function createQuickActionScopeOptions(actions: QuickAction[], query: string): QuickActionScopeOption[] {
  const queryMatches = actions.filter((action) => quickActionMatchesQuery(action, query));

  return quickActionScopeDefinitions.map((definition) => ({
    ...definition,
    count: queryMatches.filter((action) => quickActionMatchesScope(action, definition.id)).length
  }));
}

export function createQuickActionScopeResult(
  scope: QuickActionScopeId,
  actions: QuickAction[],
  query: string
): QuickActionScopeResult {
  const scopeOptions = createQuickActionScopeOptions(actions, query);
  const option = scopeOptions.find((candidate) => candidate.id === scope);
  const filteredActions = filterQuickActions(actions, query, scope);
  const firstRunnableAction = filteredActions.find((action) => !action.disabled);
  const scopeLabel = option?.label ?? quickActionScopeLabel(scope);
  const queryLabel = query.trim().length > 0 ? `search "${query.trim()}"` : "no search";
  const matchingCount = option?.count ?? 0;
  const enterTarget = firstRunnableAction ? firstRunnableAction.title : "No runnable Enter target";

  return {
    scope,
    status: "Scope selected",
    title: `${scopeLabel} commands`,
    detail: `${queryLabel} / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${enterTarget} only if it is the next explicit move.`
      : "Clear search or choose another scope before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function quickActionScopeLabel(scope: QuickActionScopeId): string {
  return quickActionScopeDefinitions.find((definition) => definition.id === scope)?.label ?? scope;
}

export function createQuickActionSearchHintResult(
  term: string,
  scope: QuickActionScopeId,
  actions: QuickAction[]
): QuickActionSearchHintResult {
  const normalizedTerm = term.trim();
  const scopeOptions = createQuickActionScopeOptions(actions, normalizedTerm);
  const scopeOption = scopeOptions.find((candidate) => candidate.id === scope);
  const filteredActions = filterQuickActions(actions, normalizedTerm, scope);
  const firstRunnableAction = filteredActions.find((candidate) => !candidate.disabled);
  const scopeLabel = scopeOption?.label ?? quickActionScopeLabel(scope);
  const matchingCount = scopeOption?.count ?? 0;
  const queryLabel = normalizedTerm ? `"${normalizedTerm}"` : "empty search";

  return {
    term: normalizedTerm,
    status: "Hint applied",
    title: normalizedTerm ? `Search hint ${queryLabel}` : "Search hint cleared",
    detail: `${scopeLabel} scope / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${firstRunnableAction.title} only if it is the next explicit move.`
      : "Edit the search or use Scope Filters before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function createQuickActionSearchRecoveryResult(
  action: QuickActionSearchRecoveryResult["action"],
  previousQuery: string,
  previousScope: QuickActionScopeId,
  nextQuery: string,
  nextScope: QuickActionScopeId,
  actions: QuickAction[]
): QuickActionSearchRecoveryResult {
  const trimmedPreviousQuery = previousQuery.trim();
  const trimmedNextQuery = nextQuery.trim();
  const scopeOptions = createQuickActionScopeOptions(actions, nextQuery);
  const scopeOption = scopeOptions.find((candidate) => candidate.id === nextScope);
  const filteredActions = filterQuickActions(actions, nextQuery, nextScope);
  const firstRunnableAction = filteredActions.find((candidate) => !candidate.disabled);
  const previousScopeLabel = quickActionScopeLabel(previousScope);
  const scopeLabel = scopeOption?.label ?? quickActionScopeLabel(nextScope);
  const matchingCount = scopeOption?.count ?? 0;
  const queryLabel = trimmedNextQuery ? `"${trimmedNextQuery}"` : "empty search";
  const previousQueryLabel = trimmedPreviousQuery ? `"${trimmedPreviousQuery}"` : "empty search";

  return {
    action,
    status: "Recovery applied",
    title: action === "clear" ? "Search cleared" : `Scope switched to ${scopeLabel}`,
    detail:
      action === "clear"
        ? `Cleared ${previousQueryLabel} / ${scopeLabel} scope / ${filteredActions.length} shown / ${matchingCount} matching`
        : `${previousScopeLabel} to ${scopeLabel} / ${queryLabel} / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${firstRunnableAction.title} only if it is the next explicit move.`
      : action === "clear"
        ? "Type a command term or use Scope Filters before running a command."
        : "Clear search or choose another scope before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function createQuickActionSearchResult(
  query: string,
  scope: QuickActionScopeId,
  actions: QuickAction[]
): QuickActionSearchResult {
  const trimmedQuery = query.trim();
  const scopeOptions = createQuickActionScopeOptions(actions, query);
  const scopeOption = scopeOptions.find((candidate) => candidate.id === scope);
  const filteredActions = filterQuickActions(actions, query, scope);
  const firstRunnableAction = filteredActions.find((action) => !action.disabled);
  const scopeLabel = scopeOption?.label ?? quickActionScopeLabel(scope);
  const matchingCount = scopeOption?.count ?? 0;
  const queryLabel = trimmedQuery ? `"${trimmedQuery}"` : "empty search";
  const status = trimmedQuery ? "Search updated" : "Search cleared";

  return {
    query: trimmedQuery,
    status,
    title: trimmedQuery ? `Search ${queryLabel}` : "Search cleared",
    detail: `${scopeLabel} scope / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${firstRunnableAction.title} only if it is the next explicit move.`
      : trimmedQuery
        ? "Edit the search or switch scope before running a command."
        : "Type a command term or use Scope Filters before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function createQuickActionSpotlightSummary(
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

export function quickActionMatchesQuery(action: QuickAction, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const terms = normalizedQuery.split(/\s+/);
  const tokens = quickActionSearchTokens(action);
  return terms.every((term) => tokens.some((token) => token.startsWith(term)));
}

export function quickActionMatchesScope(action: QuickAction, scope: QuickActionScopeId): boolean {
  switch (scope) {
    case "all":
      return true;
    case "transport":
      return action.group === "Transport";
    case "guide":
      return quickActionHasAnyTerm(action, guideScopeTerms);
    case "compose":
      return action.group === "Create";
    case "create":
      return action.group === "Create";
    case "sound":
      return quickActionHasAnyTerm(action, soundScopeTerms);
    case "arrange":
      return action.group === "Arrange";
    case "mix":
      return (
        action.group === "Mix" &&
        action.id !== "export-meter" &&
        action.id !== "master-output-role" &&
        action.id !== "master-finish" &&
        !action.id.startsWith("master-finish-") &&
        composerActionQuickActionArea(action.id) !== "finish"
      );
    case "master":
      return (
        action.id === "export-meter" ||
        action.id === "master-output-role" ||
        action.id === "master-finish" ||
        action.id.startsWith("master-finish-") ||
        composerActionQuickActionArea(action.id) === "finish"
      );
    case "finish":
      return (
        quickActionHasAnyTerm(action, finishScopeTerms) ||
        action.id === "master-finish" ||
        action.id.startsWith("master-finish-") ||
        composerActionQuickActionArea(action.id) === "finish"
      );
    case "deliver":
      return action.group === "Export" || quickActionHasAnyTerm(action, deliverScopeTerms);
    case "project":
      return action.group === "Project" || action.group === "Edit";
    case "export":
      return action.group === "Export";
  }
}

function quickActionHasAnyTerm(action: QuickAction, terms: string[]): boolean {
  const text = `${action.id} ${action.group} ${action.title} ${action.detail} ${action.keywords}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

export function quickActionSearchTokens(action: QuickAction): string[] {
  return `${action.group} ${action.title} ${action.detail} ${action.keywords}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function prependQuickActionRecent(
  recents: QuickActionRecent[],
  action: QuickAction,
  result: QuickActionResult
): QuickActionRecent[] {
  const nextRecent: QuickActionRecent = {
    actionId: action.id,
    status: result.status,
    tone: result.tone
  };
  return [nextRecent, ...recents.filter((recent) => recent.actionId !== action.id)].slice(0, 4);
}

export function createQuickActionRecentOptions(
  recents: QuickActionRecent[],
  actions: QuickAction[]
): Array<{ recent: QuickActionRecent; action: QuickAction }> {
  return recents.flatMap((recent) => {
    const action = actions.find((candidate) => candidate.id === recent.actionId);
    return action ? [{ recent, action }] : [];
  });
}

export function createQuickActionRecentResult(action: QuickAction, recent: QuickActionRecent): QuickActionRecentResult {
  const availableLabel = action.disabled ? "Unavailable now" : "Ready to rerun";
  const targetLabel = quickActionRecentResultTarget(action);
  return {
    actionId: action.id,
    status: "Inspected recent command",
    title: action.title,
    detail: `${action.group} / ${action.detail}`,
    metricLabel: "Last command result",
    metricValue: `${recent.status} / ${availableLabel} / ${targetLabel}`,
    nextCheck: `Rerun ${action.title} only if ${targetLabel} is still the next explicit move.`,
    tone: action.disabled ? "warn" : recent.tone
  };
}

export function quickActionRecentResultTarget(action: QuickAction): string {
  const detailTarget = action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  return `target ${detailTarget ?? action.title}`;
}

export function normalizeQuickActionPinnedIds(pinnedIds: string[], actions: QuickAction[]): string[] {
  const actionIds = new Set(actions.map((action) => action.id));
  const normalizedIds = pinnedIds.filter((id, index) => actionIds.has(id) && pinnedIds.indexOf(id) === index);
  const boundedIds = normalizedIds.slice(0, maxQuickActionPins);
  return pinnedIds.length === boundedIds.length && pinnedIds.every((id, index) => id === boundedIds[index])
    ? pinnedIds
    : boundedIds;
}

export function createQuickActionPinnedOptions(pinnedIds: string[], actions: QuickAction[]): QuickAction[] {
  const normalizedIds = normalizeQuickActionPinnedIds(pinnedIds, actions);
  return normalizedIds.flatMap((id) => {
    const action = actions.find((candidate) => candidate.id === id);
    return action ? [action] : [];
  });
}

export function createQuickActionPinnedResult(
  kind: QuickActionPinnedResultKind,
  action: QuickAction,
  beforeIds: string[],
  afterIds: string[]
): QuickActionPinnedResult {
  const availableLabel = action.disabled ? "Unavailable now" : "Ready to run";
  const status =
    kind === "pin" ? "Pinned command" : kind === "unpin" ? "Unpinned command" : "Inspected pinned command";
  const slotIndex = afterIds.indexOf(action.id);
  const slotLabel = slotIndex >= 0 ? `slot ${slotIndex + 1}` : "removed";
  const metricLabel = kind === "inspect" ? "Pinned command setup" : "Pin slots";
  const metricValue =
    kind === "unpin"
      ? `${afterIds.length}/${maxQuickActionPins} pinned / removed from session row / before ${beforeIds.length}`
      : `${afterIds.length}/${maxQuickActionPins} pinned / ${slotLabel} / ${availableLabel}`;
  const nextCheck =
    kind === "pin"
      ? `Run ${action.title} from Pinned Commands only when it is the next explicit move.`
      : kind === "unpin"
        ? "Pin another visible command if this repeat path is still useful in this session."
        : `Review ${quickActionPinnedResultTarget(action)}, then press Run only if it is the next explicit move.`;

  return {
    kind,
    actionId: action.id,
    status,
    title: action.title,
    detail: `${action.group} / ${action.detail}`,
    metricLabel,
    metricValue,
    nextCheck,
    tone: action.disabled ? "warn" : "good"
  };
}

export function quickActionPinnedResultTarget(action: QuickAction): string {
  const detailTarget = action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  return `target ${detailTarget ?? action.title}`;
}
