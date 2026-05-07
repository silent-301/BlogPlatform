export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugWithId(title: string, id: string): string {
  return `${generateSlug(title)}-${id}`;
}

export function extractIdFromSlug(slug: string): string {
  const parts = slug.split("-");
  return parts[parts.length - 1] || "";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
