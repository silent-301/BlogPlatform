import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const SYSTEM_PROMPTS: Record<string, string> = {
  description: `You are a blog writing assistant. Generate a compelling, engaging blog description/summary (2-3 sentences) based on the provided title and content snippet. Make it intriguing so readers want to click and read the full post. Return only the description text.`,
  improve: `You are a blog writing assistant. Take the provided text and rewrite it to be more engaging, clear, and professional. Fix any grammar issues, improve sentence flow, and enhance readability while keeping the original meaning and structure. Return only the improved text. Do not add introductions or conclusions.`,
  expand: `You are a blog writing assistant. Take the provided text and expand on it by adding relevant details, examples, and deeper explanations. Make the content more comprehensive and informative while keeping the original topic. Return only the expanded text.`,
  tags: `You are a blog writing assistant. Generate 5 relevant tags for the blog post based on the title and content. Return only comma-separated tags, no quotes or extra text.`,
};

function cleanContent(html: string): string {
  let text = html;

  // Remove base64 image data
  text = text.replace(/data:image\/[^;]+;base64,[^\s"'>]*/g, "");

  // Remove entire img tags with all attributes
  text = text.replace(/<img[^>]*>/g, "");

  // Remove markdown images
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "");

  // Remove any src URLs (image or not) since they may contain filenames
  text = text.replace(/src\s*=\s*["'][^"']*["']/g, "");

  // Remove any URL pointing to image files
  text = text.replace(/https?:\/\/\S*?(png|jpg|jpeg|gif|webp|svg|bmp|ico)\S*/gi, "");

  // Remove any path-like reference to images
  text = text.replace(/\/\S*?(png|jpg|jpeg|gif|webp|svg|bmp|ico)\S*/gi, "");

  // Remove standalone image filenames anywhere
  text = text.replace(/[a-zA-Z0-9_.-]*\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)/gi, "");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, " ");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text.slice(0, 5000);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "author") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mode, title, content, prompt } = body;

    if (!mode || !SYSTEM_PROMPTS[mode]) {
      return NextResponse.json(
        { success: false, error: "Invalid mode" },
        { status: 400 }
      );
    }

    const cleanTitle = title ? cleanContent(title) : "";
    const cleanText = content ? cleanContent(content) : "";

    if (mode === "improve" || mode === "expand") {
      if (!cleanText && !prompt) {
        return NextResponse.json(
          { success: false, error: "Content is empty. Write some text in the editor first." },
          { status: 400 }
        );
      }
    }

    let userMessage: string;
    if (prompt) {
      userMessage = cleanContent(prompt);
    } else {
      userMessage = `Title: ${cleanTitle || "Untitled"}\nContent: ${cleanText}`;
    }

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[mode] },
        { role: "user", content: userMessage },
      ],
      max_tokens: mode === "tags" ? 50 : mode === "expand" ? 1000 : 500,
      temperature: 0.7,
    });

    const generated = response.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      success: true,
      data: { generated, mode },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: `AI generation failed: ${message}` },
      { status: 500 }
    );
  }
}
