# Quick Start - AccessFlow Local Testing

## ✅ Prerequisites Verified

Your system is ready:
- ✅ AWS credentials configured (Account: 052101902987)
- ✅ Node.js installed
- ✅ Dependencies installed
- ✅ Environment configured

## 🚀 Start the App (2 Steps)

### Step 1: Start Backend Server

Open a terminal in this folder and run:

```bash
npm run dev:backend
```

**Wait for this message:**
```
Local server running on http://localhost:3001
```

**Keep this terminal open!**

---

### Step 2: Start Frontend Server

Open a **SECOND terminal** in this folder and run:

```bash
npm run dev
```

**Wait for this message:**
```
➜  Local:   http://localhost:3000/
```

**Keep this terminal open too!**

---

## 🌐 Access the App

Open your browser and go to:

**http://localhost:3000**

You should see the AccessFlow interface!

---

## 🧪 Quick Test

1. **Paste a job description** (any job posting)
2. **Paste your resume** (or sample text)
3. **Select work preferences** (optional checkboxes)
4. **Leave disclosure checkbox UNCHECKED** (default)
5. **Click "Generate Strategy & Cover Letter"**
6. **Wait 15-30 seconds** for AI to generate results

You'll see three sections:
- Job in Plain Language
- Key Skills & Strengths  
- Cover Letter Draft

Each has a "Copy to Clipboard" button.

---

## 🎯 Test Interview Prep

1. Scroll down to "Interview Preparation"
2. Click "Generate Interview Prep"
3. Wait 15-30 seconds
4. See interview questions, answers, and accommodation script

---

## 🛑 Stop the App

When done testing:

1. Go to **Terminal 1** (backend) → Press `Ctrl+C`
2. Go to **Terminal 2** (frontend) → Press `Ctrl+C`

---

## 📚 Need Help?

- **Detailed guide**: See `LOCAL_TESTING_GUIDE.md`
- **AWS setup**: See `AWS_SETUP.md`
- **API errors**: Check backend terminal for logs
- **Frontend errors**: Press F12 in browser → Console tab

---

## 💡 Sample Job Description

If you need test data, use this:

```
Senior React Developer

We're seeking an experienced React developer to build accessible web applications.

Requirements:
- 3+ years React/TypeScript experience
- Strong understanding of web accessibility (WCAG)
- REST API integration
- Git version control
- Agile/Scrum experience

Nice to have:
- AWS cloud experience
- Jest/React Testing Library
- CI/CD pipeline knowledge

We offer flexible work arrangements and support diverse working styles.
```

## 💡 Sample Resume

```
Jane Smith
Senior Software Engineer

Experience:
- 5 years building React applications with TypeScript
- Led accessibility initiative, achieving WCAG AA compliance
- Integrated RESTful APIs and GraphQL endpoints
- Mentored junior developers in best practices
- Implemented automated testing with Jest (90% coverage)

Skills:
React, TypeScript, JavaScript, HTML, CSS, WCAG, Jest, Git, AWS, CI/CD

Education:
BS Computer Science, State University
```

---

## ⚡ Quick Commands

| Action | Command |
|--------|---------|
| Start backend | `npm run dev:backend` |
| Start frontend | `npm run dev` |
| Run tests | `cd backend && npm test` |
| View app | http://localhost:3000 |

---

**Ready to test? Start with Step 1 above! 🚀**
