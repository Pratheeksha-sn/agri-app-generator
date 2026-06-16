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
          content: `You are an expert web developer who builds agricultural apps for Indian farmers. When given a request, you generate a single complete HTML file with CSS and JS included. Output only the HTML code, nothing else. No markdown, no backticks, no explanations.`
        },
        {
          role: 'user',
          content: `Build this app: ${prompt}

Requirements:
- Single HTML file with all CSS in style tag and JS in script tag
- Green themed UI for Indian farmers
- For crop recommendation: use inputs for nitrogen, phosphorus, potassium and call this API using XMLHttpRequest POST to https://agri-app-generator.vercel.app/api/recommend with JSON body, then display soil_assessment, best_matches and close_matches from the JSON response
- For weather advisory: use location, season, crop type, crop stage inputs and show 7 day forecast table, rain alert, irrigation advice and farming tips using hardcoded Indian seasonal data
- For soil analysis: use pH, organic matter, moisture inputs and show soil health report
- For fertilizer: use crop name and land size inputs and show fertilizer quantities
- For irrigation: use crop type, land size, rainfall inputs and show irrigation schedule
- Always show results in a div with id result
- All buttons must work using onclick, never form submit`
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