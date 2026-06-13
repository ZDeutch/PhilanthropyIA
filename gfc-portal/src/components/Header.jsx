export default function Header({ view, setView }) {
  return (
    <header style={{ backgroundColor: '#1a4480' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {/* Eagle seal placeholder */}
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
              <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                <circle cx="20" cy="20" r="18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                <text x="20" y="15" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">U.S.</text>
                <text x="20" y="26" textAnchor="middle" fill="white" fontSize="7">TREAS</text>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base leading-tight">U.S. Department of the Treasury</div>
              <div className="text-xs sm:text-sm text-blue-200 leading-tight">General Funding Contribution Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              DEMO / Simulated Data
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="mt-3 flex gap-1 border-t border-white/20 pt-2">
          <button
            onClick={() => setView('portal')}
            className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${
              view === 'portal'
                ? 'bg-white text-[#1a4480]'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Contribution Portal
          </button>
          <button
            onClick={() => setView('admin')}
            className={`px-4 py-1.5 text-sm rounded-t font-medium transition-colors ${
              view === 'admin'
                ? 'bg-white text-[#1a4480]'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Treasury Oversight
          </button>
        </div>
      </div>
    </header>
  );
}
