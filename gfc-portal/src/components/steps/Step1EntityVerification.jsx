import { useState } from 'react';
import { lookupOrganization } from '../../data/organizations';

function formatEIN(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '-' + digits.slice(2);
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-44 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value}</dd>
    </div>
  );
}

// Shown after a revoked, not_exempt, or not-found result — redirects to fund rail
function FundRailRedirect({ onFundRailRedirect }) {
  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded">
      <p className="text-sm font-semibold text-blue-900 mb-1">
        You can still give through the Invest America Children's Fund
      </p>
      <p className="text-sm text-blue-800 mb-3">
        Gifts to the Invest America Children's Fund are <strong>tax-deductible charitable contributions</strong>.
        Direct gifts to individual accounts are not deductible and require gift-tax filings — the Fund route is
        both compliant and cheaper for you.
      </p>
      <button
        onClick={onFundRailRedirect}
        className="px-5 py-2 text-sm font-semibold text-white rounded"
        style={{ backgroundColor: '#1a4480' }}
      >
        Give through Invest America Children's Fund →
      </button>
      <p className="text-xs text-blue-600 mt-3">
        The Fund retains final discretion over distributions (variance power).
      </p>
    </div>
  );
}

export default function Step1EntityVerification({ onNext, onBack, onFundRailRedirect }) {
  const [ein, setEin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  const handleEINChange = (e) => {
    setEin(formatEIN(e.target.value));
    setResult(null);
    setNotFound(false);
    setError(null);
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (ein.replace(/\D/g, '').length < 9) {
      setError('Please enter a complete 9-digit EIN.');
      return;
    }
    setLoading(true);
    setResult(null);
    setNotFound(false);
    setError(null);

    const res = await lookupOrganization(ein);
    setLoading(false);

    if (!res.found) {
      setNotFound(true);
      return;
    }

    setResult(res.org);
  };

  const org = result;
  const isValid = org?.status === 'valid';
  const isRevoked = org?.status === 'revoked';
  const isNotExempt = org?.status === 'not_exempt';
  const showRedirect = notFound || isRevoked || isNotExempt;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Verify EIN</h2>
        <p className="text-sm text-gray-600">
          Enter the Employer Identification Number (EIN) of the contributing 501(c)(3) organization.
          The system will verify eligibility against the IRS Tax Exempt Organization Search (TEOS) database.
        </p>
      </div>

      <form onSubmit={handleLookup} className="bg-white border border-gray-200 rounded p-5 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Employer Identification Number (EIN)
        </label>
        <p className="text-xs text-gray-500 mb-3">Format: XX-XXXXXXX</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={ein}
            onChange={handleEINChange}
            placeholder="XX-XXXXXXX"
            maxLength={10}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1a4480] focus:border-[#1a4480]"
            onKeyDown={(e) => e.key === 'Enter' && handleLookup(e)}
          />
          <button
            type="submit"
            disabled={loading || ein.replace(/\D/g, '').length < 9}
            className="px-5 py-2 text-sm font-semibold text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1a4480' }}
          >
            {loading ? 'Verifying...' : 'Verify EIN'}
          </button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <svg className="animate-spin w-4 h-4 text-[#1a4480]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Querying IRS TEOS database...
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Error: </strong>{error}
          </div>
        )}
      </form>

      {/* Not found */}
      {notFound && (
        <div className="bg-red-50 border border-red-300 rounded p-5 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <div>
              <p className="font-semibold text-red-800 text-sm">EIN Not Found</p>
              <p className="text-sm text-red-700 mt-1">
                No record found for EIN <span className="font-mono font-bold">{ein}</span> in the IRS Tax Exempt Organization database.
                Verify the EIN and try again, or give through the Fund.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revoked */}
      {isRevoked && (
        <div className="bg-red-50 border border-red-300 rounded p-5 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"/>
            </svg>
            <div>
              <p className="font-semibold text-red-800 text-sm">{org.name} — Tax-Exempt Status Auto-Revoked</p>
              <p className="text-sm text-red-700 mt-1">{org.revocationReason}</p>
              <p className="text-xs text-red-600 mt-2">Revocation effective: {org.revocationDate}</p>
              <p className="text-xs text-red-700 mt-3">
                Organizations with revoked status are not eligible to contribute under §530A.{' '}
                <span className="underline cursor-pointer">How to reinstate exempt status (IRS.gov)</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Not a 501(c)(3) */}
      {isNotExempt && (
        <div className="bg-amber-50 border border-amber-300 rounded p-5 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <div>
              <p className="font-semibold text-amber-800 text-sm">{org.name} — Not a Recognized 501(c)(3)</p>
              <p className="text-sm text-amber-700 mt-1">
                This entity is not a recognized 501(c)(3) and cannot contribute directly.
              </p>
              <p className="text-xs text-amber-600 mt-2">IRS classification on file: {org.type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fund rail redirect — shown for any non-valid outcome */}
      {showRedirect && onFundRailRedirect && (
        <FundRailRedirect onFundRailRedirect={onFundRailRedirect} />
      )}

      {/* Valid organization */}
      {isValid && (
        <div className="bg-white border border-green-300 rounded overflow-hidden mb-4">
          <div className="bg-green-600 px-5 py-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
            <span className="text-white text-sm font-semibold">Verified automatically via IRS TEOS — no manual review required</span>
          </div>
          <div className="px-5 py-4">
            <dl>
              <InfoRow label="Legal Name" value={org.name} />
              <InfoRow label="EIN" value={<span className="font-mono">{org.ein}</span>} />
              <InfoRow label="NTEE Category" value={org.nteeCategory} />
              <InfoRow label="Exemption Ruling Year" value={org.exemptionRulingYear} />
              <InfoRow
                label="Pub. 78 Status"
                value={
                  <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Listed — contributions to this organization are deductible
                  </span>
                }
              />
              <InfoRow label="Deductibility Code" value={org.deductibilityCode} />
            </dl>
          </div>
        </div>
      )}

      {isValid && (
        <div className="flex justify-end">
          <button
            onClick={() => onNext({ org })}
            className="px-6 py-2.5 text-sm font-semibold text-white rounded transition-colors"
            style={{ backgroundColor: '#1a4480' }}
          >
            Continue to Class Builder →
          </button>
        </div>
      )}
    </div>
  );
}
