// Mock OpenAI
const mockCreate = jest.fn().mockResolvedValue({
  choices: [
    {
      message: {
        content: JSON.stringify([
          {
            title: 'Step 1',
            description: 'First step description',
            estimated_duration: 15,
            order: 0,
          },
          {
            title: 'Step 2',
            description: 'Second step description',
            estimated_duration: 20,
            order: 1,
          },
        ]),
      },
    },
  ],
});

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

import { aiService } from '../src/services/aiService';

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('breakdownTask', () => {
    it('should return an array of subtasks', async () => {
      const result = await aiService.breakdownTask('Plan a birthday party');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return subtasks with required properties', async () => {
      const result = await aiService.breakdownTask('Build a website');

      result.forEach((subtask) => {
        expect(subtask).toHaveProperty('title');
        expect(subtask).toHaveProperty('description');
        expect(subtask).toHaveProperty('estimated_duration');
        expect(subtask).toHaveProperty('order');
      });
    });

    it('should return fallback breakdown on error', async () => {
      // Override mock to throw error
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      const result = await aiService.breakdownTask('Test task');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toBe('Plan approach');
    });
  });

  describe('getSuggestions', () => {
    it('should return an empty array', async () => {
      const result = await aiService.getSuggestions('test');
      expect(result).toEqual([]);
    });
  });
});
