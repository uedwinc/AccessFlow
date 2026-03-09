# Security & Privacy Guidelines

## Logging Policy

### ✅ ALLOWED to Log

1. **Hashed Session IDs**
   - Use `hashSessionId()` to create 8-char SHA-256 hash
   - Example: `sessionHash: "a3f2b9c1"`

2. **Short Hash of Input Lengths**
   - Use `hashInputLengths()` to hash combined lengths
   - Example: `inputHash: "7d4e8f2a"`

3. **Errors Without Bodies**
   - Log error message and type only
   - Use `safeErrorLog()` utility
   - Example: `{ message: "Connection timeout", type: "Error" }`

4. **Metadata**
   - Timestamps
   - Boolean flags (includeInterviewPrep, disclosureFlag)
   - Model IDs
   - Request counts

### ❌ NEVER Log

- ❌ Full session IDs
- ❌ Job descriptions (full or partial)
- ❌ Resume text (full or partial)
- ❌ Work preferences
- ❌ Accommodations
- ❌ Generated content (summaries, cover letters, etc.)
- ❌ User names or contact information
- ❌ Any PII (Personally Identifiable Information)
- ❌ Request/response bodies
- ❌ Source IP addresses

## Implementation

### Logging Utilities

**File:** `backend/src/utils/logging.ts`

```typescript
import { hashSessionId, hashInputLengths, safeErrorLog } from './utils/logging.js';

// ✅ CORRECT: Log with hashed identifiers
logRequestMetadata({
  sessionId,           // Will be hashed internally
  jobDescLength,       // Will be hashed with resumeLength
  resumeLength,        // Will be hashed with jobDescLength
  includeInterviewPrep,
  disclosureFlag
});

// Output:
// {
//   sessionHash: "a3f2b9c1",
//   inputHash: "7d4e8f2a",
//   includeInterviewPrep: true,
//   disclosureFlag: false,
//   timestamp: "2024-01-15T10:30:00.000Z"
// }
```

### Example Logs

#### ✅ CORRECT Logging

```typescript
// Request processing
console.log('Processing request:', {
  sessionHash: hashSessionId(sessionId),
  inputHash: hashInputLengths(jobDescLength, resumeLength),
  includeInterviewPrep: true,
  disclosureFlag: false,
  timestamp: new Date().toISOString()
});

// Completion
console.log('Request completed:', {
  sessionHash: hashSessionId(sessionId),
  hasInterviewPrep: true,
  timestamp: new Date().toISOString()
});

// Error
console.error('Bedrock API error:', {
  message: 'ThrottlingException',
  type: 'Error',
  timestamp: new Date().toISOString(),
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0'
});
```

#### ❌ INCORRECT Logging (DO NOT DO THIS)

```typescript
// ❌ WRONG: Logging full session ID
console.log('Session:', sessionId);

// ❌ WRONG: Logging job description
console.log('Job:', input.jobDescription);

// ❌ WRONG: Logging resume
console.log('Resume:', input.resumeText);

// ❌ WRONG: Logging generated content
console.log('Cover letter:', coverLetter);

// ❌ WRONG: Logging full error with body
console.error('Error:', error);
```

## Data Handling

### In-Memory Only

All sensitive data (job descriptions, resumes, generated content) should:
- ✅ Be processed in memory only
- ✅ Never be written to disk (except S3 with encryption)
- ✅ Never be logged to CloudWatch
- ✅ Be cleared from memory after response sent

### Storage (Future Implementation)

When implementing DynamoDB/S3 storage:
- ✅ Use server-side encryption (SSE-S3, DynamoDB encryption at rest)
- ✅ Use session IDs as keys (not user identifiers)
- ✅ Implement TTL for automatic deletion (30 days recommended)
- ✅ Never store email addresses or explicit disability labels
- ✅ Use IAM roles with least privilege

## CloudWatch Logs

### What You'll See

```
Processing request: {
  sessionHash: "a3f2b9c1",
  inputHash: "7d4e8f2a",
  includeInterviewPrep: true,
  disclosureFlag: false,
  timestamp: "2024-01-15T10:30:00.000Z"
}

Request completed: {
  sessionHash: "a3f2b9c1",
  hasInterviewPrep: true,
  timestamp: "2024-01-15T10:30:15.000Z"
}
```

### What You'll NEVER See

- Job descriptions
- Resume text
- Generated cover letters
- User preferences
- Accommodations
- Full session IDs
- Any PII

## Compliance

### GDPR Considerations

- ✅ No PII in logs (compliant)
- ✅ Session-based (no user tracking)
- ✅ Data minimization (only process what's needed)
- ✅ Right to be forgotten (no persistent storage in MVP)

### HIPAA Considerations

- ✅ No PHI (Protected Health Information) in logs
- ✅ Encryption in transit (HTTPS)
- ✅ Encryption at rest (when storage implemented)
- ✅ Access controls (IAM roles)

### Accessibility & Disability Rights

- ✅ Disclosure flag respects user choice
- ✅ No forced disclosure of disability status
- ✅ Privacy-by-default approach
- ✅ User controls what information is shared

## Security Best Practices

### AWS Configuration

1. **IAM Roles**
   - Use least privilege principle
   - Separate roles for Lambda, S3, DynamoDB
   - No hardcoded credentials

2. **Encryption**
   - HTTPS only (API Gateway)
   - SSE-S3 for S3 buckets
   - DynamoDB encryption at rest

3. **Access Control**
   - Private S3 buckets (except static website)
   - VPC endpoints for AWS services (optional)
   - CloudFront OAI for static content

4. **Monitoring**
   - CloudWatch alarms for errors
   - Billing alarms for cost control
   - No sensitive data in metrics

### Code Security

1. **Input Validation**
   - Validate all user inputs
   - Enforce character limits
   - Sanitize before processing

2. **Error Handling**
   - Never expose internal errors to users
   - Use generic error messages
   - Log errors safely (no bodies)

3. **Dependencies**
   - Keep AWS SDK updated
   - Regular security audits (`npm audit`)
   - Use official AWS packages only

## Incident Response

### If PII is Accidentally Logged

1. **Immediate Actions**
   - Stop the Lambda function
   - Delete CloudWatch log streams
   - Rotate any exposed credentials

2. **Investigation**
   - Identify how PII was logged
   - Review code for similar issues
   - Update logging utilities

3. **Prevention**
   - Add tests for logging functions
   - Code review checklist
   - Automated scanning for PII patterns

### Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT create a public GitHub issue
2. Email security contact (to be added)
3. Include details and reproduction steps
4. Allow time for fix before disclosure

## Testing Security

### Unit Tests for Logging

```typescript
describe('Logging utilities', () => {
  test('hashSessionId never returns full ID', () => {
    const sessionId = generateSessionId();
    const hashed = hashSessionId(sessionId);
    expect(hashed).not.toBe(sessionId);
    expect(hashed.length).toBe(8);
  });

  test('safeErrorLog strips sensitive data', () => {
    const error = new Error('Failed to process: ' + sensitiveData);
    const safe = safeErrorLog(error);
    expect(safe.message).not.toContain(sensitiveData);
  });
});
```

### Manual Security Checklist

Before deployment:
- [ ] Review all `console.log` statements
- [ ] Verify no PII in CloudWatch logs
- [ ] Test error scenarios (no bodies logged)
- [ ] Confirm encryption enabled (S3, DynamoDB)
- [ ] Verify IAM roles use least privilege
- [ ] Test disclosure flag (no disability mentions when false)
- [ ] Confirm HTTPS only (API Gateway)

## Summary

**Golden Rule:** If it contains user data, don't log it. Hash it, count it, or skip it.

**Safe Logging Pattern:**
```typescript
console.log('Operation:', {
  sessionHash: hashSessionId(sessionId),
  inputHash: hashInputLengths(length1, length2),
  booleanFlag: true,
  timestamp: new Date().toISOString()
});
```

**Questions to Ask:**
1. Could this log entry identify a user? → Don't log it
2. Could this log entry reveal sensitive information? → Don't log it
3. Is this necessary for debugging? → Hash it or use metadata
4. Would I want this in a public log? → If no, don't log it

**Remember:** Privacy is a core principle of AccessFlow. When in doubt, don't log it.
