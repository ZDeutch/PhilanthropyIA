import { useState, useMemo } from 'react';

const MIN_PER_CHILD = 25; // Notice 2025-68

function parseCurrency(val) {
  return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
}

function formatCurrency(n) {
  if (!n && n !== 0) return '';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function formatAmount(val) {
  // Format as user types — allow partial input
  const raw = val.replace(/[^0-9.]/g, '');
  if (!raw) return '';
  const parts = raw.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) return '$' + intPart + '.' + parts[1].slice(0, 2);
  return '$' + intPart;
}

export default function Step3ContributionEconomics({ classData, onNext, onBack }) {
  const { beneficiaryCount, classUnits, statutory } = classData;
  const [rawInput, setRawInput] = useState('');

  const amount = parseCurrency(rawInput);
  const perChild = beneficiaryCount > 0 && amount > 0 ? amount / beneficiaryCount : 0;
  const minTotal = Math.ceil(MIN_PER_CHILD * beneficiaryCount);

  const belowMin = amount > 0 && perChild < MIN_PER_CHILD;
  const valid = amount > 0 && perChild >= MIN_PER_CHILD;

  const handleChange = (e) => {
    setRawInput(formatAmount(e.target.value));
  };

  const setToMinimum = () => {
    setRawInput(formatAmount(String(minTotal)));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Step 3 — Contribution Economics</h2>
        <p className="text-sm text-gray-600">
          Enter the total contribution amount. The per-beneficiary amount must meet the statutory
          minimum of $25.00. <span className="text-xs text-gray-400">Notice 2025-68 (2026–27)</span>
        </p>
      </div>

      {/* Class summary */}
      <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Qualified Class</p>
        <p className="text-sm text-gray-800">
          <span className="font-semibold text-[#1a4480] text-base">{beneficiaryCount.toLocaleString()}</span>
          {' '}enrolled account beneficiaries
          {statutory && <span className="text-xs text-gray-500 ml-1">(statutory class)</span>}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {classUnits.slice(0, 6).map((u, i) => (
            <span key={i} className="text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600">{u}</span>
          ))}
          {classUnits.length > 6 && (
            <span className="text-xs text-gray-400">+{classUnits.length - 6} more</span>
          )}
        </div>
      </div>

      {/* Amount input */}
      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Total Contribution Amount
        </label>
        <p className="text-xs text-gray-500 mb-3">U.S. dollars</p>
        <input
          type="text"
          inputMode="decimal"
          value={rawInput}
          onChange={handleChange}
          placeholder="$0.00"
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1a4480] focus:border-[#1a4480]"
        />

        {/* Per-child live display */}
        {amount > 0 && (
          <div className={`mt-4 p-4 rounded border ${belowMin ? 'bg-red-50 border-red-200' : valid ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <p className="text-sm text-gray-600">Per-beneficiary amount</p>
            <p className={`text-3xl font-bold mt-1 ${belowMin ? 'text-red-700' : 'text-[#1a4480]'}`}>
              {formatCurrency(perChild)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Each of{' '}
              <span className="font-semibold">{beneficiaryCount.toLocaleString()}</span>{' '}
              children receives{' '}
              <span className={`font-semibold ${belowMin ? 'text-red-700' : 'text-[#1a4480]'}`}>
                {formatCurrency(perChild)}
              </span>
            </p>
          </div>
        )}

        {/* Validation error */}
        {belowMin && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <p className="font-semibold">Per-beneficiary amount is below the $25.00 minimum</p>
            <p className="mt-1 text-xs">
              Notice 2025-68 sets a $25.00 per-beneficiary floor for 2026–27. The minimum total
              contribution for this class of {beneficiaryCount.toLocaleString()} beneficiaries is{' '}
              <span className="font-semibold">{formatCurrency(minTotal)}</span>.
            </p>
            <button
              onClick={setToMinimum}
              className="mt-2 text-xs font-semibold text-[#1a4480] underline hover:no-underline"
            >
              Set to minimum ({formatCurrency(minTotal)})
            </button>
          </div>
        )}
      </div>

      {/* Disclosure */}
      <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-5 text-xs text-blue-800">
        Qualified general contributions are exempt from beneficiaries' $5,000 annual contribution limits
        and are excluded from beneficiary income. <span className="text-blue-500">§530A(d)</span>
      </div>

      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext({ amount, perChild })}
          disabled={!valid}
          className="px-6 py-2.5 text-sm font-semibold text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1a4480' }}
        >
          Continue to Self-Certification →
        </button>
      </div>
    </div>
  );
}
