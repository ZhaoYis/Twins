import { NextRequest, NextResponse } from "next/server";
import { db, feedbacks } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const createFeedbackSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  content: z.string().min(10, "反馈内容至少需要10个字符").max(2000, "反馈内容不能超过2000个字符"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(ip, "feedback");
    if (!rl.allowed) return rateLimitResponse(rl);

    const body = await request.json();
    const validatedData = createFeedbackSchema.parse(body);

    const [newFeedback] = await db
      .insert(feedbacks)
      .values({
        email: validatedData.email,
        content: validatedData.content,
      })
      .returning();

    return NextResponse.json(
      { message: "反馈提交成功", feedback: newFeedback },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating feedback:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "提交反馈失败,请稍后重试" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
