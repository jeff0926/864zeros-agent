import { ANTHROPIC_API_KEY } from '@env';

export type Granularity = 'big' | 'balanced' | 'small';

interface BreakdownResult {
  title: string;
  description: string;
  estimated_duration: number;
  order: number;
}

const GRANULARITY_CONFIG: Record<Granularity, { stepRange: string; style: string }> = {
  big: {
    stepRange: '3-4',
    style: 'large, high-level steps. Each step can represent a significant chunk of work. Focus on the major phases.',
  },
  balanced: {
    stepRange: '6-8',
    style: 'medium-sized, balanced steps. Each step should be a clear action that takes 10-30 minutes. Good mix of detail and brevity.',
  },
  small: {
    stepRange: '10-15',
    style: 'tiny, granular steps. Each step should be a single small action that takes 2-10 minutes. Break everything down as small as possible so nothing feels overwhelming.',
  },
};

/**
 * Resolve the Anthropic API key.
 * Priority: EAS Secrets (injected via eas-build-pre-install.sh into .env)
 *           → local .env file → empty string (triggers fallback).
 */
function resolveApiKey(): string {
  const key = ANTHROPIC_API_KEY;
  if (key && key !== 'your-anthropic-api-key-here') {
    return key;
  }
  return '';
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = resolveApiKey();
  }

  async breakdownTask(taskDescription: string, granularity: Granularity = 'balanced'): Promise<BreakdownResult[]> {
    const config = GRANULARITY_CONFIG[granularity];

    const prompt = `
Break down this task into ${config.stepRange} actionable steps:

Task: "${taskDescription}"

Granularity: ${config.style}

Requirements:
- Each step should be specific and actionable
- Include realistic time estimates in minutes
- Order steps logically
- Make steps completable in one sitting

Return ONLY a JSON array of objects with this structure (no other text):
[
  {
    "title": "Brief step title",
    "description": "Detailed description of what to do",
    "estimated_duration": number_in_minutes,
    "order": step_number_starting_from_0
  }
]
    `.trim();

    // No API key → skip the network call entirely
    if (!this.apiKey) {
      console.warn('No API key configured, using fallback breakdown');
      return this.getFallbackBreakdown(taskDescription, granularity);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2048,
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
        // Fall back instead of crashing
        return this.getFallbackBreakdown(taskDescription, granularity);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text;

      if (!content) {
        console.error('Empty response from AI service');
        return this.getFallbackBreakdown(taskDescription, granularity);
      }

      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No valid JSON array in AI response');
        return this.getFallbackBreakdown(taskDescription, granularity);
      }

      const subtasks = JSON.parse(jsonMatch[0]);
      return subtasks;
    } catch (error) {
      // Network error, parse error, anything — always return steps, never crash
      console.error('AI Service Error (falling back):', error);
      return this.getFallbackBreakdown(taskDescription, granularity);
    }
  }

  private getFallbackBreakdown(taskDescription: string, granularity: Granularity): BreakdownResult[] {
    if (granularity === 'big') {
      return [
        { title: 'Plan approach', description: `Think through how to approach: ${taskDescription}`, estimated_duration: 15, order: 0 },
        { title: 'Execute main work', description: `Complete the core work for: ${taskDescription}`, estimated_duration: 45, order: 1 },
        { title: 'Review and finalize', description: 'Check work quality and make any necessary adjustments', estimated_duration: 15, order: 2 },
      ];
    }

    if (granularity === 'small') {
      return [
        { title: 'Define the goal', description: `Clarify exactly what "done" looks like for: ${taskDescription}`, estimated_duration: 5, order: 0 },
        { title: 'List what you need', description: 'Write down all materials, tools, or info required', estimated_duration: 5, order: 1 },
        { title: 'Gather first resource', description: 'Get the most important item you need', estimated_duration: 5, order: 2 },
        { title: 'Gather remaining resources', description: 'Collect everything else on your list', estimated_duration: 10, order: 3 },
        { title: 'Set up workspace', description: 'Clear your space and arrange what you need', estimated_duration: 5, order: 4 },
        { title: 'Start first piece', description: 'Begin the very first part of the actual work', estimated_duration: 10, order: 5 },
        { title: 'Complete first piece', description: 'Finish the first section before moving on', estimated_duration: 10, order: 6 },
        { title: 'Work on middle section', description: 'Tackle the main body of work', estimated_duration: 15, order: 7 },
        { title: 'Work on final section', description: 'Complete the last portion of work', estimated_duration: 10, order: 8 },
        { title: 'Quick review', description: 'Scan through everything for obvious issues', estimated_duration: 5, order: 9 },
        { title: 'Final polish', description: 'Make small adjustments and finalize', estimated_duration: 5, order: 10 },
      ];
    }

    // balanced (default)
    return [
      { title: 'Plan approach', description: `Think through how to approach: ${taskDescription}`, estimated_duration: 10, order: 0 },
      { title: 'Gather resources', description: 'Collect all necessary materials, information, or tools', estimated_duration: 15, order: 1 },
      { title: 'Set up environment', description: 'Prepare your workspace and tools', estimated_duration: 10, order: 2 },
      { title: 'Execute first half', description: `Complete the first part of: ${taskDescription}`, estimated_duration: 20, order: 3 },
      { title: 'Execute second half', description: 'Complete the remaining core work', estimated_duration: 20, order: 4 },
      { title: 'Review and finalize', description: 'Check work quality and make any necessary adjustments', estimated_duration: 10, order: 5 },
    ];
  }

  async getSuggestions(_partialInput: string): Promise<string[]> {
    // Future enhancement: provide task suggestions based on partial input
    return [];
  }
}

export const aiService = new AIService();
