/**
 * 현재 프로젝트를 편집 상태와 분리된 읽기 전용 Overview로 투영한다.
 * 전체 곡 듣기는 상위 App이 소유한 단일 transport를 호출하고, 이 컴포넌트는 진행 스냅샷만 표시한다.
 */
import {
  CircleStop,
  Disc3,
  Download,
  Gauge,
  ListChecks,
  Music2,
  Play,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import type { ReactElement } from "react";
import {
  activeDeliveryTarget,
  arrangementTotalBars,
  arrangementTotalSteps,
  getStyle,
  patternSlots,
  projectStepDurationSeconds,
  type PatternData,
  type ProjectState
} from "../domain/workstation";
import type { ExportAnalysis } from "../audio/render";
import type { PlaybackSnapshot } from "../audio/scheduler";
import { localizeWorkflowNavigatorItem, useLocalization } from "./localization";
import type { WorkflowNavigatorItem } from "./workstationUiModel";
import { WorkspacePageTabs } from "./WorkspacePageTabs";

export type OverviewWorkspacePageId = "snapshot" | "song-map" | "readiness";

type OverviewAnalysisState = "pending" | "ready" | "error";

export type OverviewPlaybackProgress = {
  currentStep: number;
  elapsedSeconds: number;
  percent: number;
  totalSeconds: number;
  totalSteps: number;
};

export function projectSongDurationSeconds(project: ProjectState): number {
  return arrangementTotalSteps(project) * projectStepDurationSeconds(project);
}

export function createOverviewPlaybackProgress(
  project: ProjectState,
  playbackPosition: PlaybackSnapshot | null,
  isFullSongPlaying: boolean
): OverviewPlaybackProgress {
  const totalSteps = Math.max(1, arrangementTotalSteps(project));
  const currentStep = isFullSongPlaying && playbackPosition?.mode === "arrangement"
    ? Math.min(totalSteps, Math.max(0, playbackPosition.loopStep) + 1)
    : 0;
  const stepDuration = projectStepDurationSeconds(project);
  return {
    currentStep,
    elapsedSeconds: currentStep * stepDuration,
    percent: (currentStep / totalSteps) * 100,
    totalSeconds: totalSteps * stepDuration,
    totalSteps
  };
}

function formatClock(seconds: number): string {
  const boundedSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(boundedSeconds / 60);
  const remainder = boundedSeconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function patternEventCounts(pattern: PatternData): {
  bass: number;
  chords: number;
  drums: number;
  melody: number;
  total: number;
} {
  const drums = Object.values(pattern.drumPattern).reduce(
    (total, lane) => total + lane.filter(Boolean).length,
    0
  );
  const bass = pattern.bassNotes.length;
  const melody = pattern.melodyNotes.length;
  const chords = pattern.chordEvents.length;
  return { bass, chords, drums, melody, total: drums + bass + melody + chords };
}

function audibleMusicTrackCount(project: ProjectState): number {
  const tracks = project.mixer.filter((channel) => channel.id !== "master" && channel.id !== "fx_return");
  const hasSolo = tracks.some((channel) => channel.solo);
  return tracks.filter((channel) => !channel.muted && (!hasSolo || channel.solo)).length;
}

export function WorkspaceOverview({
  activePage,
  analysis,
  analysisState,
  isFullSongPlaying,
  isPlaying,
  onSelectPage,
  onToggleFullSongPlayback,
  playbackPosition,
  project,
  workflowItems
}: {
  activePage: OverviewWorkspacePageId;
  analysis: ExportAnalysis | null;
  analysisState: OverviewAnalysisState;
  isFullSongPlaying: boolean;
  isPlaying: boolean;
  onSelectPage: (page: OverviewWorkspacePageId) => void;
  onToggleFullSongPlayback: () => void;
  playbackPosition: PlaybackSnapshot | null;
  project: ProjectState;
  workflowItems: WorkflowNavigatorItem[];
}): ReactElement {
  const { locale, t } = useLocalization();
  const style = getStyle(project);
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const progress = createOverviewPlaybackProgress(project, playbackPosition, isFullSongPlaying);
  const durationLabel = formatClock(progress.totalSeconds);
  const elapsedLabel = formatClock(progress.elapsedSeconds);
  const eventCounts = patternSlots.map((slot) => ({ slot, ...patternEventCounts(project.patterns[slot]) }));
  const totalEvents = eventCounts.reduce((total, counts) => total + counts.total, 0);
  const usedPatterns = new Set(project.arrangement.map((block) => block.pattern));
  const musicTracks = project.mixer.filter((channel) => channel.id !== "master" && channel.id !== "fx_return");
  const audibleTracks = audibleMusicTrackCount(project);
  const briefCount = Object.values(project.sessionBrief).filter((value) => value.trim().length > 0).length;
  const activeArrangementIndex = isFullSongPlaying ? playbackPosition?.arrangementIndex ?? null : null;
  const localizedWorkflowItems = workflowItems.map((item) => ({
    ...item,
    ...localizeWorkflowNavigatorItem(locale, item)
  }));
  const playbackButtonLabel = isFullSongPlaying
    ? t("overview.stopFullSong")
    : isPlaying
      ? t("overview.stopCurrentPreview")
      : t("overview.playFullSong");
  const playbackStatus = isFullSongPlaying
    ? t("overview.playingStatus", {
        bar: playbackPosition?.bar ?? 1,
        bars,
        section: playbackPosition?.section ?? t("transport.arrangement")
      })
    : isPlaying
      ? t("overview.otherPreviewStatus")
      : t("overview.readyStatus", { duration: durationLabel });
  const analysisStatusLabel = analysis
    ? t(
        analysis.status === "Ready"
          ? "overview.analysisReady"
          : analysis.status === "Hot"
            ? "overview.analysisHot"
            : analysis.status === "Limiter active"
              ? "overview.analysisLimiterActive"
              : "overview.analysisSilent"
      )
    : null;
  const analysisLabel = analysis
    ? `${analysisStatusLabel} · ${t("overview.peak")} ${analysis.peakDb.toFixed(1)} dB · ${t("overview.headroom")} ${analysis.headroomDb.toFixed(1)} dB`
    : analysisState === "error"
      ? t("overview.analysisUnavailable")
      : t("overview.analysisUpdating");

  return (
    <>
      <WorkspacePageTabs
        activePage={activePage}
        ariaLabel={t("nav.subTabsAria", { title: t("nav.overview") })}
        idPrefix="overview"
        items={[
          {
            id: "snapshot",
            label: t("nav.overviewSnapshot"),
            detail: t("nav.overviewSnapshotDetail"),
            meta: t("nav.overviewSnapshotMeta"),
            icon: <Gauge size={18} />
          },
          {
            id: "song-map",
            label: t("nav.overviewSongMap"),
            detail: t("nav.overviewSongMapDetail"),
            meta: t("nav.overviewSongMapMeta", { count: project.arrangement.length }),
            icon: <Music2 size={18} />
          },
          {
            id: "readiness",
            label: t("nav.overviewReadiness"),
            detail: t("nav.overviewReadinessDetail"),
            meta: t("nav.overviewReadinessMeta", {
              count: workflowItems.filter((item) => item.tone === "good").length,
              total: workflowItems.length
            }),
            icon: <ListChecks size={18} />
          }
        ]}
        onSelect={onSelectPage}
        title={t("nav.overviewEditor")}
      />

      <section
        aria-labelledby="overview-page-tab-snapshot"
        className="panel workspace-page-panel overview-snapshot-panel"
        data-testid="overview-page-snapshot"
        data-workspace-page="snapshot"
        hidden={activePage !== "snapshot"}
        id="overview-page-panel-snapshot"
        role="tabpanel"
        tabIndex={activePage === "snapshot" ? 0 : -1}
      >
        <div className="overview-hero">
          <div className="overview-heading">
            <span><Sparkles size={16} aria-hidden="true" />{t("overview.eyebrow")}</span>
            <h2>{t("overview.title")}</h2>
            <p>{t("overview.detail")}</p>
          </div>
          <div
            aria-label={t("overview.playerAria")}
            className={isFullSongPlaying ? "overview-player playing" : "overview-player"}
            data-playback-state={isFullSongPlaying ? "song" : isPlaying ? "other" : "idle"}
            data-testid="overview-player"
          >
            <div className="overview-player-copy">
              <span>{t("overview.fullSong")}</span>
              <strong data-testid="overview-player-status">{playbackStatus}</strong>
              <small>{elapsedLabel} / {durationLabel} · {bars} {t("overview.bars")}</small>
            </div>
            <button
              aria-label={playbackButtonLabel}
              className="overview-play-button"
              data-testid="overview-full-song-play"
              onClick={onToggleFullSongPlayback}
              title={playbackButtonLabel}
              type="button"
            >
              {isPlaying ? <CircleStop size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
              <span>{playbackButtonLabel}</span>
            </button>
            <progress
              aria-label={t("overview.progressAria", { elapsed: elapsedLabel, duration: durationLabel })}
              data-testid="overview-song-progress"
              max={progress.totalSteps}
              value={progress.currentStep}
            />
            <span className="overview-progress-label" data-testid="overview-song-progress-label">
              {isFullSongPlaying
                ? t("overview.progressPosition", {
                    bar: playbackPosition?.bar ?? 1,
                    bars,
                    percent: Math.round(progress.percent)
                  })
                : t("overview.progressStart")}
            </span>
          </div>
        </div>

        <div className="overview-metric-grid" data-testid="overview-metrics">
          <article>
            <Disc3 size={17} aria-hidden="true" />
            <span>{t("overview.projectIdentity")}</span>
            <strong>{project.title}</strong>
            <small>{style.name} · {project.bpm} BPM · {project.key} · {project.swing}% {t("overview.swing")}</small>
          </article>
          <article>
            <Music2 size={17} aria-hidden="true" />
            <span>{t("overview.songShape")}</span>
            <strong>{durationLabel} · {bars} {t("overview.bars")}</strong>
            <small>{project.arrangement.length} {t("overview.blocks")} · {usedPatterns.size}/3 {t("overview.patternsUsed")}</small>
          </article>
          <article>
            <SlidersHorizontal size={17} aria-hidden="true" />
            <span>{t("overview.musicLayers")}</span>
            <strong>{totalEvents} {t("overview.events")}</strong>
            <small>{audibleTracks}/4 {t("overview.audibleTracks")} · {musicTracks.filter((channel) => channel.muted).length} {t("overview.muted")}</small>
          </article>
          <article>
            <Download size={17} aria-hidden="true" />
            <span>{t("overview.output")}</span>
            <strong>{project.masterPreset}</strong>
            <small>{project.masterCeilingDb.toFixed(1)} dB · {target.name}</small>
          </article>
        </div>

        <div className="overview-glance-grid">
          <section aria-labelledby="overview-glance-form-title">
            <header>
              <span>{t("overview.arrangement")}</span>
              <strong id="overview-glance-form-title">{t("overview.sectionFlow")}</strong>
            </header>
            <div className="overview-mini-timeline" data-testid="overview-mini-timeline">
              {project.arrangement.map((block, index) => (
                <span
                  aria-current={activeArrangementIndex === index ? "step" : undefined}
                  className={activeArrangementIndex === index ? "active" : ""}
                  key={`${block.section}-${index}`}
                  style={{ flexGrow: block.bars }}
                  title={`${block.section} · ${t("overview.pattern")} ${block.pattern} · ${block.bars} ${t("overview.bars")}`}
                >
                  <b>{block.section}</b>
                  <small>{block.pattern} · {block.bars}b</small>
                </span>
              ))}
            </div>
          </section>
          <section aria-labelledby="overview-glance-ready-title">
            <header>
              <span>{t("overview.readiness")}</span>
              <strong id="overview-glance-ready-title">{t("overview.productionStages")}</strong>
            </header>
            <div className="overview-stage-strip" data-testid="overview-stage-strip">
              {localizedWorkflowItems.map((item) => (
                <span className={item.tone} key={item.id}>
                  <b>{item.label}</b>
                  <small>{item.value}</small>
                </span>
              ))}
            </div>
            <p>{analysisLabel}</p>
          </section>
        </div>
      </section>

      <section
        aria-labelledby="overview-page-tab-song-map"
        className="panel workspace-page-panel overview-song-map-panel"
        data-testid="overview-page-song-map"
        data-workspace-page="song-map"
        hidden={activePage !== "song-map"}
        id="overview-page-panel-song-map"
        role="tabpanel"
        tabIndex={activePage === "song-map" ? 0 : -1}
      >
        <header className="overview-section-heading">
          <span>{t("overview.songMap")}</span>
          <h2>{t("overview.songMapTitle")}</h2>
          <p>{t("overview.songMapDetail")}</p>
        </header>
        <div className="overview-arrangement-list" data-testid="overview-arrangement-list">
          {project.arrangement.map((block, index) => (
            <article
              aria-current={activeArrangementIndex === index ? "step" : undefined}
              className={activeArrangementIndex === index ? "active" : ""}
              key={`${block.section}-${index}-${block.pattern}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{block.section}</strong>
              <b>{t("overview.pattern")} {block.pattern}</b>
              <small>{block.bars} {t("overview.bars")} · {Math.round(block.energy * 100)}% {t("overview.energy")}</small>
              <em>{block.mutedTracks.length > 0 ? `${block.mutedTracks.length} ${t("overview.muted")}` : t("overview.allLayers")}</em>
            </article>
          ))}
        </div>
        <div className="overview-detail-grid">
          <section aria-labelledby="overview-pattern-title">
            <header><strong id="overview-pattern-title">{t("overview.patternInventory")}</strong></header>
            <div className="overview-pattern-grid">
              {eventCounts.map((counts) => (
                <article key={counts.slot}>
                  <span>{t("overview.pattern")}</span>
                  <strong>{counts.slot}</strong>
                  <b>{counts.total} {t("overview.events")}</b>
                  <small>
                    {counts.drums} {t("overview.drumsShort")} · {counts.bass} {t("overview.bassShort")} · {counts.chords} {t("overview.chordsShort")} · {counts.melody} {t("overview.melodyShort")}
                  </small>
                </article>
              ))}
            </div>
          </section>
          <section aria-labelledby="overview-track-title">
            <header><strong id="overview-track-title">{t("overview.trackInventory")}</strong></header>
            <div className="overview-track-list">
              {project.mixer.map((channel) => (
                <article className={channel.muted ? "muted" : channel.solo ? "solo" : ""} key={channel.id}>
                  <span style={{ background: channel.accent }} aria-hidden="true" />
                  <strong>{channel.name}</strong>
                  <small>
                    {channel.volumeDb.toFixed(1)} dB · {channel.pan === 0
                      ? t("overview.panCenter")
                      : channel.pan < 0
                        ? `${t("overview.panLeft")}${Math.abs(channel.pan)}`
                        : `${t("overview.panRight")}${channel.pan}`}
                  </small>
                  <em>{channel.muted ? t("overview.muted") : channel.solo ? t("overview.solo") : t("overview.audible")}</em>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section
        aria-labelledby="overview-page-tab-readiness"
        className="panel workspace-page-panel overview-readiness-panel"
        data-testid="overview-page-readiness"
        data-workspace-page="readiness"
        hidden={activePage !== "readiness"}
        id="overview-page-panel-readiness"
        role="tabpanel"
        tabIndex={activePage === "readiness" ? 0 : -1}
      >
        <header className="overview-section-heading">
          <span>{t("overview.readiness")}</span>
          <h2>{t("overview.readinessTitle")}</h2>
          <p>{t("overview.readinessDetail")}</p>
        </header>
        <div className="overview-readiness-grid" data-testid="overview-readiness-grid">
          {localizedWorkflowItems.map((item) => (
            <article className={item.tone} key={item.id}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
        <div className="overview-output-grid">
          <section>
            <span>{t("overview.exactMeters")}</span>
            <strong>{analysisLabel}</strong>
            <small>
              {analysis
                ? `${analysis.sampleRate / 1000} kHz · ${analysis.bitDepth}-bit · ${analysis.channels === 2 ? t("overview.stereo") : `${analysis.channels}${t("overview.channels")}`}`
                : t("overview.analysisCoreSafe")}
            </small>
          </section>
          <section>
            <span>{t("overview.deliveryContext")}</span>
            <strong>{target.name}</strong>
            <small>{briefCount}/4 {t("overview.briefFields")} · {target.stemGoal} {t("overview.stemGoal")}</small>
          </section>
          <section>
            <span>{t("overview.masterOutput")}</span>
            <strong>{project.masterPreset}</strong>
            <small>{project.masterCeilingDb.toFixed(1)} dB {t("overview.ceiling")} · {project.automation.length} {t("overview.automationEvents")}</small>
          </section>
        </div>
      </section>
    </>
  );
}
