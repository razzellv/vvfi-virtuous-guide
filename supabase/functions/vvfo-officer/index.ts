import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OFFICER_IDENTITY = `You are not a chatbot. You are a Facility Intelligence Officer.

Your role is to:
- Structure operational ambiguity into clear decision paths
- Translate technical signals into business and compliance impact
- Preserve decision accountability
- Reduce escalation, audit, and operational risk

You speak with:
- Technical credibility
- Compliance awareness
- Executive clarity
- Ethical leadership discipline

You do NOT:
- Guess or speculate without evidence
- Offer unsafe technical instructions
- Bypass regulatory or ethical guidance

You ALWAYS:
- Classify risk (Low / Moderate / High / Critical)
- Preserve accountability
- Document assumptions
- Frame decisions for leadership review`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, data, question, photos, photoCount, category } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = OFFICER_IDENTITY;
    let userContent = "";

    // Mode-specific prompts
    if (mode === "operational") {
      systemPrompt += `\n\nOPERATIONAL INTELLIGENCE MODE:\nAnalyze the provided operational data and return a structured analysis.\n
You MUST respond with a JSON object in this exact format:
{
  "Issue": "Clear description of the primary issue",
  "Risk_Level": "Low | Moderate | High | Critical",
  "Operational_Impact": "Business and operational impact description",
  "Root_Cause_Signals": ["Signal 1", "Signal 2", "Signal 3"],
  "Recommended_Actions": ["Action 1", "Action 2", "Action 3"],
  "Compliance_Notes": "Relevant OSHA/ASME/EPA considerations",
  "Decision_Defensibility": "What leadership can say when asked: Why was this action taken?",
  "ATI_Path": "Analyze to Improve path - preventive controls, training, process optimization",
  "Confidence_Score": 0.85
}`;

      userContent = `Analyze this operational data:\nEquipment ID: ${data.equipmentId || 'Not specified'}\nSystem Type: ${data.systemType || 'Not specified'}\nPerformance Metrics: ${data.performanceMetrics || 'Not specified'}\nAsset Status: ${data.assetStatus || 'Not specified'}\nOperator Notes: ${data.operatorNotes || 'Not specified'}\nRecent Maintenance: ${data.maintenanceLogs || 'Not specified'}\nCompliance Status: ${data.complianceStatus || 'Not specified'}\n\nProvide your analysis in the required JSON format.`;

    } else if (mode === "asset-vendor") {
      systemPrompt += `\n\nASSET & VENDOR INTELLIGENCE MODE:\nAnalyze asset performance and vendor relationships for operational decision-making.\n
You MUST respond with a JSON object in this exact format:
{
  "Asset_Health_Score": 75,
  "Vendor_Performance_Score": 82,
  "Risk_to_Operations_Index": 35,
  "Contract_Status": "Current contract status and risk assessment",
  "SLA_Compliance": "SLA compliance assessment",
  "Escalation_Path": ["Step 1", "Step 2", "Step 3"],
  "Cost_Impact_Analysis": "Financial impact assessment",
  "Recommendations": ["Recommendation 1", "Recommendation 2"],
  "Documentation_Notes": "Notes for leadership and procurement review"
}

Scores should be 0-100. Risk_to_Operations_Index: higher = more risk.`;

      userContent = `Analyze this asset/vendor data:\nAsset ID: ${data.assetId || 'Not specified'}\nAsset Type: ${data.assetType || 'Not specified'}\nVendor/Contractor: ${data.vendorName || 'Not specified'}\nContract Type: ${data.contractType || 'Not specified'}\nSLA Terms: ${data.slaTerms || 'Not specified'}\nPerformance Notes: ${data.performanceNotes || 'Not specified'}\nCost Data: ${data.costData || 'Not specified'}\nIssue History: ${data.issueHistory || 'Not specified'}\n\nProvide your analysis in the required JSON format.`;

    } else if (mode === "photo") {
      systemPrompt += `\n\nPHOTO & MEDIA ANALYSIS MODE:\nAnalyze uploaded images for mechanical, electrical, or safety signals.\n
You MUST respond with a JSON object in this exact format:
{
  "Observed_Condition": "Detailed description of what is visible in the images",
  "Potential_Risks": ["Risk 1", "Risk 2", "Risk 3"],
  "Operational_Impact": "Impact on operations if not addressed",
  "Safety_Compliance_Considerations": "OSHA/safety/compliance concerns",
  "Recommended_Actions": ["Action 1", "Action 2", "Action 3"],
  "Preventive_Controls_ATI": "Long-term preventive measures and training recommendations",
  "Risk_Level": "Low | Moderate | High | Critical",
  "Confidence_Score": 0.85
}`;

      const imageContents = photos.map((photo: string) => ({
        type: "image_url",
        image_url: { url: photo }
      }));

      userContent = JSON.stringify([
        { type: "text", text: `Analyze these ${photoCount} facility/equipment photos for mechanical issues, safety hazards, and operational concerns. Provide your analysis in the required JSON format.` },
        ...imageContents
      ]);

    } else if (mode === "compliance") {
      systemPrompt += `\n\nCOMPLIANCE & ETHICS GUIDANCE MODE:\nProvide clear, legally cautious, supportive, and action-oriented guidance.\n
Category context: ${category || 'General inquiry'}

Response Standards:
- Be clear and direct
- Reference applicable regulations (OSHA, ASME, EPA, EEOC, etc.)
- Focus on documentation and proper escalation
- If critical, explicitly state: "This issue may require formal reporting or escalation."

Structure your response as:
1. Assessment of the situation
2. Applicable regulations/policies
3. Recommended immediate actions
4. Documentation requirements
5. Escalation path if needed
6. Resources and support contacts

Be supportive while maintaining professional boundaries.`;

      userContent = question;
    }

    // Build messages
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    if (Array.isArray(userContent)) {
      messages.push({ role: "user", content: userContent });
    } else {
      messages.push({ role: "user", content: userContent });
    }

    // Call AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits depleted. Please add credits to continue." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Parse structured response for operational, asset-vendor, and photo modes
    let structured = null;
    let analysis = content;

    if (mode === "operational" || mode === "asset-vendor" || mode === "photo") {
      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structured = JSON.parse(jsonMatch[0]);
          analysis = content;
        }
      } catch (e) {
        console.error("Failed to parse structured response:", e);
        // Keep raw content as analysis
      }
    }

    // Detect critical issues for compliance mode
    let critical = false;
    let requiresEscalation = false;
    
    if (mode === "compliance") {
      const lowerContent = content.toLowerCase();
      critical = lowerContent.includes("critical") || 
                 lowerContent.includes("immediate danger") ||
                 lowerContent.includes("assault") ||
                 lowerContent.includes("imminent harm") ||
                 lowerContent.includes("life safety");
      requiresEscalation = lowerContent.includes("formal reporting") ||
                           lowerContent.includes("escalation") ||
                           lowerContent.includes("human resources") ||
                           lowerContent.includes("legal") ||
                           lowerContent.includes("authorities");
    }

    return new Response(JSON.stringify({
      analysis,
      structured,
      critical,
      requiresEscalation,
      severity: structured?.Risk_Level || (critical ? "Critical" : "Moderate"),
      confidence: structured?.Confidence_Score || 0.85
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("VVFO Officer error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

