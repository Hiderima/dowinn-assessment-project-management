// Edge function: AI chatbot scoped to task statuses + departments
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Use service role to read all tasks/profiles for context
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pull current snapshot of tasks + departments
    const [{ data: tasks }, { data: profiles }] = await Promise.all([
      supabase.from("tasks").select("title, status, assignee, department"),
      supabase.from("profiles").select("display_name, department").not("department", "is", null),
    ]);

    // Build compact context for the model
    const taskLines = (tasks || []).map(t =>
      `- "${t.title}" | status: ${t.status} | assignee: ${t.assignee || "unassigned"} | dept: ${t.department || "n/a"}`
    ).join("\n");

    const deptCounts: Record<string, number> = {};
    (profiles || []).forEach(p => {
      if (p.department) deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
    });
    const deptLines = Object.entries(deptCounts).map(([d, c]) => `- ${d}: ${c} member(s)`).join("\n");

    const systemPrompt = `You are a focused assistant for the Dowinn Project Management app.
You ONLY answer simple questions about:
1. Task status — who has tasks that are "done", "in_progress" (ongoing), or "todo" (not yet started).
2. Departments — which departments exist and who is in them.

If the user asks anything outside these two topics, politely refuse and remind them what you can help with.
Keep answers short and direct. Use the live data below.

=== TASKS ===
${taskLines || "(no tasks)"}

=== DEPARTMENTS ===
${deptLines || "(no departments)"}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace settings." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a reply.";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("task-chat error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
