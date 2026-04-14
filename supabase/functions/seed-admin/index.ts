import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const email = "676767@projectflow.app";
    
    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === email);
    
    if (existing) {
      // Just ensure role exists
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: existing.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      // Update profile
      await supabaseAdmin.from("profiles").update({
        employee_number: "676767",
        display_name: "Admin",
        department: "Administration",
        position: "System Administrator",
      }).eq("user_id", existing.id);
      
      return new Response(JSON.stringify({ success: true, message: "Admin already exists, role ensured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "Admin676767",
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });

    if (authError) throw authError;

    // Update profile
    await supabaseAdmin.from("profiles").update({
      employee_number: "676767",
      display_name: "Admin",
      department: "Administration",
      position: "System Administrator",
    }).eq("user_id", authData.user.id);

    // Assign admin role
    await supabaseAdmin.from("user_roles").insert({
      user_id: authData.user.id,
      role: "admin",
    });

    return new Response(JSON.stringify({ success: true, message: "Admin created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
