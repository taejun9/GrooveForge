import { Layers, ListChecks, Sparkles } from "lucide-react";
import type { ReactElement } from "react";
import type {
  LayerStarterResult,
  PatternCloneResult,
  PatternCompareResult,
  PatternEditResult,
  PatternFillResult,
  PatternVariationResult
} from "./workstationUiModel";

export function LayerStarterResultStrip({ result }: { result: LayerStarterResult }): ReactElement {
  return (
    <div
      className={`pattern-stack-result layer-starter-result ${result.tone}`}
      data-result-layer-starter={result.starterId}
      data-testid="layer-starter-result"
      aria-live="polite"
    >
      <div className="pattern-stack-result-main">
        <Layers size={14} aria-hidden="true" />
        <span>
          <strong data-testid="layer-starter-result-title">{result.title}</strong>
          <small data-testid="layer-starter-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-stack-result-meta">
        <span data-testid="layer-starter-result-status">{result.status}</span>
        <span data-testid="layer-starter-result-scope">{result.scope}</span>
        <span data-testid="layer-starter-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-stack-result-metrics" data-testid="layer-starter-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`layer-starter-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-stack-result-followup" data-testid="layer-starter-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="layer-starter-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="layer-starter-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternFillResultStrip({ result }: { result: PatternFillResult }): ReactElement {
  return (
    <div
      className={`pattern-stack-result pattern-fill-result ${result.tone}`}
      data-result-pattern-fill={`${result.pattern}-${result.preset}`}
      data-testid="pattern-fill-result"
      aria-live="polite"
    >
      <div className="pattern-stack-result-main">
        <Sparkles size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-fill-result-title">{result.title}</strong>
          <small data-testid="pattern-fill-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-stack-result-meta">
        <span data-testid="pattern-fill-result-status">{result.status}</span>
        <span data-testid="pattern-fill-result-scope">{result.scope}</span>
        <span data-testid="pattern-fill-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-stack-result-metrics" data-testid="pattern-fill-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`pattern-fill-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-stack-result-followup" data-testid="pattern-fill-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="pattern-fill-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="pattern-fill-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternVariationResultStrip({ result }: { result: PatternVariationResult }): ReactElement {
  return (
    <div
      className={`pattern-stack-result pattern-variation-result ${result.tone}`}
      data-result-pattern-variation={`${result.pattern}-${result.preset}`}
      data-testid="pattern-variation-result"
      aria-live="polite"
    >
      <div className="pattern-stack-result-main">
        <Sparkles size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-variation-result-title">{result.title}</strong>
          <small data-testid="pattern-variation-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-stack-result-meta">
        <span data-testid="pattern-variation-result-status">{result.status}</span>
        <span data-testid="pattern-variation-result-scope">{result.scope}</span>
        <span data-testid="pattern-variation-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-stack-result-metrics" data-testid="pattern-variation-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`pattern-variation-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-stack-result-followup" data-testid="pattern-variation-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="pattern-variation-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="pattern-variation-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternCloneResultStrip({ result }: { result: PatternCloneResult }): ReactElement {
  return (
    <div
      className={`pattern-stack-result pattern-clone-result ${result.tone}`}
      data-result-pattern-clone={`${result.source}-${result.target}-${result.preset}`}
      data-testid="pattern-clone-result"
      aria-live="polite"
    >
      <div className="pattern-stack-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-clone-result-title">{result.title}</strong>
          <small data-testid="pattern-clone-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-stack-result-meta">
        <span data-testid="pattern-clone-result-status">{result.status}</span>
        <span data-testid="pattern-clone-result-scope">{result.scope}</span>
        <span data-testid="pattern-clone-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-stack-result-metrics" data-testid="pattern-clone-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`pattern-clone-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-stack-result-followup" data-testid="pattern-clone-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="pattern-clone-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="pattern-clone-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternEditResultStrip({ result }: { result: PatternEditResult }): ReactElement {
  return (
    <div
      className={`pattern-stack-result pattern-edit-result ${result.tone}`}
      data-result-pattern-edit={`${result.action}-${result.source}-${result.target}`}
      data-testid="pattern-edit-result"
      aria-live="polite"
    >
      <div className="pattern-stack-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-edit-result-title">{result.title}</strong>
          <small data-testid="pattern-edit-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-stack-result-meta">
        <span data-testid="pattern-edit-result-status">{result.status}</span>
        <span data-testid="pattern-edit-result-scope">{result.scope}</span>
        <span data-testid="pattern-edit-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-stack-result-metrics" data-testid="pattern-edit-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`pattern-edit-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-stack-result-followup" data-testid="pattern-edit-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="pattern-edit-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="pattern-edit-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternCompareResultStrip({ result }: { result: PatternCompareResult }): ReactElement {
  return (
    <div
      className={`pattern-stack-result pattern-compare-result ${result.tone}`}
      data-result-pattern-compare={`${result.action}-${result.pattern}`}
      data-testid="pattern-compare-result"
      aria-live="polite"
    >
      <div className="pattern-stack-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-compare-result-title">{result.title}</strong>
          <small data-testid="pattern-compare-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-stack-result-meta">
        <span data-testid="pattern-compare-result-status">{result.status}</span>
        <span data-testid="pattern-compare-result-scope">{result.scope}</span>
        <span data-testid="pattern-compare-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-stack-result-metrics" data-testid="pattern-compare-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`pattern-compare-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-stack-result-followup" data-testid="pattern-compare-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="pattern-compare-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="pattern-compare-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}
