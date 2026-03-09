// Shared types matching backend API contract

export interface UserPreferences {
  workStyle: string;
  accommodations: string;
  disclosureFlag: boolean;
  includeInterviewPrep: boolean;
}

export interface AnalyzeRequest {
  jobDescription: string;
  resumeText: string;
  preferences: UserPreferences;
}

export interface InterviewPrep {
  questions: string[];
  answers: string[];
  accommodationScript?: string;
}

export interface ApplicationAnalysis {
  sessionId: string;
  jobSummary: string;
  positioningSummary: string;
  coverLetter: string;
  interviewPrep?: InterviewPrep;
}

export interface AnalyzeResponse {
  sessionId: string;
  analysis: ApplicationAnalysis;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string>;
}
