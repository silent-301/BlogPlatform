import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const posts = await getCollection("posts");

    let post;
    if (ObjectId.isValid(id)) {
      post = await posts.findOne({ _id: new ObjectId(id) });
    }

    if (!post) {
      post = await posts.findOne({ slug: id });
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    const userId = session.id;
    const likes: string[] = (post.likes as string[]) || [];
    const userIndex = likes.indexOf(userId);

    let updatedLikes: string[];
    let action: "liked" | "unliked";

    if (userIndex > -1) {
      updatedLikes = likes.filter((_, i) => i !== userIndex);
      action = "unliked";
    } else {
      updatedLikes = [...likes, userId];
      action = "liked";
    }

    await posts.updateOne(
      { _id: post._id },
      { $set: { likes: updatedLikes } }
    );

    return NextResponse.json({
      success: true,
      data: {
        action,
        likesCount: updatedLikes.length,
        isLiked: action === "liked",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
