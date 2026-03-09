import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AnalyzeRequest, ErrorResponse, InterviewPrep } from '../types.js';
import { validateInput } from '../utils/validation.js';
import { generateSessionId } from '../utils/session.js';
import { generateInterviewPrep } from '../services/bedrock.js';
import {
  logRequestMetadata,
  logCompletionMetadata,
  safeErrorLog
} from '../utils/logging.js';

/**
 * Lambda handler for POST /api/interview-prep
 * Generates interview preparation materials only
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'ValidationError',
          message: 'Request body is required'
        } as ErrorResponse)
      };
    }

    const input: AnalyzeRequest = JSON.parse(event.body);

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
      includeInterviewPrep: true,
      disclosureFlag: input.preferences.disclosureFlag
    });

    // Generate interview prep
    const interviewPrep = await generateInterviewPrep(
      input.jobDescription,
      input.preferences
    );

    // Log completion metadata safely
    logCompletionMetadata({
      sessionId,
      hasInterviewPrep: true
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        sessionId,
        interviewPrep
      })
    };

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
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: statusCode === 503 ? 'ServiceUnavailable' : 'InternalError',
        message: errorMessage
      } as ErrorResponse)
    };
  }
}
