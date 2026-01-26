import { ANTHROPIC_API_KEY } from '@env';

interface BreakdownResult {
  title: string;
  description: string;
  estimated_duration: number;
  order: number;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = ANTHROPIC_API_KEY || '';
  }

  async breakdownTask(taskDescription: string, _userPreferences?: any): Promise<BreakdownResult[]> {
    const prompt = `
Break down this task into 3-7 actionable steps that can be completed independently:

Task: "${taskDescription}"

Requirements:
- Each step should be specific and actionable
- Include realistic time estimates in minutes
- Order steps logically
- Make steps atomic (can't be broken down further)

Return ONLY a JSON array of objects with this structure (no other text):
[
  {
    "title": "Brief step title",
    "description": "Detailed description of what to do",
    "estimated_duration": number_in_minutes,
    "order": step_number_starting_from_0
  }
]

Example output for "Plan a birthday party":
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
      if (!this.apiKey) {
        console.warn('No API key configured, using fallback breakdown');
        return this.getFallbackBreakdown(taskDescription);
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text;

      if (!content) {
        throw new Error('No response from AI service');
      }

      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array in response');
      }

      const subtasks = JSON.parse(jsonMatch[0]);
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

  async getSuggestions(_partialInput: string): Promise<string[]> {
    // Future enhancement: provide task suggestions based on partial input
    return [];
  }
}

export const aiService = new AIService();
