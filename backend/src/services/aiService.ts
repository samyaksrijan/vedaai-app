import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AssignmentData {
  subject: string;
  numberOfQuestions: number;
  questionTypes: string[];
  totalMarks: number;
  additionalInstructions: string;
}

export interface GeneratedQuestion {
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface GeneratedSection {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestionPaper {
  sections: GeneratedSection[];
}

/**
 * Generates a structured question paper based on the assignment parameters.
 * Uses OpenAI with structured JSON response formatting.
 */
export async function generateQuestionPaper(
  assignment: AssignmentData
): Promise<GeneratedQuestionPaper> {
  const {
    subject,
    numberOfQuestions,
    questionTypes,
    totalMarks,
    additionalInstructions,
  } = assignment;

  const systemPrompt = `You are an exam paper generator. Create a question paper for ${subject}.`;

  const userPrompt = `
Create a question paper based on the following requirements:
- Subject: ${subject}
- Total questions: ${numberOfQuestions}
- Question types: ${questionTypes.join(', ')}  
- Total marks: ${totalMarks}
- Difficulty distribution: 30% easy, 50% medium, 20% hard
- Additional instructions: ${additionalInstructions || 'None'}

Return ONLY valid JSON in this exact format:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "text": "question here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 1
        }
      ]
    }
  ]
}
Do not include any text outside the JSON. Ensure the "difficulty" is strictly one of "easy", "medium", or "hard".`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const rawContent = completion.choices[0]?.message?.content ?? '';
    if (!rawContent) {
      throw new Error('Received empty response from OpenAI');
    }

    const parsed = JSON.parse(rawContent) as GeneratedQuestionPaper;

    // Validate structure briefly
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Parsed response does not contain a sections array');
    }

    return parsed;
  } catch (err: any) {
    console.error('Error generating question paper via AI:', err);
    throw new Error(`Failed to generate question paper: ${err.message}`);
  }
}
