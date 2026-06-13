import { useState } from 'react';

function parseCurrency(val) {
  return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
}

function formatAmount(val) {
  const raw = val.replace(/[^0-9.]/g, '');
  if (!raw) return '';
  const parts = raw.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) return '$' + intPart + '.' + parts[1].slice(0, 2);
  return '$' + intPart;
}

function fmtCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function GeneralFundAmount({ onNext, onBack }) {
  const [rawInput, setRawInput] = useState('');

  const amount = parseCurrency(rawInput);
  const valid = amount > 0;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Give to the General Fund</h2>
        <p className="text-sm text-gray-600">
          Any amount. The Invest America Children's Fund allocates your gift across the
          highest-need open campaigns.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Gift amount</label>
        <p className="text-xs text-gray-500 mb-3">Any amount — no minimum</p>
        <input
          type="text"
          inputMode="decimal"
          value={rawInput}
          onChange={e => setRawInput(formatAmount(e.target.value))}
          placeholder="$0.00"
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1a4480] focus:border-[#1a4480]"
        />
      </div>

      <div className="bg-green-50 border border-green-100 rounded p-4 mb-4 text-sm text-green-800">
        <p className="font-semibold mb-1">Why give to the general fund?</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Fully tax-deductible charitable contribution</li>
          <li>Fund directs gifts to highest-need campaigns — maximum child impact</li>
          <li>No minimum amount required</li>
          <li>Immediate confirmation number and receipt</li>
        </ul>
      </div>

      <p className="text-xs text-gray-400 mb-5 text-center">
        The Fund retains final discretion over all distributions (variance power).
      </p>

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={() => onNext({ amount })}
          disabled={!valid}
          className="px-6 py-2.5 text-sm font-semibold text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1a4480' }}
        >
          {valid ? `Give ${fmtCurrency(amount)} →` : 'Enter an amount →'}
        </button>
      </div>
    </div>
  );
}
