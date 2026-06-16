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

MOST IMPORTANT RULE — READ THE PROMPT AND DECIDE THE APP TYPE:
- If prompt mentions NPK, nitrogen, phosphorus, potassium, soil nutrients → NPK app
- If prompt mentions weather, season, rainfall, temperature, climate → Weather app
- If prompt mentions soil pH, organic matter, moisture → Soil analysis app
- If prompt mentions fertilizer, manure → Fertilizer app
- If prompt mentions irrigation, water, scheduling → Irrigation app

FOR NPK / CROP RECOMMENDATION APPS ONLY:
Use inputs with ids: nitrogen, phosphorus, potassium
Use this exact XMLHttpRequest code on button click:
document.getElementById('result').innerHTML = 'Analyzing...';
var xhr = new XMLHttpRequest();
xhr.open('POST', 'https://agri-app-generator.vercel.app/api/recommend', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var data = JSON.parse(xhr.responseText);
    var html = '<p><b>Soil Assessment:</b> ' + data.soil_assessment + '</p>';
    html += '<h3 style="color:#2d6a4f">Best Crops:</h3>';
    data.best_matches.forEach(function(c) {
      html += '<div style="background:#d8f3dc;padding:10px;margin:8px 0;border-radius:8px">';
      html += '<b>' + c.crop + '</b> - ' + c.suitability + '<br>';
      html += '<small>' + c.reason + '</small></div>';
    });
    if (data.close_matches && data.close_matches.length > 0) {
      html += '<h3 style="color:#b5500f">Close Matches:</h3>';
      data.close_matches.forEach(function(c) {
        html += '<div style="background:#fff3cd;padding:10px;margin:8px 0;border-radius:8px">';
        html += '<b>' + c.crop + '</b> - ' + c.suitability + '<br>';
        html += '<small>' + c.reason + '</small></div>';
      });
    }
    document.getElementById('result').innerHTML = html;
  } else if (xhr.readyState === 4) {
    document.getElementById('result').innerHTML = 'Error getting recommendations. Please try again.';
  }
};
xhr.send(JSON.stringify({
  nitrogen: document.getElementById('nitrogen').value,
  phosphorus: document.getElementById('phosphorus').value,
  potassium: document.getElementById('potassium').value
}));

FOR WEATHER APPS:
Use inputs: district/location (text), season (dropdown: Kharif/Rabi/Zaid), crop type (text)
Use hardcoded Indian weather-based farming logic in JS. No external API calls.
Show advisory like: best sowing time, expected rainfall, farming tips for that season and crop.

FOR SOIL ANALYSIS APPS:
Use inputs: pH level (number), organic matter percentage (number), moisture level (number)
Use hardcoded soil science logic in JS. No external API calls.
Show: soil type, health status, what to add to improve soil.

FOR FERTILIZER APPS:
Use inputs: crop name (dropdown with Indian crops), land size in acres (number)
Use hardcoded fertilizer quantity logic in JS. No external API calls.
Show: exact kg of urea, DAP, potash needed for that crop and land size.

FOR IRRIGATION APPS:
Use inputs: crop type (dropdown), land size in acres (number), last rainfall in mm (number)
Use hardcoded irrigation scheduling logic in JS. No external API calls.
Show: water needed in litres, irrigation frequency, best time to irrigate.`
        },
        {
          role: 'user',
          content: `Generate an agricultural web app for this request: "${prompt}". Read it carefully and build the correct app with the right inputs for this specific use case.`
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