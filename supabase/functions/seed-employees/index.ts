import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const employees = [
  { employee_number: "100000", password: "pass100000", name: "Maria Leonora", department: "Management", position: "CEO/President" },
  { employee_number: "200001", password: "pass200001", name: "Juan Dela Cruz", department: "Operations", position: "Chief Operating Officer (COO)" },
  { employee_number: "200002", password: "pass200002", name: "Elena Rossi", department: "Operations", position: "VP of Production" },
  { employee_number: "200003", password: "pass200003", name: "Ricardo Gomez", department: "Operations", position: "Director of Supply Chain Mgt" },
  { employee_number: "200004", password: "pass200004", name: "Sarah Jenkins", department: "Operations", position: "Director of Procurement" },
  { employee_number: "300001", password: "pass300001", name: "Chen Wei", department: "Finance", position: "Chief Financial Officer (CFO)" },
  { employee_number: "300002", password: "pass300002", name: "Linda Thompson", department: "Finance", position: "VP of Accounting" },
  { employee_number: "300003", password: "pass300003", name: "Marcus Aurelius", department: "Finance", position: "VP of Human Resources (HR)" },
  { employee_number: "300004", password: "pass300004", name: "Atty. Sofia Velasco", department: "Finance", position: "General Counsel (Legal)" },
  { employee_number: "400001", password: "pass400001", name: "Jordan Smith", department: "Marketing/Sales", position: "Chief Revenue Officer (CRO)" },
  { employee_number: "400002", password: "pass400002", name: "Amara Okafor", department: "Marketing/Sales", position: "VP of Marketing" },
  { employee_number: "400003", password: "pass400003", name: "David Miller", department: "Marketing/Sales", position: "VP of Sales" },
  { employee_number: "400004", password: "pass400004", name: "Chloe Tan", department: "Marketing/Sales", position: "Director of Customer Service" },
  { employee_number: "500001", password: "pass500001", name: "Dr. Aris Thorne", department: "R&D", position: "Chief Technology Officer (CTO)" },
  { employee_number: "500002", password: "pass500002", name: "Yuki Tanaka", department: "R&D", position: "VP of Development" },
  { employee_number: "500003", password: "pass500003", name: "Cedric Rivera", department: "R&D", position: "IT Director" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: string[] = [];

    for (const emp of employees) {
      const email = `${emp.employee_number}@projectflow.app`;

      // Check if user already exists by looking up profile
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("employee_number", emp.employee_number)
        .maybeSingle();

      if (existing) {
        results.push(`${emp.employee_number} (${emp.name}) — already exists`);
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: emp.password,
        email_confirm: true,
        user_metadata: { full_name: emp.name },
      });

      if (authError) {
        results.push(`${emp.employee_number} — ERROR: ${authError.message}`);
        continue;
      }

      // Update the auto-created profile with employee fields
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          employee_number: emp.employee_number,
          department: emp.department,
          position: emp.position,
          display_name: emp.name,
        })
        .eq("user_id", authData.user.id);

      if (profileError) {
        results.push(`${emp.employee_number} — user created but profile update failed: ${profileError.message}`);
      } else {
        results.push(`${emp.employee_number} (${emp.name}) — created successfully`);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
