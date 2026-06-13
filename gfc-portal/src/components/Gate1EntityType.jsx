export default function Gate1EntityType({ onDirect, onFund }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-[#1a4480] mb-2">
          Welcome to the GFC Portal
        </h2>
        <p className="text-gray-600">
          To route your contribution correctly, please tell us how you are giving.
        </p>
      </div>

      <p className="text-center text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        Are you contributing as a 501(c)(3) organization or government entity?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Yes — Direct rail */}
        <button
          onClick={onDirect}
          className="text-left p-5 bg-white border-2 border-gray-200 rounded-lg hover:border-[#1a4480] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
              <svg className="w-5 h-5 text-[#1a4480]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Yes — 501(c)(3) or government entity</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your organization contributes directly as contributor of record. Enter your EIN for
            instant TEOS verification — no manual review required.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-[#1a4480] group-hover:underline">
            Continue as organization →
          </div>
        </button>

        {/* No — Fund rail */}
        <button
          onClick={onFund}
          className="text-left p-5 bg-white border-2 border-gray-200 rounded-lg hover:border-[#1a4480] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
              <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">No — individual, corporation, or other</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Give through the <span className="font-medium text-gray-800">Invest America Children's Fund</span> —
            a 501(c)(3) that acts as contributor of record on your behalf.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-[#1a4480] group-hover:underline">
            Continue via fund →
          </div>
        </button>
      </div>

      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 text-center">
        Need help choosing?{' '}
        <span className="text-[#1a4480] underline cursor-pointer">See the FAQ</span> or{' '}
        <span className="text-[#1a4480] underline cursor-pointer">contact the fund office</span>.
      </div>
    </div>
  );
}
