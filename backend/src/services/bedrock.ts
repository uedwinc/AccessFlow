import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { AnalyzeRequest, InterviewPrep } from '../types.js';
import { safeErrorLog } from '../utils/logging.js';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

/**
 * Call Bedrock Converse API with retry logic
 */
async function callBedrock(prompt: string, maxTokens: number = 2000): Promise<string> {
  try {
    const command = new ConverseCommand({
      modelId: MODEL_ID,
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }]
        }
      ],
      inferenceConfig: {
        maxTokens,
        temperature: 0.7
      }
    });

    const response = await bedrockClient.send(command);

    if (!response.output?.message?.content?.[0]?.text) {
      throw new Error('Invalid response from Bedrock');
    }

    return response.output.message.content[0].text;
  } catch (error) {
    // Log error without request/response bodies
    console.error('Bedrock API error:', {
      ...safeErrorLog(error),
      modelId: MODEL_ID
    });
    throw new Error('Failed to generate content from AI service');
  }
}

/**
 * Generate empathetic job summary in plain English
 */
export async function generateJobSummary(jobDescription: string): Promise<string> {
  const prompt = `You are helping a neurodivergent job seeker understand a job posting. 
Provide a clear, empathetic summary in plain English that explains what the role really involves day-to-day. 
Focus on concrete tasks and expectations. Avoid jargon where possible, and explain any technical terms you must use.

Job Description:
${jobDescription}

Please provide a 2-3 paragraph summary that helps someone understand what they would actually be doing in this role.`;

  return await callBedrock(prompt, 1000);
}

/**
 * Generate capability-focused positioning summary
 */
export async function generatePositioningSummary(
  jobDescription: string,
  resumeText: string
): Promise<string> {
  const prompt = `You are helping a job seeker understand how their strengths align with a job opportunity.

Job Description:
${jobDescription}

Candidate's Resume:
${resumeText}

Analyze the job requirements and the candidate's background. Provide a capability-focused positioning summary that:
1. Identifies the candidate's key strengths that match this role
2. Highlights relevant experience and skills
3. Focuses on what the candidate CAN do, not limitations
4. Suggests which accomplishments or skills to emphasize in their application

Provide a 2-3 paragraph summary focusing on capabilities and strengths.`;

  return await callBedrock(prompt, 1500);
}

/**
 * Generate tailored cover letter
 */
export async function generateCoverLetter(
  jobDescription: string,
  resumeText: string,
  disclosureFlag: boolean
): Promise<string> {
  const disclosureInstruction = disclosureFlag
    ? 'The candidate is open to mentioning relevant accommodations or disability-related information if it strengthens their application.'
    : 'IMPORTANT: Do NOT mention disability, accommodations, or any disability-related terms. Focus solely on capabilities and professional qualifications.';

  const prompt = `You are writing a professional cover letter for a job application.

Job Description:
${jobDescription}

Candidate's Resume:
${resumeText}

Instructions:
- Write a compelling, professional cover letter tailored to this specific job
- Focus on the candidate's capabilities, skills, and relevant experience
- Highlight how their background aligns with the job requirements
- Use a confident, professional tone
- Keep it concise (3-4 paragraphs)
- ${disclosureInstruction}
- Leave placeholder [Your Name] for the signature

Generate the complete cover letter now:`;

  return await callBedrock(prompt, 2000);
}

/**
 * Generate interview preparation materials
 */
export async function generateInterviewPrep(
  jobDescription: string,
  preferences: { accommodations: string }
): Promise<InterviewPrep> {
  const prompt = `You are helping a job seeker prepare for an interview.

Job Description:
${jobDescription}

Generate interview preparation materials:

1. List 5 likely interview questions for this role
2. For each question, provide a brief suggested approach for answering (not a full answer, just guidance)

Format your response as JSON with this structure:
{
  "questions": ["question 1", "question 2", ...],
  "answers": ["approach 1", "approach 2", ...]
}

Ensure the arrays have the same length.`;

  const response = await callBedrock(prompt, 1500);

  // Parse JSON response
  let parsed: { questions: string[]; answers: string[] };
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (error) {
    console.error('Failed to parse interview prep JSON:', error);
    // Fallback to default questions
    parsed = {
      questions: [
        'Tell me about your relevant experience for this role.',
        'How do you approach problem-solving in your work?',
        'Describe a challenging project you completed successfully.',
        'How do you handle working under pressure or tight deadlines?',
        'Why are you interested in this position?'
      ],
      answers: [
        'Focus on specific examples that match the job requirements.',
        'Explain your systematic approach with concrete examples.',
        'Use the STAR method: Situation, Task, Action, Result.',
        'Share strategies you use and emphasize positive outcomes.',
        'Connect your skills and goals to what the company needs.'
      ]
    };
  }

  // Generate accommodation script if needed
  let accommodationScript: string | undefined;
  if (preferences.accommodations && preferences.accommodations.trim().length > 0) {
    const scriptPrompt = `Generate a brief, professional script for requesting workplace accommodations during a job interview. 

The candidate needs: ${preferences.accommodations}

Create a 2-3 sentence script that:
- Is confident and professional
- Frames accommodations as enabling peak performance
- Invites collaborative discussion
- Does not apologize or sound uncertain

Provide just the script text, no additional explanation.`;

    accommodationScript = await callBedrock(scriptPrompt, 300);
  }

  return {
    questions: parsed.questions,
    answers: parsed.answers,
    accommodationScript
  };
}
