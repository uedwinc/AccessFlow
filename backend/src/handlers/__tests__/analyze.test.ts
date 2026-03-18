import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../analyze.js';

// Mock all external dependencies
jest.mock('../../services/bedrock.js', () => ({
  generateJobSummary: jest.fn().mockResolvedValue('Job summary text'),
  generatePositioningSummary: jest.fn().mockResolvedValue('Positioning summary text'),
  generateCoverLetter: jest.fn().mockResolvedValue('Cover letter text'),
  generateInterviewPrep: jest.fn().mockResolvedValue({
    questions: ['Q1'],
    answers: ['A1'],
    accommodationScript: 'Script text'
  })
}));

jest.mock('../../utils/logging.js', () => ({
  logRequestMetadata: jest.fn(),
  logCompletionMetadata: jest.fn(),
  safeErrorLog: jest.fn((e) => e?.message ?? String(e))
}));

jest.mock('../../utils/session.js', () => ({
  generateSessionId: jest.fn().mockReturnValue('test-session-id')
}));

const validBody = {
  jobDescription: 'Software engineer role at Acme Corp',
  resumeText: 'Experienced developer with 5 years in TypeScript',
  preferences: {
    workStyle: 'remote',
    accommodations: 'flexible hours',
    disclosureFlag: false,
    includeInterviewPrep: false
  }
};

function makeEvent(body: unknown): APIGatewayProxyEvent {
  return {
    body: body !== null ? JSON.stringify(body) : null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/api/analyze',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: ''
  };
}

describe('analyze handler', () => {
  describe('happy path', () => {
    it('returns 200 with analysis when input is valid', async () => {
      const result = await handler(makeEvent(validBody));

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.sessionId).toBe('test-session-id');
      expect(body.analysis.jobSummary).toBe('Job summary text');
      expect(body.analysis.coverLetter).toBe('Cover letter text');
      expect(body.analysis.interviewPrep).toBeUndefined();
    });

    it('includes CORS headers in success response', async () => {
      const result = await handler(makeEvent(validBody));

      expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers?.['Access-Control-Allow-Headers']).toBe('Content-Type');
      expect(result.headers?.['Access-Control-Allow-Methods']).toBe('POST,OPTIONS');
    });

    it('includes interviewPrep when includeInterviewPrep is true', async () => {
      const event = makeEvent({
        ...validBody,
        preferences: { ...validBody.preferences, includeInterviewPrep: true }
      });

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.analysis.interviewPrep).toBeDefined();
      expect(body.analysis.interviewPrep.questions).toEqual(['Q1']);
    });
  });

  describe('base64 encoded body', () => {
    it('decodes base64 body when isBase64Encoded is true', async () => {
      const encoded = Buffer.from(JSON.stringify(validBody)).toString('base64');
      const event = {
        ...makeEvent(null),
        body: encoded,
        isBase64Encoded: true
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.sessionId).toBe('test-session-id');
    });

    it('handles plain string body when isBase64Encoded is false', async () => {
      const event = {
        ...makeEvent(validBody),
        isBase64Encoded: false
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
    });
  });

  describe('error handling', () => {
    it('returns 400 when body is missing', async () => {
      const event = makeEvent(null);
      event.body = null;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('ValidationError');
      expect(body.message).toBe('Request body is required');
    });

    it('returns 400 when jobDescription is missing', async () => {
      const result = await handler(makeEvent({
        ...validBody,
        jobDescription: ''
      }));

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('ValidationError');
      expect(body.details?.jobDescription).toBeDefined();
    });

    it('returns 400 when resumeText is missing', async () => {
      const result = await handler(makeEvent({
        ...validBody,
        resumeText: ''
      }));

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('ValidationError');
      expect(body.details?.resumeText).toBeDefined();
    });

    it('returns 503 when Bedrock service fails', async () => {
      const { generateJobSummary } = require('../../services/bedrock.js');
      generateJobSummary.mockRejectedValueOnce(new Error('Bedrock connection failed'));

      const result = await handler(makeEvent(validBody));

      expect(result.statusCode).toBe(503);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('ServiceUnavailable');
    });

    it('returns 429 when throttled', async () => {
      const { generateJobSummary } = require('../../services/bedrock.js');
      generateJobSummary.mockRejectedValueOnce(new Error('Request throttled by service'));

      const result = await handler(makeEvent(validBody));

      expect(result.statusCode).toBe(429);
    });

    it('returns 500 for unexpected errors', async () => {
      const { generateJobSummary } = require('../../services/bedrock.js');
      generateJobSummary.mockRejectedValueOnce(new Error('Unexpected failure'));

      const result = await handler(makeEvent(validBody));

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error).toBe('InternalError');
    });
  });
});
