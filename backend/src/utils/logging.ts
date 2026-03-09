import { createHash } from 'crypto';

/**
 * Security-focused logging utilities
 * NEVER logs PII - only hashed identifiers and metadata
 */

/**
 * Hash a session ID for safe logging
 * @param sessionId Full session ID
 * @returns First 8 characters of SHA-256 hash
 */
export function hashSessionId(sessionId: string): string {
  return createHash('sha256')
    .update(sessionId)
    .digest('hex')
    .substring(0, 8);
}

/**
 * Create a short hash of input lengths for logging
 * @param jobDescLength Length of job description
 * @param resumeLength Length of resume text
 * @returns Short hash representing input sizes
 */
export function hashInputLengths(jobDescLength: number, resumeLength: number): string {
  const combined = `${jobDescLength}:${resumeLength}`;
  return createHash('sha256')
    .update(combined)
    .digest('hex')
    .substring(0, 8);
}

/**
 * Safe error logging - strips sensitive data
 * @param error Error object
 * @returns Safe error object for logging
 */
export function safeErrorLog(error: unknown): {
  message: string;
  type: string;
  timestamp: string;
} {
  return {
    message: error instanceof Error ? error.message : 'Unknown error',
    type: error instanceof Error ? error.constructor.name : typeof error,
    timestamp: new Date().toISOString()
  };
}

/**
 * Log request metadata safely
 */
export function logRequestMetadata(params: {
  sessionId: string;
  jobDescLength: number;
  resumeLength: number;
  includeInterviewPrep: boolean;
  disclosureFlag: boolean;
}) {
  console.log('Processing request:', {
    sessionHash: hashSessionId(params.sessionId),
    inputHash: hashInputLengths(params.jobDescLength, params.resumeLength),
    includeInterviewPrep: params.includeInterviewPrep,
    disclosureFlag: params.disclosureFlag,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log completion metadata safely
 */
export function logCompletionMetadata(params: {
  sessionId: string;
  hasInterviewPrep: boolean;
}) {
  console.log('Request completed:', {
    sessionHash: hashSessionId(params.sessionId),
    hasInterviewPrep: params.hasInterviewPrep,
    timestamp: new Date().toISOString()
  });
}
