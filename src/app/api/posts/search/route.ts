import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: { posts: [], total: 0 },
      });
    }

    const posts = await getCollection("posts");

    const searchQuery = {
      status: "published",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    };

    const results = await posts
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const enrichedPosts = results.map((post) => ({
      ...post,
      _id: post._id.toString(),
      authorId: post.authorId.toString(),
      createdAt: post.createdAt?.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: { posts: enrichedPosts, total: enrichedPosts.length },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
