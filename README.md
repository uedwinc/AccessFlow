# AccessFlow

Empathetic job application assistant for disabled and neurodivergent job seekers.

## Project Structure

```
accessflow-mvp/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.tsx       # Main app component
│   │   ├── api.ts        # API client
│   │   └── types.ts      # TypeScript types
│   └── package.json
├── backend/           # Node.js Lambda functions
│   ├── src/
│   │   ├── handlers/     # Lambda handlers
│   │   ├── services/     # Business logic (Bedrock integration)
│   │   ├── utils/        # Utilities (validation, session)
│   │   └── types.ts      # TypeScript types
│   └── package.json
└── package.json       # Root workspace config
```

## Quick Start

### Prerequisites
- Node.js 22.x or later
- npm 9.x or later
- AWS Account with Bedrock access (see AWS_SETUP.md)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials:
```bash
aws configure
# Enter your AWS credentials and set region to us-east-1
```

3. Enable Bedrock model access:
   - Go to AWS Console → Amazon Bedrock → Model Access
   - Request access to Claude 3.5 Sonnet or Haiku
   - Wait for approval (usually instant)

4. Copy environment variables:
```bash
# Backend environment
cp .env.example .env
# Edit .env and set BEDROCK_MODEL_ID if needed

# Frontend environment (already configured for local dev)
cp frontend/.env.example frontend/.env
# No changes needed for local development
```

### Development

Run both frontend and backend in development mode:

```bash
# Terminal 1 - Backend server (port 3001)
npm run dev:backend

# Terminal 2 - Frontend dev server (port 3000)
npm run dev
```

Open http://localhost:3000 in your browser.

**Note:** The backend now makes real calls to Amazon Bedrock. Ensure you have:
- AWS credentials configured
- Bedrock model access enabled
- `BEDROCK_MODEL_ID` set in `.env` (defaults to Claude 3.5 Sonnet)

See **AWS_SETUP.md** for detailed setup instructions.

## Key Files Explained

### Frontend
- **App.tsx** - Main application component with routing logic
- **InputForm.tsx** - Form for job description, resume, and preferences
- **ResultsDisplay.tsx** - Displays generated application materials
- **api.ts** - HTTP client for backend API calls
- **types.ts** - TypeScript interfaces matching backend contract

### Backend
- **handlers/analyze.ts** - Lambda handler for POST /api/analyze
- **services/bedrock.ts** - Amazon Bedrock integration with Claude 3.5 Sonnet/Haiku
- **utils/validation.ts** - Input validation logic
- **utils/session.ts** - Session ID generation (128-bit entropy)
- **utils/logging.ts** - Security-focused logging (hashed IDs only, no PII)
- **local-server.ts** - Local development server (port 3001)

## Amazon Bedrock Integration

The backend now uses **real Amazon Bedrock API calls** via the Converse API:

### Features
- ✅ Empathetic job summaries in plain English
- ✅ Capability-focused positioning analysis
- ✅ Tailored cover letters (respects disclosure preferences)
- ✅ Interview preparation with questions and answers
- ✅ Accommodation request scripts
- ✅ **Privacy-focused logging** (hashed IDs only, no PII - see SECURITY.md)

### Prompts Engineered For
1. **Job Summary**: Neurodivergent-friendly, concrete, jargon-free
2. **Positioning**: Strength-focused, capability-driven
3. **Cover Letter**: Professional, respects disability disclosure preference
4. **Interview Prep**: Practical guidance with STAR method suggestions

### Model Selection

Configure via `BEDROCK_MODEL_ID` in `.env`:

- **Claude 3.5 Sonnet** (default): Best quality, higher cost (~$0.027/application)
- **Claude 3.5 Haiku**: Good quality, faster, lower cost (~$0.007/application)
- **Claude 3 Haiku**: Legacy, lowest cost (~$0.002/application)

See **AWS_SETUP.md** for detailed configuration.

## Common Commands

### Development
```bash
# Install all dependencies
npm install

# Start frontend dev server (port 3000)
npm run dev

# Start backend dev server (port 3001)
npm run dev:backend
```

### Testing
```bash
# Run backend unit tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

See `backend/TESTING.md` for detailed testing documentation.

### Building
```bash
# Build frontend for production
npm run build:frontend

# Build backend Lambda functions
npm run build:backend

# Build everything
npm run build
```

### Lambda Deployment
```bash
# Build optimized Lambda bundles
cd backend
npm run build:lambda

# Output: dist/lambda/analyzeApplication/ and dist/lambda/interviewPrep/
```

See `backend/LAMBDA_BUILD.md` for detailed deployment instructions.

### POST /api/analyze

**Request:**
```json
{
  "jobDescription": "string",
  "resumeText": "string",
  "preferences": {
    "workStyle": "string",
    "accommodations": "string",
    "disclosureFlag": boolean,
    "includeInterviewPrep": boolean
  }
}
```

**Response:**
```json
{
  "sessionId": "string",
  "analysis": {
    "sessionId": "string",
    "jobSummary": "string",
    "positioningSummary": "string",
    "coverLetter": "string",
    "interviewPrep": {
      "questions": ["string"],
      "answers": ["string"],
      "accommodationScript": "string"
    }
  }
}
```

## Next Steps

1. **Test with Real Data**: Try the application with actual job descriptions and resumes
2. **Fine-tune Prompts**: Adjust prompts in `backend/src/services/bedrock.ts` for better output
3. **Add DynamoDB storage**: Implement session storage in `backend/src/services/storage.ts`
4. **Add S3 storage**: Store input data securely
5. **Deploy to AWS**: Use AWS SAM, CDK, or Terraform for infrastructure
6. **Add testing**: Implement unit tests and property-based tests
7. **Monitor costs**: Set up billing alarms in AWS Console

## AWS Deployment

This application is designed for AWS serverless deployment:
- **Frontend**: S3 + CloudFront
- **Backend**: Lambda + API Gateway
- **Storage**: DynamoDB + S3
- **AI**: Amazon Bedrock (Claude 3 Haiku)

See `.kiro/specs/accessflow-core-mvp/` for detailed requirements and design documentation.

## Accessibility

This application follows WCAG AA standards:
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Visible focus indicators
- ARIA labels for dynamic content

## Security & Privacy

AccessFlow follows strict privacy-by-default principles:
- **No PII in logs**: Only hashed session IDs and metadata (see SECURITY.md)
- **Session-based**: No authentication or user tracking required
- **Disclosure control**: User chooses whether to mention disability
- **Encryption**: HTTPS only, S3/DynamoDB encryption at rest
- **Minimal retention**: No persistent storage in MVP

See **SECURITY.md** for complete security guidelines.

## License

MIT

A web app that helps disabled and neurodivergent job seekers make better applications, with minimal friction and maximum empathy.

## Tech

Node.js, React (frontend), AWS Lambda, API Gateway, DynamoDB, S3, CloudFront, Amazon Bedrock.

## Non‑functional

Accessibility (WCAG‑aware UI), privacy‑by‑default (no unnecessary PII retention), Free‑Tier‑optimized.

# Setup and Architecture

Create a non‑root admin user / Identity Center user and enable MFA

Setup billing and alarms
