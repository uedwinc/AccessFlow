# Environment Configuration Guide

## Overview

AccessFlow uses environment variables to configure API endpoints and AWS services for different environments (local development, production).

## File Structure

```
accessflow-mvp/
├── .env.example              # Backend config template
├── .env                      # Backend config (gitignored)
├── frontend/
│   ├── .env.example         # Frontend config template
│   ├── .env                 # Frontend local dev (gitignored)
│   └── .env.production      # Frontend production (gitignored)
└── backend/
    └── (uses root .env)
```

## Frontend Configuration

### Local Development

**File:** `frontend/.env`

```bash
# API Base URL - proxied by Vite dev server to http://localhost:3001
VITE_API_BASE_URL=/api
```

**How it works:**
- Vite dev server proxies `/api` requests to `http://localhost:3001`
- Configured in `frontend/vite.config.ts`
- No CORS issues during development

### Production

**File:** `frontend/.env.production`

```bash
# API Base URL - Your deployed API Gateway URL
VITE_API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com
```

**Setup:**
1. Deploy Lambda functions and API Gateway
2. Get your API Gateway URL from AWS Console
3. Update `VITE_API_BASE_URL` with your URL
4. Build frontend: `npm run build`
5. Deploy to S3/CloudFront

### How Frontend Reads Environment Variables

**File:** `frontend/src/api.ts`

```typescript
// Vite exposes env vars prefixed with VITE_ via import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function analyzeApplication(request: AnalyzeRequest) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  // ...
}
```

**Key Points:**
- Vite only exposes variables prefixed with `VITE_`
- Access via `import.meta.env.VITE_*`
- Defaults to `/api` if not set
- Variables are replaced at build time (not runtime)

## Backend Configuration

### Local Development

**File:** `.env` (root)

```bash
# AWS Configuration
AWS_REGION=us-east-1

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# DynamoDB (future)
DYNAMODB_TABLE_NAME=AccessFlowApplications

# S3 (future)
S3_DATA_BUCKET=accessflow-data-bucket
```

### Production (Lambda)

Environment variables are set in Lambda function configuration:

```bash
aws lambda update-function-configuration \
  --function-name accessflow-analyze \
  --environment Variables="{
    AWS_REGION=us-east-1,
    BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
  }"
```

Or via AWS Console:
1. Go to Lambda function
2. Configuration → Environment variables
3. Add key-value pairs

## Environment Variable Reference

### Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `/api` | API Gateway base URL |

### Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_REGION` | No | `us-east-1` | AWS region for services |
| `BEDROCK_MODEL_ID` | No | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Claude model to use |
| `DYNAMODB_TABLE_NAME` | Future | `AccessFlowApplications` | DynamoDB table name |
| `S3_DATA_BUCKET` | Future | `accessflow-data-bucket` | S3 bucket for data |

## Setup Instructions

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd accessflow-mvp

# 2. Install dependencies
npm install

# 3. Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env

# 4. Configure AWS credentials
aws configure

# 5. Start development servers
npm run dev:backend  # Terminal 1
npm run dev          # Terminal 2
```

### Production Deployment

```bash
# 1. Build Lambda functions
cd backend
npm run build:lambda

# 2. Deploy Lambda functions (get API Gateway URL)
# ... deployment steps ...

# 3. Update frontend production config
echo "VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com" > frontend/.env.production

# 4. Build frontend
cd frontend
npm run build

# 5. Deploy frontend to S3
aws s3 sync dist/ s3://accessflow-frontend/
```

## Vite Proxy Configuration

**File:** `frontend/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

**How it works:**
- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:3001`
- Requests to `/api/*` are proxied to backend
- No CORS configuration needed for local dev

## Troubleshooting

### Frontend can't reach API

**Symptom:** Network errors, CORS errors

**Solutions:**
1. Check backend is running: `npm run dev:backend`
2. Verify `VITE_API_BASE_URL` is set correctly
3. Check Vite proxy configuration
4. For production, verify API Gateway URL is correct

### Environment variables not updating

**Symptom:** Changes to `.env` not reflected

**Solutions:**
1. Restart Vite dev server (Ctrl+C, then `npm run dev`)
2. Clear browser cache
3. For production, rebuild: `npm run build`
4. Remember: Vite replaces variables at build time

### CORS errors in production

**Symptom:** Browser blocks API requests

**Solutions:**
1. Configure CORS in API Gateway
2. Allow origin: your CloudFront domain
3. Allow methods: POST, OPTIONS
4. Allow headers: Content-Type

## Security Best Practices

### What to Commit

✅ **Commit:**
- `.env.example` (templates)
- `frontend/.env.example` (templates)

❌ **Never Commit:**
- `.env` (actual values)
- `frontend/.env` (actual values)
- `frontend/.env.production` (actual values)
- Any file with real credentials or URLs

### Protecting Secrets

1. **Use .gitignore**
   - Already configured to ignore `.env` files
   - Double-check before committing

2. **Use AWS Secrets Manager** (future)
   - Store sensitive values in AWS
   - Lambda retrieves at runtime
   - No secrets in environment variables

3. **Rotate Credentials**
   - Change AWS access keys regularly
   - Update Lambda environment variables
   - Redeploy if needed

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      
      - name: Create production env file
        run: |
          echo "VITE_API_BASE_URL=${{ secrets.API_GATEWAY_URL }}" > frontend/.env.production
      
      - name: Build frontend
        run: |
          cd frontend
          npm run build
      
      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync frontend/dist/ s3://accessflow-frontend/
```

**GitHub Secrets to Set:**
- `API_GATEWAY_URL` - Your API Gateway URL
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

## Testing Different Environments

### Test Local Development

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev

# Open http://localhost:3000
# Should proxy to backend on port 3001
```

### Test Production Build Locally

```bash
# Build with production config
cd frontend
npm run build

# Serve built files
npx serve -s dist -p 3000

# Note: API calls will go to production URL
# Make sure VITE_API_BASE_URL in .env.production is correct
```

### Test with Different API URLs

```bash
# Temporarily override for testing
VITE_API_BASE_URL=https://test-api.example.com npm run dev
```

## Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [AWS Lambda Environment Variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- [API Gateway CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

---

**Environment configuration is now complete and documented!** 🔧
