# Lambda Build Guide

## Overview

The backend includes a build script that creates optimized Lambda function bundles for AWS deployment using esbuild.

## Build Command

```bash
cd backend
npm run build:lambda
```

## Output Structure

```
backend/dist/lambda/
├── analyzeApplication/
│   ├── index.js          # Bundled handler
│   └── index.js.map      # Source map
└── interviewPrep/
    ├── index.js          # Bundled handler
    └── index.js.map      # Source map
```

## Lambda Handlers

### 1. analyzeApplication

**Entry Point:** `src/handlers/analyzeApplication.ts`

**Exports:** `handler` function from `analyze.ts`

**Purpose:** Main endpoint for complete application analysis
- Job summary
- Positioning summary
- Cover letter
- Optional interview prep

**API Route:** `POST /api/analyze`

### 2. interviewPrep

**Entry Point:** `src/handlers/interviewPrep.ts`

**Exports:** `handler` function

**Purpose:** Standalone interview preparation endpoint
- Interview questions
- Answer guidance
- Accommodation script

**API Route:** `POST /api/interview-prep`

## Build Configuration

### esbuild Settings

- **Platform:** Node.js
- **Target:** Node 22
- **Format:** ESM (ES Modules)
- **Bundle:** Yes (all dependencies included)
- **Minify:** Yes (optimized for size)
- **Sourcemap:** Yes (for debugging)

### External Dependencies

AWS SDK v3 packages are marked as external because they're provided by the Lambda runtime:
- `@aws-sdk/client-bedrock-runtime`
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/client-s3`

### ESM Compatibility

The build includes a banner for Node 22 ESM compatibility:
```javascript
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

## Deployment

### AWS Lambda Configuration

**Runtime:** Node.js 22.x

**Handler:** `index.handler`

**Memory:** 1024 MB (recommended)

**Timeout:** 30 seconds

**Environment Variables:**
```bash
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

### Using AWS CLI

```bash
# Build the Lambda functions
npm run build:lambda

# Create deployment package for analyzeApplication
cd dist/lambda/analyzeApplication
zip -r analyzeApplication.zip .

# Upload to Lambda
aws lambda update-function-code \
  --function-name accessflow-analyze \
  --zip-file fileb://analyzeApplication.zip \
  --region us-east-1

# Create deployment package for interviewPrep
cd ../interviewPrep
zip -r interviewPrep.zip .

# Upload to Lambda
aws lambda update-function-code \
  --function-name accessflow-interview-prep \
  --zip-file fileb://interviewPrep.zip \
  --region us-east-1
```

### Using AWS SAM

Create `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  AnalyzeApplicationFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: accessflow-analyze
      CodeUri: dist/lambda/analyzeApplication/
      Handler: index.handler
      Runtime: nodejs22.x
      MemorySize: 1024
      Timeout: 30
      Environment:
        Variables:
          AWS_REGION: us-east-1
          BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet-20241022-v2:0
      Policies:
        - Statement:
          - Effect: Allow
            Action:
              - bedrock:InvokeModel
            Resource: 
              - arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-*

  InterviewPrepFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: accessflow-interview-prep
      CodeUri: dist/lambda/interviewPrep/
      Handler: index.handler
      Runtime: nodejs22.x
      MemorySize: 1024
      Timeout: 30
      Environment:
        Variables:
          AWS_REGION: us-east-1
          BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet-20241022-v2:0
      Policies:
        - Statement:
          - Effect: Allow
            Action:
              - bedrock:InvokeModel
            Resource: 
              - arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-*
```

Deploy:
```bash
sam build
sam deploy --guided
```

## Bundle Size

Typical bundle sizes (minified):
- **analyzeApplication:** ~50-100 KB
- **interviewPrep:** ~40-80 KB

The bundles are small because AWS SDK v3 is external (provided by Lambda runtime).

## Testing Locally

Before deploying, test the handlers locally:

```bash
# Start local dev server
npm run dev

# Test analyzeApplication
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Test interviewPrep
curl -X POST http://localhost:3001/api/interview-prep \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

## Troubleshooting

### Build Fails

**Error:** `Cannot find module 'esbuild'`

**Solution:** Install dependencies
```bash
npm install
```

### Lambda Timeout

**Error:** Task timed out after 30 seconds

**Solution:** 
- Increase Lambda timeout to 60 seconds
- Switch to faster Bedrock model (Claude Haiku 4.5)
- Optimize prompts to reduce token count

### Module Not Found in Lambda

**Error:** `Cannot find module '@aws-sdk/...'`

**Solution:** Ensure AWS SDK packages are marked as external in `build.mjs`

### ESM Import Errors

**Error:** `require is not defined in ES module scope`

**Solution:** The build script includes ESM compatibility banner. Ensure you're using the built files from `dist/lambda/`, not source files.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Lambda Functions

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
          cd backend
          npm install
      
      - name: Build Lambda functions
        run: |
          cd backend
          npm run build:lambda
      
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          cd backend/dist/lambda/analyzeApplication
          zip -r analyzeApplication.zip .
          aws lambda update-function-code \
            --function-name accessflow-analyze \
            --zip-file fileb://analyzeApplication.zip \
            --region us-east-1
```

## Performance Optimization

### Cold Start

Lambda cold starts typically take 1-3 seconds. To minimize:
- Keep bundle size small (already optimized)
- Use provisioned concurrency for production
- Consider Lambda SnapStart (Node 22 compatible)

### Execution Time

Typical execution times:
- **analyzeApplication:** 5-15 seconds (depends on Bedrock model)
- **interviewPrep:** 2-5 seconds

### Memory Allocation

Recommended: 1024 MB
- Provides good CPU allocation
- Balances cost and performance
- Sufficient for Bedrock API calls

## Cost Estimation

### Lambda Costs (Free Tier)

- **Requests:** 1M free per month
- **Compute:** 400,000 GB-seconds free per month

### Example Usage

100 applications/day × 30 days = 3,000 requests/month

**Lambda costs:** Free (well within free tier)

**Bedrock costs:** ~$81/month (Claude 3.5 Sonnet) or ~$30/month (Claude Haiku 4.5)

## Next Steps

1. ✅ Build Lambda functions: `npm run build:lambda`
2. ✅ Test locally before deploying
3. ✅ Create Lambda functions in AWS Console
4. ✅ Configure IAM roles with Bedrock permissions
5. ✅ Deploy using AWS CLI or SAM
6. ✅ Set up API Gateway routes
7. ✅ Test deployed endpoints
8. ✅ Monitor CloudWatch logs

## Resources

- [AWS Lambda Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [esbuild Documentation](https://esbuild.github.io/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
