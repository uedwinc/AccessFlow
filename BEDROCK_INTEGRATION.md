# Amazon Bedrock Integration - Technical Details

## Overview

AccessFlow now uses **Amazon Bedrock's Claude models** via the Converse API to generate empathetic, capability-focused job application materials.

## Implementation Details

### File: `backend/src/services/bedrock.ts`

#### Core Function: `callBedrock()`

```typescript
async function callBedrock(prompt: string, maxTokens: number = 2000): Promise<string>
```

- Uses `@aws-sdk/client-bedrock-runtime`
- Implements `ConverseCommand` for Claude models
- Region: `us-east-1` (configurable via `AWS_REGION`)
- Model: Configurable via `BEDROCK_MODEL_ID` environment variable
- Temperature: 0.7 (balanced creativity/consistency)
- Error handling with descriptive messages
- Logging without sensitive data

### AI Generation Functions

#### 1. Job Summary (`generateJobSummary`)

**Purpose:** Create neurodivergent-friendly job descriptions

**Prompt Strategy:**
- Emphasizes plain English and empathy
- Requests concrete, day-to-day task descriptions
- Avoids jargon or explains technical terms
- 2-3 paragraph format

**Token Limit:** 1000 tokens

**Example Output:**
```
This role involves working with a development team to build web applications.
You'll spend most of your time writing code, reviewing others' code, and 
participating in planning meetings. The work is a mix of independent coding 
(about 60% of the time) and collaborative activities like pair programming 
and team discussions (40%).
```

#### 2. Positioning Summary (`generatePositioningSummary`)

**Purpose:** Map candidate strengths to job requirements

**Prompt Strategy:**
- Analyzes both job description and resume
- Identifies matching capabilities
- Focuses on what candidate CAN do
- Suggests which accomplishments to emphasize

**Token Limit:** 1500 tokens

**Example Output:**
```
Your technical skills and problem-solving abilities align well with this role.
Highlight your experience with React and TypeScript, your ability to learn new
technologies quickly, and your track record of delivering projects on time.
Emphasize your collaborative approach and attention to detail.
```

#### 3. Cover Letter (`generateCoverLetter`)

**Purpose:** Generate tailored, professional cover letter

**Prompt Strategy:**
- Respects `disclosureFlag` preference
- If `false`: Explicitly instructs NO disability mentions
- If `true`: Allows relevant accommodation information
- Focuses on capabilities and qualifications
- Professional, confident tone
- 3-4 paragraph structure
- Leaves `[Your Name]` placeholder

**Token Limit:** 2000 tokens

**Disclosure Handling:**
```typescript
const disclosureInstruction = disclosureFlag
  ? 'The candidate is open to mentioning relevant accommodations...'
  : 'IMPORTANT: Do NOT mention disability, accommodations, or any disability-related terms...';
```

#### 4. Interview Prep (`generateInterviewPrep`)

**Purpose:** Generate interview questions and guidance

**Prompt Strategy:**
- Requests 5 likely interview questions
- Provides approach guidance (not full answers)
- Returns structured JSON format
- Separate call for accommodation script if needed

**Token Limit:** 1500 tokens (questions) + 300 tokens (script)

**JSON Parsing:**
- Attempts to extract JSON from response
- Fallback to default questions if parsing fails
- Ensures questions and answers arrays match length

**Accommodation Script:**
- Only generated if accommodations specified
- Confident, professional tone
- Frames accommodations as enabling peak performance
- 2-3 sentences

## Error Handling

### Bedrock-Specific Errors

```typescript
try {
  const response = await bedrockClient.send(command);
  return response.output.message.content[0].text;
} catch (error) {
  console.error('Bedrock API error:', {
    error: error.message,
    modelId: MODEL_ID
  });
  throw new Error('Failed to generate content from AI service');
}
```

### Lambda Handler Error Mapping

| Error Type | Status Code | User Message |
|------------|-------------|--------------|
| Bedrock/AI service | 503 | "The AI service is temporarily unavailable..." |
| Throttling | 429 | "Too many requests. Please wait..." |
| Credentials/Auth | 500 | "Service configuration error..." |
| Other | 500 | "An error occurred while processing..." |

## Privacy & Security

### What Gets Logged

✅ **Safe to log:**
- Session IDs
- Timestamps
- Request metadata (IP, request ID)
- Error types and messages
- Model ID
- Boolean flags (hasJobDescription, includeInterviewPrep)

❌ **Never logged:**
- Job descriptions
- Resume text
- Work preferences
- Accommodations
- Generated content
- Any PII

### Example Safe Logging

```typescript
console.log('Generated session:', {
  sessionId,
  hasJobDescription: !!input.jobDescription,
  hasResumeText: !!input.resumeText,
  includeInterviewPrep: input.preferences.includeInterviewPrep,
  disclosureFlag: input.preferences.disclosureFlag
});
```

## Model Selection Guide

### Claude 3.5 Sonnet (Default)
- **Model ID:** `anthropic.claude-3-5-sonnet-20241022-v2:0`
- **Best for:** Highest quality output, complex reasoning
- **Cost:** ~$0.027 per application
- **Speed:** Moderate
- **Use when:** Quality is priority, competition demo

### Claude 3.5 Haiku
- **Model ID:** `anthropic.claude-3-5-haiku-20241022-v1:0`
- **Best for:** Good quality, faster responses
- **Cost:** ~$0.007 per application
- **Speed:** Fast
- **Use when:** Balancing quality and cost

### Claude 3 Haiku (Legacy)
- **Model ID:** `anthropic.claude-3-haiku-20240307-v1:0`
- **Best for:** Lowest cost, simple tasks
- **Cost:** ~$0.002 per application
- **Speed:** Fastest
- **Use when:** Budget is primary concern

## Configuration

### Environment Variables

```bash
# Required
AWS_REGION=us-east-1

# Optional (has defaults)
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

### IAM Permissions Required

```json
{
  "Effect": "Allow",
  "Action": ["bedrock:InvokeModel"],
  "Resource": [
    "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
    "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0",
    "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
  ]
}
```

## Testing

### Local Testing

1. Ensure AWS credentials configured:
```bash
aws configure
```

2. Enable Bedrock model access in AWS Console

3. Start backend:
```bash
npm run dev:backend
```

4. Test with curl:
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Software Engineer position requiring React and TypeScript...",
    "resumeText": "Experienced developer with 5 years in web development...",
    "preferences": {
      "workStyle": "Remote work preferred",
      "accommodations": "Flexible schedule",
      "disclosureFlag": false,
      "includeInterviewPrep": true
    }
  }'
```

### Expected Response Time

- **Claude 3.5 Sonnet:** 5-10 seconds
- **Claude 3.5 Haiku:** 2-5 seconds
- **Claude 3 Haiku:** 1-3 seconds

Times vary based on input length and network latency.

## Prompt Engineering Tips

### For Better Job Summaries
- Emphasize "day-to-day" activities
- Request concrete examples
- Ask for jargon explanations

### For Better Positioning
- Request specific skill matches
- Ask for accomplishment prioritization
- Focus on transferable skills

### For Better Cover Letters
- Specify tone (professional, confident)
- Request specific structure (3-4 paragraphs)
- Emphasize tailoring to job description

### For Better Interview Prep
- Request structured JSON format
- Ask for approach guidance, not full answers
- Include STAR method references

## Troubleshooting

### "Invalid response from Bedrock"

**Cause:** Response doesn't contain expected structure

**Solution:** Check model ID is correct and model has access

### "Failed to parse interview prep JSON"

**Cause:** Model returned non-JSON or malformed JSON

**Solution:** Fallback to default questions (already implemented)

### "ThrottlingException"

**Cause:** Too many requests to Bedrock

**Solution:** 
- Wait and retry
- Implement exponential backoff
- Request quota increase

### High Costs

**Solution:**
- Switch to Haiku model
- Reduce `maxTokens` limits
- Implement caching for identical inputs

## Future Enhancements

### Potential Improvements

1. **Streaming Responses**
   - Use `InvokeModelWithResponseStream`
   - Show real-time generation to user
   - Better perceived performance

2. **Prompt Caching**
   - Cache identical job descriptions
   - Reduce redundant API calls
   - Lower costs

3. **Retry Logic**
   - Exponential backoff for throttling
   - Automatic fallback to faster model
   - Circuit breaker pattern

4. **A/B Testing**
   - Test different prompt variations
   - Measure output quality
   - Optimize for user satisfaction

5. **Fine-tuning**
   - Create custom model for job applications
   - Train on successful applications
   - Improve domain-specific output

## Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude Model Documentation](https://docs.anthropic.com/claude/docs)
- [Converse API Reference](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html)
- [Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
