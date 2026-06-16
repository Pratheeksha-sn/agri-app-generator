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
          content: 'You are an expert agricultural web app generator. Generate a COMPLETE, SELF-CONTAINED HTML file. Output ONLY raw HTML, no explanation, no markdown, no backticks. Include all CSS in a style tag and all JS in a script tag. Use green theme. For crop recommendation apps: create three number inputs with ids nitrogen, phosphorus, potassium. Add a button with onclick that first sets document.getElementById("result").innerHTML to "Analyzing..." then uses XMLHttpRequest to POST to https://agri-app-generator.vercel.app/api/recommend with JSON body containing nitrogen phosphorus and potassium values from the inputs. On success parse the JSON response and display soil_assessment, then loop through best_matches and close_matches arrays showing crop name suitability and reason in colored divs. Show results in a div with id result. Use XMLHttpRequest not fetch to avoid any syntax issues.'
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