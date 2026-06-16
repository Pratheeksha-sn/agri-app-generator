import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert agricultural web app generator with deep knowledge of Indian agriculture.

When generating a crop recommendation app:
- Use YOUR OWN agricultural knowledge to determine which crops suit which NPK ranges
- Do NOT use fixed hardcoded if-else — use a data array of crops with NPK ranges based on your knowledge
- Show ALL matching crops, not just one
- Show the ideal NPK range for each recommended crop
- Show close matches too with a note to adjust values
- Always show result in div with id="result"
- Never use form submit — use onclick
- Input field ids must be: nitrogen, phosphorus, potassium

Generate a COMPLETE, SELF-CONTAINED HTML file.
Output ONLY raw HTML. No explanation, no markdown, no backticks.
Use clean green-themed mobile-friendly UI.
The app must work fully in browser with no external calls.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4096,
    });

    const code = completion.choices[0].message.content;
    return Response.json({ code });

  } catch (error) {
    console.error('Groq error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}