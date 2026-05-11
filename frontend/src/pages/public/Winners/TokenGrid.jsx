import { useState } from 'react';
import { Skeleton } from 'antd';
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react';

// Renders the full list of token codes for an announced draw, with the winning
// token visually pinned + highlighted. Long lists are collapsed by default to
// keep the page scrollable.

const COLLAPSED_COUNT = 24;

export default function TokenGrid({ tokens, loading, winnerCode }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="mt-4">
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <p className="mt-4 text-sm text-text-muted">
        Token list will be published when the draw is announced.
      </p>
    );
  }

  const losing = tokens.filter((t) => !t.isWinner);
  const visible = expanded ? losing : losing.slice(0, COLLAPSED_COUNT);
  const hidden = losing.length - visible.length;

  return (
    <div className="mt-5">
      <div className="font-label-bold text-[11px] text-text-muted mb-3">
        ALL ENTERED TOKEN NUMBERS · {tokens.length}
      </div>

      {/* Winning token pinned at the top */}
      {winnerCode && (
        <div className="mb-3 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-primary text-dark">
          <div className="flex items-center gap-3 min-w-0">
            <Trophy size={18} />
            <span className="font-label-bold text-[10px]">WINNING TOKEN</span>
          </div>
          <span className="font-mono font-bold text-base tracking-wider">{winnerCode}</span>
        </div>
      )}

      {/* All other tokens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {visible.map((t) => (
          <span
            key={t.code}
            className="px-2.5 py-1.5 rounded-md bg-dark-200 border border-outline-variant/30 font-mono text-xs text-text-muted text-center tracking-wider"
          >
            {t.code}
          </span>
        ))}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline font-label-bold text-[11px]"
        >
          SHOW {hidden} MORE
          <ChevronDown size={14} />
        </button>
      )}
      {expanded && losing.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline font-label-bold text-[11px]"
        >
          COLLAPSE
          <ChevronUp size={14} />
        </button>
      )}
    </div>
  );
}
