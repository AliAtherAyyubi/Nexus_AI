import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// GET — fetch all conversations for the logged-in user
export async function GET(req: Request) {
  try {
     const cookieStore = await cookies()
    const supabase =  createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/conversations error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST — create a new conversation for the logged-in user
// ✅ REPLACE entire POST function with this
export async function POST(req: Request) {
  try {

     const cookieStore = await cookies()

    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("POST /api/conversations body:", body);

    // ✅ Always guarantee a non-null title
    const title =
      typeof body?.title === "string" && body.title.trim().length > 0
        ? body.title.trim()
        : "New conversation";

    const { data, error } = await supabase
      .from("conversations")
      .insert({ title, user_id: user.id })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/conversations error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
