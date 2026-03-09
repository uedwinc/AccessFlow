# Local Testing Guide

## Prerequisites Check

Before starting, verify you have:

1. **Node.js 22.x or later**
   ```bash
   node --version
   # Should show v22.x.x or higher
   ```

2. **AWS Credentials Configured**
   ```bash
   aws sts get-caller-identity
   # Should show your AWS account details
   ```

3. **Bedrock Model Access**
   - Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock)
   - Navigate to "Model access" in the left sidebar
   - Verify "Claude 3.5 Sonnet" or "Claude Sonnet 4" shows "Access granted"

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From the project root
npm install
```

This installs dependencies for both frontend and backend.

### 2. Start the Backend Server

Open a terminal and run:

```bash
npm run dev:backend
```

You should see:
```
Local server running on http://localhost:3001
Endpoints:
  POST http://localhost:3001/api/analyze
  POST http://localhost:3001/api/interview-prep
```

**Keep this terminal open** - the backend needs to stay running.

### 3. Start the Frontend Server

Open a **second terminal** and run:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Keep this terminal open** too.

### 4. Open the App

Open your browser and go to:
```
http://localhost:3000
```

You should see the AccessFlow interface with:
- Page title "AccessFlow"
- Job description textarea
- Resume/experience textarea
- Work preference checkboxes
- Disclosure checkbox (yellow highlighted)
- "Generate Strategy & Cover Letter" button

## Testing the Application

### Test Case 1: Basic Job Analysis

1. **Paste a job description** (example):
   ```
   Software Engineer - React Developer
   
   We're looking for a mid-level React developer to join our team.
   
   Requirements:
   - 3+ years React experience
   - TypeScript proficiency
   - REST API integration
   - Git version control
   
   Nice to have:
   - AWS experience
   - Accessibility knowledge
   ```

2. **Paste resume text** (example):
   ```
   John Doe
   Software Developer
   
   Experience:
   - 4 years building React applications
   - Strong TypeScript skills
   - Built accessible web components
   - Experience with AWS Lambda and S3
   
   Skills: React, TypeScript, JavaScript, HTML, CSS, Git, AWS
   ```

3. **Select work preferences** (optional):
   - Check boxes that apply (e.g., "Written communication preferred")

4. **Disclosure checkbox**:
   - Leave UNCHECKED to avoid disability mentions in cover letter
   - Check it if you want the AI to reference accommodations

5. **Click "Generate Strategy & Cover Letter"**

6. **Wait for results** (10-30 seconds):
   - You'll see a loading spinner
   - Backend calls Amazon Bedrock
   - Results appear in three sections

### Expected Results

You should see three sections:

1. **Job in Plain Language**
   - Simple, jargon-free summary
   - Key responsibilities explained clearly
   - Neurodivergent-friendly language

2. **Key Skills & Strengths**
   - Your resume strengths mapped to job requirements
   - Specific examples from your experience
   - Capability-focused positioning

3. **Cover Letter Draft**
   - Professional, tailored cover letter
   - Highlights relevant experience
   - Respects disclosure preference (no disability mention if unchecked)

Each section has a "Copy to Clipboard" button.

### Test Case 2: Interview Preparation

1. Fill in the same job description and resume
2. Scroll down to "Interview Preparation" section
3. Click "Generate Interview Prep"
4. Wait for results (10-30 seconds)

You should see:
- **Likely Interview Questions** (5-7 questions)
- **Suggested Answers** (STAR method guidance)
- **Accommodation Request Script** (if disclosure was checked)

### Test Case 3: Disclosure Flag Testing

Try the same inputs twice:

**Test A - Disclosure OFF (default)**:
- Leave disclosure checkbox unchecked
- Generate cover letter
- Verify: No mention of disability, accommodations, or neurodivergence

**Test B - Disclosure ON**:
- Check the disclosure checkbox
- Generate cover letter
- Verify: May include professional mention of accommodations if relevant

## Troubleshooting

### Backend Won't Start

**Error: "AWS credentials not found"**
```bash
# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1)
```

**Error: "Module not found"**
```bash
cd backend
npm install
```

### Frontend Won't Start

**Error: "Cannot find module"**
```bash
cd frontend
npm install
```

**Error: "Port 3000 already in use"**
```bash
# Kill the process using port 3000, or use a different port:
npm run dev -- --port 3001
```

### API Calls Failing

**Error: "Network Error" or "Failed to fetch"**
- Check backend is running on http://localhost:3001
- Check browser console (F12) for error details
- Verify `frontend/.env` has `VITE_API_BASE_URL=/api`

**Error: "Bedrock AccessDeniedException"**
- Go to AWS Bedrock Console → Model Access
- Request access to Claude models
- Wait for approval (usually instant)

**Error: "Bedrock ThrottlingException"**
- You're hitting rate limits
- Wait a few seconds and try again
- Consider using Claude Haiku (faster, cheaper)

### Slow Response Times

If Bedrock calls take >30 seconds:
- This is normal for Claude Sonnet (high quality, slower)
- Switch to Claude Haiku for faster responses:
  ```bash
  # Edit .env
  BEDROCK_MODEL_ID=anthropic.claude-3-5-haiku-20241022-v1:0
  ```
- Restart backend server

## Checking Logs

### Backend Logs (Terminal 1)

You should see privacy-focused logs like:
```
[INFO] Request received - Session: a1b2c3d4, Input hash: xyz123
[INFO] Bedrock call successful - Session: a1b2c3d4
```

**You should NEVER see**:
- Full job descriptions
- Resume text
- Generated content
- Full session IDs (only 8-char hashes)

### Frontend Logs (Browser Console)

Press F12 → Console tab to see:
- API request/response status
- Any JavaScript errors
- Network timing

## Performance Expectations

- **Backend startup**: 2-5 seconds
- **Frontend startup**: 3-10 seconds
- **Bedrock API call**: 10-30 seconds (Sonnet), 5-15 seconds (Haiku)
- **Total time per analysis**: 15-35 seconds

## Cost Monitoring

Each test costs approximately:
- **Claude Sonnet 4**: ~$0.027 per analysis
- **Claude 3.5 Haiku**: ~$0.007 per analysis

For 10 tests: $0.07-$0.27 (well within Free Tier)

## Next Steps After Testing

Once you've verified everything works:

1. **Test with real data**: Use actual job postings and your resume
2. **Test accessibility**: Try keyboard navigation (Tab, Enter, Space)
3. **Test screen reader**: Enable screen reader and verify labels
4. **Test error handling**: Try invalid inputs (empty fields, too long text)
5. **Review generated content**: Check quality and tone
6. **Adjust prompts**: Edit `backend/src/services/bedrock.ts` if needed

## Stopping the Servers

When done testing:

1. Go to Terminal 1 (backend) and press `Ctrl+C`
2. Go to Terminal 2 (frontend) and press `Ctrl+C`

Both servers will shut down gracefully.

## Quick Reference

| Action | Command |
|--------|---------|
| Start backend | `npm run dev:backend` |
| Start frontend | `npm run dev` |
| Run tests | `cd backend && npm test` |
| Check AWS creds | `aws sts get-caller-identity` |
| View app | http://localhost:3000 |
| Backend API | http://localhost:3001/api |

## Getting Help

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review `README.md` for setup details
3. Check `AWS_SETUP.md` for AWS configuration
4. Review `SECURITY.md` for privacy guidelines
5. Check backend logs for error messages
