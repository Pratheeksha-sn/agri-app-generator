import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function detectAppType(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('npk') || p.includes('nitrogen') || p.includes('phosphorus') || p.includes('potassium') || p.includes('crop recommendation')) return 'crop';
  if (p.includes('weather') || p.includes('season') || p.includes('rainfall') || p.includes('climate') || p.includes('advisory')) return 'weather';
  if (p.includes('soil') || p.includes('ph') || p.includes('organic') || p.includes('moisture')) return 'soil';
  if (p.includes('fertilizer') || p.includes('manure') || p.includes('urea') || p.includes('dap')) return 'fertilizer';
  if (p.includes('irrigation') || p.includes('water') || p.includes('scheduling')) return 'irrigation';
  return 'general';
}

function getAppPrompt(type, prompt) {
  if (type === 'crop') {
    return `Build a crop recommendation web app for Indian farmers.
Use three number inputs with ids: nitrogen, phosphorus, potassium.
Add a button that on click does this using XMLHttpRequest:
1. Sets result div to "Analyzing your soil..."
2. POSTs to https://agri-app-generator.vercel.app/api/recommend with JSON: nitrogen, phosphorus, potassium values
3. On response shows soil_assessment, then loops best_matches showing crop name, suitability, reason in green cards, then close_matches in yellow cards
All in a div with id="result".
Use green theme. Output only raw HTML with CSS in style tag and JS in script tag.`;
  }

  if (type === 'weather') {
    return `Build a weather-based farming advisory app for Indian farmers.
Use these inputs:
- Location (text, Indian district name)
- Season (dropdown: Kharif, Rabi, Summer)
- Crop Type (dropdown: Paddy, Maize, Wheat, Cotton, Groundnut, Sugarcane, Soybean)
- Crop Stage (dropdown: Sowing, Vegetative, Flowering, Harvesting)

On button click use hardcoded JS logic (NO fetch, NO API calls) to show:
1. Weather Summary for that season and region
2. 7-day forecast as a table (Day, Condition, Rain Chance %)
3. Rain Alert (High/Medium/Low)
4. Irrigation Advice (specific recommendation)
5. Three farming tips based on crop stage and season

Use realistic Indian seasonal data hardcoded in JS. Green theme. Output only raw HTML.`;
  }

  if (type === 'soil') {
    return `Build a soil health analysis app for Indian farmers.
Use these inputs:
- pH Level (number, range 0-14)
- Organic Matter Percentage (number)
- Moisture Level percentage (number)

On button click use hardcoded JS logic (NO fetch, NO API calls) to show:
1. Soil Type (Acidic/Neutral/Alkaline based on pH)
2. Soil Health Score out of 100
3. Organic Matter Status (Poor/Good/Excellent)
4. Moisture Status (Dry/Optimal/Waterlogged)
5. Three specific recommendations to improve the soil

Green theme. Output only raw HTML with CSS in style tag and JS in script tag.`;
  }

  if (type === 'fertilizer') {
    return `Build a fertilizer recommendation app for Indian farmers.
Use these inputs:
- Crop (dropdown: Paddy, Wheat, Maize, Cotton, Sugarcane, Groundnut, Tomato, Onion)
- Land Size in acres (number)

On button click use hardcoded JS logic (NO fetch, NO API calls) to show:
1. Urea needed in kg
2. DAP needed in kg
3. Potash (MOP) needed in kg
4. Application schedule (when to apply each)
5. Estimated cost in rupees

Use realistic ICAR recommended quantities. Green theme. Output only raw HTML.`;
  }

  if (type === 'irrigation') {
    return `Build an irrigation scheduling app for Indian farmers.
Use these inputs:
- Crop Type (dropdown: Paddy, Wheat, Maize, Cotton, Sugarcane, Vegetables)
- Land Size in acres (number)
- Last Rainfall in mm (number)
- Soil Type (dropdown: Sandy, Loamy, Clay)

On button click use hardcoded JS logic (NO fetch, NO API calls) to show:
1. Water needed in litres
2. Irrigation frequency (every X days)
3. Best time to irrigate
4. Next irrigation date
5. Water saving tips

Green theme. Output only raw HTML with CSS in style tag and JS in script tag.`;
  }

  return `Build an agricultural web app for Indian farmers based on this request: ${prompt}
Use appropriate inputs, hardcoded JS logic, green theme.
Output only raw HTML with CSS in style tag and JS in script tag. No fetch or API calls.`;
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const appType = detectAppType(prompt);
    const appPrompt = getAppPrompt(appType, prompt);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer. Generate complete self-contained HTML files. Output ONLY raw HTML code, nothing else. No markdown, no backticks, no explanations. All CSS in style tag, all JS in script tag.`
        },
        {
          role: 'user',
          content: appPrompt
        }
      ],
      max_tokens: 4096,
    });

    const code = completion.choices[0].message.content;
    return Response.json({ code, appType });

  } catch (error) {
    console.error('Groq error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}