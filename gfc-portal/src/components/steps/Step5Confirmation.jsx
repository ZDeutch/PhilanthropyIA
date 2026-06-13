import { useState } from 'react';
import { INVEST_AMERICA_FUND } from '../../data/organizations';

function formatCurrency(n) {
  return n?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }) ?? '—';
}

// ─── JSON viewer ──────────────────────────────────────────────────────────────
function JsonView({ data }) {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return (
    <pre className="text-xs font-mono leading-relaxed overflow-auto max-h-96 bg-gray-950 rounded p-4">
      {lines.map((line, i) => {
        const colored = line
          .replace(/"([^"]+)":/g, (_, k) => `<span style="color:#93c5fd">"${k}"</span>:`)
          .replace(/: "([^"]*)"/g, (_, v) => `: <span style="color:#86efac">"${v}"</span>`)
          .replace(/: (\d+\.?\d*)/g, (_, n) => `: <span style="color:#fcd34d">${n}</span>`)
          .replace(/: (true|false)/g, (_, b) => `: <span style="color:#f9a8d4">${b}</span>`)
          .replace(/: null/g, `: <span style="color:#9ca3af">null</span>`);
        return <div key={i} className="text-gray-300" dangerouslySetInnerHTML={{ __html: colored }}/>;
      })}
    </pre>
  );
}

// ─── Life-cycle stepper ───────────────────────────────────────────────────────
const LIFECYCLE_STEPS = ['Signed', 'Funded', 'Submitted to Treasury', 'Authorized', 'Disbursed', 'Reconciled'];

function getLifecyclePos(fundData) {
  if (!fundData) return 0;
  const s = fundData.status;
  if (s === 'expired_unfunded') return -1;
  if (s === 'awaiting_wire') return 1;
  if (s === 'debit_initiated' || s === 'charged') return 2;
  if (s === 'funds_received') return 2;
  return 1;
}

function LifecycleStepper({ fundData }) {
  const pos = getLifecyclePos(fundData);
  if (pos === -1) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 border border-red-300 rounded-full text-xs font-semibold text-red-700">
          <div className="w-2 h-2 bg-red-500 rounded-full"/>
          Packet expired — wire not received by deadline
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 mt-4 flex-wrap">
      {LIFECYCLE_STEPS.map((step, i) => {
        const done = i < pos;
        const active = i === pos;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              done ? 'bg-green-100 text-green-700 border border-green-200'
                : active ? 'bg-[#1a4480] text-white'
                : 'bg-gray-100 text-gray-400 border border-gray-200'
            }`}>
              {done && '✓ '}{step}
            </div>
            {i < LIFECYCLE_STEPS.length - 1 && (
              <div className={`w-4 h-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Overall status chip ──────────────────────────────────────────────────────
function StatusChip({ fundData, signData }) {
  if (!fundData) return null;
  const s = fundData.status;
  if (s === 'expired_unfunded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <div className="w-2 h-2 bg-red-500 rounded-full"/>
        Expired — unfunded
      </span>
    );
  }
  if (s === 'awaiting_wire') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"/>
        Documents executed — awaiting wire
      </span>
    );
  }
  if (s === 'funds_received') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <div className="w-2 h-2 bg-blue-500 rounded-full"/>
        Funded — pending Treasury submission
      </span>
    );
  }
  if (s === 'debit_initiated' || s === 'charged') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <div className="w-2 h-2 bg-blue-500 rounded-full"/>
        Funded — pending Treasury submission
      </span>
    );
  }
  return null;
}

// ─── Funding status chip (live, for funding card) ─────────────────────────────
function FundingStatusChip({ fundData }) {
  if (!fundData) return null;
  const s = fundData.status;
  if (s === 'awaiting_wire') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"/>
        Awaiting wire
      </span>
    );
  }
  if (s === 'funds_received') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
        </svg>
        Funds received and matched
      </span>
    );
  }
  if (s === 'expired_unfunded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        Wire deadline expired
      </span>
    );
  }
  if (s === 'debit_initiated') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        Debit initiated → Settled (T+2)
      </span>
    );
  }
  if (s === 'charged') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
        </svg>
        Card charged
      </span>
    );
  }
  return null;
}

// ─── Campaign confirmation (fund rail campaign tier) ──────────────────────────
export function CampaignConfirmation({ campaignData, fundData, onRestart }) {
  const { campaign, amount } = campaignData;
  const confirmNum = `GFC-BATCH-${campaign.id.slice(-4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
          <svg className="w-9 h-9 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Gift Received</h2>
        <p className="text-sm text-gray-500 mt-1">You've joined the {campaign.name} campaign</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-gray-500">Gift confirmation</p><p className="font-mono text-xs text-[#1a4480] font-bold">{confirmNum}</p></div>
          <div><p className="text-xs text-gray-500">Your gift</p><p className="font-bold text-gray-900">{formatCurrency(amount)}</p></div>
          <div><p className="text-xs text-gray-500">Batch date</p><p className="font-medium text-gray-800">{campaign.nextBatchDate}</p></div>
          <div>
            <p className="text-xs text-gray-500">Projected per-child range</p>
            <p className="font-medium text-gray-800">${campaign.perChildProjection.low}–${campaign.perChildProjection.high}</p>
            <p className="text-xs text-gray-400">(adjusted at batch close)</p>
          </div>
          {fundData && (
            <>
              <div>
                <p className="text-xs text-gray-500">Payment method</p>
                <p className="font-medium text-gray-800 capitalize">{fundData.method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment status</p>
                <FundingStatusChip fundData={fundData}/>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Your gift is tax-deductible. Batched with {campaign.donorCount} other donors and submitted to Treasury
        on <strong>{campaign.nextBatchDate}</strong> as a single qualified general contribution.
      </p>

      <button onClick={onRestart} className="w-full py-2.5 text-sm font-semibold text-white rounded"
        style={{ backgroundColor: '#1a4480' }}>
        Make another contribution
      </button>
    </div>
  );
}

// ─── General fund confirmation ────────────────────────────────────────────────
export function GeneralFundConfirmation({ amount, fundData, onRestart }) {
  const confirmNum = `GFC-GENERAL-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-3">
          <svg className="w-9 h-9 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Gift Received</h2>
        <p className="text-sm text-gray-500 mt-1">Added to the Invest America Children's Fund general allocation</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-gray-500">Confirmation</p><p className="font-mono text-xs text-[#1a4480] font-bold">{confirmNum}</p></div>
          <div><p className="text-xs text-gray-500">Gift amount</p><p className="font-bold text-gray-900">{formatCurrency(amount)}</p></div>
          {fundData && (
            <>
              <div><p className="text-xs text-gray-500">Payment</p><p className="font-medium capitalize">{fundData.method}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><FundingStatusChip fundData={fundData}/></div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Tax-deductible. The Fund will allocate your gift to the highest-need open campaigns in the current cycle.
        A formal receipt will be sent to the address on file.
      </p>
      <p className="text-xs text-gray-400 mb-4">The Fund retains final discretion over distributions (variance power).</p>

      <button onClick={onRestart} className="w-full py-2.5 text-sm font-semibold text-white rounded"
        style={{ backgroundColor: '#1a4480' }}>
        Make another contribution
      </button>
    </div>
  );
}

// ─── Main confirmation (designated class / direct rail) ───────────────────────
export default function Step5Confirmation({ rail, orgData, classData, economicsData, certData, signData, fundData, onRestart }) {
  const org = rail === 'fund' ? INVEST_AMERICA_FUND : orgData?.org;
  const { beneficiaryCount, classUnits, birthYears, unitCodes } = classData || {};
  const { total, perChild } = economicsData || {};
  const { confirmationNum, packet, signerName, signerTitle } = certData || {};

  const [showPacket, setShowPacket] = useState(false);

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const batchDate = new Date();
  batchDate.setDate(batchDate.getDate() + (15 - batchDate.getDate() % 15 || 15));
  const batchDateStr = batchDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const driftBand = certData?.packet?.funding?.authorized_band;
  const fallbackText = {
    expand_to_county: 'Expand class to encompassing county',
    fallback_statewide: 'Fall back to statewide',
    hold_in_escrow: 'Hold in escrow',
  }[certData?.packet?.funding?.fallback_election] || '—';

  const wireRef = fundData?.wireReference || packet?.funding?.wire_reference;

  // Build class plain-English description
  const birthYearRange = birthYears?.length
    ? `born ${Math.min(...birthYears)}–${Math.max(...birthYears)}`
    : '';
  const classEnglish = `≈${(beneficiaryCount || 0).toLocaleString()} enrolled children across ${(unitCodes || classUnits || []).length} geographic unit(s)${birthYearRange ? `, ${birthYearRange}` : ''}`;

  return (
    <>
      {/* Print stylesheet */}
      <style>{`
        @media print {
          header, nav, [class*="WizardStepper"], footer, button, .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { break-inside: avoid; box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          .max-w-4xl { max-width: 100% !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">

        {/* ── Status header ─────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 print-card">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Confirmation Number</p>
              <p className="font-bold text-[#1a4480] font-mono text-2xl tracking-wide">{confirmationNum}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusChip fundData={fundData} signData={signData}/>
              <button onClick={() => window.print()}
                className="no-print px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 text-gray-700 flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Print / Save as PDF
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">Submitted: {timestamp}</p>
          <LifecycleStepper fundData={fundData}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── 1. Contribution summary ──────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 print-card">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Contribution Summary</p>
            <p className="text-sm text-gray-700 mb-3">{classEnglish}</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total contribution</dt>
                <dd className="font-bold text-gray-900">{formatCurrency(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Per-child at snapshot</dt>
                <dd className="font-semibold text-gray-800">{formatCurrency(perChild)}</dd>
              </div>
              {driftBand && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Authorized band</dt>
                  <dd className="text-gray-700">{formatCurrency(driftBand[0])} – {formatCurrency(driftBand[1])}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Fallback election</dt>
                <dd className="text-gray-700 text-right max-w-32">{fallbackText}</dd>
              </div>
            </dl>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Geographic units</p>
              <div className="flex flex-wrap gap-1">
                {(unitCodes || classUnits || []).map((u, i) => (
                  <span key={i} className="text-xs bg-gray-100 rounded px-1.5 py-0.5 text-gray-600 font-mono">{u}</span>
                ))}
              </div>
              {birthYears?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">Birth years: {birthYears.sort().join(', ')}</p>
              )}
            </div>
          </div>

          {/* ── 2. Funding card ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 print-card">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Funding</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Method</dt>
                <dd className="font-semibold capitalize">{fundData?.method || '—'}</dd>
              </div>
              {wireRef && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Wire reference</dt>
                  <dd className="font-mono text-xs text-gray-800">{wireRef}</dd>
                </div>
              )}
              {fundData?.maskedAccount && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Account</dt>
                  <dd className="font-mono text-xs">{fundData.maskedAccount} ({fundData.institution})</dd>
                </div>
              )}
              {fundData?.maskedCard && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Card</dt>
                  <dd className="font-mono text-xs">{fundData.maskedCard}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-bold">{formatCurrency(fundData?.chargedAmount ?? fundData?.amount ?? total)}</dd>
              </div>
              {fundData?.method === 'card' && fundData?.chargedAmount !== fundData?.giftAmount && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Gift amount (receipt)</dt>
                  <dd className="text-gray-700">{formatCurrency(fundData.giftAmount)}</dd>
                </div>
              )}
              {fundData?.deadline && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Wire deadline</dt>
                  <dd className={`font-medium ${fundData.status === 'expired_unfunded' ? 'text-red-600 line-through' : 'text-red-700'}`}>
                    {fundData.deadline}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <FundingStatusChip fundData={fundData}/>
              {fundData?.status === 'funds_received' && (
                <p className="text-xs text-gray-400 mt-1">
                  Received: {new Date().toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* ── 3. Documents card ────────────────────────────────────── */}
          {signData && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 print-card">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Executed Documents</p>
              <p className="text-xs text-gray-500 mb-3 font-mono">Envelope: {signData.envelopeId}</p>
              <div className="space-y-3">
                {signData.documents?.map(doc => (
                  <div key={doc.id} className="border border-gray-100 rounded p-3">
                    <p className="text-xs font-semibold text-gray-800">{doc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono break-all">{doc.hash?.slice(0, 20)}…</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{new Date(doc.completedAt).toLocaleString()}</p>
                      <button onClick={() => window.print()} className="text-xs text-[#1a4480] hover:underline no-print">
                        Download →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => window.print()} className="text-xs text-[#1a4480] hover:underline no-print">
                  Download Certificate of Completion →
                </button>
              </div>
            </div>
          )}

          {/* ── 4. Treasury submission card ──────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 print-card">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Treasury Submission</p>
            <dl className="space-y-2 text-sm mb-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Submission cycle</dt>
                <dd className="font-medium">{batchDateStr}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Contributor of record</dt>
                <dd className="text-gray-800 text-right max-w-40">{org?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">EIN</dt>
                <dd className="font-mono text-xs">{org?.ein}</dd>
              </div>
            </dl>
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2 mb-3">
              Treasury receives this class specification — never beneficiary names.
              Treasury resolves the class against its own enrollment records at disbursement.
            </p>
            {packet && (
              <button onClick={() => setShowPacket(v => !v)}
                className="w-full text-xs px-3 py-2 border rounded font-medium transition-colors no-print"
                style={showPacket
                  ? { backgroundColor: '#1a4480', color: 'white', borderColor: '#1a4480' }
                  : { color: '#1a4480', borderColor: '#1a4480', backgroundColor: 'white' }}
              >
                {showPacket ? 'Hide packet' : 'View packet as submitted to Treasury'}
              </button>
            )}
            {showPacket && packet && (
              <div className="mt-3">
                <JsonView data={packet}/>
              </div>
            )}
          </div>

          {/* ── 5. Tax receipt / acknowledgment card ─────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 print-card">
            {rail === 'fund' ? (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tax Receipt</p>
                <div className="border border-gray-200 rounded p-4 text-sm space-y-1.5">
                  <p className="font-semibold text-gray-800">{INVEST_AMERICA_FUND.name}</p>
                  <p className="text-xs text-gray-500">EIN: {INVEST_AMERICA_FUND.ein}</p>
                  <p className="text-xs text-gray-500">501(c)(3) — California nonprofit public benefit corporation</p>
                  <div className="border-t border-gray-100 my-2"/>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Donor</span>
                    <span className="text-xs font-medium">{signerName || fundData?.billingContact?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Date</span>
                    <span className="text-xs">{today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Amount</span>
                    <span className="text-xs font-bold">{formatCurrency(fundData?.giftAmount ?? total)}</span>
                  </div>
                  <div className="border-t border-gray-100 my-2"/>
                  <p className="text-xs text-gray-500 italic">
                    No goods or services were provided in exchange for this contribution.
                  </p>
                </div>
                <button onClick={() => window.print()} className="mt-3 w-full text-xs py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 no-print">
                  Download Receipt (PDF)
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Submission Acknowledgment</p>
                <p className="text-sm text-gray-700 mb-3">
                  Your organization's general funding contribution has been received and is pending
                  Treasury submission in the next batch cycle.
                </p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 text-xs">Organization</dt>
                    <dd className="text-xs font-medium">{org?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 text-xs">EIN</dt>
                    <dd className="text-xs font-mono">{org?.ein}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 text-xs">Submission date</dt>
                    <dd className="text-xs">{today}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 text-xs">Amount</dt>
                    <dd className="text-xs font-bold">{formatCurrency(total)}</dd>
                  </div>
                </dl>
              </>
            )}
          </div>

          {/* ── 6. What happens next card ─────────────────────────────── */}
          <div className={`bg-white border border-gray-200 rounded-xl p-5 print-card ${signData ? '' : 'md:col-span-2'}`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">What Happens Next</p>
            <div className="space-y-3 mb-4">
              {[
                { date: fundData?.deadline || batchDateStr, label: 'Wire deadline / Batch submission date', active: fundData?.status === 'awaiting_wire' },
                { date: batchDateStr, label: 'Treasury batch submission', active: false },
                { date: (() => { const d = new Date(batchDate); d.setDate(d.getDate() + 14); return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }); })(), label: 'Expected disbursement window opens', active: false },
                { date: 'After disbursement', label: 'Final per-child figure replaces projection', active: false },
              ].map(({ date, label, active }) => (
                <div key={label} className="flex gap-3 text-xs">
                  <div className="flex-shrink-0 w-28 text-gray-500 font-medium">{date}</div>
                  <div className={active ? 'text-amber-700 font-semibold' : 'text-gray-600'}>{label}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 text-xs text-gray-500">
              <p className="font-semibold text-gray-700 mb-1">Questions?</p>
              <p>Contact the Fund at <span className="text-[#1a4480]">contributions@investamerica.org</span></p>
              <p className="mt-0.5">Reference your confirmation number: <span className="font-mono font-semibold">{confirmationNum}</span></p>
            </div>
          </div>

        </div>

        {/* Beneficiary preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-4 no-print">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">What Account Holders See</p>
          <div className="bg-white border border-blue-200 rounded p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-gray-800">Qualified General Contribution</p>
                <p className="text-xs text-gray-500 mt-0.5">{org?.name}</p>
                <p className="text-xs text-gray-400">Trump Account — {today}</p>
              </div>
              <p className="font-bold text-green-700 text-lg">+{formatCurrency(perChild)}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            This contribution is excluded from the beneficiary's $5,000 annual contribution limit.{' '}
            <span className="text-blue-400">§530A(d)</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5 no-print">
          <button onClick={onRestart}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1a4480' }}
          >
            Make another contribution
          </button>
        </div>

      </div>
    </>
  );
}
