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
          content: `You are an expert agricultural web app generator.
Generate a COMPLETE, SELF-CONTAINED HTML file for the requested app.
STRICT Rules:
- Output ONLY raw HTML. No explanation, no markdown, no backticks.
- Include ALL CSS in style tag and ALL JS in script tag.
- Use clean green-themed mobile-friendly UI.
- Never use form submit, use onclick for buttons.
- Always include a div with id="result" for output.
- For crop recommendation apps, generate input fields with ids: nitrogen, phosphorus, potassium.
- The button must call this exact fetch on click:
document.getElementById('result').innerHTML = '🔍 Analyzing your soil...';
fetch('https://agri-app-generator.vercel.app/api/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nitrogen: document.getElementById('nitrogen').value,
    phosphorus: document.getElementById('phosphorus').value,
    potassium: document.getElementById('potassium').value
  })
})
.then(r => r.json())
.then(data => {
  let html = '<p><b>🌍 Soil Assessment:</b> ' + data.soil_assessment + '</p>';
  html += '<h3 style="color:#2d6a4f">✅ Best Crops:</h3>';
  data.best_matches.forEach(c => {
    html += '<div style="background:#d8f3dc;padding:10px;margin:8px 0;border-radius:8px">';
    html += '<b>' + c.crop + '</b> — ' + c.suitability + '<br>';
    html += '<small>' + c.reason + '</small>';
    html += '</div>';
  });
  if (data.close_matches && data.close_matches.length > 0) {
    html += '<h3 style="color:#b5500f">⚠️ Close Matches:</h3>';
    data.close_matches.forEach(c => {
      html += '<div style="background:#fff3cd;padding:10px;margin:8px 0;border-radius:8px">';
      html += '<b>' + c.crop + '</b> — ' + c.suitability + '<br>';
      html += '<small>' + c.reason + '</small>';
      html += '</div>';
    });
  }
  document.getElementById('result').innerHTML = html;
})
.catch(e => {
  document.getElementById('result').innerHTML = '<p style="color:red">Error: ' + e.message + '</p>';
});`
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