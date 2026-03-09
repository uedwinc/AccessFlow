# Environment Files Structure

## 📁 File Organization

```
accessflow-mvp/
├── .env.example              # Backend template (commit to git)
├── .env                      # Backend config (gitignored)
│
└── frontend/
    ├── .env.example         # Frontend template (commit to git)
    ├── .env                 # Frontend local dev (gitignored)
    └── .env.production      # Frontend production (gitignored)
```

## 🔧 Backend Configuration (Root)

### `.env.example` (Template - Committed to Git)
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# DynamoDB Configuration (future use)
DYNAMODB_TABLE_NAME=AccessFlowApplications

# S3 Configuration (future use)
S3_DATA_BUCKET=accessflow-data-bucket
S3_STATIC_BUCKET=accessflow-static-website

# Local Development
NODE_ENV=development
```

**Purpose:** Template for backend configuration

**Contains:** AWS settings, Bedrock model, database names

**Used by:** Backend Lambda functions, local dev server

**Access:** `process.env.AWS_REGION`, `process.env.BEDROCK_MODEL_ID`

---

### `.env` (Your Actual Config - Gitignored)
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=052101902987

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-20250514-v1:0

# DynamoDB Configuration (future use)
DYNAMODB_TABLE_NAME=AccessFlowApplications

# S3 Configuration (future use)
S3_DATA_BUCKET=accessflow-data-bucket
S3_STATIC_BUCKET=accessflow-static-website

# Local Development
NODE_ENV=development
```

**Purpose:** Your actual backend configuration

**Contains:** Real AWS account ID, chosen Bedrock model

**Security:** Never commit this file (contains account info)

---

## 🎨 Frontend Configuration (Frontend Folder)

### `frontend/.env.example` (Template - Committed to Git)
```bash
# Frontend Environment Variables

# API Base URL
# For local development (with Vite proxy): /api
# For production (deployed): https://your-api-id.execute-api.us-east-1.amazonaws.com
VITE_API_BASE_URL=/api
```

**Purpose:** Template for frontend configuration

**Contains:** API URL examples

**Used by:** React app, Vite build process

**Access:** `import.meta.env.VITE_API_BASE_URL`

---

### `frontend/.env` (Local Dev - Gitignored)
```bash
# Frontend Environment Variables (Local Development)

# API Base URL - proxied by Vite dev server to http://localhost:3001
VITE_API_BASE_URL=/api
```

**Purpose:** Local development configuration

**How it works:**
- Vite dev server proxies `/api` → `http://localhost:3001`
- No CORS issues during development
- Backend runs on port 3001, frontend on port 3000

---

### `frontend/.env.production` (Production - Gitignored)
```bash
# Frontend Environment Variables (Production)

# API Base URL - Your deployed API Gateway URL
VITE_API_BASE_URL=https://nkooa8qieg.execute-api.us-east-1.amazonaws.com
```

**Purpose:** Production deployment configuration

**Contains:** Real API Gateway URL from AWS

**Used when:** Building for production (`npm run build`)

**Security:** Gitignored because it contains your specific AWS URL

---

## 🔑 Key Differences Summary

| File | Scope | Contains | Committed? | Security Level |
|------|-------|----------|------------|----------------|
| `.env.example` | Backend | AWS templates | ✅ Yes | Public (no secrets) |
| `.env` | Backend | Real AWS config | ❌ No | Private (account info) |
| `frontend/.env.example` | Frontend | API URL template | ✅ Yes | Public |
| `frontend/.env` | Frontend | Local dev URL | ❌ No | Public (but gitignored) |
| `frontend/.env.production` | Frontend | Production URL | ❌ No | Public (but gitignored) |

---

## 🚀 Setup Instructions

### For New Developers

```bash
# 1. Clone repository
git clone <repo-url>
cd accessflow-mvp

# 2. Copy backend template
cp .env.example .env
# Edit .env with your AWS account ID and preferred model

# 3. Copy frontend template
cp frontend/.env.example frontend/.env
# No changes needed for local dev

# 4. Install dependencies
npm install

# 5. Start development
npm run dev:backend  # Terminal 1
npm run dev          # Terminal 2
```

### For Production Deployment

```bash
# 1. Deploy backend (Lambda + API Gateway)
cd backend
npm run build:lambda
# ... deploy to AWS ...
# Note your API Gateway URL: https://abc123.execute-api.us-east-1.amazonaws.com

# 2. Update frontend production config
echo "VITE_API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com" > frontend/.env.production

# 3. Build frontend
cd frontend
npm run build

# 4. Deploy frontend to S3
aws s3 sync dist/ s3://accessflow-frontend/
```

---

## ⚠️ Security Rules

### ✅ Safe to Commit
- `.env.example` (templates only)
- `frontend/.env.example` (templates only)

### ❌ Never Commit
- `.env` (contains account info)
- `frontend/.env` (contains local config)
- `frontend/.env.production` (contains production URLs)
- Any file with real credentials or account IDs

### 🔒 Backend Secrets
- AWS credentials should come from `aws configure`, not `.env`
- Never put AWS access keys in `.env` files
- Use IAM roles for Lambda (no keys needed)

### 🌐 Frontend "Secrets"
- Frontend `.env` values are **PUBLIC** (embedded in JavaScript)
- Never put API keys or passwords in `VITE_*` variables
- Only put public configuration (URLs, feature flags)

---

## 🧪 Testing Different Configurations

### Test Local Development
```bash
# Uses frontend/.env (VITE_API_BASE_URL=/api)
npm run dev
```

### Test Production Build Locally
```bash
# Uses frontend/.env.production
cd frontend
npm run build
npx serve -s dist
```

### Test with Different Backend
```bash
# Temporarily override
VITE_API_BASE_URL=https://test-api.example.com npm run dev
```

---

## 🔄 What Changed

### Before (Incorrect)
```
.env (root)
├── AWS_REGION=us-east-1
├── BEDROCK_MODEL_ID=...
└── VITE_API_BASE_URL=https://...  ❌ Wrong location!
```

### After (Correct)
```
.env (root) - Backend only
├── AWS_REGION=us-east-1
└── BEDROCK_MODEL_ID=...

frontend/.env.production - Frontend only
└── VITE_API_BASE_URL=https://...  ✅ Correct location!
```

---

## 📚 Quick Reference

**Need to change backend settings?**
→ Edit `.env` (root)

**Need to change local dev API URL?**
→ Edit `frontend/.env`

**Need to change production API URL?**
→ Edit `frontend/.env.production`

**Deploying to production?**
→ Update `frontend/.env.production`, then `npm run build`

**New team member?**
→ Copy `.env.example` → `.env` and `frontend/.env.example` → `frontend/.env`

---

**Environment files are now properly organized!** ✨
