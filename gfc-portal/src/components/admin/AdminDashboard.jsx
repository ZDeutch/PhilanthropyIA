import { useState } from 'react';
import { HISTORICAL_CONTRIBUTIONS, BATCH_CAMPAIGNS } from '../../data/adminHistory';

function formatCurrency(n) {
  if (n == null) return '—';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function fmtLarge(n) {
  if (n == null) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

// ─── Approval detail view ─────────────────────────────────────────────────────
const APPROVAL_CHECKS = (packet) => [
  {
    id: 'wire',
    label: 'Funds received match wire reference',
    evidence: `Wire ref ${packet.funding.wire_reference} — matched in FRB ledger`,
  },
  {
    id: 'teos',
    label: 'Contributor EIN re-verified via TEOS',
    evidence: `${packet.contributor.legal_name} (${packet.contributor.ein}) — ${packet.contributor.teos_status}`,
  },
  {
    id: 'floor',
    label: `Class spec resolves to ${packet.class_spec.snapshot_count.toLocaleString()} enrolled beneficiaries (≥ 5,000)`,
    evidence: `${packet.prevalidation.floor_check} — Resolved against Treasury enrollment data, not contributor-supplied figures.`,
  },
  {
    id: 'perchild',
    label: `Per-beneficiary amount $${packet.funding.per_beneficiary_at_snapshot.toFixed(2)} (≥ $25.00)`,
    evidence: packet.prevalidation.minimum_check,
  },
];

function ApprovalDetail({ contribution, onClose }) {
  const [checks, setChecks] = useState([]);
  const [authorized, setAuthorized] = useState(false);
  const [running, setRunning] = useState(false);

  const packet = contribution.packet;
  if (!packet) return null;

  const approvalChecks = APPROVAL_CHECKS(packet);

  const runChecks = async () => {
    setRunning(true);
    setChecks([]);
    for (const check of approvalChecks) {
      await new Promise(r => setTimeout(r, 500));
      setChecks(prev => [...prev, check.id]);
    }
    setRunning(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-2 mb-4">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Approval Detail — {contribution.id}</p>
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">✕ Close</button>
      </div>
      <div className="p-5">
        {/* Packet summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs">
          {[
            { label: 'Rail', value: <span className={`font-semibold ${contribution.rail === 'fund' ? 'text-purple-700' : 'text-[#1a4480]'}`}>{contribution.rail}</span> },
            { label: 'Units', value: packet.class_spec.geography.units.join(', ') },
            { label: 'Wire ref', value: <span className="font-mono">{packet.funding.wire_reference}</span> },
            { label: 'OFAC', value: <span className="text-green-700 font-semibold">{packet.prevalidation.ofac_screen}</span> },
          ].map(item => (
            <div key={item.label}>
              <p className="text-gray-500 uppercase tracking-wide text-xs">{item.label}</p>
              <p className="text-gray-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Four checks */}
        {!running && checks.length === 0 && (
          <button onClick={runChecks}
            className="mb-4 px-4 py-2 text-sm font-medium text-white rounded"
            style={{ backgroundColor: '#1a4480' }}
          >
            Run verification checks
          </button>
        )}

        {(running || checks.length > 0) && (
          <div className="space-y-3 mb-5">
            {approvalChecks.map((check, idx) => {
              const complete = checks.includes(check.id);
              const active = running && !complete && checks.length === idx;
              return (
                <div key={check.id} className={`rounded border p-3 transition-colors ${complete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    {complete
                      ? <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      : active
                      ? <svg className="animate-spin w-5 h-5 text-[#1a4480] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                      : <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"/>
                    }
                    <div>
                      <p className={`text-sm font-medium ${complete ? 'text-green-800' : 'text-gray-500'}`}>
                        {check.label} {complete && '✓'}
                      </p>
                      {complete && (
                        <p className="text-xs text-green-700 mt-0.5">{check.evidence}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {checks.length === approvalChecks.length && !authorized && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setAuthorized(true)}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded"
              style={{ backgroundColor: '#16a34a' }}
            >
              Authorize disbursement
            </button>
            <p className="text-xs text-gray-400 mt-2">Every check is binary. No discretionary review required.</p>
          </div>
        )}

        {authorized && (
          <div className="border-t border-gray-200 pt-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">Disbursement authorized</p>
              <p className="text-xs text-gray-400">Auto-authorized (safe harbor) at {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Packets ledger tab ───────────────────────────────────────────────────────
function PacketsTab({ allContributions }) {
  const [openId, setOpenId] = useState(null);

  const disbursed = allContributions.filter(c => c.status === 'Disbursed');
  const totalDisbursed = disbursed.reduce((s, c) => s + (c.total || 0), 0);
  const totalBeneficiaries = disbursed.reduce((s, c) => s + (c.beneficiaries || 0), 0);
  const perChildAmounts = disbursed.filter(c => c.perChild).map(c => c.perChild);
  const medianPerChild = perChildAmounts.length
    ? [...perChildAmounts].sort((a, b) => a - b)[Math.floor(perChildAmounts.length / 2)]
    : 0;

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Disbursed', value: formatCurrency(totalDisbursed), sub: 'to account trustees' },
          { label: 'Beneficiaries Reached', value: fmtLarge(totalBeneficiaries), sub: 'enrolled account holders' },
          { label: 'Median Per-Child', value: perChildAmounts.length ? '$' + medianPerChild.toFixed(2) : '—', sub: 'across disbursed contributions' },
          { label: 'Auto-Certified', value: '99.2%', sub: 'no manual review required', highlight: true },
        ].map(card => (
          <div key={card.label} className={`bg-white border rounded p-4 ${card.highlight ? 'border-green-300' : 'border-gray-200'}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.highlight ? 'text-green-700' : 'text-[#1a4480]'}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Ledger */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Contribution Ledger</p>
          <p className="text-xs text-gray-400">{allContributions.length} records — click any row to re-verify</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['', 'Confirmation #', 'Rail', 'Organization', 'Class Summary', 'Beneficiaries', 'Total', 'Per-Child', 'Status', 'Audit'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allContributions.map(c => (
                <>
                  <tr
                    key={c.id}
                    onClick={() => c.packet ? setOpenId(openId === c.id ? null : c.id) : null}
                    className={`transition-colors ${c.packet ? 'hover:bg-blue-50 cursor-pointer' : ''} ${openId === c.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-3 py-3 text-center">
                      {c.packet && (
                        <span className="text-xs text-gray-400">{openId === c.id ? '▼' : '▶'}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#1a4480] whitespace-nowrap">{c.id}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.rail === 'fund' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.rail || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900 text-xs whitespace-nowrap">{c.entity}</p>
                      <p className="text-xs text-gray-400 font-mono">{c.ein}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 max-w-xs">
                      <span className="truncate block max-w-[200px]">{c.classSummary}</span>
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-gray-800 whitespace-nowrap">
                      {c.beneficiaries != null ? c.beneficiaries.toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs font-mono text-gray-800 whitespace-nowrap">{formatCurrency(c.total)}</td>
                    <td className="px-3 py-3 text-xs font-mono text-gray-800 whitespace-nowrap">
                      {c.perChild != null ? '$' + c.perChild.toFixed(2) : '—'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {c.status === 'Disbursed'
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                            Disbursed
                          </span>
                        : <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">⚠ Pending</span>
                      }
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {c.auditFlag === 'Selected for sampling audit'
                        ? <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">Sampling audit</span>
                        : c.auditFlag
                        ? <span className="text-amber-700 text-xs leading-snug block max-w-[220px]">{c.auditFlag}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                  </tr>
                  {openId === c.id && c.packet && (
                    <tr key={`${c.id}-detail`}>
                      <td colSpan={10} className="px-3 pb-2">
                        <ApprovalDetail contribution={c} onClose={() => setOpenId(null)} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
        <strong>Note on GFC-2026-00288:</strong> The $6.25B Dell Technologies Foundation pledge is currently
        blocked pending Treasury rulemaking. The proposed income-based class definition (median HHI &lt; $65,000)
        does not correspond to a presently designated geographic unit type under §530A.
      </div>
    </>
  );
}

// ─── Monthly batch tab ────────────────────────────────────────────────────────
function BatchTab() {
  const [openId, setOpenId] = useState(null);
  const totalBatching = BATCH_CAMPAIGNS.reduce((s, c) => s + c.total, 0);
  const totalDonors = BATCH_CAMPAIGNS.reduce((s, c) => s + c.donorCount, 0);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Campaigns Batching', value: BATCH_CAMPAIGNS.length, sub: 'in current cycle' },
          { label: 'Total Batching', value: formatCurrency(totalBatching), sub: 'across all campaigns' },
          { label: 'Contributing Donors', value: totalDonors.toLocaleString(), sub: 'aggregate → single packets' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-bold mt-1 text-[#1a4480]">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Current Monthly Cycle</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Each campaign batches N individual gifts into one Treasury-facing packet.
            This illustrates the floor-pooling argument: small gifts, one Treasury touchpoint per class per month.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {BATCH_CAMPAIGNS.map(c => (
            <>
              <div
                key={c.id}
                onClick={() => setOpenId(openId === c.id ? null : c.id)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{openId === c.id ? '▼' : '▶'}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{c.classSummary}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-gray-800">${(c.total / 1000).toFixed(0)}K — {c.donorCount} donors</p>
                    <p className="text-xs text-gray-400">Batches {c.batchDate}</p>
                    {c.status === 'goal_reached' && (
                      <span className="text-xs text-green-700 font-medium">Goal reached ✓</span>
                    )}
                  </div>
                </div>
              </div>
              {openId === c.id && (
                <div key={`${c.id}-donors`} className="bg-gray-50 px-6 pb-3 pt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Donor breakdown → batches as one packet to Treasury
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="text-left py-1 font-medium">Donor</th>
                        <th className="text-right py-1 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {c.donors.map((d, i) => (
                        <tr key={i}>
                          <td className="py-1 text-gray-700">{d.donor}</td>
                          <td className="py-1 text-right font-mono text-gray-800">${d.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-300">
                        <td className="py-1 font-semibold text-gray-700">Total → one packet</td>
                        <td className="py-1 text-right font-semibold font-mono text-[#1a4480]">${c.total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── AdminDashboard shell ─────────────────────────────────────────────────────
export default function AdminDashboard({ sessionContributions, onSimulateWire, onFastForwardDeadline }) {
  const [tab, setTab] = useState('packets');
  const allContributions = [...(sessionContributions || []), ...HISTORICAL_CONTRIBUTIONS];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Treasury Oversight Dashboard</h2>
        <p className="text-sm text-gray-600">
          Read-only record of qualified general contributions. Rule-based validation enables
          99.2% auto-certification without manual Treasury sign-off.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {[
          { key: 'packets', label: 'Contribution Packets' },
          { key: 'batch', label: 'Monthly Batch Pipeline' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-b-2 text-[#1a4480]' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={tab === t.key ? { borderBottomColor: '#1a4480' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Demo controls for wire simulation */}
      {onSimulateWire && (() => {
        const awaitingWire = allContributions.filter(c => c.status === 'Awaiting Wire');
        if (!awaitingWire.length) return null;
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Demo Controls</p>
            <div className="space-y-2">
              {awaitingWire.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span className="text-xs font-mono text-amber-700 font-semibold">{c.id}</span>
                    <span className="text-xs text-amber-600 ml-2">— Awaiting wire</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onSimulateWire(c.id)}
                      className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Simulate incoming wire
                    </button>
                    {onFastForwardDeadline && (
                      <button onClick={() => onFastForwardDeadline(c.id)}
                        className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Fast-forward deadline (expire)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {tab === 'packets' && <PacketsTab allContributions={allContributions} />}
      {tab === 'batch' && <BatchTab />}
    </div>
  );
}
