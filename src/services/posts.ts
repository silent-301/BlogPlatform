export async function fetchPosts(
  params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}
) {
  const { page = 1, limit = 10, status = "published" } = params;
  const res = await fetch(
    `/api/posts?page=${page}&limit=${limit}&status=${status}`
  );
  return res.json();
}

export async function fetchPost(id: string) {
  const res = await fetch(`/api/posts/${id}`);
  return res.json();
}

export async function createPost(data: {
  title: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  status?: "draft" | "published";
}) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    content?: string;
    coverImage?: string;
    tags?: string[];
    status?: "draft" | "published";
  }
) {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePost(id: string) {
  const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
  return res.json();
}

export async function searchPosts(query: string) {
  const res = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function fetchComments(postId: string) {
  const res = await fetch(`/api/posts/${postId}/comments`);
  return res.json();
}

export async function addComment(postId: string, content: string) {
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function toggleLike(postId: string) {
  const res = await fetch(`/api/posts/${postId}/likes`, { method: "POST" });
  return res.json();
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  return res.json();
}
