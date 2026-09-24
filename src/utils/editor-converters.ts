/**
 * Lightweight HTML <-> Markdown converter for Blog Content Editor
 */

export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Code blocks: ```lang\ncode\n```
  html = html.replace(/```([\s\S]*?)```/g, (_match, p1) => {
    return `<pre><code>${escapeHtml(p1.trim())}</code></pre>`;
  });

  // Blockquotes: > quote
  html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

  // Headings
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Horizontal Rule
  html = html.replace(/^---$/gim, "<hr />");

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/___(.*?)___/g, "<strong><em>$1</em></strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full h-auto" />');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>');

  // Lists: Bullet list lines
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, "<ul>$1</ul>");
  // Clean up nested <ul> tags from multiple <li> replacements
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Lists: Numbered list lines
  html = html.replace(/^\s*\d+\.\s+(.*)$/gim, "<oli>$1</oli>");
  html = html.replace(/(<oli>[\s\S]*?<\/oli>)/gim, "<ol>$1</ol>");
  html = html.replace(/<oli>/g, "<li>").replace(/<\/oli>/g, "</li>");
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  // Paragraphs
  const paragraphs = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<table")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .filter(Boolean);

  return paragraphs.join("\n\n");
}

export function htmlToMarkdown(html: string): string {
  if (!html) return "";

  let md = html;

  // Code blocks
  md = md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (_m, p1) => `\n\`\`\`\n${unescapeHtml(p1.trim())}\n\`\`\`\n`);

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, p1) => `\n> ${p1.trim()}\n`);

  // Bold & Italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, "**$2**");
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, "*$2*");
  md = md.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, "_$1_");

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");

  // Horizontal Rule
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, "![$1]($2)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, p1) => {
    return "\n" + p1.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n").trim() + "\n";
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, p1) => {
    let index = 1;
    return "\n" + p1.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => `${index++}. $1\n`).trim() + "\n";
  });

  // Paragraphs & Line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n");

  // Clean extra tags and empty lines
  md = md.replace(/<[^>]+>/g, "");
  md = unescapeHtml(md);
  md = md.replace(/\n{3,}/g, "\n\n").trim();

  return md;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
