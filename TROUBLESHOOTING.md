# Troubleshooting Guide

## Error: "The AI service is temporarily unavailable"

This error means the backend isn't responding properly. Here's how to diagnose:

### Step 1: Check Backend is Running

In your backend terminal, you should see:
```
Backend server running at http://localhost:3001
API endpoint: POST http://localhost:3001/api/analyze
```

If you don't see this:
1. Stop the backend (Ctrl+C)
2. Restart with: `npm run dev:backend`

### Step 2: Check for Backend Errors

Look at your backend terminal for errors like:

**AWS Credentials Error:**
```
Error: Unable to locate credentials
```
**Fix:** Run `aws configure` and enter your credentials

**Bedrock Access Error:**
```
AccessDeniedException: User is not authorized to perform: bedrock:InvokeModel
```
**Fix:** 
1. Go to AWS Bedrock Console
2. Click "Model access" in left sidebar
3. Request access to Claude models
4. Wait for approval (usually instant)

**Region Error:**
```
Error: Could not load credentials from any providers
```
**Fix:** Check `.env` file has `AWS_REGION=us-east-1`

### Step 3: Test Backend Directly

Open a new terminal and test the backend:

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Test job",
    "resumeText": "Test resume",
    "preferences": {
      "workStyle": "",
      "accommodations": "",
      "disclosureFlag": false,
      "includeInterviewPrep": true
    }
  }'
```

**Expected:** JSON response with analysis
**If error:** Check the error message in backend terminal

### Step 4: Check AWS Credentials

```bash
aws sts get-caller-identity
```

Should show your AWS account details. If error, run:
```bash
aws configure
```

### Step 5: Verify Bedrock Model Access

```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude')].modelId"
```

Should list Claude models. If empty or error:
1. Go to https://console.aws.amazon.com/bedrock
2. Click "Model access"
3. Request access to Claude models

### Step 6: Test Bedrock Directly

```bash
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id anthropic.claude-3-5-haiku-20241022-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}' \
  output.json
```

Should create `output.json` with response. If error, check:
- Model access is granted
- Region is correct (us-east-1)
- AWS credentials are valid

## Common Issues

### Issue: Backend starts but requests fail

**Symptom:** Backend terminal shows no activity when you click "Generate"

**Cause:** Frontend not proxying to backend correctly

**Fix:**
1. Check `frontend/.env` has: `VITE_API_BASE_URL=/api`
2. Check `frontend/vite.config.ts` has proxy configuration
3. Restart frontend: Ctrl+C, then `npm run dev`

### Issue: "Network Error" in browser

**Symptom:** Browser console shows network error

**Cause:** Backend not running or wrong port

**Fix:**
1. Verify backend is on port 3001
2. Verify frontend is on port 3000
3. Check no firewall blocking localhost

### Issue: Slow responses (>60 seconds)

**Symptom:** Request times out

**Cause:** Using Claude Sonnet (slower model)

**Fix:** Switch to Haiku in `.env`:
```
BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0
```

### Issue: "ThrottlingException"

**Symptom:** Error about rate limits

**Cause:** Too many requests too fast

**Fix:** Wait 10-30 seconds between requests

## Debugging Checklist

- [ ] Backend terminal shows "Backend server running"
- [ ] Frontend terminal shows "Local: http://localhost:3000"
- [ ] `aws sts get-caller-identity` works
- [ ] AWS Bedrock Console shows "Access granted" for Claude
- [ ] `.env` file has correct `AWS_REGION=us-east-1`
- [ ] `frontend/.env` has `VITE_API_BASE_URL=/api`
- [ ] No errors in backend terminal
- [ ] Browser console (F12) shows no errors

## Still Having Issues?

1. **Check backend terminal output** - Copy any error messages
2. **Check browser console** (F12 → Console tab) - Copy any errors
3. **Check AWS CloudWatch** - Look for Lambda errors (if deployed)
4. **Verify environment variables** - Check `.env` and `frontend/.env`

## Quick Reset

If nothing works, try a full reset:

```bash
# Stop both servers (Ctrl+C in both terminals)

# Backend terminal:
cd backend
npm install
cd ..
npm run dev:backend

# Frontend terminal (new terminal):
cd frontend
npm install
cd ..
npm run dev
```

Then try again at http://localhost:3000
