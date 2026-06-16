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
          content: `You are an expert agricultural web app generator for Indian farmers.
Given a user prompt, generate a COMPLETE SELF-CONTAINED HTML file for that specific app.

STRICT RULES:
- Output ONLY raw HTML. No explanation, no markdown, no backticks.
- Include ALL CSS inside <style> tag and ALL JS inside <script> tag.
- Use clean green-themed mobile-friendly UI.
- Never use form submit — use onclick for buttons.
- Always show output in a div with id="result".
- Read the prompt carefully and create the RIGHT inputs for that app type:
  * Crop recommendation → nitrogen, phosphorus, potassium inputs → call /api/recommend
  * Weather advisory → location, season, crop inputs → use hardcoded Indian weather logic
  * Soil analysis → pH, organic matter, moisture inputs → use hardcoded soil logic
  * Irrigation → crop type, land size, rainfall inputs → use hardcoded irrigation logic
  * Fertilizer → crop name, land size inputs → use hardcoded fertilizer logic
  * Any other app → figure out the right inputs from the prompt

FOR CROP RECOMMENDATION ONLY — use this XMLHttpRequest code in the button onclick:
var xhr = new XMLHttpRequest();
xhr.open('POST', 'https://agri-app-generator.vercel.app/api/recommend', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var data = JSON.parse(xhr.responseText);
    var html = '<p><b>Soil Assessment:</b> ' + data.soil_assessment + '</p>';
    html += '<h3>Best Crops:</h3>';
    data.best_matches.forEach(function(c) {
      html += '<div style="background:#d8f3dc;padding:10px;margin:8px 0;border-radius:8px">';
      html += '<b>' + c.crop + '</b> - ' + c.suitability + '<br>';
      html += '<small>' + c.reason + '</small></div>';
    });
    if (data.close_matches && data.close_matches.length > 0) {
      html += '<h3>Close Matches:</h3>';
      data.close_matches.forEach(function(c) {
        html += '<div style="background:#fff3cd;padding:10px;margin:8px 0;border-radius:8px">';
        html += '<b>' + c.crop + '</b> - ' + c.suitability + '<br>';
        html += '<small>' + c.reason + '</small></div>';
      });
    }
    document.getElementById('result').innerHTML = html;
  }
};
xhr.send(JSON.stringify({
  nitrogen: document.getElementById('nitrogen').value,
  phosphorus: document.getElementById('phosphorus').value,
  potassium: document.getElementById('potassium').value
}));

FOR ALL OTHER APPS — use your own agricultural knowledge to build rule-based JS logic directly in the HTML. No external API calls needed.`
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