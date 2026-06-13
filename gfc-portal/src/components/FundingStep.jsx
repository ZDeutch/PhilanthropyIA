import { useState, useMemo } from 'react';

const DEMO_BANNER = 'Demonstration — simulated payment rails';

function fmtCurrency(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function addBusinessDays(days) {
  const d = new Date();
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getAvailableRails(rail, tier, amount) {
  if (rail === 'direct' || (rail === 'fund' && tier === 'designate')) return ['wire'];
  if (tier === 'campaign') {
    if (amount > 250000) return ['wire'];
    if (amount >= 25000) return ['ach', 'wire'];
    if (amount >= 1000) return ['card', 'ach'];
    return ['card'];
  }
  // general pool
  const rails = [];
  if (amount < 25000) rails.push('card');
  rails.push('ach');
  return rails;
}

const MOCK_BANKS = [
  { id: 'chase', name: 'Chase', icon: '🏦' },
  { id: 'boa', name: 'Bank of America', icon: '🏛️' },
  { id: 'wells', name: 'Wells Fargo', icon: '🐴' },
  { id: 'usbank', name: 'U.S. Bank', icon: '🏙️' },
];

function PlaidModal({ onConnected, onClose }) {
  const [step, setStep] = useState('pick');
  const [inst, setInst] = useState(null);
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-80 shadow-2xl overflow-hidden">
        <div className="bg-[#1a4480] px-5 py-4 flex justify-between items-start">
          <div>
            <p className="text-white font-semibold text-sm">Connect your bank</p>
            <p className="text-blue-200 text-xs mt-0.5">Simulated bank connection</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-4">
          {step === 'pick' && (
            <>
              <p className="text-xs text-gray-500 mb-3">Select your institution</p>
              <div className="space-y-2">
                {MOCK_BANKS.map(b => (
                  <button key={b.id} onClick={() => { setInst(b); setStep('creds'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-left text-sm"
                  >
                    <span className="text-xl">{b.icon}</span>
                    <span className="font-medium text-gray-800">{b.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">Demonstration — no real data used</p>
            </>
          )}
          {step === 'creds' && (
            <>
              <button onClick={() => setStep('pick')} className="text-xs text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{inst?.icon}</span>
                <p className="font-medium text-gray-800 text-sm">{inst?.name}</p>
              </div>
              <div className="space-y-2 mb-3">
                <input type="text" value={u} onChange={e => setU(e.target.value)}
                  placeholder="Username (anything)" className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
                <input type="password" value={p} onChange={e => setP(e.target.value)}
                  placeholder="Password (anything)" className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-3">
                Simulated — accepts any credentials
              </p>
              <button onClick={() => setStep('account')} disabled={!u || !p}
                className="w-full py-2 text-sm font-semibold text-white rounded disabled:opacity-40"
                style={{ backgroundColor: '#1a4480' }}
              >
                Continue
              </button>
            </>
          )}
          {step === 'account' && (
            <>
              <p className="text-xs text-gray-500 mb-3">Select account to debit</p>
              <button onClick={() => onConnected({ institution: inst.name, maskedAccount: '••••6789' })}
                className="w-full flex justify-between items-center px-3 py-2.5 border-2 border-[#1a4480] rounded-lg bg-blue-50"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Checking ••••6789</p>
                  <p className="text-xs text-gray-500">{inst?.name}</p>
                </div>
                <span className="text-xs bg-[#1a4480] text-white px-2 py-0.5 rounded">Select</span>
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">Simulated — no real account accessed</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WireScreen({ packet, rail, amount, onSent }) {
  const [sent, setSent] = useState(false);
  const deadline = useMemo(() => addBusinessDays(10), []);
  const wireRef = packet?.funding?.wire_reference || `FRB-${Date.now().toString().slice(-8)}`;
  const isFund = rail === 'fund';

  const bankName = isFund
    ? 'Pacific Trust Bank, N.A.'
    : 'Federal Reserve Bank of New York — Bureau of the Fiscal Service';
  const acctName = isFund
    ? "Invest America Children's Fund — Contribution Clearing"
    : 'U.S. Treasury — GFC Receipts';
  const routing = isFund ? '121000248' : '021000021';
  const maskedAcct = isFund ? '••••••4892' : '••••••7731';
  const swift = isFund ? 'PACTUS66XXX' : 'FRNYUS33XXX';

  const copy = text => navigator.clipboard.writeText(text).catch(() => {});

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p className="font-semibold text-green-800">Wire instruction logged</p>
          <p className="text-sm text-green-700 mt-1">Your packet is pending fund matching</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"/>
            <span className="text-xs text-amber-700 font-medium">Awaiting wire</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Funds matched automatically when wire arrives with ref{' '}
          <span className="font-mono font-semibold">{wireRef}</span>.
          Use "Simulate incoming wire" in the admin tab for demo purposes.
        </p>
        <button
          onClick={() => onSent({ method: 'wire', wireReference: wireRef, deadline, bankName, amount, status: 'awaiting_wire' })}
          className="w-full py-2.5 text-sm font-semibold text-white rounded"
          style={{ backgroundColor: '#1a4480' }}
        >
          Continue to Confirmation →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
        {DEMO_BANNER}
      </div>

      {/* Wire reference — prominent */}
      <div className="bg-[#1a4480] text-white rounded-lg p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-1">Wire Memo Reference (Required)</p>
        <div className="flex items-center gap-3">
          <p className="font-mono text-lg font-bold tracking-wider flex-1">{wireRef}</p>
          <button onClick={() => copy(wireRef)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-blue-200 mt-2">
          Must be included in the wire memo field. Funds without this reference cannot be matched automatically.
        </p>
      </div>

      {/* Bank details */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Receiving Bank</p>
        <dl className="space-y-2.5">
          {[
            { label: 'Bank Name', value: bankName },
            { label: 'ABA Routing', value: routing, mono: true },
            { label: 'Account Name', value: acctName },
            { label: 'Account Number', value: maskedAcct, mono: true },
            { label: 'SWIFT/BIC', value: swift, mono: true, note: 'For international originators' },
          ].map(({ label, value, mono, note }) => (
            <div key={label} className="flex gap-4">
              <dt className="text-xs text-gray-500 w-32 flex-shrink-0 pt-0.5">{label}</dt>
              <dd>
                <span className={`text-sm ${mono ? 'font-mono text-gray-900' : 'text-gray-900'}`}>{value}</span>
                {note && <p className="text-xs text-gray-400">{note}</p>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Amount and notices */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Exact Amount Due</span>
          <span className="text-lg font-bold text-gray-900">{fmtCurrency(amount)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2">
            Originator name must match the contributor of record. Wires from third-party accounts will be returned.
          </p>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
          <span className="text-gray-500">Funding Deadline</span>
          <span className="font-semibold text-red-700">{deadline}</span>
        </div>
        <p className="text-xs text-gray-400">Wire must be received within 10 business days or this packet expires and is voided.</p>
      </div>

      {/* DAF / stock callout */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm font-medium text-purple-800">Giving appreciated stock or granting from a donor-advised fund?</p>
        <p className="text-sm text-purple-600 mt-1">
          Contact the Fund — transfer instructions differ. We support DTC delivery and DAF grants from major sponsoring organizations.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => window.print()}
          className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
        >
          Download wire instructions (PDF)
        </button>
        <button onClick={() => setSent(true)}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded"
          style={{ backgroundColor: '#1a4480' }}
        >
          I've sent the wire →
        </button>
      </div>
    </div>
  );
}

function AchScreen({ amount, onComplete }) {
  const [step, setStep] = useState('connect');
  const [showPlaid, setShowPlaid] = useState(false);
  const [account, setAccount] = useState(null);
  const [manualRouting, setManualRouting] = useState('');
  const [manualAcct, setManualAcct] = useState('');
  const [authorized, setAuthorized] = useState(false);

  const maskedAcct = account?.maskedAccount ?? (manualAcct.length >= 4 ? `••••${manualAcct.slice(-4)}` : null);
  const institution = account?.institution ?? 'Your bank';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleAuthorize = async () => {
    setStep('done');
    await new Promise(r => setTimeout(r, 1100));
    onComplete({ method: 'ach', institution, maskedAccount: maskedAcct || '••••0000', amount, status: 'debit_initiated' });
  };

  if (step === 'done') {
    return (
      <div className="text-center py-10">
        <svg className="animate-spin w-8 h-8 text-[#1a4480] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p className="font-medium text-gray-700">Initiating ACH debit…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
        {DEMO_BANNER}
      </div>

      <div className="bg-white border border-gray-200 rounded p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Bank Account</p>
        {!maskedAcct ? (
          <div className="space-y-3">
            <button onClick={() => setShowPlaid(true)}
              className="w-full flex items-center gap-3 px-4 py-3 border-2 border-[#1a4480] rounded-lg hover:bg-blue-50 text-left"
            >
              <div className="w-7 h-7 bg-[#1a4480] rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1a4480]">Connect instantly</p>
                <p className="text-xs text-gray-500">Simulated bank link</p>
              </div>
            </button>
            <div className="text-center text-xs text-gray-400">— or enter manually —</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Routing number</label>
                <input type="text" maxLength={9} value={manualRouting}
                  onChange={e => setManualRouting(e.target.value.replace(/\D/g, ''))}
                  placeholder="021000021"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Account number</label>
                <input type="text" value={manualAcct}
                  onChange={e => setManualAcct(e.target.value.replace(/\D/g, ''))}
                  placeholder="Any account number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            {/* Check helper */}
            <div className="border border-dashed border-gray-200 rounded p-3 bg-gray-50 text-xs text-gray-500">
              <div className="flex justify-between mb-1 text-gray-400 text-[10px]">
                <span>PAY TO THE ORDER OF _______________________</span>
                <span className="font-bold">$_______</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex gap-6 mt-1">
                <div>
                  <p className="text-gray-400 text-[10px]">⑆ Routing</p>
                  <p className="font-mono">{manualRouting || '•••••••••'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px]">Account</p>
                  <p className="font-mono">{manualAcct || '•••••••••••'}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1">Sample check — routing and account number locations</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">{institution}</p>
              <p className="text-sm font-mono text-gray-600">{maskedAcct} — Checking</p>
            </div>
            <button onClick={() => { setAccount(null); setManualAcct(''); setManualRouting(''); }}
              className="text-xs text-[#1a4480] hover:underline"
            >Change</button>
          </div>
        )}
      </div>

      {maskedAcct && (
        <div className="bg-white border border-gray-200 rounded p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={authorized} onChange={e => setAuthorized(e.target.checked)} className="mt-0.5 flex-shrink-0"/>
            <span className="text-sm text-gray-700">
              I authorize Invest America Children's Fund to initiate a one-time ACH debit to the account above for{' '}
              <strong>{fmtCurrency(amount)}</strong> on or after {today}. This authorization is subject to the rules
              of the National Automated Clearinghouse Association (NACHA). I may revoke this authorization by
              contacting the Fund before the debit is initiated.
            </span>
          </label>
        </div>
      )}

      {maskedAcct && authorized && (
        <button onClick={handleAuthorize}
          className="w-full py-2.5 text-sm font-semibold text-white rounded"
          style={{ backgroundColor: '#1a4480' }}
        >
          Authorize debit — {fmtCurrency(amount)}
        </button>
      )}

      {showPlaid && (
        <PlaidModal
          onConnected={acct => { setAccount(acct); setShowPlaid(false); }}
          onClose={() => setShowPlaid(false)}
        />
      )}
    </div>
  );
}

function CardScreen({ amount, onComplete }) {
  const RATE = 0.022;
  const FLAT = 0.30;
  const fee = parseFloat((amount * RATE + FLAT).toFixed(2));

  const [coverFee, setCoverFee] = useState(true);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addr, setAddr] = useState('');
  const [processing, setProcessing] = useState(false);

  const chargedAmt = coverFee ? amount + fee : amount;
  const digits = cardNum.replace(/\s/g, '');
  const canPay = digits.length === 16 && expiry.length >= 5 && cvc.length >= 3 && zip.length === 5 && name && email;

  const fmtCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = v => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1400));
    onComplete({
      method: 'card',
      maskedCard: `••••${digits.slice(-4)}`,
      chargedAmount: chargedAmt,
      giftAmount: amount,
      billingContact: { name, email, address: addr },
      status: 'charged',
    });
  };

  if (processing) {
    return (
      <div className="text-center py-12">
        <svg className="animate-spin w-10 h-10 text-[#1a4480] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p className="font-semibold text-gray-700">Processing payment…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-center text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
        {DEMO_BANNER} — test card: 4242 4242 4242 4242
      </div>

      {/* Fee toggle */}
      <div className="bg-amber-50 border border-amber-200 rounded p-4">
        <p className="text-sm text-amber-800 mb-2">
          Card processing costs approximately 2.2% + $0.30{' '}
          (<strong>{fmtCurrency(fee)}</strong> on this gift).
        </p>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCoverFee(v => !v)}>
          <div className={`w-10 h-5 rounded-full flex items-center transition-colors flex-shrink-0 ${coverFee ? 'bg-[#1a4480]' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-transform ${coverFee ? 'translate-x-5' : ''}`}/>
          </div>
          <span className="text-sm text-amber-800">
            {coverFee
              ? `Cover the fee — charging ${fmtCurrency(chargedAmt)} so 100% of ${fmtCurrency(amount)} reaches children`
              : `Waive — charging ${fmtCurrency(amount)} (fund absorbs ${fmtCurrency(fee)} fee)`}
          </span>
        </div>
        {amount >= 1000 && (
          <p className="text-xs text-amber-700 mt-2">Gifts over $1,000 — consider bank transfer (no fees).</p>
        )}
      </div>

      {/* Card details */}
      <div className="bg-white border border-gray-200 rounded p-5 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Card Information</p>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Card number</label>
          <input type="text" value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))}
            placeholder="4242 4242 4242 4242"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry (MM/YY)</label>
            <input type="text" value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))}
              placeholder="12/27" className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">CVC</label>
            <input type="text" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123" className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"/>
          </div>
        </div>
        <div className="w-32">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Billing ZIP</label>
          <input type="text" value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="94025" className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"/>
        </div>
      </div>

      {/* Billing contact */}
      <div className="bg-white border border-gray-200 rounded p-5 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Billing Contact (for tax receipt)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Billing address</label>
          <input type="text" value={addr} onChange={e => setAddr(e.target.value)}
            placeholder="Street, City, State, ZIP"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"/>
        </div>
      </div>

      <button onClick={handlePay} disabled={!canPay}
        className="w-full py-3 text-sm font-semibold text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#1a4480' }}
      >
        Pay {fmtCurrency(chargedAmt)} →
      </button>
    </div>
  );
}

const RAIL_LABELS = { wire: 'Wire Transfer', ach: 'ACH Bank Debit', card: 'Credit / Debit Card' };
const RAIL_DESC = {
  wire: 'Required for this contribution type. No processing fees.',
  ach: 'Bank debit via ACH. No fees. Settles T+2 in demo.',
  card: 'Instant. Processing fee approx. 2.2% + $0.30.',
};

export default function FundingStep({ rail, tier, amount, packet, onNext, onBack }) {
  const availableRails = useMemo(() => getAvailableRails(rail, tier, amount), [rail, tier, amount]);
  const [selectedRail, setSelectedRail] = useState(availableRails[0]);
  const [termsChecked, setTermsChecked] = useState(false);
  const needsTerms = tier === 'campaign' || tier === 'general';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Fund Your Contribution</h2>
        <p className="text-sm text-gray-600">
          {availableRails.length === 1
            ? `${RAIL_LABELS[availableRails[0]]} is the required payment method for this contribution type and amount.`
            : `Select a payment method for ${fmtCurrency(amount)}.`}
        </p>
      </div>

      {/* Rail selector */}
      {availableRails.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
          {availableRails.map(r => (
            <button key={r} onClick={() => setSelectedRail(r)}
              className={`px-3 py-3 rounded-lg border-2 text-sm transition-all ${
                selectedRail === r ? 'border-[#1a4480] bg-blue-50 text-[#1a4480]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold">{RAIL_LABELS[r]}</p>
              <p className={`text-xs mt-0.5 ${selectedRail === r ? 'text-blue-500' : 'text-gray-400'}`}>{RAIL_DESC[r]}</p>
            </button>
          ))}
        </div>
      )}

      {/* Lightweight terms for campaign/general */}
      {needsTerms && !termsChecked && (
        <div className="bg-white border border-gray-200 rounded p-4 mb-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)} className="mt-0.5"/>
            <span className="text-sm text-gray-700">
              I agree to the Invest America Children's Fund{' '}
              <span className="text-[#1a4480] underline">Terms of Contribution</span>{' '}
              and authorize this one-time charitable gift of <strong>{fmtCurrency(amount)}</strong>.
            </span>
          </label>
        </div>
      )}

      {/* Payment screen */}
      {(!needsTerms || termsChecked) && (
        <div className="mb-4">
          {selectedRail === 'wire' && <WireScreen packet={packet} rail={rail} amount={amount} onSent={onNext}/>}
          {selectedRail === 'ach' && <AchScreen amount={amount} onComplete={onNext}/>}
          {selectedRail === 'card' && <CardScreen amount={amount} onComplete={onNext}/>}
        </div>
      )}

      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mt-2">← Back</button>
    </div>
  );
}
