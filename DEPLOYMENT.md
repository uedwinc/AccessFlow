# AccessFlow Deployment Guide

> Production setup: API Gateway `djzdw066t5`, CloudFront `d1uephgkca0e0.cloudfront.net`, region `us-east-1`

## Quick Deployment Checklist

- [ ] AWS account with Bedrock access (Claude Haiku 4.5 cross-region inference enabled)
- [ ] IAM role `accessflow-lambda-role` with Bedrock + CloudWatch permissions
- [ ] Frontend built and uploaded to S3 `accessflow-frontend`
- [ ] Lambda functions built and deployed
- [ ] API Gateway Lambda permissions set (see Step 4)
- [ ] Environment variables configured on Lambda

---

## Step 1: Build Lambda Functions

```bash
cd backend
npm install
npm run build:lambda
```

Output in `backend/dist/lambda/`:
- `analyzeApplication/index.js` — main analysis endpoint
- `interviewPrep/index.js` — interview prep endpoint

---

## Step 2: Package and Deploy Lambda Functions

### First-time deploy (create)

```bash
# analyzeApplication
cd backend/dist/lambda/analyzeApplication
zip -r ../../../analyzeApplication.zip .
cd ../../..

aws lambda create-function \
  --function-name accessflow-analyze \
  --runtime nodejs22.x \
  --role arn:aws:iam::052101902987:role/accessflow-lambda-role \
  --handler index.handler \
  --zip-file fileb://analyzeApplication.zip \
  --timeout 30 \
  --memory-size 512 \
  --region us-east-1 \
  --environment Variables="{AWS_REGION=us-east-1,BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0}"

# interviewPrep
cd dist/lambda/interviewPrep
zip -r ../../../interviewPrep.zip .
cd ../../..

aws lambda create-function \
  --function-name accessflow-interview-prep \
  --runtime nodejs22.x \
  --role arn:aws:iam::052101902987:role/accessflow-lambda-role \
  --handler index.handler \
  --zip-file fileb://interviewPrep.zip \
  --timeout 30 \
  --memory-size 512 \
  --region us-east-1 \
  --environment Variables="{AWS_REGION=us-east-1,BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0}"
```

### Redeployment (update existing)

```bash
cd backend
npm run build:lambda

# Package and update analyzeApplication
cd dist/lambda/analyzeApplication && zip -r ../../../analyzeApplication.zip . && cd ../../..
aws lambda update-function-code \
  --function-name accessflow-analyze \
  --zip-file fileb://analyzeApplication.zip \
  --region us-east-1

aws lambda wait function-updated \
  --function-name accessflow-analyze \
  --region us-east-1

# Package and update interviewPrep
cd dist/lambda/interviewPrep && zip -r ../../../interviewPrep.zip . && cd ../../..
aws lambda update-function-code \
  --function-name accessflow-interview-prep \
  --zip-file fileb://interviewPrep.zip \
  --region us-east-1

aws lambda wait function-updated \
  --function-name accessflow-interview-prep \
  --region us-east-1
```

---

## Step 3: Create API Gateway (if recreating)

```bash
# Create HTTP API
aws apigatewayv2 create-api \
  --name accessflow-api \
  --protocol-type HTTP \
  --cors-configuration \
    AllowOrigins="https://d1uephgkca0e0.cloudfront.net",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type" \
  --region us-east-1

# Save the API ID from output, then:
API_ID=<your-api-id>

# Create integration for accessflow-analyze
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-method POST \
  --integration-uri arn:aws:lambda:us-east-1:052101902987:function:accessflow-analyze \
  --payload-format-version 2.0 \
  --region us-east-1 \
  --query 'IntegrationId' --output text)

aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /analyze" \
  --target "integrations/$INTEGRATION_ID" \
  --region us-east-1

# Create integration for accessflow-interview-prep
INTEGRATION_ID2=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-method POST \
  --integration-uri arn:aws:lambda:us-east-1:052101902987:function:accessflow-interview-prep \
  --payload-format-version 2.0 \
  --region us-east-1 \
  --query 'IntegrationId' --output text)

aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /api/interview-prep" \
  --target "integrations/$INTEGRATION_ID2" \
  --region us-east-1

# Deploy to $default stage
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy \
  --region us-east-1
```

---

## Step 4: Grant API Gateway Permission to Invoke Lambda

**This step is required and easy to forget.** Without it, API Gateway returns `{"message":"Internal Server Error"}` even when Lambda works fine.

```bash
# Grant permission for accessflow-analyze
aws lambda add-permission \
  --function-name accessflow-analyze \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:052101902987:djzdw066t5/*/*/analyze" \
  --region us-east-1

# Grant permission for accessflow-interview-prep
aws lambda add-permission \
  --function-name accessflow-interview-prep \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:052101902987:djzdw066t5/*/*/api/interview-prep" \
  --region us-east-1
```

> Note: This permission persists across Lambda code updates. You only need to re-run this if you delete and recreate the Lambda function.

To verify permissions are set:
```bash
aws lambda get-policy \
  --function-name accessflow-analyze \
  --region us-east-1
```

---

## Step 5: Deploy Frontend

```bash
cd frontend
npm install
npm run build

# Sync to S3
aws s3 sync dist/ s3://accessflow-frontend/ --delete --region us-east-1

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <your-distribution-id> \
  --paths "/*"
```

The `frontend/.env.production` is already configured:
```
VITE_API_BASE_URL=https://djzdw066t5.execute-api.us-east-1.amazonaws.com/prod
```

If the API Gateway ID changes, update this file and rebuild before syncing.

---

## Step 6: IAM Role Setup

### trust-policy.json
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
```

### bedrock-policy.json
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

---

## Step 7: Verify Deployment

```bash
# Test analyze endpoint directly
curl -X POST https://djzdw066t5.execute-api.us-east-1.amazonaws.com/prod/analyze \
  -H "Content-Type: application/json" \
  -d '{"jobDescription":"test job","resumeText":"test resume","preferences":{"includeInterviewPrep":false,"disclosureFlag":false,"accommodations":""}}'

# Test interview-prep endpoint
curl -X POST https://djzdw066t5.execute-api.us-east-1.amazonaws.com/prod/api/interview-prep \
  -H "Content-Type: application/json" \
  -d '{"jobDescription":"test job","resumeText":"test resume","preferences":{"includeInterviewPrep":true,"disclosureFlag":false,"accommodations":""}}'
```

Both should return JSON with a `sessionId` field, not `{"message":"Internal Server Error"}`.

---

## Checking Logs

```bash
# Get latest Lambda logs
bash get-latest-logs.sh

# Or tail live
aws logs tail /aws/lambda/accessflow-analyze --follow --region us-east-1
aws logs tail /aws/lambda/accessflow-interview-prep --follow --region us-east-1
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `{"message":"Internal Server Error"}` from API GW | Lambda invoke permission missing | Run Step 4 |
| Lambda logs show success but browser gets 500 | Same as above | Run Step 4 |
| `AccessDenied` on CloudFront | S3 bucket policy / OAC misconfigured | Check CloudFront origin access settings |
| `Failed to fetch` in browser | CORS or wrong API URL in `.env.production` | Check `VITE_API_BASE_URL` and API GW CORS config |
| Bedrock `AccessDeniedException` | IAM role missing Bedrock permission or model not enabled | Check IAM policy and Bedrock model access in console |
| Lambda timeout | Bedrock cold start or slow response | Increase Lambda timeout to 60s |
| `ResourceNotFoundException` on log streams | Log group doesn't exist yet | Invoke Lambda at least once first |

---

## Production Checklist

- [ ] Lambda functions deployed with correct handler (`index.handler`)
- [ ] Lambda runtime set to Node.js 22.x
- [ ] `BEDROCK_MODEL_ID` env var set to `us.anthropic.claude-haiku-4-5-20251001-v1:0`
- [ ] API Gateway Lambda permissions granted (Step 4)
- [ ] API Gateway CORS configured for CloudFront domain
- [ ] Frontend built with correct `VITE_API_BASE_URL`
- [ ] Frontend deployed to S3 and CloudFront cache invalidated
- [ ] Both endpoints tested via curl
- [ ] CloudWatch logs reviewed (no PII in logs)
- [ ] Billing alarms configured
