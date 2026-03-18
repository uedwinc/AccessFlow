# AccessFlow Deployment Guide

## Quick Deployment Checklist

- [ ] AWS account with Bedrock access
- [ ] IAM user/role with appropriate permissions
- [ ] Bedrock model access enabled (Claude 3.5 Sonnet/Haiku)
- [ ] Frontend built and ready
- [ ] Lambda functions built
- [ ] Environment variables configured

## Step 1: Build Lambda Functions

```bash
cd backend
npm install
npm run build:lambda
```

This creates optimized bundles in `backend/dist/lambda/`:
- `analyzeApplication/` - Main analysis endpoint
- `interviewPrep/` - Interview prep endpoint

## Step 2: Create Lambda Functions

### Using AWS Console

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"

**Function 1: accessflow-analyze**
- Function name: `accessflow-analyze`
- Runtime: Node.js 22.x
- Architecture: x86_64
- Execution role: Create new role with basic Lambda permissions

**Function 2: accessflow-interview-prep**
- Function name: `accessflow-interview-prep`
- Runtime: Node.js 22.x
- Architecture: x86_64
- Execution role: Use existing role or create new

### Using AWS CLI

```bash
# Create IAM role first
aws iam create-role \
  --role-name accessflow-lambda-role \
  --assume-role-policy-document file://trust-policy.json

# Attach Bedrock policy
aws iam put-role-policy \
  --role-name accessflow-lambda-role \
  --policy-name BedrockAccess \
  --policy-document file://bedrock-policy.json

# Create analyzeApplication function
cd backend/dist/lambda/analyzeApplication
zip -r function.zip .

aws lambda create-function \
  --function-name accessflow-analyze \
  --runtime nodejs22.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/accessflow-lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 1024 \
  --environment Variables="{AWS_REGION=us-east-1,BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0}"

# Create interviewPrep function
cd ../interviewPrep
zip -r function.zip .

aws lambda create-function \
  --function-name accessflow-interview-prep \
  --runtime nodejs22.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/accessflow-lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 1024 \
  --environment Variables="{AWS_REGION=us-east-1,BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0}"
```

## Step 3: Configure IAM Permissions

### trust-policy.json
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### bedrock-policy.json
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Step 4: Create API Gateway

### Using AWS Console

1. Go to API Gateway Console
2. Click "Create API"
3. Choose "HTTP API"
4. Click "Build"

**Configure:**
- API name: `accessflow-api`
- Add integrations:
  - `POST /api/analyze` → Lambda: `accessflow-analyze`
  - `POST /api/interview-prep` → Lambda: `accessflow-interview-prep`
- Configure CORS:
  - Allow origins: `*` (or your domain)
  - Allow methods: `POST, OPTIONS`
  - Allow headers: `Content-Type`

### Using AWS CLI

```bash
# Create HTTP API
aws apigatewayv2 create-api \
  --name accessflow-api \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins="*",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type"

# Get API ID from output, then create integrations
API_ID=your-api-id

# Create integration for analyze
aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:accessflow-analyze \
  --payload-format-version 2.0

# Create route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /api/analyze" \
  --target integrations/INTEGRATION_ID

# Repeat for interview-prep endpoint
```

## Step 5: Deploy Frontend

### Build Frontend

```bash
cd frontend
npm install
npm run build
```

Output: `frontend/dist/`

### Deploy to S3 + CloudFront

```bash
# Create S3 bucket
aws s3 mb s3://accessflow-frontend

# Upload files
aws s3 sync frontend/dist/ s3://accessflow-frontend/ --acl public-read

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name accessflow-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

### Update Frontend API URL

Edit `frontend/.env.production`:
```bash
VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

Rebuild and redeploy:
```bash
npm run build
aws s3 sync dist/ s3://accessflow-frontend/ --acl public-read
```

## Step 6: Test Deployment

```bash
# Test analyze endpoint
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Software Engineer position...",
    "resumeText": "Experienced developer...",
    "preferences": {
      "workStyle": "Remote",
      "accommodations": "Flexible hours",
      "disclosureFlag": false,
      "includeInterviewPrep": true
    }
  }'

# Test interview-prep endpoint
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/api/interview-prep \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Software Engineer position...",
    "resumeText": "Experienced developer...",
    "preferences": {
      "workStyle": "Remote",
      "accommodations": "Flexible hours",
      "disclosureFlag": false,
      "includeInterviewPrep": true
    }
  }'
```

## Step 7: Monitor and Optimize

### CloudWatch Logs

View logs:
```bash
aws logs tail /aws/lambda/accessflow-analyze --follow
aws logs tail /aws/lambda/accessflow-interview-prep --follow
```

### CloudWatch Metrics

Monitor:
- Invocations
- Duration
- Errors
- Throttles

### Cost Monitoring

Set up billing alarms:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name accessflow-cost-alarm \
  --alarm-description "Alert when costs exceed $10" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

## Updating Lambda Functions

```bash
# Rebuild
cd backend
npm run build:lambda

# Update analyzeApplication
cd dist/lambda/analyzeApplication
zip -r function.zip .
aws lambda update-function-code \
  --function-name accessflow-analyze \
  --zip-file fileb://function.zip

# Update interviewPrep
cd ../interviewPrep
zip -r function.zip .
aws lambda update-function-code \
  --function-name accessflow-interview-prep \
  --zip-file fileb://function.zip
```

## Troubleshooting

### Lambda Timeout
- Increase timeout to 60 seconds
- Switch to faster Bedrock model (Claude Haiku 4.5)

### CORS Errors
- Verify API Gateway CORS configuration
- Check Lambda response headers include CORS headers

### Bedrock Access Denied
- Verify IAM role has `bedrock:InvokeModel` permission
- Verify model access enabled in Bedrock console

### High Costs
- Switch to Claude Haiku 4.5 model
- Implement request throttling
- Set up billing alarms

## Production Checklist

- [ ] Lambda functions deployed
- [ ] API Gateway configured with CORS
- [ ] Frontend deployed to S3 + CloudFront
- [ ] Custom domain configured (optional)
- [ ] SSL certificate configured
- [ ] CloudWatch alarms set up
- [ ] Billing alarms configured
- [ ] IAM roles follow least privilege
- [ ] Bedrock model access enabled
- [ ] Environment variables set
- [ ] Logs reviewed (no PII)
- [ ] Load testing completed
- [ ] Backup/disaster recovery plan

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
