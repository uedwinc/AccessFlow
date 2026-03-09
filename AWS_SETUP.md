# AWS Setup Guide for AccessFlow

## Prerequisites

- AWS Account (Free Tier eligible)
- AWS CLI installed and configured
- Node.js 22.x or later

## Step 1: Configure AWS Credentials

### Option A: AWS CLI Configuration (Recommended for Local Development)

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### Option B: Environment Variables

Add to your `.env` file:

```bash
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
```

### Option C: IAM Role (For Lambda Deployment)

When deploying to Lambda, attach an IAM role with the following permissions:
- `bedrock:InvokeModel`
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`

## Step 2: Enable Amazon Bedrock Model Access

1. **Open AWS Console** and navigate to Amazon Bedrock
2. **Go to Model Access** (in the left sidebar)
3. **Request Access** to Claude models:
   - Claude 3.5 Sonnet (recommended)
   - Claude 3.5 Haiku (faster, lower cost)
   - Claude 3 Haiku (legacy, lowest cost)

4. **Wait for Approval** (usually instant for most accounts)

### Verify Model Access

```bash
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?contains(modelId, `claude`)].modelId'
```

You should see:
```json
[
    "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "anthropic.claude-3-5-haiku-20241022-v1:0",
    "anthropic.claude-3-haiku-20240307-v1:0"
]
```

## Step 3: Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# AWS Configuration
AWS_REGION=us-east-1

# Bedrock Model Selection
# Choose one based on your needs:

# Option 1: Claude 3.5 Sonnet (best quality, higher cost)
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Option 2: Claude 3.5 Haiku (good quality, faster, lower cost)
# BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0

# Option 3: Claude 3 Haiku (legacy, lowest cost)
# BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

## Step 4: Test Bedrock Connection

Create a test script `test-bedrock.js`:

```javascript
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

const command = new ConverseCommand({
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  messages: [{
    role: 'user',
    content: [{ text: 'Say hello!' }]
  }],
  inferenceConfig: {
    maxTokens: 100,
    temperature: 0.7
  }
});

try {
  const response = await client.send(command);
  console.log('✅ Bedrock connection successful!');
  console.log('Response:', response.output.message.content[0].text);
} catch (error) {
  console.error('❌ Bedrock connection failed:', error.message);
}
```

Run it:

```bash
node test-bedrock.js
```

## Step 5: Start the Application

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

Open http://localhost:3000 and test the application!

## Troubleshooting

### Error: "Could not load credentials"

**Solution:** Ensure AWS credentials are configured via `aws configure` or environment variables.

### Error: "Access denied to model"

**Solution:** 
1. Go to AWS Console → Bedrock → Model Access
2. Request access to Claude models
3. Wait for approval (usually instant)

### Error: "ValidationException: The provided model identifier is invalid"

**Solution:** Check that your `BEDROCK_MODEL_ID` matches exactly one of:
- `anthropic.claude-3-5-sonnet-20241022-v2:0`
- `anthropic.claude-3-5-haiku-20241022-v1:0`
- `anthropic.claude-3-haiku-20240307-v1:0`

### Error: "ThrottlingException"

**Solution:** You're hitting rate limits. Wait a moment and try again. Consider:
- Using a faster model (Haiku instead of Sonnet)
- Implementing exponential backoff
- Requesting a quota increase in AWS Service Quotas

### Error: "Region not supported"

**Solution:** Bedrock is only available in specific regions. Use `us-east-1` (recommended) or check [AWS Bedrock regions](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-regions.html).

## Cost Estimation (AWS Free Tier)

### Bedrock Pricing (as of 2024)

**Claude 3.5 Sonnet:**
- Input: $3.00 per million tokens
- Output: $15.00 per million tokens

**Claude 3.5 Haiku:**
- Input: $0.80 per million tokens
- Output: $4.00 per million tokens

**Claude 3 Haiku (legacy):**
- Input: $0.25 per million tokens
- Output: $1.25 per million tokens

### Example Cost per Application

Assuming:
- Job description: ~500 tokens
- Resume: ~1000 tokens
- Generated content: ~1500 tokens

**Claude 3.5 Sonnet:** ~$0.027 per application
**Claude 3.5 Haiku:** ~$0.007 per application
**Claude 3 Haiku:** ~$0.002 per application

### Free Tier Notes

- Bedrock does NOT have a free tier
- Lambda: 1M free requests/month + 400,000 GB-seconds compute
- API Gateway: 1M free requests/month (first 12 months)
- DynamoDB: 25 GB storage + 25 read/write capacity units
- S3: 5 GB storage + 20,000 GET requests + 2,000 PUT requests

## IAM Policy for Lambda

When deploying to Lambda, use this IAM policy:

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
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-haiku-20241022-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
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

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use IAM roles** for Lambda instead of access keys
3. **Enable MFA** on your AWS account
4. **Set up billing alarms** to avoid unexpected charges
5. **Use least privilege** IAM policies
6. **Rotate access keys** regularly
7. **Monitor CloudWatch logs** for errors and usage patterns

## Next Steps

Once Bedrock is working:

1. ✅ Test with real job descriptions and resumes
2. ✅ Fine-tune prompts for better output quality
3. ✅ Add DynamoDB for session storage
4. ✅ Add S3 for input data storage
5. ✅ Deploy to AWS Lambda + API Gateway
6. ✅ Set up CloudFront for frontend hosting

## Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude Model Documentation](https://docs.anthropic.com/claude/docs)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
