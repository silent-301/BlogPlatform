import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { validatePost } from "@/models/Post";
import { generateSlug, slugWithId } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "published";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query: Record<string, unknown> = { status: "published" };

    if (session && session.role === "author") {
      if (status === "all") {
        query = { authorId: new ObjectId(session.id) };
      } else if (status === "draft" || status === "published") {
        query = { authorId: new ObjectId(session.id), status };
      }
    }

    const posts = await getCollection("posts");
    const totalPosts = await posts.countDocuments(query);

    const postsData = await posts
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const authorIds = postsData.map((p) => p.authorId as ObjectId);
    const users = await getCollection("users");
    const authors = await users
      .find({ _id: { $in: authorIds } })
      .project({ password: 0 })
      .toArray();

    const authorsMap = new Map();
    authors.forEach((a) => authorsMap.set(a._id.toString(), a));

    const enrichedPosts = postsData.map((post) => ({
      ...post,
      _id: post._id.toString(),
      authorId: post.authorId.toString(),
      author: authorsMap.get(post.authorId.toString()) || null,
      createdAt: post.createdAt?.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        posts: enrichedPosts,
        pagination: {
          total: totalPosts,
          page,
          limit,
          totalPages: Math.ceil(totalPosts / limit),
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.role !== "author") {
      return NextResponse.json(
        { success: false, error: "Only authors can create posts" },
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

    const posts = await getCollection("posts");
    const newPost = {
      title: title.trim(),
      slug: "",
      content: content.trim(),
      coverImage: coverImage || null,
      authorId: new ObjectId(session.id),
      status: status || "draft",
      tags: tags || [],
      likes: [],
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await posts.insertOne(newPost);

    const slug = slugWithId(newPost.title, result.insertedId.toString());
    await posts.updateOne(
      { _id: result.insertedId },
      { $set: { slug } }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId.toString(),
          ...newPost,
          slug,
          createdAt: newPost.createdAt.toISOString(),
          updatedAt: newPost.updatedAt.toISOString(),
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
