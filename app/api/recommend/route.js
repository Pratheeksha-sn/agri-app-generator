import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request) {
  try {
    const { nitrogen, phosphorus, potassium } = await request.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert agricultural scientist specializing in Indian farming. Given NPK soil values, use your own knowledge to recommend crops. Respond ONLY in this exact JSON format, no backticks, no explanation: {"soil_assessment": "your assessment", "best_matches": [{"crop": "crop name with emoji", "suitability": "Excellent / Good / Fair", "reason": "your reasoning"}], "close_matches": [{"crop": "crop name with emoji", "suitability": "Good with adjustment", "reason": "what to adjust"}]}'
        },
        {
          role: 'user',
          content: 'My soil has Nitrogen=' + nitrogen + ' kg/ha, Phosphorus=' + phosphorus + ' kg/ha, Potassium=' + potassium + ' kg/ha. What crops should I grow in India?'
        }
      ],
      max_tokens: 1024,
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return Response.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('Recommend error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}