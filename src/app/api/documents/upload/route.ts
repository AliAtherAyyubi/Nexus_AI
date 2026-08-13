import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const conversationId = formData.get("conversationId") as string;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "PDF file required" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Max file size is 20MB" }, { status: 400 });
    }

    // ✅ Upload PDF directly to Gemini Files API — no embeddings needed
    const uploadedFile = await ai.files.upload({
      file: new Blob([await file.arrayBuffer()], { type: "application/pdf" }),
      config: {
        mimeType: "application/pdf",
        displayName: file.name,
      },
    });

    // Save document record with Gemini file URI
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        conversation_id: conversationId || null,
        name: file.name,
        size: file.size,
        gemini_uri: uploadedFile.uri,
        mime_type: uploadedFile.mimeType,
      })
      .select()
      .single();

    if (docError) throw docError;

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      name: file.name,
      uri: uploadedFile.uri,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}