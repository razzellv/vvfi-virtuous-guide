import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, photos, question, conversationHistory, photoCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`VVFI Instructor request - Mode: ${mode}`);

    let systemPrompt = "";
    let userContent: any = "";

    // Define system prompts based on mode
    if (mode === "photo") {
      systemPrompt = `You are the Virtual Virtuous Facility Instructor (VVFI), an expert mechanical, electrical, and safety advisor.

ANALYZE THE PROVIDED PHOTOS for:
• Visible equipment issues (damage, wear, misalignment, corrosion)
• Safety hazards (exposed wiring, missing guards, leaks)
• Maintenance indicators (dirty filters, loose bolts, improper installation)

RESPOND IN THIS FORMAT:

📸 Photo Analysis Summary:
[Brief overview of what you observe across all ${photoCount} photo(s)]

🔍 Detailed Observations:
Photo #1: [specific findings]
Photo #2: [specific findings]
[etc.]

⚠️ Identified Issues:
• [Issue 1]: [severity - Low/Moderate/High/Critical]
  - Possible causes
  - Safety implications
  
• [Issue 2]: [severity]
  - Possible causes
  - Safety implications

🔧 Recommended Actions:
1. [Immediate action with safety precautions]
2. [Diagnostic steps]
3. [Repair/replacement procedures]
4. [Testing and verification]

📋 Related References:
• PM Schedule: [if applicable]
• SOP Reference: [relevant procedure code]
• Standards: [OSHA/ASME/EPA if relevant]

Severity Assessment: [Overall: Low/Moderate/High/Critical]
Confidence Level: [0.0-1.0]`;

      // Build user content with images
      const imageContent = photos.map((photo: string, index: number) => ({
        type: "image_url",
        image_url: { url: photo }
      }));

      userContent = [
        {
          type: "text",
          text: `Analyze these ${photoCount} facility/equipment photo(s) for mechanical issues, safety concerns, and maintenance needs. Provide detailed technical guidance.`
        },
        ...imageContent
      ];

    } else if (mode === "text") {
      systemPrompt = `You are the Virtual Virtuous Facility Instructor (VVFI), a professional technical advisor specializing in facility equipment, HVAC, mechanical, electrical, plumbing, and safety systems.

PROVIDE RESPONSES IN THIS FORMAT:

🎯 Question Understanding:
[Restate the question clearly]

📊 Diagnosis & Analysis:
[Explain likely causes, technical background]

🔧 Step-by-Step Resolution:
1. [Safety first - lockout/tagout if needed]
2. [Diagnostic/inspection steps]
3. [Repair/adjustment procedures]
4. [Testing and verification]
5. [Documentation required]

⚙️ Common Causes:
• [Cause 1 with explanation]
• [Cause 2 with explanation]
• [Cause 3 with explanation]

📋 References & Standards:
• SOP: [relevant procedure code]
• PM: [preventive maintenance reference]
• Standards: [OSHA, ASME, EPA, NEC as applicable]
• Parts: [common replacement parts if relevant]

💡 Pro Tips:
[Practical advice, best practices, preventive measures]

Severity: [Low/Moderate/High based on safety/operational impact]`;

      userContent = question;

      // Add conversation history for context
      if (conversationHistory && conversationHistory.length > 0) {
        systemPrompt += "\n\nPrevious conversation context provided. Reference it if relevant but focus on the current question.";
      }

    } else if (mode === "ethical") {
      systemPrompt = `You are the Virtual Virtuous Facility Instructor (VVFI) providing confidential ethical, legal, and workplace safety guidance.

YOU MUST:
• Be compassionate, clear, and direct
• Cite legal protections (EEOC Title VII, OSHA, state laws)
• Provide actionable steps
• Flag CRITICAL issues (harassment, assault, immediate danger)
• Never minimize serious concerns

RESPOND IN THIS FORMAT:

🛡️ Understanding Your Concern:
[Empathetic acknowledgment]

⚖️ Legal & Ethical Context:
[Relevant laws, rights, protections - EEOC, OSHA, state labor laws]

✅ Immediate Steps You Should Take:
1. [Document everything - dates, witnesses, evidence]
2. [Report to appropriate authority - HR, supervisor, external agency]
3. [Protect yourself - safety measures if needed]
4. [Know your rights - cannot be retaliated against]

🚨 Critical Safety Information:
[If immediate danger exists, emphasize: call 911, leave situation, emergency contacts]

📞 Resources & Support:
• HR Hotline: [if workplace issue]
• EEOC: 1-800-669-4000 (discrimination/harassment)
• OSHA: 1-800-321-6742 (safety violations)
• National Domestic Violence Hotline: 1-800-799-7233
• Local authorities: 911 (immediate danger)

🔒 Confidentiality Note:
[Explain privacy, reporting requirements, next steps]

**FLAG AS CRITICAL if issue involves:**
- Physical/sexual harassment or assault
- Immediate safety danger
- Ongoing discrimination
- Retaliation threats
- Mental health crisis`;

      userContent = question;
    }

    // Call Lovable AI
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add conversation history for text mode
    if (mode === "text" && conversationHistory) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        });
      });
    }

    // Add user message
    if (mode === "photo") {
      messages.push({
        role: "user",
        content: userContent
      });
    } else {
      messages.push({
        role: "user",
        content: userContent
      });
    }

    console.log("Calling Lovable AI...");

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log("VVFI analysis completed successfully");

    // Detect critical issues in ethical mode
    const critical = mode === "ethical" && (
      analysis.toLowerCase().includes("critical") ||
      analysis.toLowerCase().includes("immediate danger") ||
      analysis.toLowerCase().includes("call 911") ||
      analysis.toLowerCase().includes("assault")
    );

    // Estimate severity and confidence
    let severity = "Moderate";
    let confidence = 0.85;

    if (mode === "photo") {
      if (analysis.toLowerCase().includes("critical")) severity = "Critical";
      else if (analysis.toLowerCase().includes("high")) severity = "High";
      else if (analysis.toLowerCase().includes("low")) severity = "Low";
      confidence = 0.80;
    } else if (mode === "text") {
      confidence = 0.90;
    } else if (mode === "ethical") {
      severity = critical ? "CRITICAL" : "Moderate";
      confidence = 0.95;
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        critical,
        severity,
        confidence
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('VVFI Instructor error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
