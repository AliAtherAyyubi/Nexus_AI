import "server-only";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { prompt, conversationId, pdfUri, model } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
      });
    }

    // ✅ Check if conversation has an uploaded PDF
    let contents: object[] = [{ text: prompt }];

    if (pdfUri) {
  contents = [
    {
      text: `You are a helpful assistant. Answer the user's question based on the provided document. If the answer is not in the document, say so clearly.\n\nUser question: ${prompt}`,
    },
    {
      fileData: {
        fileUri: pdfUri,
        mimeType: "application/pdf",
      },
    },
  ];
} else if (conversationId) {
  // Fallback: check DB for previously uploaded doc in this conversation
  try {
    const cookieStore = await cookies();

    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: docs } = await supabase
        .from("documents")
        .select("gemini_uri, mime_type")
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (docs && docs.length > 0 && docs[0].gemini_uri) {
        contents = [
          {
            text: `You are a helpful assistant. Answer the user's question based on the provided document.\n\nUser question: ${prompt}`,
          },
          {
            fileData: {
              fileUri: docs[0].gemini_uri,
              mimeType: docs[0].mime_type ?? "application/pdf",
            },
          },
        ];
      }
    }
  } catch (err) {
    console.error("Doc fetch error (non-fatal):", err);
  }
}

    const stream = await ai.models.generateContentStream({
      model: model ?? "gemini-3.5-flash-lite",
      contents: [{ role: "user", parts: contents }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.text ?? "";
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
    });
  }
}
