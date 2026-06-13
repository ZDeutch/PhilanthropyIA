import { useState, useEffect } from 'react';

const CHECKS = [
  { id: 'teos', label: 'TEOS status re-verified', delay: 600 },
  { id: 'ofac', label: 'OFAC/AML screening', delay: 600 },
  { id: 'class', label: 'Class definition validated', delay: 600 },
  { id: 'funding', label: 'Funding instruction verified', delay: 600 },
];

function formatCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function Step4SelfCertification({ orgData, classData, economicsData, onNext, onBack }) {
  const { org } = orgData;
  const { classUnits, beneficiaryCount, birthYears } = classData;
  const { amount, perChild } = economicsData;

  const [checked, setChecked] = useState({ attest1: false, attest2: false, attest3: false });
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [sweeping, setSweeping] = useState(false);
  const [sweepResults, setSweepResults] = useState([]);
  const [done, setDone] = useState(false);

  const allChecked = checked.attest1 && checked.attest2 && checked.attest3;
  const canSubmit = allChecked && name.trim() && title.trim();

  const handleSubmit = async () => {
    setSweeping(true);
    setSweepResults([]);
    for (const check of CHECKS) {
      await new Promise(r => setTimeout(r, check.delay));
      setSweepResults(prev => [...prev, check.id]);
    }
    await new Promise(r => setTimeout(r, 400));
    setDone(true);
  };

  const confirmationNum = `GFC-2026-${String(Math.floor(400 + Math.random() * 100)).padStart(5, '0')}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Step 4 — Self-Certification</h2>
        <p className="text-sm text-gray-600">
          Review the contribution summary and complete the required attestations. An authorized officer
          must certify under penalty of perjury.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white border border-gray-200 rounded p-5 mb-5 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contribution Summary</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Contributing Organization</p>
            <p className="font-semibold text-gray-900">{org.name}</p>
            <p className="text-xs text-gray-500 font-mono">{org.ein}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="font-semibold text-gray-900 text-lg">{formatCurrency(amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Beneficiary Count</p>
            <p className="font-semibold text-gray-900">{beneficiaryCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Per-Beneficiary Amount</p>
            <p className="font-semibold text-gray-900">{formatCurrency(perChild)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Qualified Class Composition</p>
          <div className="flex flex-wrap gap-1">
            {classUnits.map((u, i) => (
              <span key={i} className="text-xs bg-blue-50 border border-blue-200 rounded px-2 py-0.5 text-blue-800">{u}</span>
            ))}
          </div>
          {birthYears.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">Birth-year cohort: {birthYears.sort().join(', ')}</p>
          )}
        </div>
      </div>

      {/* Attestations */}
      {!sweeping && (
        <>
          <div className="bg-white border border-gray-200 rounded p-5 mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Required Attestations</p>
            <p className="text-xs text-gray-500 mb-4">Under penalty of perjury, the undersigned certifies that:</p>

            <div className="space-y-4">
              {[
                {
                  key: 'attest1',
                  text: 'I am an authorized officer of the named 501(c)(3) organization. The funds to be contributed are unrestricted charitable assets of the organization, not held in trust for any individual donor.',
                },
                {
                  key: 'attest2',
                  text: 'The specified qualified class meets the requirements of §530A. No additional eligibility criteria beyond the geographic designation and, if applicable, birth-year cohort are imposed on beneficiaries.',
                },
                {
                  key: 'attest3',
                  text: 'I consent to Treasury record retention, contributor-identity reporting to beneficiaries upon request, and post-disbursement sampling-based audit as required under §530A and related Treasury guidance.',
                },
              ].map(a => (
                <label key={a.key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked[a.key]}
                    onChange={e => setChecked(prev => ({ ...prev, [a.key]: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-700">{a.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Signature block */}
          <div className="bg-white border border-gray-200 rounded p-5 mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Authorized Signature</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name (print)</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4480]"
                  placeholder="Full legal name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4480]"
                  placeholder="e.g., Executive Director"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1a4480' }}
            >
              Submit Certification
            </button>
          </div>
        </>
      )}

      {/* Compliance sweep animation */}
      {sweeping && !done && (
        <div className="bg-white border border-gray-200 rounded p-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Running automated compliance sweep...</p>
          <div className="space-y-3">
            {CHECKS.map(check => {
              const complete = sweepResults.includes(check.id);
              const pending = !complete;
              const active = !complete && sweepResults.length === CHECKS.indexOf(check);
              return (
                <div key={check.id} className="flex items-center gap-3">
                  {complete ? (
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : active ? (
                    <svg className="animate-spin w-5 h-5 text-[#1a4480] flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0"/>
                  )}
                  <span className={`text-sm ${complete ? 'text-green-700 font-medium' : pending ? 'text-gray-400' : 'text-gray-700'}`}>
                    {check.label} {complete && '✓'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Done */}
      {done && (
        <div className="bg-green-50 border border-green-300 rounded p-5">
          <div className="flex items-start gap-3 mb-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            <div>
              <p className="font-semibold text-green-800">No manual review required. Application auto-certified.</p>
              <p className="text-sm text-green-700 mt-1">
                Treasury retains full records; this contribution is subject to sampling-based audit.
              </p>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-green-700 ml-9">
            {CHECKS.map(c => (
              <p key={c.id} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                {c.label}
              </p>
            ))}
          </div>
          <div className="mt-4 ml-9">
            <button
              onClick={() => onNext({ confirmationNum, signerName: name, signerTitle: title })}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded transition-colors"
              style={{ backgroundColor: '#1a4480' }}
            >
              View Confirmation →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
