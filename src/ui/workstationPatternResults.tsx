import { Layers, ListChecks } from "lucide-react";
import type { ReactElement } from "react";
import type { LayerStarterResult, PatternCloneResult } from "./workstationUiModel";

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
