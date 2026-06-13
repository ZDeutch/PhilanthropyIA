import { useState, useMemo } from 'react';
import {
  STATES, COUNTIES, DISTRICTS, ZIP_CODES, BIRTH_YEARS,
  computeUnionBeneficiaries, suggestAdditions
} from '../../data/geoUnits';

const FLOOR = 5000;

function fmt(n) {
  if (n == null) return '—';
  return n >= 1000000
    ? (n / 1000000).toFixed(1) + 'M'
    : n >= 1000
    ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K'
    : n.toLocaleString();
}

function UnitRow({ unit, selected, onToggle }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer rounded transition-colors">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(unit.id)}
      />
      <span className="flex-1 text-sm text-gray-800">{unit.name}</span>
      <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
        {fmt(unit.beneficiaries)}
        <span className="text-gray-400 ml-0.5 cursor-help" title="Enrolled Trump Account beneficiaries in this unit (not total child population)"> ⓘ</span>
      </span>
    </label>
  );
}

function SearchableList({ units, selectedIds, onToggle, placeholder }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() =>
    units.filter(u => u.name.toLowerCase().includes(query.toLowerCase())),
    [units, query]
  );

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder || 'Search...'}
          className="w-full text-sm bg-transparent focus:outline-none"
        />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 px-3 py-4 text-center">No results</p>
        ) : (
          filtered.map(u => (
            <UnitRow
              key={u.id}
              unit={u}
              selected={selectedIds.has(u.id)}
              onToggle={onToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}

const TABS = [
  { key: 'state', label: 'State' },
  { key: 'county', label: 'County' },
  { key: 'district', label: 'School District' },
  { key: 'zip', label: 'ZIP Code' },
];

export default function Step2QualifiedClassBuilder({ onNext, onBack }) {
  const [tab, setTab] = useState('county');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedBirthYears, setSelectedBirthYears] = useState([]);
  const [showBirthYear, setShowBirthYear] = useState(false);
  const [includeAll, setIncludeAll] = useState(false);

  const toggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBirthYear = (y) => {
    setSelectedBirthYears(prev =>
      prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y]
    );
  };

  const effectiveIds = includeAll ? ['all'] : [...selectedIds];
  const { total, statutory } = computeUnionBeneficiaries(effectiveIds, showBirthYear ? selectedBirthYears : []);

  const qualified = includeAll || statutory || total >= FLOOR;
  const pct = Math.min(100, (total / FLOOR) * 100);
  const suggestions = (!qualified && !includeAll) ? suggestAdditions([...selectedIds], total) : [];

  const unitsByTab = { state: STATES, county: COUNTIES, district: DISTRICTS, zip: ZIP_CODES };

  // Build a human-readable class summary
  const buildClassSummary = () => {
    if (includeAll) return ['All beneficiaries nationally'];
    const items = [];
    STATES.filter(s => selectedIds.has(s.id)).forEach(s => items.push(s.name));
    COUNTIES.filter(c => selectedIds.has(c.id)).forEach(c => items.push(c.name));
    DISTRICTS.filter(d => selectedIds.has(d.id)).forEach(d => items.push(d.name));
    ZIP_CODES.filter(z => selectedIds.has(z.id)).forEach(z => items.push(z.name));
    return items;
  };

  const handleContinue = () => {
    onNext({
      selectedIds: effectiveIds,
      classUnits: buildClassSummary(),
      birthYears: showBirthYear ? selectedBirthYears : [],
      beneficiaryCount: total,
      statutory,
      includeAll,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main panel */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Step 2 — Qualified Class Builder</h2>
          <p className="text-sm text-gray-600">
            Compose a qualified geographic class from Treasury-pre-designated units. The class must encompass
            at least 5,000 enrolled account beneficiaries.{' '}
            <span className="text-xs text-gray-400">§530A</span>
          </p>
        </div>

        {/* All-beneficiaries toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-start gap-3">
          <input
            type="checkbox"
            id="all-national"
            checked={includeAll}
            onChange={e => { setIncludeAll(e.target.checked); setSelectedIds(new Set()); }}
            className="mt-0.5"
          />
          <label htmlFor="all-national" className="text-sm text-blue-800 cursor-pointer">
            <span className="font-semibold">All beneficiaries nationally</span>
            <span className="text-blue-600 ml-2 text-xs">(statutory class per §530A — bypasses floor requirement)</span>
          </label>
        </div>

        {!includeAll && (
          <>
            {/* Tab selector */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="flex border-b border-gray-200">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 px-2 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                      tab === t.key
                        ? 'border-b-2 text-[#1a4480]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={tab === t.key ? { borderBottomColor: '#1a4480' } : {}}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-3">
                <SearchableList
                  units={unitsByTab[tab]}
                  selectedIds={selectedIds}
                  onToggle={toggle}
                  placeholder={`Search ${TABS.find(t=>t.key===tab)?.label.toLowerCase()}s...`}
                />
              </div>
            </div>

            {/* Birth year cohort */}
            <div className="bg-white border border-gray-200 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="birth-year-toggle"
                  checked={showBirthYear}
                  onChange={e => setShowBirthYear(e.target.checked)}
                />
                <label htmlFor="birth-year-toggle" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Birth-year cohort filter
                </label>
                <span className="text-xs text-gray-400">(intersects with geographic selection)</span>
              </div>
              {showBirthYear && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BIRTH_YEARS.map(y => (
                    <button
                      key={y}
                      onClick={() => toggleBirthYear(y)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        selectedBirthYears.includes(y)
                          ? 'bg-[#1a4480] text-white border-[#1a4480]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#1a4480]'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                  {selectedBirthYears.length > 0 && (
                    <button
                      onClick={() => setSelectedBirthYears([])}
                      className="text-xs px-2 py-1 text-red-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex gap-3 justify-between pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!qualified}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1a4480' }}
          >
            Continue to Contribution Economics →
          </button>
        </div>
      </div>

      {/* Validation sidebar */}
      <div className="lg:col-span-1">
        <div className={`border rounded p-4 sticky top-4 ${qualified ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: qualified ? '#166534' : '#92400e' }}>
            Qualified Class Status
          </p>

          {/* Count */}
          <div className="mb-3">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs text-gray-600">Beneficiary count</span>
              <span className={`text-lg font-bold ${qualified ? 'text-green-700' : 'text-amber-700'}`}>
                {includeAll ? '—' : total.toLocaleString()}
              </span>
            </div>
            {!includeAll && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className={`h-2.5 rounded-full transition-all ${qualified ? 'bg-green-500' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>5,000 minimum <span className="text-gray-400">(§530A)</span></span>
                </div>
              </>
            )}
          </div>

          {/* Status badge */}
          {qualified ? (
            <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-sm text-green-800 font-semibold">
              ✓ Qualified class formed
              {statutory && !includeAll && <div className="text-xs font-normal mt-0.5">State-level selection — statutory class per §530A</div>}
              {includeAll && <div className="text-xs font-normal mt-0.5">National selection — statutory class per §530A</div>}
            </div>
          ) : (
            <div className="bg-amber-100 border border-amber-300 rounded px-3 py-2 text-sm text-amber-800">
              <p className="font-semibold">
                {total === 0 ? 'No units selected' : `${(FLOOR - total).toLocaleString()} more beneficiaries needed`}
              </p>
              {total > 0 && (
                <p className="text-xs mt-0.5 text-amber-700">
                  §530A requires at least 5,000 enrolled account beneficiaries.
                </p>
              )}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-amber-800 mb-2">Suggested additions:</p>
              {suggestions.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className="w-full text-left text-xs bg-white border border-amber-200 rounded px-2 py-1.5 mb-1.5 hover:bg-amber-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-amber-700 ml-1">(+{s.beneficiaries.toLocaleString()} beneficiaries)</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected units summary */}
          {(selectedIds.size > 0 || includeAll) && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Selected units:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {includeAll ? (
                  <p className="text-xs text-gray-700 bg-white rounded px-2 py-1 border border-gray-200">All beneficiaries nationally</p>
                ) : (
                  buildClassSummary().map((name, i) => (
                    <p key={i} className="text-xs text-gray-700 bg-white rounded px-2 py-1 border border-gray-200 truncate">{name}</p>
                  ))
                )}
              </div>
            </div>
          )}

          {showBirthYear && selectedBirthYears.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Cohort filter: birth years {selectedBirthYears.sort().join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
