"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, ExternalLink, Plus, Zap } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "llm" | "billing" | "alerts" | "observability";
  connected: boolean;
  logo: string;         // emoji stand-in
  docsUrl: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "openai",     name: "OpenAI",        description: "GPT-4o, GPT-4o Mini, o1 and more",          category: "llm",           connected: true,  logo: "🤖", docsUrl: "https://platform.openai.com/docs" },
  { id: "anthropic",  name: "Anthropic",     description: "Claude Opus, Sonnet, Haiku",                 category: "llm",           connected: true,  logo: "🔮", docsUrl: "https://docs.anthropic.com" },
  { id: "google",     name: "Google AI",     description: "Gemini 2.0 Flash, Gemini 2.5 Pro",           category: "llm",           connected: false, logo: "✨", docsUrl: "https://ai.google.dev/docs" },
  { id: "groq",       name: "Groq",          description: "Ultra-fast inference via Groq Cloud",         category: "llm",           connected: false, logo: "⚡", docsUrl: "https://console.groq.com/docs" },
  { id: "mistral",    name: "Mistral AI",    description: "Mistral Large, Mixtral 8x7B",                 category: "llm",           connected: false, logo: "🌊", docsUrl: "https://docs.mistral.ai" },
  { id: "stripe",     name: "Stripe",        description: "Meter-based billing and invoicing",           category: "billing",       connected: true,  logo: "💳", docsUrl: "https://stripe.com/docs" },
  { id: "resend",     name: "Resend",        description: "Transactional email for alert notifications", category: "alerts",        connected: true,  logo: "📧", docsUrl: "https://resend.com/docs" },
  { id: "slack",      name: "Slack",         description: "Alert notifications to Slack channels",       category: "alerts",        connected: false, logo: "💬", docsUrl: "https://api.slack.com" },
  { id: "pagerduty",  name: "PagerDuty",     description: "On-call alerting for critical breaches",      category: "alerts",        connected: false, logo: "🚨", docsUrl: "https://developer.pagerduty.com" },
  { id: "datadog",    name: "Datadog",       description: "Export metrics and traces to Datadog",        category: "observability", connected: false, logo: "🐶", docsUrl: "https://docs.datadoghq.com" },
  { id: "langfuse",   name: "Langfuse",      description: "LLM observability and tracing",               category: "observability", connected: false, logo: "🔍", docsUrl: "https://langfuse.com/docs" },
  { id: "helicone",   name: "Helicone",      description: "LLM proxy and analytics",                     category: "observability", connected: false, logo: "📊", docsUrl: "https://docs.helicone.ai" },
];

const categoryLabels: Record<Integration["category"], string> = {
  llm:           "LLM Providers",
  billing:       "Billing",
  alerts:        "Alerts & Notifications",
  observability: "Observability",
};

const categoryColors: Record<Integration["category"], string> = {
  llm:           "bg-chart-blue/10 text-chart-blue",
  billing:       "bg-chart-green/10 text-chart-green",
  alerts:        "bg-chart-orange/10 text-chart-orange",
  observability: "bg-chart-purple/10 text-chart-purple",
};

export default function IntegrationsPage() {
  const [filter, setFilter] = React.useState<Integration["category"] | "all">("all");
  const [connections, setConnections] = React.useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected]))
  );

  const categories = ["all", "llm", "billing", "alerts", "observability"] as const;
  const filtered = filter === "all" ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === filter);
  const connectedCount = Object.values(connections).filter(Boolean).length;

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gradient mb-1">Integrations</h1>
          <p className="text-sm text-meridian-text-muted">
            {connectedCount} of {INTEGRATIONS.length} integrations connected
          </p>
        </div>
      </motion.div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
              filter === cat
                ? "bg-meridian-burgundy/20 text-meridian-burgundy-bright border border-meridian-burgundy/30"
                : "bg-meridian-bg-hover text-meridian-text-muted hover:text-meridian-text-secondary border border-transparent"
            )}
          >
            {cat === "all" ? "All" : categoryLabels[cat as Integration["category"]]}
          </button>
        ))}
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration, i) => {
          const isConnected = connections[integration.id];
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-card-hover transition-all duration-300 h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-meridian-bg-hover flex items-center justify-center text-xl">
                        {integration.logo}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-meridian-text-primary">{integration.name}</p>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", categoryColors[integration.category])}>
                          {categoryLabels[integration.category]}
                        </span>
                      </div>
                    </div>
                    {isConnected && (
                      <CheckCircle2 className="w-4 h-4 text-chart-green shrink-0 mt-0.5" />
                    )}
                  </div>

                  <p className="text-xs text-meridian-text-muted leading-relaxed flex-1 mb-4">
                    {integration.description}
                  </p>

                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setConnections((prev) => ({ ...prev, [integration.id]: false }))}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setConnections((prev) => ({ ...prev, [integration.id]: true }))}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Connect
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer" aria-label="Documentation">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Shell>
  );
}
