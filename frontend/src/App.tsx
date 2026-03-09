import { useState } from 'react';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { ApplicationAnalysis } from './types';
import './App.css';

function App() {
  const [results, setResults] = useState<ApplicationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisComplete = (analysis: ApplicationAnalysis) => {
    setResults(analysis);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="app-header" role="banner">
        <h1>AccessFlow</h1>
        <p>Empowering job seekers with accessible, empathetic application support</p>
      </header>

      <main id="main-content" className="app-main" role="main">
        {error && (
          <div className="error-banner" role="alert" aria-live="assertive">
            <strong>Something went wrong</strong>
            {error}
          </div>
        )}

        {!results ? (
          <InputForm
            onAnalysisComplete={handleAnalysisComplete}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <ResultsDisplay analysis={results} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>
          Built with empathy for disabled and neurodivergent job seekers. 
          Your privacy matters—we don't store your personal information.
        </p>
      </footer>
    </div>
  );
}

export default App;
