export default function Gate2DirectionTiers({ onDesignate, onCampaign, onGeneral, onBack }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
          ← Back
        </button>

        {/* Tax-benefit lead */}
        <div className="bg-green-50 border border-green-200 rounded p-4 mb-5">
          <p className="text-sm font-semibold text-green-800 mb-1">Tax deduction available</p>
          <p className="text-sm text-green-700">
            Gifts to the Invest America Children's Fund are <strong>tax-deductible charitable contributions</strong>.
            Direct gifts to individual accounts are not deductible and require gift-tax filings —
            the Fund route is both compliant and cheaper for you.
          </p>
        </div>

        <p className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
          How would you like your gift directed?
        </p>
        <p className="text-center text-xs text-gray-400 mb-5">
          Choose a direction — this determines how your contribution flows to children's accounts.
        </p>
      </div>

      <div className="space-y-3">
        {/* Designate my own class */}
        <button
          onClick={onDesignate}
          className="w-full text-left p-5 bg-white border-2 border-gray-200 rounded-lg hover:border-[#1a4480] hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors mt-0.5">
              <svg className="w-5 h-5 text-[#1a4480]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Designate my own class</p>
              <p className="text-sm text-gray-600 mt-1">
                Commission a contribution to a geography and age group you define.
                Minimums apply based on class size — smallest possible class: <span className="font-medium">$125,000</span>.
              </p>
              <p className="mt-2 text-xs text-[#1a4480] font-medium group-hover:underline">Build a class →</p>
            </div>
          </div>
        </button>

        {/* Join an open campaign */}
        <button
          onClick={onCampaign}
          className="w-full text-left p-5 bg-white border-2 border-gray-200 rounded-lg hover:border-[#1a4480] hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors mt-0.5">
              <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Join an open campaign</p>
              <p className="text-sm text-gray-600 mt-1">
                Add your gift, in any amount, to an active class campaign.
                Batched and submitted monthly.
              </p>
              <p className="mt-2 text-xs text-[#1a4480] font-medium group-hover:underline">Browse campaigns →</p>
            </div>
          </div>
        </button>

        {/* General fund */}
        <button
          onClick={onGeneral}
          className="w-full text-left p-5 bg-white border-2 border-gray-200 rounded-lg hover:border-[#1a4480] hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors mt-0.5">
              <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Give to the general fund</p>
              <p className="text-sm text-gray-600 mt-1">
                Any amount. The Fund allocates across the highest-need open campaigns.
              </p>
              <p className="mt-2 text-xs text-[#1a4480] font-medium group-hover:underline">Give now →</p>
            </div>
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-5">
        The Fund retains final discretion over all distributions (variance power).
      </p>
    </div>
  );
}
