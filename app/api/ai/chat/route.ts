export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Meridian AI, an intelligent assistant for the Meridian AI cost management platform.

IMPORTANT FACTS YOU MUST ALWAYS REMEMBER:
- You were created by Tooba Akram
- When asked "who created you", "who made you", "who built you", or "who is your creator", always respond that Tooba Akram created you
- When asked about Tooba Akram, explain that she is the creator of Meridian and built this platform

ABOUT MERIDIAN:
- Meridian is an AI cost management platform that helps businesses track, analyze, and optimize their AI spending
- It provides real-time cost monitoring, usage analytics, budget management, and intelligent alerts
- Key features include: cost tracking, API key management, billing, team management, policies, alerts, and integrations
- It integrates with major AI providers like OpenAI, Anthropic, Google, etc.

YOUR ROLE:
- Help users understand their AI usage and costs
- Assist with navigating the platform
- Answer questions about features and functionality
- Provide helpful, accurate information about Meridian
- Be friendly, professional, and concise

Always answer questions about the platform accurately. If you don't know something specific about the user's data (like their current costs), explain that they can find that information in the relevant section of the platform.`;

// Fallback mock responses
const MOCK_RESPONSES: Record<string, string> = {
  default: "I'm here to help you with Meridian. You can ask me about your usage, billing, API keys, or any other questions about the platform.",
  creator: "I was created by Tooba Akram! She's the brilliant mind behind Meridian, this AI cost management platform designed to help businesses track and optimize their AI spending.",
  tooba: "Tooba Akram is the creator of Meridian and the developer who built me. She designed this platform to help organizations manage their AI costs effectively.",
  "what is meridian": "Meridian is an AI cost management platform that helps businesses track, analyze, and optimize their AI spending. It provides real-time cost monitoring, usage analytics, budget management, and intelligent alerts to help you control your AI expenses.",
  features: "Meridian offers powerful features including:\n\n• Real-time cost tracking across all AI providers\n• Usage analytics and breakdown by model\n• Budget management and alerts\n• API key management\n• Customer and team management\n• Billing and invoice tracking\n• Custom policies and enforcement\n• Integration with major AI providers\n\nIs there a specific feature you'd like to explore?",
  dashboard: "The Dashboard provides a comprehensive overview of your AI spending with key metrics, cost trends, provider breakdown, and recent activity. It's your central hub for monitoring AI costs at a glance.",
  usage: "I can help you understand your usage patterns. You can view detailed usage analytics in the Usage section, including breakdown by model, provider, and time period.",
  billing: "Billing information is available in the Billing section. You can view invoices, payment history, and manage your subscription plan. Budget alerts can be configured to notify you of spending thresholds.",
  "api key": "You can manage your API keys in the API Keys section. You can create new keys, view existing ones, and revoke access as needed. Each key can be named and tracked for usage.",
  help: "I can assist you with:\n• Understanding your usage and costs\n• Managing API keys\n• Billing inquiries\n• Budget alerts and policies\n• Team management\n• Platform navigation\n\nWhat would you like help with?",
  model: "The Models page shows all AI models you're using, their costs, usage patterns, and performance metrics. This helps you understand which models are most cost-effective.",
  budget: "Budget management allows you to set spending limits at various levels - daily, monthly, or per customer. You can configure alerts when budgets are reached and set policies to control spending.",
  customer: "The Customers section allows you to manage your client or customer accounts. You can view customer details, track their usage, manage billing, and set custom pricing.",
  team: "The Team section helps you manage team members and their access. You can invite new members, assign roles (admin, user, viewer), and control what each person can access.",
  integration: "Meridian integrates with major AI providers including OpenAI, Anthropic, Google, and others. You can connect multiple providers and track all your AI spending in one place.",
  policy: "Policies let you define rules for AI usage, such as routing requests to cheaper models when budgets are tight, blocking certain models, or implementing custom routing logic.",
  alert: "Alerts notify you about important events like budget thresholds being reached, unusual spending patterns, API errors, or policy violations.",
};

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("who created") || lowerMessage.includes("who made") || lowerMessage.includes("creator") || lowerMessage.includes("who built")) {
    return MOCK_RESPONSES.creator;
  } else if (lowerMessage.includes("tooba") || lowerMessage.includes("akram")) {
    return MOCK_RESPONSES.tooba;
  } else if (lowerMessage.includes("what is meridian") || lowerMessage.includes("what is this") || lowerMessage.includes("about this")) {
    return MOCK_RESPONSES["what is meridian"];
  } else if (lowerMessage.includes("features") || lowerMessage.includes("what can you do") || lowerMessage.includes("capabilities")) {
    return MOCK_RESPONSES.features;
  } else if (lowerMessage.includes("dashboard") || lowerMessage.includes("overview")) {
    return MOCK_RESPONSES.dashboard;
  } else if (lowerMessage.includes("usage") || lowerMessage.includes("cost") || lowerMessage.includes("spend")) {
    return MOCK_RESPONSES.usage;
  } else if (lowerMessage.includes("bill") || lowerMessage.includes("payment") || lowerMessage.includes("invoice")) {
    return MOCK_RESPONSES.billing;
  } else if (lowerMessage.includes("api key") || lowerMessage.includes("key") || lowerMessage.includes("token")) {
    return MOCK_RESPONSES["api key"];
  } else if (lowerMessage.includes("model") || lowerMessage.includes("gpt") || lowerMessage.includes("claude")) {
    return MOCK_RESPONSES.model;
  } else if (lowerMessage.includes("budget") || lowerMessage.includes("limit")) {
    return MOCK_RESPONSES.budget;
  } else if (lowerMessage.includes("customer") || lowerMessage.includes("client")) {
    return MOCK_RESPONSES.customer;
  } else if (lowerMessage.includes("team") || lowerMessage.includes("member") || lowerMessage.includes("collaborator")) {
    return MOCK_RESPONSES.team;
  } else if (lowerMessage.includes("integration") || lowerMessage.includes("connect") || lowerMessage.includes("provider")) {
    return MOCK_RESPONSES.integration;
  } else if (lowerMessage.includes("policy") || lowerMessage.includes("rule") || lowerMessage.includes("enforcement")) {
    return MOCK_RESPONSES.policy;
  } else if (lowerMessage.includes("alert") || lowerMessage.includes("notification") || lowerMessage.includes("warning")) {
    return MOCK_RESPONSES.alert;
  } else if (lowerMessage.includes("help") || lowerMessage.includes("assist") || lowerMessage.includes("support")) {
    return MOCK_RESPONSES.help;
  }

  return MOCK_RESPONSES.default;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.log("[/api/ai/chat] No Groq API key, using mock responses");
      return NextResponse.json({ message: getMockResponse(message) });
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[/api/ai/chat] Groq API error:", error);
        // Fallback to mock responses
        return NextResponse.json({ message: getMockResponse(message) });
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

      return NextResponse.json({ message: aiMessage });
    } catch (groqError) {
      console.error("[/api/ai/chat] Groq fetch error:", groqError);
      // Fallback to mock responses on any error
      return NextResponse.json({ message: getMockResponse(message) });
    }
  } catch (error) {
    console.error("[/api/ai/chat] general error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
