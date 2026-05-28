import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GenerationPayload {
  fileContent:    string;
  questionRows:   { type: string; numQuestions: number; marks: number }[];
  additionalInfo?: string;
}

/**
 * Calls the OpenAI API to generate a structured exam paper JSON from
 * the provided material and question configuration.
 */
export async function generateExamPaper(
  payload: GenerationPayload
): Promise<Record<string, unknown>> {
  const { fileContent, questionRows, additionalInfo } = payload;

  const questionSpec = questionRows
    .map((r) => `• ${r.numQuestions} × ${r.type} (${r.marks} mark${r.marks > 1 ? 's' : ''} each)`)
    .join('\n');

  const systemPrompt = `You are an expert educator and exam designer. 
Generate a structured exam paper in valid JSON format only.
Return a single JSON object matching the schema provided.`;

  const userPrompt = `
Study Material:
"""
${fileContent}
"""

Question Requirements:
${questionSpec}

Additional Instructions:
${additionalInfo ?? 'None'}

Return a JSON object with this exact schema:
{
  "schoolName": "string",
  "subject": "string",
  "className": "string",
  "timeAllowed": "string",
  "maxMarks": number,
  "generalInstruction": "string",
  "studentFields": ["Name", "Roll Number", "Class"],
  "sections": [
    {
      "id": "string",
      "title": "Section A",
      "subtitle": "string",
      "instruction": "string",
      "questions": [
        { "number": 1, "difficulty": "Easy|Moderate|Challenging", "text": "string", "marks": number }
      ]
    }
  ],
  "answerKey": [
    { "number": 1, "answer": "string" }
  ]
}`;

  const completion = await openai.chat.completions.create({
    model:       'gpt-4o',
    messages:    [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  return JSON.parse(raw) as Record<string, unknown>;
}
