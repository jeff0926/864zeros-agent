import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || '',
});

interface BreakdownResult {
  title: string;
  description: string;
  estimated_duration: number;
  order: number;
}

class AIService {
  async breakdownTask(taskDescription: string, userPreferences?: any): Promise<BreakdownResult[]> {
    const prompt = `
Break down this task into 3-7 actionable steps that can be completed independently:

Task: "${taskDescription}"

Requirements:
- Each step should be specific and actionable
- Include realistic time estimates in minutes
- Order steps logically
- Make steps atomic (can't be broken down further)

Return a JSON array of objects with this structure:
{
  "title": "Brief step title",
  "description": "Detailed description of what to do",
  "estimated_duration": number_in_minutes,
  "order": step_number_starting_from_0
}

Example for "Plan a birthday party":
[
  {
    "title": "Set date and time",
    "description": "Choose a specific date and time that works for the birthday person and key guests",
    "estimated_duration": 15,
    "order": 0
  },
  {
    "title": "Create guest list",
    "description": "List all people to invite, get their contact information",
    "estimated_duration": 20,
    "order": 1
  }
]
    `.trim();

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a task breakdown expert. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const subtasks = JSON.parse(content);
      return subtasks;
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to basic breakdown
      return this.getFallbackBreakdown(taskDescription);
    }
  }

  private getFallbackBreakdown(taskDescription: string): BreakdownResult[] {
    return [
      {
        title: 'Plan approach',
        description: `Think through how to approach: ${taskDescription}`,
        estimated_duration: 10,
        order: 0,
      },
      {
        title: 'Gather resources',
        description: 'Collect all necessary materials, information, or tools',
        estimated_duration: 15,
        order: 1,
      },
      {
        title: 'Execute main task',
        description: `Complete the core work for: ${taskDescription}`,
        estimated_duration: 30,
        order: 2,
      },
      {
        title: 'Review and finalize',
        description: 'Check work quality and make any necessary adjustments',
        estimated_duration: 10,
        order: 3,
      },
    ];
  }

  async getSuggestions(partialInput: string): Promise<string[]> {
    // Future enhancement: provide task suggestions based on partial input
    return [];
  }
}

export const aiService = new AIService();
