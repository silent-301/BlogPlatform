import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { validatePost } from "@/models/Post";
import { slugWithId } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const users = await getCollection("users");
    const author = await users
      .findOne({ _id: post.authorId })
      .then((u) => (u ? { ...u, password: undefined } : null));

    await posts.updateOne(
      { _id: post._id },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        _id: post._id.toString(),
        authorId: post.authorId.toString(),
        author,
        createdAt: post.createdAt?.toISOString(),
        updatedAt: post.updatedAt?.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "author") {
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

    if (post.authorId.toString() !== session.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own posts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, coverImage, tags, status } = body;

    const validation = validatePost({ title, content, status });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (title) {
      updateData.title = title.trim();
      updateData.slug = slugWithId(title.trim(), post._id.toString());
    }
    if (content !== undefined) updateData.content = content.trim();
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;

    await posts.updateOne({ _id: post._id }, { $set: updateData });

    return NextResponse.json({
      success: true,
      data: { ...post, ...updateData, _id: post._id.toString() },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "author") {
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

    if (post.authorId.toString() !== session.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own posts" },
        { status: 403 }
      );
    }

    const comments = await getCollection("comments");
    await comments.deleteMany({ postId: post._id });

    await posts.deleteOne({ _id: post._id });

    return NextResponse.json({
      success: true,
      data: { message: "Post deleted successfully" },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
