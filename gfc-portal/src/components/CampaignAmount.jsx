import { useState } from 'react';

const MIN_GIFT = 10;

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

export default function CampaignAmount({ campaign, onNext, onBack }) {
  const [rawInput, setRawInput] = useState('');

  const amount = parseCurrency(rawInput);
  const valid = amount >= MIN_GIFT;

  const newRaised = campaign.raised + amount;
  const projectedPerChild = newRaised > 0 && campaign.beneficiaries > 0
    ? newRaised / campaign.beneficiaries
    : 0;

  const handleChange = (e) => {
    setRawInput(formatAmount(e.target.value));
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-5">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
          ← Back to campaigns
        </button>
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Join Campaign</h2>
        <p className="text-sm text-gray-600">{campaign.name}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-4 mb-4 text-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Campaign Details</p>
        <p className="text-gray-600 text-xs">{campaign.classSummary}</p>
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
          <div>
            <p className="text-gray-500">Beneficiaries</p>
            <p className="font-semibold text-gray-800">{campaign.beneficiaries.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Next batch</p>
            <p className="font-semibold text-gray-800">{campaign.nextBatchDate}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded p-5 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Your gift amount</label>
        <p className="text-xs text-gray-500 mb-3">Minimum: $10.00</p>
        <input
          type="text"
          inputMode="decimal"
          value={rawInput}
          onChange={handleChange}
          placeholder="$0.00"
          className="w-full border border-gray-300 rounded px-3 py-2.5 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#1a4480] focus:border-[#1a4480]"
        />

        {amount > 0 && amount < MIN_GIFT && (
          <p className="mt-2 text-xs text-red-700">Minimum gift is $10.00.</p>
        )}

        {valid && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
            <p>Your contribution joins {campaign.donorCount} other donors.</p>
            <p className="mt-1">
              New projected per-child range:{' '}
              <span className="font-semibold">
                ${Math.round(projectedPerChild * 0.9).toFixed(0)}–${Math.round(projectedPerChild * 1.1).toFixed(0)}/child
              </span>
              <span className="text-blue-500 ml-1">(adjusted at disbursement)</span>
            </p>
            <p className="mt-1">Batches on <span className="font-semibold">{campaign.nextBatchDate}</span>.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-5 text-xs text-blue-800">
        Your gift is tax-deductible. The final per-child amount is set when the batch closes,
        not at time of giving. <span className="text-blue-500">§530A(d)</span>
      </div>

      <div className="flex gap-3 justify-between">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={() => onNext({ campaign, amount })}
          disabled={!valid}
          className="px-6 py-2.5 text-sm font-semibold text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#1a4480' }}
        >
          Confirm gift of {valid ? fmtCurrency(amount) : '—'} →
        </button>
      </div>
    </div>
  );
}
