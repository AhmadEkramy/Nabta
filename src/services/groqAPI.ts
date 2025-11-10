// Groq API service for AI Coach
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Using llama-3.1-8b-instant as replacement for deprecated llama3-8b-8192
const MODEL = 'llama-3.1-8b-instant';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a message to Groq API and get AI response
 * @param messages - Array of chat messages (conversation history)
 * @param language - Language code ('ar' or 'en')
 * @returns AI response text
 */
export async function getGroqResponse(
  messages: ChatMessage[],
  language: 'ar' | 'en' = 'en'
): Promise<string> {
  try {
    // Validate API key
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY in your .env file.');
    }

    // Add system message based on language
    const systemMessage: ChatMessage = {
      role: 'system',
      content: language === 'ar'
        ? 'أنت مدرب شخصي ذكي ومحترف. مهمتك هي مساعدة المستخدمين في رحلة النمو الشخصي، تحديد الأهداف، تحسين الإنتاجية، وتطوير المهارات. كن داعماً، إيجابياً، ومهتماً. قدم نصائح عملية وقابلة للتطبيق. استجب بالعربية دائماً.'
        : 'You are an intelligent and professional personal coach. Your mission is to help users on their personal growth journey, set goals, improve productivity, and develop skills. Be supportive, positive, and caring. Provide practical and actionable advice. Always respond in English.'
    };

    const allMessages = [systemMessage, ...messages];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: allMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Groq API error: ${response.status} ${response.statusText}`
      );
    }

    const data: GroqResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    }

    throw new Error('No response from Groq API');
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

/**
 * Get AI insights based on user goals and progress
 * @param goals - User's goals data
 * @param language - Language code
 * @returns AI-generated insights
 */
export async function getAICoachInsights(
  goals: Array<{ title: string; progress: number; status: string }>,
  language: 'ar' | 'en' = 'en'
): Promise<string> {
  const goalsSummary = goals.map(g => 
    `- ${g.title}: ${g.progress}% ${g.status === 'completed' ? '(مكتمل)' : '(قيد التنفيذ)'}`
  ).join('\n');

  const prompt = language === 'ar'
    ? `بناءً على أهداف المستخدم التالية:\n${goalsSummary}\n\nقدم رؤى وتوصيات ذكية ومفيدة لمساعدة المستخدم على تحقيق أهدافه. كن مختصراً ومباشراً.`
    : `Based on the following user goals:\n${goalsSummary}\n\nProvide intelligent and helpful insights and recommendations to help the user achieve their goals. Be concise and direct.`;

  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: prompt
    }
  ];

  return await getGroqResponse(messages, language);
}

