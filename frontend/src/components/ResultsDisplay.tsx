import { ApplicationAnalysis } from '../types';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  analysis: ApplicationAnalysis;
  onReset: () => void;
}

function ResultsDisplay({ analysis, onReset }: ResultsDisplayProps) {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="results-display">
      <header className="results-header">
        <div>
          <h2>Your Application Materials</h2>
          <p className="results-subtitle">
            Review and customize these materials for your application
          </p>
        </div>
        <button onClick={onReset} className="reset-button" aria-label="Start new application">
          Start New Application
        </button>
      </header>

      <section className="result-section" aria-labelledby="job-summary-heading">
        <div className="section-header">
          <h3 id="job-summary-heading">Job in Plain Language</h3>
          <button
            onClick={() => handleCopy(analysis.jobSummary, 'Job summary')}
            className="copy-button"
            aria-label="Copy job summary to clipboard"
          >
            Copy
          </button>
        </div>
        <div className="result-content">
          <p>{analysis.jobSummary}</p>
        </div>
      </section>

      <section className="result-section" aria-labelledby="positioning-heading">
        <div className="section-header">
          <h3 id="positioning-heading">Key Skills & Strengths</h3>
          <button
            onClick={() => handleCopy(analysis.positioningSummary, 'Skills and strengths')}
            className="copy-button"
            aria-label="Copy skills and strengths to clipboard"
          >
            Copy
          </button>
        </div>
        <div className="result-content">
          <p>{analysis.positioningSummary}</p>
        </div>
      </section>

      <section className="result-section cover-letter-section" aria-labelledby="cover-letter-heading">
        <div className="section-header">
          <h3 id="cover-letter-heading">Cover Letter Draft</h3>
          <button
            onClick={() => handleCopy(analysis.coverLetter, 'Cover letter')}
            className="copy-button"
            aria-label="Copy cover letter to clipboard"
          >
            Copy
          </button>
        </div>
        <div className="result-content cover-letter">
          <pre>{analysis.coverLetter}</pre>
        </div>
      </section>

      {analysis.interviewPrep && (
        <section className="result-section interview-section" aria-labelledby="interview-prep-heading">
          <h3 id="interview-prep-heading">Interview Preparation</h3>
          
          <div className="result-content">
            <h4>Likely Interview Questions</h4>
            <ol className="interview-questions">
              {analysis.interviewPrep.questions.map((question, index) => (
                <li key={index}>
                  <strong>{question}</strong>
                  <p className="suggested-answer">
                    <em>Suggested approach:</em> {analysis.interviewPrep!.answers[index]}
                  </p>
                </li>
              ))}
            </ol>

            {analysis.interviewPrep.accommodationScript && (
              <div className="accommodation-script">
                <h4>Accommodation Request Script</h4>
                <p>{analysis.interviewPrep.accommodationScript}</p>
                <button
                  onClick={() => handleCopy(analysis.interviewPrep!.accommodationScript!, 'Accommodation script')}
                  className="copy-button"
                  aria-label="Copy accommodation script to clipboard"
                >
                  Copy Script
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="results-footer">
        <p className="footer-note">
          <strong>Remember:</strong> These are starting points. Feel free to personalize 
          and adjust them to match your voice and style.
        </p>
      </div>
    </div>
  );
}

export default ResultsDisplay;
