# AccessFlow Setup Guide

## Initial Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

For local development, the defaults should work. For AWS deployment, update with your AWS credentials and resource names.

### 3. Start Development Servers

**Option A: Run both servers (recommended)**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev
```

**Option B: Run individually**

Backend only:
```bash
cd backend
npm run dev
```

Frontend only:
```bash
cd frontend
npm run dev
```

### 4. Access the Application

Open your browser to: http://localhost:3000

The frontend will proxy API requests to the backend at http://localhost:3001

## Project Structure Overview

```
accessflow-mvp/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.tsx   # Main input form
│   │   │   ├── InputForm.css
│   │   │   ├── ResultsDisplay.tsx  # Results page
│   │   │   └── ResultsDisplay.css
│   │   ├── App.tsx             # Root component
│   │   ├── App.css
│   │   ├── main.tsx            # Entry point
│   │   ├── index.css           # Global styles
│   │   ├── api.ts              # API client
│   │   └── types.ts            # TypeScript types
│   ├── index.html
│   ├── vite.config.ts          # Vite configuration
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Lambda functions
│   ├── src/
│   │   ├── handlers/
│   │   │   └── analyze.ts      # Main Lambda handler
│   │   ├── services/
│   │   │   └── bedrock.ts      # AI generation (mocked)
│   │   ├── utils/
│   │   │   ├── validation.ts   # Input validation
│   │   │   └── session.ts      # Session ID generation
│   │   ├── types.ts            # TypeScript types
│   │   └── local-server.ts     # Dev server
│   ├── tsconfig.json
│   └── package.json
│
├── .kiro/                       # Kiro IDE specs
│   └── specs/accessflow-core-mvp/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
├── package.json                 # Root workspace config
├── .env.example                 # Environment template
├── .gitignore
├── README.md
└── SETUP.md                     # This file
```

## Development Workflow

### Making Changes

1. **Frontend changes**: Edit files in `frontend/src/`, Vite will hot-reload
2. **Backend changes**: Edit files in `backend/src/`, tsx will auto-restart the server
3. **Types**: Keep `frontend/src/types.ts` and `backend/src/types.ts` in sync

### Testing the API

You can test the backend API directly:

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Software Engineer position...",
    "resumeText": "My resume...",
    "preferences": {
      "workStyle": "Remote work preferred",
      "accommodations": "Flexible hours",
      "disclosureFlag": false,
      "includeInterviewPrep": true
    }
  }'
```

## Next Steps

### Integrating Amazon Bedrock

1. Open `backend/src/services/bedrock.ts`
2. Uncomment the Bedrock client imports
3. Replace mock responses with real Bedrock Converse API calls
4. Update `.env` with your AWS credentials and Bedrock model ID

Example:
```typescript
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

export async function generateJobSummary(jobDescription: string): Promise<string> {
  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    messages: [{
      role: 'user',
      content: [{ text: `Summarize this job: ${jobDescription}` }]
    }]
  });
  
  const response = await client.send(command);
  return response.output.message.content[0].text;
}
```

### Adding Storage

1. Create `backend/src/services/storage.ts`
2. Implement DynamoDB operations for session storage
3. Implement S3 operations for input data storage
4. Update the analyze handler to use storage services

### Deployment

See the spec files in `.kiro/specs/accessflow-core-mvp/` for detailed deployment architecture and infrastructure requirements.

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Frontend**: Edit `frontend/vite.config.ts` and change the port
**Backend**: Edit `backend/src/local-server.ts` and change the PORT constant

### TypeScript Errors

Run type checking:
```bash
npm run build
```

### Dependencies Issues

Clear and reinstall:
```bash
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
```

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
