import { validateInput } from '../validation.js';
import { AnalyzeRequest } from '../../types.js';

describe('Input Validation', () => {
  const createValidRequest = (): AnalyzeRequest => ({
    jobDescription: 'Software Engineer position requiring React and TypeScript',
    resumeText: 'Experienced developer with 5 years in web development',
    preferences: {
      workStyle: 'Remote work preferred',
      accommodations: 'Flexible schedule',
      disclosureFlag: false,
      includeInterviewPrep: true
    }
  });

  describe('validateInput', () => {
    it('should accept valid input', () => {
      const request = createValidRequest();
      const result = validateInput(request);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    describe('Job Description validation', () => {
      it('should reject empty job description', () => {
        const request = createValidRequest();
        request.jobDescription = '';
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.jobDescription).toBe('Job description is required');
      });

      it('should reject whitespace-only job description', () => {
        const request = createValidRequest();
        request.jobDescription = '   \n\t  ';
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.jobDescription).toBe('Job description is required');
      });

      it('should reject job description over 10,000 characters', () => {
        const request = createValidRequest();
        request.jobDescription = 'a'.repeat(10001);
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.jobDescription).toBe('Job description must be less than 10,000 characters');
      });

      it('should accept job description at exactly 10,000 characters', () => {
        const request = createValidRequest();
        request.jobDescription = 'a'.repeat(10000);
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(true);
        expect(result.errors.jobDescription).toBeUndefined();
      });
    });

    describe('Resume Text validation', () => {
      it('should reject empty resume text', () => {
        const request = createValidRequest();
        request.resumeText = '';
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.resumeText).toBe('Resume text is required');
      });

      it('should reject whitespace-only resume text', () => {
        const request = createValidRequest();
        request.resumeText = '   \n\t  ';
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.resumeText).toBe('Resume text is required');
      });

      it('should reject resume text over 20,000 characters', () => {
        const request = createValidRequest();
        request.resumeText = 'a'.repeat(20001);
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.resumeText).toBe('Resume text must be less than 20,000 characters');
      });

      it('should accept resume text at exactly 20,000 characters', () => {
        const request = createValidRequest();
        request.resumeText = 'a'.repeat(20000);
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(true);
        expect(result.errors.resumeText).toBeUndefined();
      });
    });

    describe('Preferences validation', () => {
      it('should accept empty work style', () => {
        const request = createValidRequest();
        request.preferences.workStyle = '';
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(true);
      });

      it('should reject work style over 1,000 characters', () => {
        const request = createValidRequest();
        request.preferences.workStyle = 'a'.repeat(1001);
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.workStyle).toBe('Work style must be less than 1,000 characters');
      });

      it('should accept empty accommodations', () => {
        const request = createValidRequest();
        request.preferences.accommodations = '';
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(true);
      });

      it('should reject accommodations over 1,000 characters', () => {
        const request = createValidRequest();
        request.preferences.accommodations = 'a'.repeat(1001);
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(result.errors.accommodations).toBe('Accommodations must be less than 1,000 characters');
      });
    });

    describe('Multiple validation errors', () => {
      it('should return all validation errors', () => {
        const request = createValidRequest();
        request.jobDescription = '';
        request.resumeText = '';
        request.preferences.workStyle = 'a'.repeat(1001);
        
        const result = validateInput(request);
        
        expect(result.valid).toBe(false);
        expect(Object.keys(result.errors)).toHaveLength(3);
        expect(result.errors.jobDescription).toBeDefined();
        expect(result.errors.resumeText).toBeDefined();
        expect(result.errors.workStyle).toBeDefined();
      });
    });
  });
});
