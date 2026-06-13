import { useState, useMemo, useRef } from 'react';
import { INVEST_AMERICA_FUND } from '../data/organizations';

function fmtCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function mockHash() {
  const hex = '0123456789abcdef';
  return Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * 16)]).join('');
}

// ─── Signature/initial tabs ───────────────────────────────────────────────────
function SignTab({ id, signed, adoptedSig, onSign, label = 'Sign here' }) {
  if (signed && adoptedSig) {
    return (
      <span className="inline-flex items-baseline gap-1 px-2 py-0.5 bg-blue-50 border border-blue-300 rounded text-blue-800"
        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem' }}>
        {adoptedSig.name}
        <span className="text-xs text-blue-400 ml-1 not-italic" style={{ fontFamily: 'sans-serif' }}>✓</span>
      </span>
    );
  }
  return (
    <button onClick={onSign}
      className="inline-flex items-center gap-1 bg-yellow-300 hover:bg-yellow-400 border border-yellow-500 rounded px-2 py-0.5 text-xs font-bold text-yellow-900 transition-colors"
    >
      ✏ {label}
    </button>
  );
}

function InitialTab({ id, signed, adoptedSig, onSign }) {
  if (signed && adoptedSig) {
    return (
      <span className="inline-flex items-baseline px-2 py-0.5 bg-blue-50 border border-blue-300 rounded text-blue-800"
        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem' }}>
        {adoptedSig.initials}
        <span className="text-xs text-blue-400 ml-1 not-italic" style={{ fontFamily: 'sans-serif' }}>✓</span>
      </span>
    );
  }
  return (
    <button onClick={onSign}
      className="inline-flex items-center gap-1 bg-yellow-300 hover:bg-yellow-400 border border-yellow-500 rounded px-2 py-0.5 text-xs font-bold text-yellow-900 transition-colors"
    >
      ✏ Initial
    </button>
  );
}

// ─── Signature adoption modal ─────────────────────────────────────────────────
const SIG_STYLES = [
  { id: 'serif', renderName: n => ({ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.6rem', color: '#1a3a5c' }), label: 'Classic' },
  { id: 'script', renderName: n => ({ fontFamily: 'Palatino Linotype, Palatino, serif', fontStyle: 'italic', fontSize: '1.8rem', color: '#1a3a5c', letterSpacing: '-0.02em' }), label: 'Flowing' },
  { id: 'modern', renderName: n => ({ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a3a5c', fontWeight: '300', transform: 'skewX(-5deg)', display: 'inline-block' }), label: 'Modern' },
];

function AdoptModal({ onAdopt, onClose }) {
  const [fullName, setFullName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('serif');

  const initials = fullName.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-[#1a4480] px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-white font-semibold">Adopt Your Signature</p>
            <p className="text-blue-200 text-xs mt-0.5">Choose a style to use throughout this document</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Your full legal name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4480]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Initials</label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm font-mono text-gray-600">
                {initials || '—'}
              </div>
            </div>
          </div>

          {fullName.trim() && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select a signature style</p>
              <div className="space-y-3 mb-5">
                {SIG_STYLES.map(style => (
                  <button key={style.id} onClick={() => setSelectedStyle(style.id)}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-left flex items-center justify-between transition-all ${
                      selectedStyle === style.id ? 'border-[#1a4480] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span style={style.renderName(fullName)}>{fullName.trim()}</span>
                    <span className={`text-xs font-medium ${selectedStyle === style.id ? 'text-[#1a4480]' : 'text-gray-400'}`}>
                      {style.label} {selectedStyle === style.id && '✓'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-4">
            By selecting <strong>Adopt and Sign</strong>, I agree this electronic signature is the legal
            equivalent of my handwritten signature (E-SIGN Act, 15 U.S.C. §7001).
          </p>

          <button
            onClick={() => onAdopt({ name: fullName.trim(), initials, style: selectedStyle })}
            disabled={!fullName.trim()}
            className="w-full py-2.5 text-sm font-semibold text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1a4480' }}
          >
            Adopt and Sign
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Document A: fund rail (Designated Class Contribution and Gift Agreement) ──
function DocA({ rail, orgData, classData, economicsData, authData, certData, signedTabs, adoptedSig, onClickTab }) {
  const org = rail === 'fund' ? INVEST_AMERICA_FUND : orgData?.org;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const snapshotDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const { classUnits, beneficiaryCount, birthYears, unitCodes } = classData || {};
  const { perChild, total } = economicsData || {};
  const { driftBand, fallback } = authData || {};
  const signerName = certData?.signerName || '[Contributor Name]';
  const signerTitle = certData?.signerTitle || '';

  const low = driftBand?.[0] ? fmtCurrency(driftBand[0]) : '—';
  const high = driftBand?.[1] ? fmtCurrency(driftBand[1]) : '—';
  const fallbackText = fallback === 'expand_to_county'
    ? 'Expand the class to include all eligible beneficiaries within the encompassing county or counties.'
    : fallback === 'fallback_statewide'
    ? 'Expand the class to include all eligible beneficiaries statewide.'
    : 'Hold the contribution in escrow pending resolution of the class by the Fund.';

  const isFund = rail === 'fund';
  const title = isFund
    ? 'DESIGNATED CLASS CONTRIBUTION AND GIFT AGREEMENT'
    : 'GENERAL FUNDING CONTRIBUTION AUTHORIZATION AND SUBMISSION AGREEMENT';

  return (
    <div className="font-serif text-gray-900 text-sm leading-relaxed">
      <div className="text-center mb-8">
        <p className="text-base font-bold uppercase tracking-wide">{title}</p>
        <p className="text-xs text-gray-500 mt-1">Effective Date: {today}</p>
      </div>

      <p className="mb-4">
        This Agreement is entered into as of <strong>{today}</strong>, between{' '}
        <strong>{signerName}{signerTitle ? `, ${signerTitle}` : ''}</strong> ("Contributor"), and{' '}
        <strong>Invest America Children's Fund</strong>, a California nonprofit public benefit
        corporation exempt under Internal Revenue Code Section 501(c)(3), EIN{' '}
        <strong>88-1234567</strong> (the "Fund").
      </p>

      <p className="font-bold mb-1 mt-5">RECITALS</p>
      <p className="mb-3">
        WHEREAS, IRC §530A establishes a program of qualified general contributions through which
        organizations may designate classes of eligible account beneficiaries for contribution
        through approved Treasury mechanisms;
      </p>
      <p className="mb-3">
        WHEREAS, the Fund is a qualified intermediary authorized to receive designated class
        contributions for submission to Treasury pursuant to IRC §530A and Treasury Notice 2025-68;
      </p>
      <p className="mb-5">
        NOW, THEREFORE, in consideration of the mutual covenants herein, the parties agree:
      </p>

      {isFund ? (
        <>
          <p className="font-bold mb-1">§1. GIFT AND DESIGNATION.</p>
          <p className="mb-3">
            <strong>1.1 Gift.</strong> Contributor hereby irrevocably contributes and transfers to
            the Fund the sum of <strong>{fmtCurrency(total || 0)}</strong> (the "Gift"), to be
            applied as a qualified general contribution under IRC §530A.
          </p>
          <p className="mb-3">
            <strong>1.2 Designation.</strong> The Gift is designated for the benefit of the
            qualified class described in <strong>Exhibit A</strong> attached hereto (the "Designated
            Class"). Exhibit A sets forth the geographic unit codes, unit names, birth-year cohort,
            snapshot beneficiary count, snapshot date, and projected per-beneficiary amount.{' '}
            <InitialTab id="a-init-2" signed={signedTabs.has('a-init-2')} adoptedSig={adoptedSig}
              onSign={() => onClickTab('a-init-2')}/>
          </p>

          <p className="font-bold mb-1 mt-5">§2. VARIANCE POWER.</p>
          <p className="mb-5">
            Notwithstanding the designation in Section 1, the Fund retains final authority and
            discretion over the use and distribution of all contributed assets, and may modify any
            designation that becomes unlawful, impracticable, or inconsistent with the Fund's
            charitable purposes. The parties intend and acknowledge that this gift is a completed
            charitable contribution to the Fund and not an earmarked transfer for the benefit of
            identified individuals.
          </p>
        </>
      ) : (
        <>
          <p className="font-bold mb-1">§1. AUTHORIZATION TO SUBMIT.</p>
          <p className="mb-3">
            Contributor authorizes the Fund to submit a general funding contribution of{' '}
            <strong>{fmtCurrency(total || 0)}</strong> to the Bureau of the Fiscal Service on
            behalf of Contributor. This authorization is granted pursuant to Contributor's board
            authorization dated {today}.
          </p>
          <p className="mb-5">
            <strong>Officer Authority.</strong> The signatory below is a duly authorized officer of
            Contributor with full corporate authority to execute this Agreement and authorize the
            submission described herein.{' '}
            <InitialTab id="a-init-2" signed={signedTabs.has('a-init-2')} adoptedSig={adoptedSig}
              onSign={() => onClickTab('a-init-2')}/>
          </p>
        </>
      )}

      <p className="font-bold mb-1">§3. PER-BENEFICIARY ADJUSTMENT.</p>
      <p className="mb-5">
        The final per-beneficiary amount equals the Gift divided by the Designated Class's enrolled
        count at disbursement as determined by Treasury's enrollment records. Contributor authorizes
        a per-beneficiary range of <strong>{low}</strong> to <strong>{high}</strong> (±15% variance
        from the snapshot amount of <strong>{fmtCurrency(perChild || 0)}</strong>).
      </p>

      <p className="font-bold mb-1">§4. CONTINGENT INSTRUCTION.</p>
      <p className="mb-5">
        If the per-beneficiary amount at disbursement falls outside the authorized band in §3, or
        if the Designated Class becomes unavailable, the Contributor's elected instruction is:{' '}
        <strong>{fallbackText}</strong>
      </p>

      <p className="font-bold mb-1">§5. NO INDIVIDUAL EARMARKING.</p>
      <p className="mb-5">
        The designation in §1 identifies the Designated Class solely by geographic unit and
        birth-year cohort. No criterion included in or intended by this designation may have the
        purpose or effect of selecting, identifying, or differentiating among identified or
        individually identifiable beneficiaries within the Designated Class.{' '}
        <InitialTab id="a-init-5" signed={signedTabs.has('a-init-5')} adoptedSig={adoptedSig}
          onSign={() => onClickTab('a-init-5')}/>
      </p>

      <p className="font-bold mb-1">§6. TAX MATTERS.</p>
      <p className="mb-3">
        <strong>6.1</strong> The Fund has not provided and will not provide any goods or services in
        exchange for this contribution.
      </p>
      <p className="mb-3">
        <strong>6.2</strong> This contribution is intended to qualify as a charitable contribution
        deductible under IRC §170. A written acknowledgment will be provided upon request.
      </p>
      <p className="mb-5">
        <strong>6.3</strong> Contributor is solely responsible for obtaining independent tax advice
        regarding the deductibility and tax consequences of this contribution.
      </p>

      <p className="font-bold mb-1">§7. REPRESENTATIONS.</p>
      <p className="mb-5">
        Contributor represents and warrants that: (a) the funds contributed are lawful assets of
        Contributor; (b) Contributor has full authority to enter into this Agreement; (c) all
        information provided is accurate and complete; and (d) Contributor is not listed on, and
        the funds are not derived from any entity listed on, the OFAC SDN List or applicable
        sanctions lists.
      </p>

      <p className="font-bold mb-1">§8. GENERAL.</p>
      <p className="mb-3">
        <strong>8.1 Governing Law.</strong> This Agreement is governed by the laws of the State of California.
      </p>
      <p className="mb-3">
        <strong>8.2 Entire Agreement.</strong> This Agreement, including all exhibits, constitutes
        the entire agreement of the parties and supersedes all prior agreements.
      </p>
      <p className="mb-5">
        <strong>8.3 Electronic Signature.</strong> Electronic signatures executed herewith have the
        same legal effect as handwritten signatures pursuant to the E-SIGN Act (15 U.S.C. §7001).
      </p>

      {/* Signature blocks */}
      <div className="mt-8 pt-6 border-t border-gray-300">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-4">IN WITNESS WHEREOF, the parties have executed this Agreement.</p>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3">CONTRIBUTOR</p>
            <div className="border-b border-gray-400 pb-1 mb-1 min-h-8 flex items-end">
              <SignTab id="a-sig" signed={signedTabs.has('a-sig')} adoptedSig={adoptedSig}
                onSign={() => onClickTab('a-sig')}/>
            </div>
            <p className="text-xs text-gray-500">{signerName}</p>
            {signerTitle && <p className="text-xs text-gray-500">{signerTitle}</p>}
            <p className="text-xs text-gray-400 mt-2">Date: {today}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3">INVEST AMERICA CHILDREN'S FUND</p>
            <div className="border-b border-gray-400 pb-1 mb-1 min-h-8 flex items-end">
              <span className="text-blue-800" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem' }}>
                {signedTabs.has('a-sig') ? 'James A. Thornton' : ''}
              </span>
            </div>
            <p className="text-xs text-gray-500">James A. Thornton</p>
            <p className="text-xs text-gray-500">Executive Director</p>
            <p className="text-xs text-gray-400 mt-2">Date: {today} (counter-signed)</p>
          </div>
        </div>
      </div>

      {/* Exhibit A */}
      <div className="mt-8 pt-6 border-t border-gray-300">
        <p className="font-bold text-center mb-3">EXHIBIT A — DESIGNATED CLASS SPECIFICATION</p>
        <table className="w-full text-xs border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {['Unit Code', 'Unit Name', 'Birth Years', 'Snapshot Count', 'Per-Beneficiary', 'Snapshot Date'].map(h => (
                <th key={h} className="px-2 py-1.5 text-left border-b border-gray-300 font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(unitCodes || classUnits || []).slice(0, 8).map((code, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-2 py-1 font-mono text-gray-700">{code}</td>
                <td className="px-2 py-1 text-gray-700">{classUnits?.[i] || code}</td>
                <td className="px-2 py-1 text-gray-600">{birthYears?.join(', ') || '—'}</td>
                <td className="px-2 py-1 font-mono">{i === 0 ? (beneficiaryCount || 0).toLocaleString() : '—'}</td>
                <td className="px-2 py-1 font-mono">{fmtCurrency(perChild || 0)}</td>
                <td className="px-2 py-1">{snapshotDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-2">
          Total Contribution: <strong>{fmtCurrency(total || 0)}</strong> ·
          Authorized Band: <strong>{low} – {high}</strong>
        </p>
      </div>
    </div>
  );
}

// ─── Document B: Treasury Submission Certification ────────────────────────────
function DocB({ rail, orgData, classData, economicsData, certData, signedTabs, adoptedSig, onClickTab }) {
  const org = rail === 'fund' ? INVEST_AMERICA_FUND : orgData?.org;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const { classUnits, beneficiaryCount, birthYears, unitCodes } = classData || {};
  const { perChild, total } = economicsData || {};
  const signerName = certData?.signerName || '[Authorized Officer]';
  const signerTitle = certData?.signerTitle || '';
  const confirmationNum = certData?.confirmationNum || '—';

  return (
    <div className="font-serif text-gray-900 text-sm leading-relaxed">
      <div className="text-center mb-8">
        <p className="text-base font-bold uppercase tracking-wide">TREASURY SUBMISSION CERTIFICATION</p>
        <p className="text-xs text-gray-500 mt-1">Contribution Reference: {confirmationNum}</p>
        <p className="text-xs text-gray-500">Submission Date: {today}</p>
      </div>

      <p className="mb-5">
        I declare under penalty of perjury under the laws of the United States of America that the following
        is true and correct:
      </p>

      <ol className="list-decimal list-inside space-y-4 mb-6 pl-2">
        <li>
          I am an authorized officer of <strong>{org?.name}</strong> (EIN: <strong>{org?.ein}</strong>),
          a Section 501(c)(3) organization, and I have the authority to execute this certification on behalf
          of the organization.
        </li>
        <li>
          The qualified class described below meets the requirements of IRC §530A and Treasury Notice 2025-68.
          The class specification identifies beneficiaries solely by geographic unit code(s) and, where
          applicable, birth-year cohort, with no additional eligibility criteria that would permit selection
          of identified or individually identifiable beneficiaries.
        </li>
        <li>
          The organization has not received any goods or services in exchange for this contribution, and
          no portion of the contributed funds inures to the benefit of any private individual associated
          with the contributing organization.
        </li>
      </ol>

      <div className="border border-gray-300 rounded p-4 mb-6 bg-gray-50">
        <p className="font-bold text-xs uppercase tracking-wide text-gray-600 mb-3">Class Specification Summary</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {[
            { label: 'Geographic Units', value: (unitCodes || classUnits || []).join(', ') || '—' },
            { label: 'Birth-Year Cohort', value: birthYears?.join(', ') || 'All eligible years' },
            { label: 'Snapshot Beneficiary Count', value: (beneficiaryCount || 0).toLocaleString() },
            { label: 'Snapshot Date', value: today },
            { label: 'Per-Beneficiary Amount', value: fmtCurrency(perChild || 0) },
            { label: 'Total Contribution', value: fmtCurrency(total || 0) },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-gray-500 font-semibold">{label}</dt>
              <dd className="font-mono text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mb-8 text-xs text-gray-600 italic">
        Executed under the laws of the United States of America. Falsification of this certification
        is subject to criminal penalties under 18 U.S.C. §1001.
      </p>

      {/* Signature block */}
      <div className="border-t border-gray-300 pt-6">
        <div className="max-w-sm">
          <div className="border-b border-gray-400 pb-1 mb-1 min-h-8 flex items-end">
            <SignTab id="b-sig" signed={signedTabs.has('b-sig')} adoptedSig={adoptedSig}
              onSign={() => onClickTab('b-sig')}/>
          </div>
          <p className="text-xs text-gray-600">{signerName}</p>
          {signerTitle && <p className="text-xs text-gray-500">{signerTitle}</p>}
          <p className="text-xs text-gray-500">{org?.name}</p>
          <p className="text-xs text-gray-400 mt-1">Date: {today}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Certificate of completion ────────────────────────────────────────────────
function Certificate({ envelopeId, certData, signedAt, signerEmail }) {
  const org = certData?.signerName || 'Authorized Signatory';
  const events = [
    { event: 'Sent', ts: new Date(Date.now() - 180000) },
    { event: 'Viewed', ts: new Date(Date.now() - 120000) },
    { event: 'Consented to E-SIGN', ts: new Date(Date.now() - 110000) },
    { event: 'Signed Document A', ts: new Date(Date.now() - 60000) },
    { event: 'Signed Document B', ts: new Date(Date.now() - 20000) },
    { event: 'Completed', ts: signedAt },
  ];
  const docAHash = useMemo(mockHash, []);
  const docBHash = useMemo(mockHash, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
          <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Certificate of Completion</h3>
        <p className="text-sm text-gray-500 mt-1">Envelope signed and sealed</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Envelope ID</span>
          <span className="font-mono font-semibold text-[#1a4480]">{envelopeId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Completed</span>
          <span className="font-medium">{signedAt.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Signer</span>
          <span className="font-medium">{org}</span>
        </div>
        {signerEmail && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{signerEmail}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">IP Address</span>
          <span className="font-mono text-gray-600">192.0.2.{Math.floor(10 + Math.random() * 240)}</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Document Hashes (SHA-256)</p>
        <div className="space-y-2">
          {[
            { label: 'Document A — Gift Agreement', hash: docAHash },
            { label: 'Document B — Treasury Certification', hash: docBHash },
          ].map(({ label, hash }) => (
            <div key={label}>
              <p className="text-xs text-gray-600 font-medium mb-0.5">{label}</p>
              <p className="text-xs font-mono text-gray-500 break-all">{hash}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Event Log</p>
        <div className="space-y-1">
          {events.map(({ event, ts }, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="10"/>
              </svg>
              <span className="text-gray-500 w-36 flex-shrink-0 font-mono">{ts.toLocaleTimeString()}</span>
              <span className="text-gray-700">{event}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {['Gift Agreement', 'Treasury Certification', 'Certificate of Completion'].map(doc => (
          <button key={doc} onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
          >
            ↓ Download {doc}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center border border-dashed border-gray-200 rounded px-3 py-2">
        Demonstration document for concept evaluation. Not a binding instrument.
      </p>
    </div>
  );
}

// ─── Envelope (signing session) ───────────────────────────────────────────────
function EnvelopeView({ envelopeId, rail, orgData, classData, economicsData, authData, certData, signedTabs, adoptedSig, onClickTab, onFinish }) {
  const [docIdx, setDocIdx] = useState(0);

  const DOC_A_TABS = ['a-sig', 'a-init-2', 'a-init-5'];
  const DOC_B_TABS = ['b-sig'];
  const docAComplete = DOC_A_TABS.every(t => signedTabs.has(t));
  const docBComplete = DOC_B_TABS.every(t => signedTabs.has(t));
  const allComplete = docAComplete && docBComplete;

  const docs = [
    { label: 'Document A', sublabel: 'Gift Agreement', complete: docAComplete, tabs: DOC_A_TABS.length },
    { label: 'Document B', sublabel: 'Treasury Certification', complete: docBComplete, tabs: DOC_B_TABS.length },
  ];

  return (
    <div className="flex h-[80vh] min-h-96 border border-gray-300 rounded-xl overflow-hidden shadow-lg">
      {/* Left rail */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="px-3 py-3 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-600">DOCUMENTS</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{envelopeId}</p>
        </div>
        <div className="flex-1 p-2 space-y-1">
          {docs.map((d, i) => (
            <button key={i} onClick={() => setDocIdx(i)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                docIdx === i ? 'bg-[#1a4480] text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{d.label}</span>
                {d.complete
                  ? <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  : <span className={docIdx === i ? 'text-blue-200' : 'text-gray-400'}>{d.tabs}✏</span>
                }
              </div>
              <p className={`text-xs mt-0.5 ${docIdx === i ? 'text-blue-200' : 'text-gray-400'}`}>{d.sublabel}</p>
            </button>
          ))}
        </div>
        {allComplete && (
          <div className="p-3 border-t border-gray-200">
            <button onClick={onFinish}
              className="w-full py-2 text-xs font-bold text-white rounded"
              style={{ backgroundColor: '#16a34a' }}
            >
              Finish →
            </button>
          </div>
        )}
      </div>

      {/* Main document area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-gray-800">Please review and sign: 2 documents</p>
            <p className="text-xs text-gray-500">Document {docIdx + 1} of 2</p>
          </div>
          <div className="flex gap-2">
            {docIdx > 0 && (
              <button onClick={() => setDocIdx(i => i - 1)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >← Prev</button>
            )}
            {docIdx < docs.length - 1 && docAComplete && (
              <button onClick={() => setDocIdx(i => i + 1)}
                className="px-3 py-1 text-xs border border-[#1a4480] text-[#1a4480] rounded hover:bg-blue-50"
              >Next →</button>
            )}
          </div>
        </div>

        {/* Paper document */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white shadow-lg max-w-2xl mx-auto rounded">
            {/* Paper header */}
            <div className="border-b border-gray-200 px-8 py-4 flex justify-between items-center">
              <p className="text-xs font-bold text-[#1a4480]">INVEST AMERICA CHILDREN'S FUND</p>
              <p className="text-xs text-gray-400 font-mono">Envelope {envelopeId}</p>
            </div>

            {/* Content */}
            <div className="px-10 py-8">
              {docIdx === 0 && (
                <DocA rail={rail} orgData={orgData} classData={classData} economicsData={economicsData}
                  authData={authData} certData={certData} signedTabs={signedTabs} adoptedSig={adoptedSig}
                  onClickTab={onClickTab}/>
              )}
              {docIdx === 1 && (
                <DocB rail={rail} orgData={orgData} classData={classData} economicsData={economicsData}
                  certData={certData} signedTabs={signedTabs} adoptedSig={adoptedSig} onClickTab={onClickTab}/>
              )}
            </div>

            {/* Paper footer */}
            <div className="border-t border-gray-200 px-8 py-3 flex justify-between">
              <p className="text-xs text-gray-400">
                Demonstration document for concept evaluation. Not a binding instrument.
              </p>
              <p className="text-xs text-gray-400">Page {docIdx + 1} of 2 — Envelope {envelopeId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main SigningCeremony component ───────────────────────────────────────────
export default function SigningCeremony({ rail, orgData, classData, economicsData, authData, certData, onNext, onBack }) {
  const envelopeId = useMemo(() => `IA-ENV-2026-${Math.floor(10000 + Math.random() * 90000)}`, []);
  const [phase, setPhase] = useState('esign'); // 'esign' | 'signing' | 'completing' | 'done'
  const [signerEmail, setSignerEmail] = useState('');
  const [adoptedSig, setAdoptedSig] = useState(null);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [pendingTabId, setPendingTabId] = useState(null);
  const [signedTabs, setSignedTabs] = useState(new Set());
  const signedAtRef = useRef(null);

  const docsHash = useMemo(mockHash, []);
  const docAHash = useMemo(mockHash, []);
  const docBHash = useMemo(mockHash, []);

  const handleClickTab = (tabId) => {
    if (!adoptedSig) {
      setPendingTabId(tabId);
      setShowAdoptModal(true);
    } else {
      setSignedTabs(prev => new Set([...prev, tabId]));
    }
  };

  const handleAdopt = (sig) => {
    setAdoptedSig(sig);
    setShowAdoptModal(false);
    if (pendingTabId) {
      setSignedTabs(prev => new Set([...prev, pendingTabId]));
      setPendingTabId(null);
    }
  };

  const handleFinish = async () => {
    setPhase('completing');
    await new Promise(r => setTimeout(r, 2000));
    signedAtRef.current = new Date();
    setPhase('done');
  };

  const handleContinue = () => {
    const signData = {
      envelopeId,
      signedAt: signedAtRef.current?.toISOString() || new Date().toISOString(),
      signerName: certData?.signerName,
      signerEmail,
      documents: [
        { id: 'doc-a', title: rail === 'fund' ? 'Designated Class Contribution and Gift Agreement' : 'General Funding Contribution Authorization and Submission Agreement', hash: `sha256:${docAHash}`, completedAt: signedAtRef.current?.toISOString() },
        { id: 'doc-b', title: 'Treasury Submission Certification', hash: `sha256:${docBHash}`, completedAt: signedAtRef.current?.toISOString() },
      ],
    };
    onNext(signData);
  };

  // ESIGN consent
  if (phase === 'esign') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Electronic Signature</h2>
          <p className="text-sm text-gray-600">
            Review and sign two documents: a gift agreement and a Treasury submission certification.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-[#1a4480] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">E-SIGN Consent</p>
              <p className="text-sm text-gray-600 mt-1">
                By proceeding, you agree to conduct this transaction electronically and that your electronic
                signature is the legal equivalent of your handwritten signature pursuant to the Electronic
                Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. §7001).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Your email address (for record)</label>
            <input type="email" value={signerEmail} onChange={e => setSignerEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4480]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            ← Back
          </button>
          <button onClick={() => setPhase('signing')}
            className="flex-1 py-2.5 text-sm font-semibold text-white rounded"
            style={{ backgroundColor: '#1a4480' }}
          >
            Agree and Continue — Open Documents →
          </button>
        </div>
      </div>
    );
  }

  // Completing animation
  if (phase === 'completing') {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <svg className="animate-spin w-12 h-12 text-[#1a4480] mx-auto mb-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p className="text-lg font-semibold text-gray-700">Completing envelope…</p>
        <p className="text-sm text-gray-500 mt-2">Sealing documents and generating certificate</p>
      </div>
    );
  }

  // Certificate of completion
  if (phase === 'done') {
    return (
      <div className="max-w-2xl mx-auto">
        <Certificate envelopeId={envelopeId} certData={certData} signedAt={signedAtRef.current || new Date()} signerEmail={signerEmail}/>
        <div className="mt-6 text-center">
          <button onClick={handleContinue}
            className="px-8 py-3 text-sm font-semibold text-white rounded"
            style={{ backgroundColor: '#1a4480' }}
          >
            Continue to Funding →
          </button>
        </div>
      </div>
    );
  }

  // Signing envelope
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1a4480]">Sign Documents</h2>
          <p className="text-xs text-gray-500">Click each yellow tab to sign or initial. Complete both documents to finish.</p>
        </div>
        {adoptedSig && (
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="text-gray-400">Signing as:</span>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#1a4480' }}>{adoptedSig.name}</span>
          </div>
        )}
      </div>

      <EnvelopeView
        envelopeId={envelopeId}
        rail={rail}
        orgData={orgData}
        classData={classData}
        economicsData={economicsData}
        authData={authData}
        certData={certData}
        signedTabs={signedTabs}
        adoptedSig={adoptedSig}
        onClickTab={handleClickTab}
        onFinish={handleFinish}
      />

      {showAdoptModal && (
        <AdoptModal onAdopt={handleAdopt} onClose={() => { setShowAdoptModal(false); setPendingTabId(null); }}/>
      )}
    </div>
  );
}
