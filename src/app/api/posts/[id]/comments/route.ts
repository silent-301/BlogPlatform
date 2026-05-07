import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { validateComment } from "@/models/Comment";
import { ObjectId } from "mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let postId: ObjectId;

    if (ObjectId.isValid(id)) {
      postId = new ObjectId(id);
    } else {
      const posts = await getCollection("posts");
      const post = await posts.findOne({ slug: id });
      if (!post) {
        return NextResponse.json(
          { success: false, error: "Post not found" },
          { status: 404 }
        );
      }
      postId = post._id;
    }

    const comments = await getCollection("comments");
    const commentsData = await comments
      .find({ postId })
      .sort({ createdAt: -1 })
      .toArray();

    const users = await getCollection("users");
    const userIds = commentsData.map((c) => c.userId);
    const authors = await users
      .find({ _id: { $in: userIds } })
      .project({ password: 0 })
      .toArray();

    const usersMap = new Map();
    authors.forEach((a) => usersMap.set(a._id.toString(), a));

    const enrichedComments = commentsData.map((comment) => ({
      ...comment,
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId.toString(),
      user: usersMap.get(comment.userId.toString()) || null,
      createdAt: comment.createdAt?.toISOString(),
      updatedAt: comment.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: enrichedComments,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
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
    let postId: ObjectId;

    if (ObjectId.isValid(id)) {
      postId = new ObjectId(id);
    } else {
      const posts = await getCollection("posts");
      const post = await posts.findOne({ slug: id });
      if (!post) {
        return NextResponse.json(
          { success: false, error: "Post not found" },
          { status: 404 }
        );
      }
      postId = post._id;
    }

    const body = await request.json();
    const { content } = body;

    const validation = validateComment({ content, postId });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    const comments = await getCollection("comments");
    const newComment = {
      postId,
      userId: new ObjectId(session.id),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await comments.insertOne(newComment);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newComment,
          _id: result.insertedId.toString(),
          postId: newComment.postId.toString(),
          userId: newComment.userId.toString(),
          user: {
            id: session.id,
            name: session.name,
            email: session.email,
          },
          createdAt: newComment.createdAt.toISOString(),
          updatedAt: newComment.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
