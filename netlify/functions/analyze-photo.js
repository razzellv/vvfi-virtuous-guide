// Netlify serverless function — calls Anthropic API server-side to avoid CORS
// Environment variable required: ANTHROPIC_API_KEY

const SYSTEM_PROMPT =
  'You are VVFI — the Virtual Virtuous Facility Instructor. Analyze these facility photos as an expert facility engineer and operations advisor. Identify: equipment conditions, safety concerns, maintenance issues, compliance risks, and operational improvements. Provide specific, actionable guidance with decision defensibility principles. Be direct and professional.';

export const handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: missing API key' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { images } = body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No images provided. Send { images: [{ data, mediaType }] }' }),
    };
  }

  // Build Claude vision content blocks
  const imageContent = images.map(({ data, mediaType }) => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: mediaType || 'image/jpeg',
      data,
    },
  }));

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContent,
              { type: 'text', text: SYSTEM_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Anthropic API error', details: errText }),
      };
    }

    const anthropicData = await anthropicRes.json();
    const analysis = anthropicData.content?.[0]?.text || 'Unable to analyze photos at this time.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis }),
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: err.message }),
    };
  }
};
