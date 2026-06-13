export default function WizardStepper({ steps, currentStep }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isComplete = currentStep > step.num;
            const isActive = currentStep === step.num;
            return (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isComplete ? 'bg-green-600 text-white' : isActive ? 'text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                    style={isActive ? { backgroundColor: '#1a4480' } : {}}
                  >
                    {isComplete
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      : step.num
                    }
                  </div>
                  <span className={`mt-1 text-xs font-medium text-center leading-tight hidden sm:block ${
                    isActive ? 'text-[#1a4480]' : isComplete ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`}/>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
