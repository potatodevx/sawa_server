import OpenAI from 'openai';
import { logger } from './logger';
import { env } from '../config/env';

const client = new OpenAI({
  apiKey: env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Generates a couple bio ("Who we are") and match criteria ("What we are looking for")
 * based on onboarding answers.
 */
export const generateCoupleBio = async (
  qaData: Array<{ question: string; answers: string[] }>
): Promise<{ bio: string; matchCriteria: string[] }> => {
  try {
    const context = qaData
      .map((item) => `Q: ${item.question}\nA: ${item.answers.join(', ')}`)
      .join('\n\n');

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a profile writer for SAWA, a premium couples social app. Your job is to write SHORT, warm, human bios that feel like a real couple wrote them — not an AI.

STRICT LENGTH RULE: The "bio" must be exactly 2 sentences. No more. Each sentence should be punchy and specific.

VOICE RULES:
- Write in first-person plural ("We"). 
- Sound like a real person texting a friend, not a LinkedIn bio.
- Use ONE specific detail from their answers to make it feel personal.
- NO corporate language, NO buzzwords, NO generic phrases like "laid-back", "foodie", "adventure-seekers", "love to laugh", "partner in crime", "journey", "chapter".
- Warmth comes from specificity, not adjectives.

GOOD EXAMPLES (notice: short, specific, human):
- "We're in the thick of building our careers and somehow still find time for long dinners that run past midnight. Good food and good company are non-negotiable for us."
- "We host more than we go out — our place is usually full on weekends with friends, good wine, and whatever we've been cooking lately. Looking to add a few more tables to that rotation."
- "Weekends away are our reset button. We plan them obsessively and then happily go off-script once we're there."

BAD EXAMPLES (avoid these):
- "We are a dynamic couple passionate about exploring new horizons and building meaningful connections." ❌
- "As adventurous souls, we love experiencing life to the fullest with great food and great company." ❌

Return a JSON object with exactly two fields:
1. "bio": Exactly 2 sentences. Warm, specific, human. Max 40 words total.
2. "matchCriteria": One sentence describing the kind of couples they click with. Max 20 words.`,
        },
        {
          role: 'user',
          content: `Onboarding answers:\n\n${context}\n\nWrite a short, human bio and matchCriteria JSON. Remember: 2 sentences max for bio, sound like a real person.`,
        },
      ],
      temperature: 0.85,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    let content = response.choices[0]?.message?.content || '{}';
    
    // Cleanup markdown-wrapped JSON if present
    if (content.includes('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    const parsed = JSON.parse(content);
    logger.info(`[GroqAI] Bio generation successful for couple.`);

    return {
      bio: parsed.bio || '',
      matchCriteria: parsed.matchCriteria ? [parsed.matchCriteria] : [],
    };
  } catch (err) {
    logger.error('[GroqAI] Failed to generate structured bio:', err);
    return { bio: '', matchCriteria: [] };
  }
};
