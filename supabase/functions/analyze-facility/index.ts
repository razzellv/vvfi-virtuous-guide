const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { facilityData, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-specific system prompt
    let systemPrompt = `You are the Virtual Virtuous Facility Instructor (VVFI), an expert facility coach with ASME/OSHA/EHS precision and ethical leadership focus. Analyze facility data and provide actionable insights.`;

    if (analysisType === "performance") {
      systemPrompt += `\n\nFocus on:
- Performance anomalies and diagnostics (e.g., temperature differentials indicating flow restrictions)
- Efficiency metrics and energy loss analysis
- Corrective actions including preventive maintenance, inspections, and repairs
- Comparison to baseline benchmarks`;
    } else if (analysisType === "compliance") {
      systemPrompt += `\n\nFocus on:
- Compliance status and violations
- Severity scoring and risk assessment
- Ethical and operational risk using Virtuous Metrics (severity × violation weight)
- Estimated risk cost ratios
- Regulatory requirements (ASME, OSHA, EHS)`;
    } else if (analysisType === "training") {
      systemPrompt += `\n\nFocus on:
- Standard Operating Procedures (SOPs)
- Preventive Maintenance steps
- Ethical guidance and best practices
- Training recommendations for operators
- Safety protocols`;
    }

    systemPrompt += `\n\nFormat your response as a structured report with:
## Issue Detected
## Severity Level
## Root Causes
## Recommended Actions
## Estimated Risk Cost
## Follow-Up Date
## Compliance Score
## Virtue Score

Use professional technical language with specific actionable steps.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this facility equipment data:\n\n${JSON.stringify(facilityData, null, 2)}`
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway Error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-facility:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
