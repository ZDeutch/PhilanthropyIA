import { CAMPAIGNS } from '../data/campaigns';

function fmtCurrency(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + n.toLocaleString();
}

function ProgressBar({ raised, goal }) {
  const pct = Math.min(100, (raised / goal) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 my-1">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#16a34a' : '#1a4480' }}
      />
    </div>
  );
}

export default function CampaignList({ onSelect, onBack }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h2 className="text-xl font-semibold text-[#1a4480] mb-1">Active Campaigns</h2>
        <p className="text-sm text-gray-600">
          Choose a campaign to join. Your gift is pooled with others and submitted as a single
          qualified contribution at the next batch date.
        </p>
      </div>

      <div className="space-y-3">
        {CAMPAIGNS.map(c => {
          const pct = Math.round((c.raised / c.goal) * 100);
          const isGoalReached = c.status === 'goal_reached';

          return (
            <div
              key={c.id}
              className={`bg-white border rounded-lg overflow-hidden ${isGoalReached ? 'border-green-300' : 'border-gray-200'}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.classSummary}</p>
                  </div>
                  {isGoalReached ? (
                    <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                      Goal reached ✓
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-xs bg-blue-50 text-[#1a4480] font-medium px-2 py-1 rounded-full whitespace-nowrap">
                      Batches {c.nextBatchDate}
                    </span>
                  )}
                </div>

                <ProgressBar raised={c.raised} goal={c.goal} />

                <div className="flex items-center justify-between text-xs text-gray-500 mt-1 mb-3">
                  <span>
                    <span className="font-semibold text-gray-800">{fmtCurrency(c.raised)}</span>
                    {' '}raised of {fmtCurrency(c.goal)} goal
                    {' '}• {c.donorCount} donors
                  </span>
                  <span>
                    <span className="font-semibold text-gray-800">{c.beneficiaries.toLocaleString()}</span> beneficiaries
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Current projection:{' '}
                    <span className="font-semibold text-gray-800">
                      ${c.perChildProjection.low}–${c.perChildProjection.high}/child
                    </span>
                  </div>
                  {isGoalReached ? (
                    <span className="text-xs text-green-700 font-medium">
                      Submitting {c.nextBatchDate}
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelect(c)}
                      className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-colors"
                      style={{ backgroundColor: '#1a4480' }}
                    >
                      Join campaign
                    </button>
                  )}
                </div>
              </div>

              {isGoalReached && (
                <div className="bg-green-50 border-t border-green-200 px-4 py-2 text-xs text-green-700">
                  Goal reached — submitting in next batch cycle. Gifts are no longer accepted for this campaign.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
