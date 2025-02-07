import Groq from "groq-sdk";
import { PERSONAS, type PersonaKey } from "@/lib/personas";

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Info logs for normal operations
console.info('✅ Groq client initialized');
console.info('🚀 Chat API route called');

export async function POST(req: Request) {
  try {
    console.log('📝 Checking GROQ_API_KEY...');
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    console.log('✅ GROQ_API_KEY is present');

    console.log('📦 Parsing request body...');
    const { messages, persona = 'default' } = await req.json();
    console.log('Received messages:', messages);

    const systemPrompt = PERSONAS[persona as PersonaKey] || PERSONAS.default;
    
    console.log('🔍 Validating messages...');
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }
    console.log('✅ Messages format valid');

    console.log('🤖 Creating chat completion...');
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Create a ReadableStream from the completion
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Chat completion failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }), 
      { status: 500 }
    );
  }
} 