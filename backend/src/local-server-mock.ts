import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
config({ path: resolve(__dirname, '../../.env') });

const PORT = 3001;

// Mock responses
const generateMockResponse = (jobDescription: string, resumeText: string, disclosureFlag: boolean) => {
  return {
    sessionId: Math.random().toString(36).substring(2, 15),
    analysis: {
      sessionId: Math.random().toString(36).substring(2, 15),
      jobSummary: `This role is looking for someone who can work with technology to solve problems. The main responsibilities include building software, working with a team, and helping improve existing systems. You'll be expected to write code, test your work, and communicate with colleagues about technical decisions.

Key aspects of this job:
- Writing and maintaining code for web applications
- Collaborating with team members on projects
- Problem-solving and debugging technical issues
- Learning new technologies as needed

The work environment appears to value clear communication and steady, reliable work over constant urgency.`,
      
      positioningSummary: `Based on your experience, here are your strongest matches for this role:

**Technical Skills Match:**
Your background in ${resumeText.includes('React') ? 'React development' : 'web development'} directly aligns with their needs. Your experience with ${resumeText.includes('TypeScript') ? 'TypeScript' : 'JavaScript'} shows you can work with modern development tools.

**Problem-Solving Abilities:**
Your track record of ${resumeText.includes('debug') ? 'debugging complex issues' : 'building functional applications'} demonstrates the analytical thinking they're looking for.

**Communication Style:**
${resumeText.includes('documentation') ? 'Your emphasis on documentation shows you value clear, written communication - a strength for remote collaboration.' : 'Your experience working in teams shows you can communicate effectively with colleagues.'}

**Key Strengths to Highlight:**
1. Hands-on experience with relevant technologies
2. Proven ability to deliver working solutions
3. Comfortable with independent work and collaboration
4. Continuous learning mindset`,

      coverLetter: `Dear Hiring Manager,

I'm writing to express my interest in this position. My background in software development and my approach to problem-solving make me a strong fit for this role.

In my previous work, I've focused on building reliable, maintainable applications. I've worked with ${resumeText.includes('React') ? 'React and modern JavaScript frameworks' : 'web technologies'}, which aligns well with your technical requirements. I'm comfortable working both independently and as part of a team, and I value clear communication throughout the development process.

What draws me to this opportunity is the chance to work on meaningful projects where I can apply my technical skills while continuing to learn and grow. I appreciate environments that value steady, thoughtful work and clear communication.

${disclosureFlag ? `I work best with clear, written instructions and regular check-ins. I've found that having flexibility in my work schedule and environment helps me produce my best work. I'm happy to discuss any accommodations that would help me contribute effectively to your team.` : ''}

I'm excited about the possibility of contributing to your team and would welcome the opportunity to discuss how my experience aligns with your needs.

Thank you for your consideration.

Best regards`,

      interviewPrep: {
        questions: [
          "Can you walk me through a recent project you worked on?",
          "How do you approach debugging a complex technical problem?",
          "Tell me about a time you had to learn a new technology quickly.",
          "How do you prioritize tasks when working on multiple features?",
          "What's your experience with code reviews and collaboration?",
          "How do you stay current with new technologies and best practices?"
        ],
        answers: [
          "Focus on a specific project, explain the problem you solved, the technologies you used, and the outcome. Use the STAR method: Situation, Task, Action, Result.",
          "Describe your systematic approach: reproduce the issue, check logs, isolate the problem, test hypotheses, and verify the fix.",
          "Share a concrete example of learning something new, emphasizing your learning process and how you applied it successfully.",
          "Explain your method for assessing urgency and importance, and how you communicate priorities with your team.",
          "Discuss how you give and receive feedback constructively, and how code reviews improve code quality.",
          "Mention specific resources you use (documentation, courses, communities) and how you apply new knowledge to your work."
        ],
        accommodationScript: disclosureFlag ? 
          `If asked about work preferences or accommodations:

"I work most effectively when I have clear, written documentation of requirements and expectations. I find that having flexibility in my schedule helps me manage my energy and produce my best work. I also benefit from regular, structured check-ins rather than ad-hoc interruptions.

I'm happy to discuss specific accommodations that would help me contribute effectively to the team. In past roles, I've found that [mention specific accommodations that have worked for you] have been helpful.

I'm committed to delivering high-quality work and am proactive about communicating if I need any adjustments to work at my best."` 
          : undefined
      }
    }
  };
};

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle POST /api/analyze
  if (req.method === 'POST' && req.url === '/api/analyze') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const input = JSON.parse(body);
        
        console.log('🎭 MOCK MODE: Generating sample response...');
        console.log('Job description length:', input.jobDescription?.length || 0);
        console.log('Resume length:', input.resumeText?.length || 0);
        
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = generateMockResponse(
          input.jobDescription,
          input.resumeText,
          input.preferences?.disclosureFlag || false
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('🎭 ========================================');
  console.log('🎭 MOCK BACKEND SERVER (No AWS Required)');
  console.log('🎭 ========================================');
  console.log('');
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ API endpoint: POST http://localhost:${PORT}/api/analyze`);
  console.log('');
  console.log('⚠️  This is a MOCK server returning sample data');
  console.log('⚠️  No actual AI calls are being made');
  console.log('⚠️  Switch to real backend once AWS quotas are approved');
  console.log('');
});
