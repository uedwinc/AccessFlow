import { AnalyzeRequest, ValidationResult } from '../types.js';

/**
 * Validate user input for application analysis
 * @param input User input to validate
 * @returns Validation result with field-specific errors
 */
export function validateInput(input: AnalyzeRequest): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate job description
  if (!input.jobDescription || input.jobDescription.trim().length === 0) {
    errors.jobDescription = 'Job description is required';
  } else if (input.jobDescription.length > 10000) {
    errors.jobDescription = 'Job description must be less than 10,000 characters';
  }

  // Validate resume text
  if (!input.resumeText || input.resumeText.trim().length === 0) {
    errors.resumeText = 'Resume text is required';
  } else if (input.resumeText.length > 20000) {
    errors.resumeText = 'Resume text must be less than 20,000 characters';
  }

  // Validate preferences
  if (input.preferences) {
    if (input.preferences.workStyle && input.preferences.workStyle.length > 1000) {
      errors.workStyle = 'Work style must be less than 1,000 characters';
    }
    if (input.preferences.accommodations && input.preferences.accommodations.length > 1000) {
      errors.accommodations = 'Accommodations must be less than 1,000 characters';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
