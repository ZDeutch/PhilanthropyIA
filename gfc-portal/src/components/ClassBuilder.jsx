import { useState, useMemo } from 'react';
import {
  STATES, COUNTIES, DISTRICTS, ZIP_CODES, BIRTH_YEARS,
  computeUnionBeneficiaries, suggestAdditions
} from '../data/geoUnits';

// ─── constants ───────────────────────────────────────────────────────────────
const FLOOR = 5000;
const LEGAL_MIN_PER_CHILD = 25;
const FUND_POLICY_MIN_PER_CHILD = 100;

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return n.toLocaleString();
}

function parseCurrency(val) {
  return parseFloat(String(val).replace(/[^0-9.]/g, '')) || 0;
}

function formatAmount(val) {
  const raw = String(val).replace(/[^0-9.]/g, '');
  if (!raw) return '';
  const parts = raw.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) return '$' + intPart + '.' + parts[1].slice(0, 2);
  return '$' + intPart;
}

function fmtCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

// ─── sub-components ──────────────────────────────────────────────────────────
function UnitRow({ unit, selected, onToggle }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer rounded transition-colors">
      <input type="checkbox" checked={selected} onChange={() => onToggle(unit.id)} />
      <span className="flex-1 text-sm text-gray-800">{unit.name}</span>
      <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
        {fmt(unit.beneficiaries)}
        <span className="text-gray-400 ml-0.5" title="Enrolled Trump Account beneficiaries"> ⓘ</span>
      </span>
    </label>
  );
}

function SearchableList({ units, selectedIds, onToggle, placeholder }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => units.filter(u => u.name.toLowerCase().includes(query.toLowerCase())),
    [units, query]
  );
  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder={placeholder || 'Search...'} className="w-full text-sm bg-transparent focus:outline-none"
        />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0
          ? <p className="text-sm text-gray-400 px-3 py-4 text-center">No results</p>
          : filtered.map(u => <UnitRow key={u.id} unit={u} selected={selectedIds.has(u.id)} onToggle={onToggle} />)
        }
      </div>
    </div>
  );
}

const GEO_TABS = [
  { key: 'state', label: 'State' },
  { key: 'county', label: 'County' },
  { key: 'district', label: 'School District' },
  { key: 'zip', label: 'ZIP Code' },
];
const unitsByTab = { state: STATES, county: COUNTIES, district: DISTRICTS, zip: ZIP_CODES };

// ─── Step 0: Build class ──────────────────────────────────────────────────────
function BuildClassStep({ onNext }) {
  const [tab, setTab] = useState('county');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedBirthYears, setSelectedBirthYears] = useState([]);
  const [showBirthYear, setShowBirthYear] = useState(false);
  const [includeAll, setIncludeAll] = useState(false);

  const toggle = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleBirthYear = (y) =>
    setSelectedBirthYears(prev => prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y]);

  const effectiveIds = includeAll ? ['all'] : [...selectedIds];
  const { total, statutory, unitCodes } = computeUnionBeneficiaries(effectiveIds, showBirthYear ? selectedBirthYears : []);
  const qualified = includeAll || statutory || total >= FLOOR;
  const pct = Math.min(100, (total / FLOOR) * 100);
  const suggestions = (!qualified && !includeAll) ? suggestAdditions([...selectedIds], total) : [];

  const buildClassUnits = () => {
    if (includeAll) return ['All beneficiaries nationally'];
    const items = [];
    STATES.filter(s => selectedIds.has(s.id)).forEach(s => items.push(s.name));
    COUNTIES.filter(c => selectedIds.has(c.id)).forEach(c => items.push(c.name));
    DISTRICTS.filter(d => selectedIds.has(d.id)).forEach(d => items.push(d.name));
    ZIP_CODES.filter(z => selectedIds.has(z.id)).forEach(z => items.push(z.name));
    return items;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1a4480] mb-1">Build Qualified Class</h3>
          <p className="text-sm text-gray-600">
            Compose a qualified geographic class from Treasury-pre-designated units.
            Must encompass at least 5,000 enrolled account beneficiaries. <span className="text-xs text-gray-400">§530A</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-start gap-3">
          <input type="checkbox" id="all-national" checked={includeAll}
            onChange={e => { setIncludeAll(e.target.checked); setSelectedIds(new Set()); }} className="mt-0.5"
          />
          <label htmlFor="all-national" className="text-sm text-blue-800 cursor-pointer">
            <span className="font-semibold">All beneficiaries nationally</span>
            <span className="text-blue-600 ml-2 text-xs">(statutory class per §530A)</span>
          </label>
        </div>

        {!includeAll && (
          <>
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <div className="flex border-b border-gray-200">
                {GEO_TABS.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex-1 px-2 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                      tab === t.key ? 'border-b-2 text-[#1a4480]' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={tab === t.key ? { borderBottomColor: '#1a4480' } : {}}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-3">
                <SearchableList units={unitsByTab[tab]} selectedIds={selectedIds} onToggle={toggle}
                  placeholder={`Search ${GEO_TABS.find(t => t.key === tab)?.label.toLowerCase()}s...`}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="birth-year-toggle" checked={showBirthYear}
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
                    <button key={y} onClick={() => toggleBirthYear(y)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        selectedBirthYears.includes(y)
                          ? 'bg-[#1a4480] text-white border-[#1a4480]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#1a4480]'
                      }`}
                    >{y}</button>
                  ))}
                  {selectedBirthYears.length > 0 && (
                    <button onClick={() => setSelectedBirthYears([])}
                      className="text-xs px-2 py-1 text-red-600 hover:underline"
                    >Clear</button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={() => onNext({ effectiveIds, classUnits: buildClassUnits(), birthYears: showBirthYear ? selectedBirthYears : [], beneficiaryCount: total, statutory, includeAll, unitCodes })}
            disabled={!qualified}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1a4480' }}
          >
            Set per-child amount →
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className={`border rounded p-4 sticky top-4 ${qualified ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: qualified ? '#166534' : '#92400e' }}>
            Qualified Class Status
          </p>
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
                  <div className={`h-2.5 rounded-full transition-all ${qualified ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>5,000 minimum</span>
                </div>
              </>
            )}
          </div>
          {qualified ? (
            <div className="bg-green-100 border border-green-300 rounded px-3 py-2 text-sm text-green-800 font-semibold">
              ✓ Qualified class formed
              {(statutory || includeAll) && <div className="text-xs font-normal mt-0.5">Statutory class per §530A</div>}
            </div>
          ) : (
            <div className="bg-amber-100 border border-amber-300 rounded px-3 py-2 text-sm text-amber-800">
              <p className="font-semibold">{total === 0 ? 'No units selected' : `${(FLOOR - total).toLocaleString()} more needed`}</p>
              {total > 0 && <p className="text-xs mt-0.5">§530A requires ≥ 5,000 enrolled beneficiaries.</p>}
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-amber-800 mb-2">Suggested additions:</p>
              {suggestions.map(s => (
                <button key={s.id} onClick={() => toggle(s.id)}
                  className="w-full text-left text-xs bg-white border border-amber-200 rounded px-2 py-1.5 mb-1.5 hover:bg-amber-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-amber-700 ml-1">(+{s.beneficiaries.toLocaleString()})</span>
                </button>
              ))}
            </div>
          )}
          {(selectedIds.size > 0 || includeAll) && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Selected units:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {includeAll
                  ? <p className="text-xs text-gray-700 bg-white rounded px-2 py-1 border border-gray-200">All beneficiaries nationally</p>
                  : buildClassUnits().map((name, i) => (
                    <p key={i} className="text-xs text-gray-700 bg-white rounded px-2 py-1 border border-gray-200 truncate">{name}</p>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Per-child amount ─────────────────────────────────────────────────
function PerChildAmountStep({ classData, isFundRail, onNext, onBack }) {
  const { beneficiaryCount, classUnits } = classData;
  const [rawInput, setRawInput] = useState('');

  const perChild = parseCurrency(rawInput);
  const total = perChild > 0 && beneficiaryCount > 0 ? perChild * beneficiaryCount : 0;

  const legalMin = LEGAL_MIN_PER_CHILD;
  const policyMin = isFundRail ? FUND_POLICY_MIN_PER_CHILD : null;
  const effectiveMin = policyMin ?? legalMin;

  const belowLegal = perChild > 0 && perChild < legalMin;
  const belowPolicy = isFundRail && perChild >= legalMin && perChild < FUND_POLICY_MIN_PER_CHILD;
  const valid = perChild >= effectiveMin;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1a4480] mb-1">Set Per-Child Amount</h3>
        <p className="text-sm text-gray-600">
          Enter the amount each enrolled beneficiary in your class will receive.
          The total contribution equals this amount × the snapshot beneficiary count.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Qualified Class</p>
        <p className="text-sm text-gray-800">
          <span className="font-semibold text-[#1a4480] text-base">{beneficiaryCount.toLocaleString()}</span>{' '}
          enrolled account beneficiaries
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {classUnits.slice(0, 5).map((u, i) => (
            <span key={i} className="text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600">{u}</span>
          ))}
          {classUnits.length > 5 && <span className="text-xs text-gray-400">+{classUnits.length - 5} more</span>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Per-child amount</label>

        {/* Minimums display */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded">
            Legal minimum: $25.00/child
            <span className="text-red-400 font-normal">Notice 2025-68</span>
          </span>
          {isFundRail && (
            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded">
              Fund policy minimum: $100.00/child
              <span className="text-purple-400 font-normal">Invest America Children's Fund</span>
            </span>
          )}
        </div>

        <input
          type="text" inputMode="decimal" value={rawInput}
          onChange={e => setRawInput(formatAmount(e.target.value))}
          placeholder="$0.00"
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1a4480] focus:border-[#1a4480]"
        />

        {perChild > 0 && (
          <div className={`mt-4 p-4 rounded border ${belowLegal ? 'bg-red-50 border-red-200' : belowPolicy ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-baseline gap-3">
              <div>
                <p className="text-xs text-gray-500">Per-child amount</p>
                <p className={`text-3xl font-bold ${belowLegal ? 'text-red-700' : belowPolicy ? 'text-purple-700' : 'text-[#1a4480]'}`}>
                  {fmtCurrency(perChild)}
                </p>
              </div>
              {total > 0 && (
                <div className="border-l border-gray-300 pl-3">
                  <p className="text-xs text-gray-500">Total contribution</p>
                  <p className="text-xl font-bold text-gray-800">{fmtCurrency(total)}</p>
                  <p className="text-xs text-gray-400">{beneficiaryCount.toLocaleString()} × {fmtCurrency(perChild)}</p>
                </div>
              )}
            </div>

            {belowLegal && (
              <div className="mt-2 text-xs text-red-800">
                <p className="font-semibold">Below legal minimum ($25.00/child)</p>
                <p>Notice 2025-68 sets a $25.00 per-beneficiary floor for 2026–27.</p>
              </div>
            )}
            {belowPolicy && (
              <div className="mt-2 text-xs text-purple-800">
                <p className="font-semibold">Below Fund policy minimum ($100.00/child)</p>
                <p>
                  The Invest America Children's Fund requires $100.00/child for designated class contributions.
                  This is a <strong>fund policy</strong>, not a legal requirement — direct 501(c)(3) contributions
                  are subject only to the $25.00 statutory minimum.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">← Back</button>
        <button
          onClick={() => onNext({ perChild, total })}
          disabled={!valid}
          className="px-6 py-2.5 text-sm font-semibold text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1a4480' }}
        >
          Review authorizations →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Authorizations ───────────────────────────────────────────────────
function AuthorizationsStep({ classData, economicsData, onNext, onBack }) {
  const { beneficiaryCount } = classData;
  const { perChild } = economicsData;

  const [driftAuthorized, setDriftAuthorized] = useState(false);
  const [fallback, setFallback] = useState('');
  const [equitableAck, setEquitableAck] = useState(false);
  const [liabilityAck, setLiabilityAck] = useState(false);

  const lowBand = parseFloat((perChild * 0.85).toFixed(2));
  const highBand = parseFloat((perChild * 1.15).toFixed(2));
  const canContinue = driftAuthorized && fallback && equitableAck && liabilityAck;

  const FALLBACK_OPTIONS = [
    { value: 'expand_to_county', label: 'Expand to the containing county/counties', note: null },
    { value: 'fallback_statewide', label: 'Fall back to statewide class', note: null },
    { value: 'hold_in_escrow', label: 'Hold in escrow until the class reaches 5,000 enrolled', note: 'Escrowed pledges are published to the coverage map and notify local enrollment partners.' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#1a4480] mb-1">Authorizations</h3>
        <p className="text-sm text-gray-600">
          Two final authorizations are required before certification.
        </p>
      </div>

      {/* Count drift authorization */}
      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Count-Drift Authorization</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={driftAuthorized} onChange={e => setDriftAuthorized(e.target.checked)} className="mt-0.5" />
          <span className="text-sm text-gray-700">
            I understand the final per-child amount equals my total divided by the class's enrolled count
            at disbursement, and authorize a final per-child amount between{' '}
            <span className="font-semibold text-gray-900">{fmtCurrency(lowBand)}</span> and{' '}
            <span className="font-semibold text-gray-900">{fmtCurrency(highBand)}</span>{' '}
            (±15% of snapshot count of {beneficiaryCount.toLocaleString()}).
          </span>
        </label>
        <div className="mt-3 ml-7 p-3 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600">
          <p><span className="font-medium">Snapshot per-child:</span> {fmtCurrency(perChild)}</p>
          <p className="mt-1"><span className="font-medium">Authorized band:</span> {fmtCurrency(lowBand)} — {fmtCurrency(highBand)}</p>
          <p className="mt-1 text-gray-400">Treasury resolves class size against enrollment data at disbursement, not at submission time.</p>
        </div>
      </div>

      {/* Fallback election */}
      <div className="bg-white border border-gray-200 rounded p-5 mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Fallback Election</p>
        <p className="text-sm text-gray-600 mb-3">
          If the class fails validation at disbursement, how should Treasury proceed?
        </p>
        <div className="space-y-3">
          {FALLBACK_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded border transition-colors hover:bg-gray-50"
              style={{ borderColor: fallback === opt.value ? '#1a4480' : '#e5e7eb', backgroundColor: fallback === opt.value ? '#eff6ff' : undefined }}
            >
              <input type="radio" name="fallback" value={opt.value}
                checked={fallback === opt.value} onChange={() => setFallback(opt.value)} className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                {opt.note && fallback === opt.value && (
                  <p className="text-xs text-blue-700 mt-1 bg-blue-50 border border-blue-100 rounded px-2 py-1">{opt.note}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Equitable distribution acknowledgment */}
      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Equitable Distribution Requirement</p>
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3 text-xs text-amber-800">
          <p className="font-semibold mb-1">§530A Pro-Rata Distribution Mandate</p>
          <p>
            All contributions under §530A must be distributed on a strictly equal, per-beneficiary basis.
            Every enrolled account holder in the qualified class must receive the identical per-child amount at disbursement.
            Differential amounts, priority ordering, or conditions tied to individual beneficiary characteristics are prohibited.
          </p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={equitableAck} onChange={e => setEquitableAck(e.target.checked)} className="mt-0.5" />
          <span className="text-sm text-gray-700">
            I acknowledge that the per-child amount of{' '}
            <span className="font-semibold text-gray-900">{fmtCurrency(perChild)}</span>{' '}
            will be credited identically to every enrolled beneficiary in the qualified class at disbursement.
            I may not direct, vary, condition, or restrict the amount credited to any individual beneficiary,
            and I understand that any attempt to do so voids this contribution authorization.
          </span>
        </label>
      </div>

      {/* Legal liability disclosure */}
      <div className="bg-white border border-red-200 rounded p-5 mb-5">
        <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3">Legal Liability Disclosure</p>
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 text-xs text-red-800 space-y-1.5">
          <p className="font-semibold">Violations of the equitable distribution requirement may result in:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Full recapture of the contributed amount plus applicable interest under IRC §530A(g)</li>
            <li>Excise taxes under IRC §4966 (taxable distributions) and §4967 (prohibited benefits)</li>
            <li>Personal liability for officers and directors who authorized the contribution</li>
            <li>Referral to the Department of Justice for willful violations</li>
            <li>Loss of the organization's §501(c)(3) tax-exempt status in cases of repeated or egregious violations</li>
          </ul>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={liabilityAck} onChange={e => setLiabilityAck(e.target.checked)} className="mt-0.5" />
          <span className="text-sm text-gray-700">
            I have read and understood the legal liability disclosures above. I certify that I am authorized
            to bind the contributing organization to this acknowledgment and that I have consulted with
            qualified legal counsel regarding the equitable distribution requirements and potential liability
            exposure. I accept personal responsibility for ensuring compliance with §530A and related
            Treasury guidance for this contribution.
          </span>
        </label>
      </div>

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">← Back</button>
        <button
          onClick={() => onNext({ driftAuthorized, driftBand: [lowBand, highBand], fallback, equitableAck, liabilityAck })}
          disabled={!canContinue}
          className="px-6 py-2.5 text-sm font-semibold text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1a4480' }}
        >
          Continue to Certification →
        </button>
      </div>
    </div>
  );
}

// ─── ClassBuilder shell ───────────────────────────────────────────────────────
export default function ClassBuilder({ isFundRail, onNext, onBack }) {
  const [innerStep, setInnerStep] = useState(0);
  const [classData, setClassData] = useState(null);
  const [economicsData, setEconomicsData] = useState(null);

  // Inner step labels for sub-progress
  const SUB_STEPS = ['Build class', 'Per-child amount', 'Authorizations'];

  return (
    <div>
      {/* Sub-step progress */}
      <div className="flex items-center gap-2 mb-5 justify-center">
        {SUB_STEPS.map((label, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              idx < innerStep ? 'bg-green-500 text-white' : idx === innerStep ? 'text-white' : 'bg-gray-200 text-gray-400'
            }`} style={idx === innerStep ? { backgroundColor: '#1a4480' } : {}}>
              {idx < innerStep
                ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                : idx + 1
              }
            </div>
            <span className={`text-xs hidden sm:block ${idx === innerStep ? 'font-semibold text-[#1a4480]' : idx < innerStep ? 'text-green-700' : 'text-gray-400'}`}>
              {label}
            </span>
            {idx < SUB_STEPS.length - 1 && <div className={`w-6 h-0.5 mx-1 ${idx < innerStep ? 'bg-green-400' : 'bg-gray-200'}`}/>}
          </div>
        ))}
      </div>

      {innerStep === 0 && (
        <BuildClassStep
          onNext={(data) => { setClassData(data); setInnerStep(1); }}
        />
      )}
      {innerStep === 1 && classData && (
        <PerChildAmountStep
          classData={classData}
          isFundRail={isFundRail}
          onNext={(data) => { setEconomicsData(data); setInnerStep(2); }}
          onBack={() => setInnerStep(0)}
        />
      )}
      {innerStep === 2 && classData && economicsData && (
        <AuthorizationsStep
          classData={classData}
          economicsData={economicsData}
          onNext={(authData) => onNext({ classData, economicsData, authData })}
          onBack={() => setInnerStep(1)}
        />
      )}

      {innerStep === 0 && (
        <div className="flex mt-3">
          <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700">← Back</button>
        </div>
      )}
    </div>
  );
}
