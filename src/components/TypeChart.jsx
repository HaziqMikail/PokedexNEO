import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldHalf, Swords, X, Compass, TableProperties, ShieldAlert, Sparkles } from 'lucide-react';
import { TYPE_CHART, TYPE_COLORS, getTypeStyle, calculateWeaknesses } from '../utils/typeLogic';

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
  if (value === 0) return 'rgba(22,22,28,0.88)';
  if (value === 2) return 'rgba(34,197,94,0.85)';
  if (value === 0.5) return 'rgba(185,28,28,0.85)';
  return null;
}

function cellLabel(value) {
  if (value === 2) return '2';
  if (value === 0.5) return '½';
  if (value === 0) return '0';
  return null;
}

function TypePill({ type, size = 'normal' }) {
  const isSmall = size === 'small';
  return (
    <span
      style={getTypeStyle(type)}
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-lg ${
        isSmall ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      }`}
    >
      <img
        src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`}
        alt={type}
        className={isSmall ? 'w-2.5 h-2.5 opacity-90' : 'w-3 h-3 opacity-90'}
        onError={e => { e.target.style.display = 'none'; }}
      />
      {type}
    </span>
  );
}

function SummarySection({ label, types, emptyText }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[10px] font-bold text-gray-400">({types.length})</span>
      </p>
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
const GAP = 2;     // gap between cells

export default function TypeChart() {
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector' | 'matrix'
  const [primaryType, setPrimaryType] = useState('fire');
  const [secondaryType, setSecondaryType] = useState(null);
  const [inspectorMode, setInspectorMode] = useState('defense'); // 'defense' | 'offense'

  // Ensure mobile view (< 768px) defaults and stays on 'inspector' (table option removed for mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && activeTab === 'matrix') {
        setActiveTab('inspector');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Full Matrix state
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null); // { rowIdx, colIdx }
  const [tooltipPos, setTooltipPos] = useState(null);  // { x, y } screen coords

  const clearSelection = () => { setSelectedRow(null); setSelectedCol(null); };
  const clearHover = () => { setHoveredCell(null); setTooltipPos(null); };

  const handleRowClick = type => {
    setSelectedRow(prev => prev === type ? null : type);
    setSelectedCol(null);
  };
  const handleColClick = type => {
    setSelectedCol(prev => prev === type ? null : type);
    setSelectedRow(null);
  };

  const activeMatrixType = selectedRow ?? selectedCol;
  const isAttackMode = selectedRow !== null;
  const matrixSummary = activeMatrixType
    ? (isAttackMode ? getAttackerSummary(activeMatrixType) : getDefenderSummary(activeMatrixType))
    : null;

  // Crosshair positions derived from hovered cell index
  const crosshairRow = hoveredCell?.rowIdx ?? null;
  const crosshairCol = hoveredCell?.colIdx ?? null;

  // Dual-Type Defense Calculation
  const activeDefendingTypes = secondaryType ? [primaryType, secondaryType] : [primaryType];
  const defenseMultipliers = calculateWeaknesses(activeDefendingTypes);

  const defenseGroups = {
    quadWeakness: [], // 4x
    weakness: [],     // 2x
    resistance: [],   // 0.5x
    quadResistance: [], // 0.25x
    immunity: [],     // 0x
  };

  TYPES.forEach(t => {
    const m = defenseMultipliers[t] ?? 1;
    if (m === 4) defenseGroups.quadWeakness.push(t);
    else if (m === 2) defenseGroups.weakness.push(t);
    else if (m === 0.5) defenseGroups.resistance.push(t);
    else if (m === 0.25) defenseGroups.quadResistance.push(t);
    else if (m === 0) defenseGroups.immunity.push(t);
  });

  // Offense Calculation
  const primaryOffense = getAttackerSummary(primaryType);
  const secondaryOffense = secondaryType ? getAttackerSummary(secondaryType) : null;

  return (
    <div className="max-w-full mx-auto pb-12">
      {/* Top Header Card with View Switcher */}
      <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neo-accent/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neo-accent/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-neo-accent/20 shrink-0">
              <ShieldHalf className="text-neo-accent" size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Type Matrix & Calculator</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                Analyze single or dual-type matchups, weaknesses and full matrix coverage.
              </p>
            </div>
          </div>

          {/* Mode Switcher Pills (Web / Desktop only: table option removed for mobile) */}
          <div className="hidden md:flex bg-black/5 p-1 rounded-xl border border-black/5 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inspector'
                  ? 'bg-neo-accent text-white shadow-sm shadow-neo-accent/30'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Compass size={14} />
              <span>Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-neo-accent text-white shadow-sm shadow-neo-accent/30'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableProperties size={14} />
              <span>Full Matrix (18×18)</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'inspector' ? (
        /* ═══════════════════════════════════════════════════════════
           TAB 1: TYPE INSPECTOR & DUAL-TYPE CALCULATOR (Mobile Native)
           ═══════════════════════════════════════════════════════════ */
        <div className="flex flex-col gap-6">
          {/* Type Selector Panel */}
          <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-black/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Primary Type */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neo-accent inline-block" />
                    Primary Type
                  </span>
                  <TypePill type={primaryType} />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {TYPES.map(t => (
                    <button
                      key={`primary-${t}`}
                      onClick={() => {
                        setPrimaryType(t);
                        if (secondaryType === t) setSecondaryType(null);
                      }}
                      style={primaryType === t ? getTypeStyle(t) : {}}
                      className={`px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all truncate text-center ${
                        primaryType === t
                          ? 'shadow-md scale-105 ring-2 ring-black/10'
                          : 'bg-white/60 text-gray-700 hover:bg-black/5 border border-black/5'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Type (Optional Dual Type) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Secondary Type (Dual Type)
                  </span>
                  {secondaryType ? (
                    <div className="flex items-center gap-1.5">
                      <TypePill type={secondaryType} />
                      <button
                        onClick={() => setSecondaryType(null)}
                        className="text-[10px] text-gray-400 hover:text-red-500 font-bold ml-1"
                        title="Remove secondary type"
                      >
                        (Clear)
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">None (Pure Type)</span>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  <button
                    onClick={() => setSecondaryType(null)}
                    className={`px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all truncate text-center ${
                      secondaryType === null
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-white/60 text-gray-500 hover:bg-black/5 border border-black/5'
                    }`}
                  >
                    None
                  </button>
                  {TYPES.map(t => {
                    const isSelected = secondaryType === t;
                    const isSameAsPrimary = primaryType === t;
                    return (
                      <button
                        key={`secondary-${t}`}
                        disabled={isSameAsPrimary}
                        onClick={() => setSecondaryType(isSelected ? null : t)}
                        style={isSelected ? getTypeStyle(t) : {}}
                        className={`px-2 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all truncate text-center ${
                          isSameAsPrimary
                            ? 'opacity-30 cursor-not-allowed bg-black/5 text-gray-400 border border-transparent'
                            : isSelected
                              ? 'shadow-md scale-105 ring-2 ring-black/10'
                              : 'bg-white/60 text-gray-700 hover:bg-black/5 border border-black/5'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Typing Badge Banner */}
            <div className="mt-5 pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Typing:</span>
                <div className="flex items-center gap-1.5">
                  <TypePill type={primaryType} />
                  {secondaryType && (
                    <>
                      <span className="text-gray-400 font-black">+</span>
                      <TypePill type={secondaryType} />
                    </>
                  )}
                </div>
              </div>

              {/* Inspector View Switcher: Defense vs Attack */}
              <div className="flex bg-black/5 p-1 rounded-xl border border-black/5">
                <button
                  onClick={() => setInspectorMode('defense')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    inspectorMode === 'defense'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShieldHalf size={13} />
                  <span>Defending (Takes)</span>
                </button>
                <button
                  onClick={() => setInspectorMode('offense')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    inspectorMode === 'offense'
                      ? 'bg-neo-accent text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Swords size={13} />
                  <span>Attacking (Deals)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Dashboard */}
          {inspectorMode === 'defense' ? (
            /* ── Defensive Profile ── */
            <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-black/5">
              <div className="flex items-center gap-2 mb-6">
                <ShieldHalf className="text-blue-600" size={20} />
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-gray-900">
                  Defensive Profile — Damage Taken by {primaryType}{secondaryType ? ` / ${secondaryType}` : ''}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 4x Quad Weakness (Only possible on dual types) */}
                {defenseGroups.quadWeakness.length > 0 && (
                  <div className="rounded-2xl p-4 bg-red-500/15 border border-red-500/30">
                    <p className="text-[11px] font-black uppercase tracking-wider text-red-600 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1"><ShieldAlert size={14} /> Double Weakness (4×)</span>
                      <span>({defenseGroups.quadWeakness.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {defenseGroups.quadWeakness.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  </div>
                )}

                {/* 2x Weakness */}
                <div className="rounded-2xl p-4 bg-orange-500/10 border border-orange-500/25">
                  <p className="text-[11px] font-black uppercase tracking-wider text-orange-700 mb-2 flex items-center justify-between">
                    <span>Weak to (2×)</span>
                    <span>({defenseGroups.weakness.length})</span>
                  </p>
                  {defenseGroups.weakness.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {defenseGroups.weakness.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  )}
                </div>

                {/* 0.5x Resistance */}
                <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/25">
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-2 flex items-center justify-between">
                    <span>Resists (½×)</span>
                    <span>({defenseGroups.resistance.length})</span>
                  </p>
                  {defenseGroups.resistance.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {defenseGroups.resistance.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  )}
                </div>

                {/* 0.25x Quad Resistance */}
                {defenseGroups.quadResistance.length > 0 && (
                  <div className="rounded-2xl p-4 bg-purple-500/10 border border-purple-500/25">
                    <p className="text-[11px] font-black uppercase tracking-wider text-purple-700 mb-2 flex items-center justify-between">
                      <span>Double Resist (¼×)</span>
                      <span>({defenseGroups.quadResistance.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {defenseGroups.quadResistance.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  </div>
                )}

                {/* 0x Immunity */}
                <div className="rounded-2xl p-4 bg-gray-900/10 border border-gray-900/20">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-800 mb-2 flex items-center justify-between">
                    <span>Immune To (0×)</span>
                    <span>({defenseGroups.immunity.length})</span>
                  </p>
                  {defenseGroups.immunity.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {defenseGroups.immunity.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Offensive Coverage ── */
            <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-black/5">
              <div className="flex items-center gap-2 mb-6">
                <Swords className="text-neo-accent" size={20} />
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-gray-900">
                  Offensive Coverage — Damage Dealt by {primaryType.toUpperCase()} Moves
                </h3>
              </div>

              {/* Primary Type Moves */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/25">
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-2 flex items-center justify-between">
                    <span>Super Effective (2×)</span>
                    <span>({primaryOffense.superEffective.length})</span>
                  </p>
                  {primaryOffense.superEffective.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {primaryOffense.superEffective.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl p-4 bg-rose-500/10 border border-rose-500/25">
                  <p className="text-[11px] font-black uppercase tracking-wider text-rose-700 mb-2 flex items-center justify-between">
                    <span>Not Very Effective (½×)</span>
                    <span>({primaryOffense.resisted.length})</span>
                  </p>
                  {primaryOffense.resisted.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {primaryOffense.resisted.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl p-4 bg-gray-900/10 border border-gray-900/20">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-800 mb-2 flex items-center justify-between">
                    <span>No Effect (0×)</span>
                    <span>({primaryOffense.immune.length})</span>
                  </p>
                  {primaryOffense.immune.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {primaryOffense.immune.map(t => <TypePill key={t} type={t} />)}
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary Type Moves (if selected) */}
              {secondaryOffense && (
                <div className="pt-6 border-t border-black/5">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-500" />
                    Damage Dealt by {secondaryType.toUpperCase()} Moves
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/25">
                      <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-2">Super Effective (2×)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {secondaryOffense.superEffective.map(t => <TypePill key={t} type={t} />)}
                      </div>
                    </div>
                    <div className="rounded-2xl p-4 bg-rose-500/10 border border-rose-500/25">
                      <p className="text-[11px] font-black uppercase tracking-wider text-rose-700 mb-2">Not Very Effective (½×)</p>
                      <div className="flex flex-wrap gap-1.5">
                        {secondaryOffense.resisted.map(t => <TypePill key={t} type={t} />)}
                      </div>
                    </div>
                    <div className="rounded-2xl p-4 bg-gray-900/10 border border-gray-900/20">
                      <p className="text-[11px] font-black uppercase tracking-wider text-gray-800 mb-2">No Effect (0×)</p>
                      {secondaryOffense.immune.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">None</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {secondaryOffense.immune.map(t => <TypePill key={t} type={t} />)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════
           TAB 2: FULL 18×18 MATRIX (With Sticky Headers)
           ═══════════════════════════════════════════════════════════ */
        <div>
          {/* Legend */}
          <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap gap-2.5 sm:gap-4 items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2">Legend:</span>
            {[
              { bg: 'rgba(34,197,94,0.85)', label: '200% Super Effective' },
              { bg: 'rgba(185,28,28,0.85)', label: '50% Not Very Effective' },
              { bg: 'rgba(0,0,0,0.06)', label: '100% Normal', border: true },
              { bg: 'rgba(22,22,28,0.88)', label: '0% No Effect' },
            ].map(({ bg, label, border }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md" style={{ background: bg, border: border ? '1px solid rgba(0,0,0,0.12)' : 'none' }} />
                <span className="text-[11px] text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Matrix Card */}
          <div className="glass rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-x-auto flex flex-col md:items-center">
            <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 self-start flex items-center justify-between w-full">
              <span>Pinned Left Headers · Swipe horizontally →</span>
            </div>
            <div>
              {/* Axis hint */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-neo-accent">
                  <Swords size={13} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Attack (row) →</span>
                </div>
                <span className="text-gray-300 text-[10px]">|</span>
                <div className="flex items-center gap-1.5 text-blue-500">
                  <ShieldHalf size={13} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">↓ Defense (col)</span>
                </div>
              </div>

              {/* Table wrapper — Sticky left column! */}
              <table
                className="border-collapse"
                style={{ tableLayout: 'fixed' }}
                onMouseLeave={clearHover}
              >
                {/* ── Column headers ── */}
                <thead>
                  <tr>
                    <th style={{ width: ROW_HEADER_W, minWidth: ROW_HEADER_W }} className="sticky left-0 bg-white/95 backdrop-blur-md z-20" />
                    {TYPES.map((col, ci) => {
                      const isActive = selectedCol === col;
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
                    const isActiveRow = selectedRow === row;
                    const isCrossedRow = crosshairRow === ri;

                    return (
                      <tr key={row}>
                        {/* Sticky Row Header */}
                        <td
                          className="sticky left-0 bg-white/95 backdrop-blur-md z-20 shadow-xs"
                          style={{ paddingRight: 6, paddingTop: GAP / 2, paddingBottom: GAP / 2 }}
                        >
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
                          const bg = cellBg(val);
                          const lbl = cellLabel(val);

                          const isRowActive = selectedRow === row;
                          const isColActive = selectedCol === col;
                          const isHighlighted = isRowActive || isColActive;
                          const isCrossH = crosshairRow === ri;
                          const isCrossV = crosshairCol === ci;
                          const isHovCell = isCrossH && isCrossV;

                          const dimmed = !isHighlighted && (selectedRow || selectedCol) ? 0.3 : 1;
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

          {/* Hover tooltip */}
          <AnimatePresence>
            {hoveredCell && tooltipPos && (() => {
              const row = TYPES[hoveredCell.rowIdx];
              const col = TYPES[hoveredCell.colIdx];
              const val = getMultiplier(row, col);
              const bg = cellBg(val);
              return (
                <motion.div
                  key={`tt-${hoveredCell.rowIdx}-${hoveredCell.colIdx}`}
                  initial={{ opacity: 0, y: -4, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.94 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    position: 'fixed',
                    left: tooltipPos.x,
                    top: tooltipPos.y,
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{
                    margin: '0 auto',
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderBottom: `7px solid ${bg ? bg : 'rgba(20,20,28,0.85)'}`,
                  }} />
                  <div
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl shadow-xl"
                    style={{
                      background: bg ?? 'rgba(20,20,28,0.85)',
                      backdropFilter: 'blur(14px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <TypePill type={row} size="small" />
                    <span className="font-black text-xs text-white/70">→</span>
                    <TypePill type={col} size="small" />
                    <span className="font-black text-sm ml-0.5 text-white">×{val}</span>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Matrix Selection Summary Panel */}
          <AnimatePresence>
            {activeMatrixType && matrixSummary && (
              <motion.div
                key={activeMatrixType + (isAttackMode ? '-atk' : '-def')}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25 }}
                className="mt-6 glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: TYPE_COLORS[activeMatrixType] }}
                />
                <div className="flex items-center justify-between mb-6 relative">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: TYPE_COLORS[activeMatrixType] }}
                    >
                      <img
                        src={`https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${activeMatrixType}.svg`}
                        alt={activeMatrixType}
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
                        style={{ color: TYPE_COLORS[activeMatrixType] }}
                      >
                        {activeMatrixType}
                      </h3>
                    </div>
                    <span
                      className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                      style={{
                        color: TYPE_COLORS[activeMatrixType],
                        borderColor: TYPE_COLORS[activeMatrixType] + '55',
                        backgroundColor: TYPE_COLORS[activeMatrixType] + '15',
                      }}
                    >
                      {isAttackMode ? '⚔ Attacker' : '🛡 Defender'}
                    </span>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                  {isAttackMode ? (
                    <>
                      <SummarySection label="Super Effective (×2)" types={matrixSummary.superEffective} emptyText="None" />
                      <SummarySection label="Resisted (×½)" types={matrixSummary.resisted} emptyText="None" />
                      <SummarySection label="No Effect (×0)" types={matrixSummary.immune} emptyText="None" />
                    </>
                  ) : (
                    <>
                      <SummarySection label="Weak To (×2)" types={matrixSummary.weakTo} emptyText="None" />
                      <SummarySection label="Resists (×½)" types={matrixSummary.resists} emptyText="None" />
                      <SummarySection label="Immune To (×0)" types={matrixSummary.immuneTo} emptyText="None" />
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
