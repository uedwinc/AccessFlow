import { useState, FormEvent } from 'react';
import { analyzeApplication } from '../api';
import { ApplicationAnalysis } from '../types';
import './InputForm.css';

interface InputFormProps {
  onAnalysisComplete: (analysis: ApplicationAnalysis) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const WORK_PREFERENCES = [
  { id: 'written-comm', label: 'I prefer written communication over verbal' },
  { id: 'flexible-schedule', label: 'I may need flexible scheduling' },
  { id: 'quiet-space', label: 'I work best in a quiet environment' },
  { id: 'clear-instructions', label: 'I appreciate clear, written instructions' },
  { id: 'breaks', label: 'I may need regular breaks' }
];

function InputForm({ onAnalysisComplete, onError, isLoading, setIsLoading }: InputFormProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [accommodations, setAccommodations] = useState('');
  const [disclosureFlag, setDisclosureFlag] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }
    if (!resumeText.trim()) {
      newErrors.resumeText = 'Resume or experience summary is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreferenceChange = (prefId: string) => {
    setSelectedPreferences(prev =>
      prev.includes(prefId)
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const workStyle = selectedPreferences
        .map(id => WORK_PREFERENCES.find(p => p.id === id)?.label)
        .filter(Boolean)
        .join('; ');

      const response = await analyzeApplication({
        jobDescription,
        resumeText,
        preferences: {
          workStyle,
          accommodations,
          disclosureFlag,
          includeInterviewPrep: true
        }
      });

      onAnalysisComplete(response.analysis);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h1>AccessFlow</h1>
        <p className="tagline">
          Empowering disabled and neurodivergent job seekers to create confident, 
          capability-focused applications
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="jobDescription">
          Job Description <span className="required" aria-label="required">*</span>
        </label>
        <p className="help-text">
          Paste the full job posting here. We'll help you understand what they're really asking for.
        </p>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={8}
          aria-required="true"
          aria-invalid={!!errors.jobDescription}
          aria-describedby={errors.jobDescription ? 'jobDescription-error' : 'jobDescription-help'}
        />
        {errors.jobDescription && (
          <span id="jobDescription-error" className="error-message" role="alert">
            {errors.jobDescription}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="resumeText">
          Your Resume or Experience Summary <span className="required" aria-label="required">*</span>
        </label>
        <p className="help-text">
          Share your work history, skills, and accomplishments. Don't worry about perfect formatting.
        </p>
        <textarea
          id="resumeText"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume or describe your experience..."
          rows={8}
          aria-required="true"
          aria-invalid={!!errors.resumeText}
          aria-describedby={errors.resumeText ? 'resumeText-error' : 'resumeText-help'}
        />
        {errors.resumeText && (
          <span id="resumeText-error" className="error-message" role="alert">
            {errors.resumeText}
          </span>
        )}
      </div>

      <fieldset className="form-group preferences-group">
        <legend>Work Preferences (Optional)</legend>
        <p className="help-text">
          Select any that apply. This helps us tailor your application materials. 
          You can leave this blank if you prefer.
        </p>
        <div className="checkbox-list">
          {WORK_PREFERENCES.map(pref => (
            <label key={pref.id} className="checkbox-label">
              <input
                type="checkbox"
                id={pref.id}
                checked={selectedPreferences.includes(pref.id)}
                onChange={() => handlePreferenceChange(pref.id)}
              />
              <span>{pref.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-group">
        <label htmlFor="accommodations">
          Specific Accommodations (Optional)
        </label>
        <p className="help-text">
          If you have specific workplace needs, you can note them here. 
          We'll help you frame them professionally if you choose to include them.
        </p>
        <textarea
          id="accommodations"
          value={accommodations}
          onChange={(e) => setAccommodations(e.target.value)}
          placeholder="E.g., noise-canceling headphones, flexible start times, written meeting notes..."
          rows={3}
          aria-describedby="accommodations-help"
        />
      </div>

      <div className="form-group disclosure-group">
        <label className="checkbox-label disclosure-label">
          <input
            type="checkbox"
            id="disclosureFlag"
            checked={disclosureFlag}
            onChange={(e) => setDisclosureFlag(e.target.checked)}
            aria-describedby="disclosure-help"
          />
          <span>
            It's okay to reference disability or accommodations in my cover letter
          </span>
        </label>
        <p id="disclosure-help" className="help-text disclosure-help">
          By default, we focus only on your capabilities and qualifications. 
          Check this box if you want to include information about accommodations 
          or disability-related strengths in your cover letter.
        </p>
      </div>

      <button 
        type="submit" 
        className="submit-button" 
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Strategy & Cover Letter'}
      </button>

      {isLoading && (
        <div className="loading-indicator" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <p>
            Analyzing your application and generating personalized materials... 
            This usually takes 5-15 seconds.
          </p>
        </div>
      )}
    </form>
  );
}

export default InputForm;
