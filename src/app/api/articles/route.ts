import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, articles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createArticleSchema } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.userId, session.user.id))
      .orderBy(articles.createdAt);

    return NextResponse.json({ articles: userArticles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createArticleSchema.parse(body);

    const [newArticle] = await db
      .insert(articles)
      .values({
        userId: session.user.id,
        title: validatedData.title,
        content: validatedData.content,
        sourceType: validatedData.sourceType,
        sourceUrl: validatedData.sourceUrl,
      })
      .returning();

    return NextResponse.json({ article: newArticle }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("id");

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
