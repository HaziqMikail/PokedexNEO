import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldHalf, Swords, X } from 'lucide-react';
import { TYPE_CHART, TYPE_COLORS, getTypeStyle } from '../utils/typeLogic';

const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

function getMultiplier(attacker, defender) {
  return TYPE_CHART[attacker]?.[defender] ?? 1;
}

function getAttackerSummary(type) {
  const superEffective = [], resisted = [], immune = [];
  TYPES.forEach(def => {
    const m = getMultiplier(type, def);
    if (m >= 2) superEffective.push(def);
    else if (m === 0) immune.push(def);
    else if (m < 1) resisted.push(def);
  });
  return { superEffective, resisted, immune };
}

function getDefenderSummary(type) {
  const weakTo = [], resists = [], immuneTo = [];
  TYPES.forEach(atk => {
    const m = getMultiplier(atk, type);
    if (m >= 2) weakTo.push(atk);
    else if (m === 0) immuneTo.push(atk);
    else if (m < 1) resists.push(atk);
  });
  return { weakTo, resists, immuneTo };
}

function cellBg(value) {
  if (value === 0)   return 'rgba(22,22,28,0.88)';
  if (value === 2)   return 'rgba(34,197,94,0.85)';
  if (value === 0.5) return 'rgba(185,28,28,0.85)';
  return null;
}

function cellLabel(value) {
  if (value === 2)   return '2';
  if (value === 0.5) return '½';
  if (value === 0)   return '0';
  return null;
}

function TypePill({ type }) {
  return (
    <span
      style={getTypeStyle(type)}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
    >
      <img
        src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`}
        alt={type}
        className="w-3 h-3 opacity-90"
        onError={e => { e.target.style.display = 'none'; }}
      />
      {type}
    </span>
  );
}

function SummarySection({ label, types, emptyText }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</p>
      {types.length === 0 ? (
        <span className="text-xs text-gray-400 italic">{emptyText}</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {types.map(t => <TypePill key={t} type={t} />)}
        </div>
      )}
    </div>
  );
}

// Cell size constants (px) — used for crosshair sizing
const CELL = 34;   // cell square size
const ROW_HEADER_W = 90; // row header column width
const COL_HEADER_H = 52; // column header row height
const GAP = 2;     // gap between cells

export default function TypeChart() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null); // { rowIdx, colIdx }
  const [tooltipPos, setTooltipPos] = useState(null);  // { x, y } screen coords

  const clearSelection = () => { setSelectedRow(null); setSelectedCol(null); };
  const clearHover    = () => { setHoveredCell(null); setTooltipPos(null); };

  const handleRowClick = type => {
    setSelectedRow(prev => prev === type ? null : type);
    setSelectedCol(null);
  };
  const handleColClick = type => {
    setSelectedCol(prev => prev === type ? null : type);
    setSelectedRow(null);
  };

  const activeType = selectedRow ?? selectedCol;
  const isAttackMode = selectedRow !== null;
  const summary = activeType
    ? (isAttackMode ? getAttackerSummary(activeType) : getDefenderSummary(activeType))
    : null;

  // Crosshair positions derived from hovered cell index
  const crosshairRow = hoveredCell?.rowIdx ?? null;
  const crosshairCol = hoveredCell?.colIdx ?? null;

  // Total grid inner dimensions for crosshair overlay
  const gridW = TYPES.length * (CELL + GAP);
  const gridH = TYPES.length * (CELL + GAP);

  // Cross hair line positions relative to the data grid
  const crossX = crosshairCol !== null ? crosshairCol * (CELL + GAP) : null;
  const crossY = crosshairRow !== null ? crosshairRow * (CELL + GAP) : null;

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="glass rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neo-accent/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-neo-accent/10 rounded-2xl flex items-center justify-center border border-neo-accent/20">
            <ShieldHalf className="text-neo-accent" size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Type Effectiveness Matrix</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Click a <span className="text-neo-accent font-semibold">row</span> to see attack coverage ·
              Click a <span className="font-semibold" style={{ color: '#6890F0' }}>column</span> to see defence matchups
            </p>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5">
          {[
            { bg: 'rgba(34,197,94,0.85)',  label: '2× Super Effective' },
            { bg: 'rgba(185,28,28,0.85)', label: '½× Not Very Effective' },
            { bg: 'rgba(22,22,28,0.88)',  label: '0× Immune' },
            { bg: 'rgba(0,0,0,0.06)',     label: '1× Neutral (empty)', border: true },
          ].map(({ bg, label, border }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md" style={{ background: bg, border: border ? '1px solid rgba(0,0,0,0.12)' : 'none' }} />
              <span className="text-xs text-gray-600 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Matrix card — centered, scrollable */}
      <div className="glass rounded-3xl p-6 overflow-x-auto flex justify-center">
        <div>
          {/* Axis hint */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-neo-accent">
              <Swords size={13} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Attack (row) →</span>
            </div>
            <span className="text-gray-300 text-[10px]">|</span>
            <div className="flex items-center gap-1.5 text-blue-400">
              <ShieldHalf size={13} />
              <span className="text-[10px] font-bold uppercase tracking-widest">↓ Defense (col)</span>
            </div>
          </div>

          {/* Table wrapper — positioned for crosshair overlay */}
          <table
            className="border-collapse"
            style={{ tableLayout: 'fixed' }}
            onMouseLeave={clearHover}
          >
            {/* ── Column headers ── */}
            <thead>
              <tr>
                <th style={{ width: ROW_HEADER_W, minWidth: ROW_HEADER_W }} />
                {TYPES.map((col, ci) => {
                  const isActive  = selectedCol === col;
                  const isCrossed = crosshairCol === ci;
                  return (
                    <th key={col} style={{ width: CELL + GAP, padding: GAP / 2 }}>
                      <button
                        onClick={() => handleColClick(col)}
                        className="flex flex-col items-center gap-0.5 w-full transition-transform active:scale-95 focus:outline-none"
                      >
                        <div
                          className="flex items-center justify-center rounded-lg transition-all duration-150"
                          style={{
                            width: CELL,
                            height: CELL,
                            backgroundColor: TYPE_COLORS[col] + (isActive ? 'ff' : isCrossed ? 'cc' : '55'),
                            boxShadow: isActive ? `0 0 12px ${TYPE_COLORS[col]}99` : isCrossed ? `0 0 6px ${TYPE_COLORS[col]}55` : 'none',
                            transform: isActive ? 'scale(1.12)' : 'none',
                          }}
                        >
                          <img
                            src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${col}.svg`}
                            alt={col}
                            style={{ width: 16, height: 16 }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <span
                          className="font-bold uppercase leading-none"
                          style={{
                            fontSize: 7,
                            letterSpacing: '0.06em',
                            color: isActive ? TYPE_COLORS[col] : isCrossed ? TYPE_COLORS[col] + 'cc' : '#9ca3af',
                          }}
                        >
                          {col.slice(0, 3)}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* ── Body rows ── */}
            <tbody>
              {TYPES.map((row, ri) => {
                const isActiveRow  = selectedRow === row;
                const isCrossedRow = crosshairRow === ri;

                return (
                  <tr key={row}>
                    {/* Row header */}
                    <td style={{ paddingRight: 6, paddingTop: GAP / 2, paddingBottom: GAP / 2 }}>
                      <button
                        onClick={() => handleRowClick(row)}
                        className="flex items-center gap-2 w-full rounded-xl transition-all active:scale-95 focus:outline-none"
                        style={{
                          padding: '5px 8px',
                          backgroundColor: isActiveRow
                            ? TYPE_COLORS[row] + '28'
                            : isCrossedRow
                            ? TYPE_COLORS[row] + '14'
                            : 'transparent',
                          boxShadow: isActiveRow ? `inset 0 0 0 1.5px ${TYPE_COLORS[row]}66` : 'none',
                          minWidth: ROW_HEADER_W - 8,
                        }}
                      >
                        <div
                          className="flex-shrink-0 flex items-center justify-center rounded-md"
                          style={{
                            width: 22, height: 22,
                            backgroundColor: TYPE_COLORS[row] + (isActiveRow ? 'ff' : isCrossedRow ? 'cc' : '99'),
                          }}
                        >
                          <img
                            src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${row}.svg`}
                            alt={row}
                            style={{ width: 13, height: 13 }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <span
                          className="font-bold capitalize whitespace-nowrap"
                          style={{
                            fontSize: 10,
                            letterSpacing: '0.04em',
                            color: isActiveRow ? TYPE_COLORS[row] : isCrossedRow ? TYPE_COLORS[row] : '#374151',
                          }}
                        >
                          {row}
                        </span>
                      </button>
                    </td>

                    {/* Data cells */}
                    {TYPES.map((col, ci) => {
                      const val = getMultiplier(row, col);
                      const bg  = cellBg(val);
                      const lbl = cellLabel(val);

                      const isRowActive = selectedRow === row;
                      const isColActive = selectedCol === col;
                      const isHighlighted = isRowActive || isColActive;
                      const isCrossH = crosshairRow === ri;
                      const isCrossV = crosshairCol === ci;
                      const isHovCell = isCrossH && isCrossV;

                      // Dimming: when something is selected, non-highlighted cells dim
                      const dimmed = !isHighlighted && (selectedRow || selectedCol) ? 0.3 : 1;

                      // Crosshair tint on the line but not on active highlights
                      const isCrossLine = (isCrossH || isCrossV) && !isHovCell;

                      let cellBackground = 'rgba(0,0,0,0.045)';
                      if (bg) {
                        cellBackground = bg;
                      } else if (isHovCell) {
                        cellBackground = 'rgba(0,0,0,0.15)';
                      } else if (isCrossLine) {
                        cellBackground = 'rgba(0,0,0,0.08)';
                      } else if (isHighlighted) {
                        cellBackground = 'rgba(0,0,0,0.07)';
                      }

                      return (
                        <td
                          key={col}
                          style={{ padding: GAP / 2 }}
                          onMouseEnter={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredCell({ rowIdx: ri, colIdx: ci });
                            setTooltipPos({
                              x: rect.left + rect.width / 2,
                              y: rect.bottom + 8,
                            });
                          }}
                        >
                          <div
                            className="flex items-center justify-center rounded-md transition-all duration-100 select-none"
                            style={{
                              width: CELL,
                              height: CELL,
                              backgroundColor: cellBackground,
                              opacity: dimmed,
                              transform: isHovCell ? 'scale(1.18)' : 'none',
                              boxShadow: isHovCell && bg ? `0 0 10px ${bg}` : 'none',
                              border: isHovCell ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
                              position: 'relative',
                              zIndex: isHovCell ? 2 : 1,
                            }}
                          >
                            {lbl && (
                              <span
                                className="font-black leading-none select-none"
                                style={{ fontSize: 11, color: 'rgba(255,255,255,0.95)' }}
                              >
                                {lbl}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hover tooltip — fixed, floats below the hovered cell */}
      <AnimatePresence>
        {hoveredCell && tooltipPos && (() => {
          const row = TYPES[hoveredCell.rowIdx];
          const col = TYPES[hoveredCell.colIdx];
          const val = getMultiplier(row, col);
          const bg  = cellBg(val);
          const isDark = !!bg; // colored cells get white text
          return (
            <motion.div
              key={`tt-${hoveredCell.rowIdx}-${hoveredCell.colIdx}`}
              initial={{ opacity: 0, y: -4, scale: 0.94 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.94 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                left: tooltipPos.x,
                top:  tooltipPos.y,
                transform: 'translateX(-50%)',
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              {/* Arrow pointing up */}
              <div style={{
                margin: '0 auto',
                width: 0,
                height: 0,
                borderLeft:   '7px solid transparent',
                borderRight:  '7px solid transparent',
                borderBottom: `7px solid ${bg ? bg : 'rgba(20,20,28,0.85)'}`,
              }} />
              {/* Tooltip body */}
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl shadow-xl"
                style={{
                  background: bg ?? 'rgba(20,20,28,0.85)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  whiteSpace: 'nowrap',
                }}
              >
                <TypePill type={row} />
                <span className="font-black text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.7)' }}>→</span>
                <TypePill type={col} />
                <span
                  className="font-black text-sm ml-0.5"
                  style={{ color: '#fff' }}
                >
                  ×{val}
                </span>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Summary Panel */}
      <AnimatePresence>
        {activeType && summary && (
          <motion.div
            key={activeType + (isAttackMode ? '-atk' : '-def')}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="mt-6 glass rounded-3xl p-6 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: TYPE_COLORS[activeType] }}
            />
            <div className="flex items-center justify-between mb-6 relative">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: TYPE_COLORS[activeType] }}
                >
                  <img
                    src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${activeType}.svg`}
                    alt={activeType}
                    className="w-5 h-5"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {isAttackMode ? 'Attack Coverage' : 'Defence Profile'}
                  </p>
                  <h3
                    className="text-xl font-black uppercase tracking-tighter capitalize"
                    style={{ color: TYPE_COLORS[activeType] }}
                  >
                    {activeType}
                  </h3>
                </div>
                <span
                  className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                  style={{
                    color: TYPE_COLORS[activeType],
                    borderColor: TYPE_COLORS[activeType] + '55',
                    backgroundColor: TYPE_COLORS[activeType] + '15',
                  }}
                >
                  {isAttackMode ? '⚔ Attacker' : '🛡 Defender'}
                </span>
              </div>
              <button
                onClick={clearSelection}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {isAttackMode ? (
                <>
                  <SummarySection label="Super Effective (×2)" types={summary.superEffective} emptyText="None" />
                  <SummarySection label="Resisted (×½)" types={summary.resisted} emptyText="None" />
                  <SummarySection label="No Effect (×0)" types={summary.immune} emptyText="None" />
                </>
              ) : (
                <>
                  <SummarySection label="Weak To (×2)" types={summary.weakTo} emptyText="None" />
                  <SummarySection label="Resists (×½)" types={summary.resists} emptyText="None" />
                  <SummarySection label="Immune To (×0)" types={summary.immuneTo} emptyText="None" />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
