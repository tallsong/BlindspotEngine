import React, { useState } from 'react';
import { WizardInput, WizardDiagnostic, WizardCalendar } from './components/WizardSteps';
import { Target, Brain, Calendar, ArrowRight } from 'lucide-react';

function App() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    knownDomain: '',
    targetDomain: '',
    goal: ''
  });
  const [diagnosticResults, setDiagnosticResults] = useState({});

  const handleConfigSubmit = (data) => {
    setConfig(data);
    setStep(2);
  };

  const handleDiagnosticComplete = (results) => {
    setDiagnosticResults(results);
    setStep(3);
  };

  const handleDebugShowPlan = () => {
    // Mock results for all 10 questions to ensure the calendar renders fully
    setDiagnosticResults({
      1: 'no', 2: 'yes', 3: 'somewhat', 4: 'no', 5: 'yes',
      6: 'no', 7: 'no', 8: 'yes', 9: 'somewhat', 10: 'no'
    });
    // Ensure config has some values so the header looks right
    if (!config.knownDomain) {
      setConfig({
        knownDomain: 'Debug Domain',
        targetDomain: 'Debug Target',
        goal: 'Debug Goal'
      });
    }
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">The Blindspot Engine</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className={`flex items-center ${step >= 1 ? 'text-indigo-600 font-medium' : ''}`}>
              <Target className="w-4 h-4 mr-1" />
              1. Config
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className={`flex items-center ${step >= 2 ? 'text-indigo-600 font-medium' : ''}`}>
              <Brain className="w-4 h-4 mr-1" />
              2. Diagnostic
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className={`flex items-center ${step >= 3 ? 'text-indigo-600 font-medium' : ''}`}>
              <Calendar className="w-4 h-4 mr-1" />
              3. Plan
            </span>

            {/* Debug Button */}
            <button
              onClick={handleDebugShowPlan}
              className="ml-6 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors border border-gray-300"
              title="Skip to Calendar Plan for testing"
            >
              Debug: Show Plan
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="max-w-3xl mx-auto">
          {step === 1 && (
            <WizardInput
              onNext={handleConfigSubmit}
              initialValues={config}
            />
          )}

          {step === 2 && (
            <WizardDiagnostic
              config={config}
              onComplete={handleDiagnosticComplete}
            />
          )}

          {step === 3 && (
            <WizardCalendar
              config={config}
              diagnosticResults={diagnosticResults}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} The Blindspot Engine. Discover your Unknown Unknowns.
        </div>
      </footer>
    </div>
  );
}

export default App;
