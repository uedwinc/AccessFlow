import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { AnalyzeRequest, AnalyzeResponse, ErrorResponse } from '../types.js';
import { validateInput } from '../utils/validation.js';
import { generateSessionId } from '../utils/session.js';
import {
  generateJobSummary,
  generatePositioningSummary,
  generateCoverLetter,
  generateInterviewPrep
} from '../services/bedrock.js';
import {
  logRequestMetadata,
  logCompletionMetadata,
  safeErrorLog
} from '../utils/logging.js';

/**
 * Lambda handler for POST /api/analyze
 * Analyzes job application and generates tailored materials
 */
export async function handler(
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> {
  try {
    // Parse request body - handle both v1 and v2 event formats
    const rawBody = event.body;
    if (!rawBody) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'Request body is required'
        } as ErrorResponse)
      };
    }

    // Handle base64 encoded body (API Gateway v2 can base64 encode)
    const bodyString = ('isBase64Encoded' in event && event.isBase64Encoded)
      ? Buffer.from(rawBody, 'base64').toString('utf-8')
      : rawBody;

    const input: AnalyzeRequest = JSON.parse(bodyString);

    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'Invalid input provided',
          details: validation.errors
        } as ErrorResponse)
      };
    }

    // Generate session ID
    const sessionId = generateSessionId();
    
    // Log request metadata safely (hashed IDs only)
    logRequestMetadata({
      sessionId,
      jobDescLength: input.jobDescription.length,
      resumeLength: input.resumeText.length,
      includeInterviewPrep: input.preferences.includeInterviewPrep,
      disclosureFlag: input.preferences.disclosureFlag
    });

    // Generate all analysis components
    const [jobSummary, positioningSummary, coverLetter] = await Promise.all([
      generateJobSummary(input.jobDescription),
      generatePositioningSummary(input.jobDescription, input.resumeText),
      generateCoverLetter(
        input.jobDescription,
        input.resumeText,
        input.preferences.disclosureFlag
      )
    ]);

    // Conditionally generate interview prep
    let interviewPrep;
    if (input.preferences.includeInterviewPrep) {
      interviewPrep = await generateInterviewPrep(
        input.jobDescription,
        input.preferences
      );
    }

    // Build response
    const response: AnalyzeResponse = {
      sessionId,
      analysis: {
        sessionId,
        jobSummary,
        positioningSummary,
        coverLetter,
        interviewPrep
      }
    };

    // Log completion metadata safely (hashed session ID only)
    logCompletionMetadata({
      sessionId,
      hasInterviewPrep: !!interviewPrep
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: JSON.stringify(response)
    } as any;

  } catch (error) {
    // Log error without sensitive data (no bodies, no PII)
    console.error('Error processing request:', safeErrorLog(error));
    
    // Determine appropriate error response
    let statusCode = 500;
    let errorMessage = 'An error occurred while processing your request';
    
    if (error instanceof Error) {
      // Check for specific AWS errors
      if (error.message.includes('Bedrock') || error.message.includes('AI service')) {
        statusCode = 503;
        errorMessage = 'The AI service is temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('throttl')) {
        statusCode = 429;
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('credentials') || error.message.includes('authorization')) {
        statusCode = 500;
        errorMessage = 'Service configuration error. Please contact support.';
      }
    }
    
    return {
      statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
      },
      body: JSON.stringify({
        error: statusCode === 503 ? 'ServiceUnavailable' : 'InternalError',
        message: errorMessage
      } as ErrorResponse)
    } as any;
  }
}
