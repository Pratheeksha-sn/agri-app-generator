import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { nitrogen, phosphorus, potassium } = await request.json();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert agricultural scientist specializing in Indian farming.
Given NPK soil values, use your own knowledge to recommend crops.
Respond ONLY in this exact JSON format, no backticks, no explanation:
{
  "soil_assessment": "your assessment of this soil",
  "best_matches": [
    {
      "crop": "crop name with emoji",
      "suitability": "Excellent / Good / Fair",
      "reason": "your reasoning based on these exact NPK values"
    }
  ],
  "close_matches": [
    {
      "crop": "crop name with emoji",
      "suitability": "Good with adjustment",
      "reason": "what the farmer should adjust and why"
    }
  ]
}`
        },
        {
          role: 'user',
          content: `My soil has Nitrogen=${nitrogen} kg/ha, Phosphorus=${phosphorus} kg/ha, Potassium=${potassium} kg/ha. What crops should I grow in India?`
        }
      ],
      max_tokens: 1024,
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return Response.json(data);

  } catch (error) {
    console.error('Recommend error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}