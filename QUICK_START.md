# AccessFlow - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Configure AWS (2 min)
```bash
# Set up AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region: us-east-1, Format: json

# Enable Bedrock in AWS Console
# 1. Go to: console.aws.amazon.com/bedrock
# 2. Click: Model Access → Request model access
# 3. Select: Claude 3.5 Sonnet
# 4. Submit (instant approval)
```

### Step 3: Configure Environment (30 sec)
```bash
cp .env.example .env
# Default settings work fine - no need to edit
```

### Step 4: Start Servers (1 min)
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev
```

### Step 5: Test! (30 sec)
Open: http://localhost:3000

## 📋 Sample Test Data

### Job Description
```
Software Engineer - Full Stack

We're looking for a full-stack developer to join our team. 
You'll work with React, TypeScript, and Node.js to build 
web applications. The role involves both independent coding 
and team collaboration. Remote work available.

Requirements:
- 3+ years JavaScript/TypeScript
- Experience with React
- Strong problem-solving skills
- Good communication
```

### Resume
```
John Doe
Software Developer

Experience:
- 5 years web development
- Expert in React, TypeScript, Node.js
- Built 10+ production applications
- Led team of 3 developers
- Strong focus on accessibility and user experience

Skills: JavaScript, TypeScript, React, Node.js, Git, Agile
```

### Preferences
- **Work Style:** "I prefer written communication and async collaboration"
- **Accommodations:** "Flexible schedule and quiet workspace"
- **Disclosure:** Unchecked (no disability mentions)
- **Interview Prep:** Checked

## ✅ Expected Results

After ~5-10 seconds, you should see:

1. **Job Summary** - Plain English explanation of the role
2. **Your Strengths** - How your skills match the job
3. **Cover Letter** - Professional, tailored letter
4. **Interview Prep** - 5 questions with guidance + accommodation script

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Could not load credentials" | Run `aws configure` |
| "Access denied to model" | Enable Bedrock model access in AWS Console |
| Port 3000/3001 in use | Change ports in vite.config.ts / local-server.ts |
| Slow responses | Switch to Claude 3.5 Haiku model in .env |

## 💰 Cost Per Test

- **Claude 3.5 Sonnet:** ~$0.03 per application
- **Claude 3.5 Haiku:** ~$0.01 per application

For 100 test runs: $3 (Sonnet) or $1 (Claude 3.5 Haiku)

## 📚 More Info

- **AWS_SETUP.md** - Detailed AWS configuration
- **BEDROCK_INTEGRATION.md** - Technical implementation
- **README.md** - Full project documentation
- **INTEGRATION_COMPLETE.md** - What was built

## 🎯 Competition Ready

✅ Real Amazon Bedrock integration
✅ Empathetic, neurodivergent-friendly output
✅ Privacy-focused (no PII logging)
✅ Accessibility-first UI
✅ Professional quality results

**Ready to demo!** 🚀
