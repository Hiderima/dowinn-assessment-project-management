// Edge function: AI chatbot scoped to tasks, statuses, assignees, dates, and departments
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

    // Service role: read live snapshot of tasks/projects/profiles
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [{ data: tasks }, { data: profiles }, { data: projects }] = await Promise.all([
      supabase.from("tasks").select("title, status, priority, assignee, department, start_date, end_date, start_time, end_time, project_id"),
      supabase.from("profiles").select("display_name, department, position"),
      supabase.from("projects").select("id, name"),
    ]);

    const projectMap = new Map((projects || []).map(p => [p.id, p.name]));

    // Build compact, fresh context
    const taskLines = (tasks || []).map(t => {
      const dates = t.start_date || t.end_date
        ? ` | ${t.start_date || "?"}${t.start_time ? " " + t.start_time : ""} → ${t.end_date || "?"}${t.end_time ? " " + t.end_time : ""}`
        : "";
      const proj = projectMap.get(t.project_id) || "n/a";
      return `- "${t.title}" | project: ${proj} | status: ${t.status} | priority: ${t.priority} | assignee: ${t.assignee || "unassigned"} | dept: ${t.department || "n/a"}${dates}`;
    }).join("\n");

    const deptMembers: Record<string, string[]> = {};
    (profiles || []).forEach(p => {
      const dept = p.department || "Unassigned";
      if (!deptMembers[dept]) deptMembers[dept] = [];
      deptMembers[dept].push(`${p.display_name || "Unknown"}${p.position ? ` (${p.position})` : ""}`);
    });
    const deptLines = Object.entries(deptMembers)
      .map(([d, members]) => `- ${d} (${members.length}): ${members.join(", ")}`)
      .join("\n");

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `You are a focused assistant for the Dowinn Project Management app. Today is ${today}.

You ONLY answer questions about:
1. **Tasks** — title, status (done / in_progress / todo), priority, assignee, department, start/end dates and times, and which project they belong to.
2. **Departments** — which departments exist, who belongs to them, and progress (counts of done / ongoing / not started) per department or compared across departments.
3. **People** — what tasks are assigned to whom, and progress on those tasks.

If the user asks anything outside these topics, politely refuse and remind them what you can help with.

Format responses in **markdown**. Use **bold** for names, statuses, and key facts. Use bullet lists for multiple items. Keep answers short and direct. Always base answers on the live data below.

=== TASKS (${(tasks || []).length}) ===
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
