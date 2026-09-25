"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Minus,
  Undo2,
  Redo2,
  FileCode,
  Eye,
  FileText,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { htmlToMarkdown, markdownToHtml } from "@/utils/editor-converters";

type ContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  defaultMode?: "visual" | "markdown" | "html";
  onModeChange?: (mode: "visual" | "markdown" | "html") => void;
};

export function ContentEditor({
  value,
  onChange,
  defaultMode = "visual",
  onModeChange,
}: ContentEditorProps) {
  const [mode, setMode] = useState<"visual" | "markdown" | "html">(defaultMode);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string>(value || "");
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);
  const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Saved selection/cursor state to avoid links jumping to top
  const savedRangeRef = useRef<Range | null>(null);
  const savedTextareaSelectionRef = useRef<{ start: number; end: number } | null>(null);

  const isNodeInEditor = (node: Node | null): boolean => {
    if (!node || !visualRef.current) return false;
    if (visualRef.current === node) return true;
    return visualRef.current.contains(
      node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode
    );
  };

  const saveSelection = () => {
    if (typeof window === "undefined") return;

    if (mode === "visual") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (isNodeInEditor(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
        }
      }
    } else if (mode === "markdown" && markdownTextareaRef.current) {
      const el = markdownTextareaRef.current;
      savedTextareaSelectionRef.current = {
        start: el.selectionStart,
        end: el.selectionEnd,
      };
    } else if (mode === "html" && htmlTextareaRef.current) {
      const el = htmlTextareaRef.current;
      savedTextareaSelectionRef.current = {
        start: el.selectionStart,
        end: el.selectionEnd,
      };
    }
  };

  const getSelectedText = (): string => {
    saveSelection();
    if (mode === "visual") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && isNodeInEditor(sel.getRangeAt(0).commonAncestorContainer)) {
        return sel.toString().trim();
      }
      if (savedRangeRef.current && isNodeInEditor(savedRangeRef.current.commonAncestorContainer)) {
        return savedRangeRef.current.toString().trim();
      }
      return "";
    } else if (mode === "markdown" && markdownTextareaRef.current) {
      const el = markdownTextareaRef.current;
      const start = savedTextareaSelectionRef.current?.start ?? el.selectionStart;
      const end = savedTextareaSelectionRef.current?.end ?? el.selectionEnd;
      return el.value.substring(start, end).trim();
    } else if (mode === "html" && htmlTextareaRef.current) {
      const el = htmlTextareaRef.current;
      const start = savedTextareaSelectionRef.current?.start ?? el.selectionStart;
      const end = savedTextareaSelectionRef.current?.end ?? el.selectionEnd;
      return el.value.substring(start, end).trim();
    }
    return "";
  };

  // Sync internal state when external value changes without resetting cursor if actively editing
  useEffect(() => {
    setHtmlContent(value || "");
    if (visualRef.current && mode === "visual") {
      const current = visualRef.current.innerHTML;
      const target = value || "";
      if (current !== target && (document.activeElement !== visualRef.current || !current.trim())) {
        visualRef.current.innerHTML = target;
      }
    }
  }, [value, mode]);

  const switchMode = (newMode: "visual" | "markdown" | "html") => {
    if (newMode === mode) return;

    if (mode === "visual") {
      const currentHtml = visualRef.current?.innerHTML || htmlContent;
      setHtmlContent(currentHtml);
      if (newMode === "markdown") {
        setMarkdownContent(htmlToMarkdown(currentHtml));
      }
    } else if (mode === "markdown") {
      const convertedHtml = markdownToHtml(markdownContent);
      setHtmlContent(convertedHtml);
      if (visualRef.current && newMode === "visual") {
        visualRef.current.innerHTML = convertedHtml;
      }
      onChange(convertedHtml);
    } else if (mode === "html") {
      if (visualRef.current && newMode === "visual") {
        visualRef.current.innerHTML = htmlContent;
      }
      onChange(htmlContent);
      if (newMode === "markdown") {
        setMarkdownContent(htmlToMarkdown(htmlContent));
      }
    }

    setMode(newMode);
    onModeChange?.(newMode);
  };

  // Visual Editor Command Executer
  const execCmd = (command: string, arg: string | undefined = undefined) => {
    if (!visualRef.current) return;
    visualRef.current.focus();
    document.execCommand(command, false, arg);
    handleVisualInput();
    saveSelection();
  };

  const handleVisualInput = () => {
    if (!visualRef.current) return;
    const html = visualRef.current.innerHTML;
    setHtmlContent(html);
    onChange(html);
  };

  const insertHtmlAtSavedRange = (html: string) => {
    if (!visualRef.current) return;
    visualRef.current.focus();

    const sel = window.getSelection();
    let range: Range | null = null;

    if (
      savedRangeRef.current &&
      isNodeInEditor(savedRangeRef.current.commonAncestorContainer)
    ) {
      range = savedRangeRef.current;
    } else if (
      sel &&
      sel.rangeCount > 0 &&
      isNodeInEditor(sel.getRangeAt(0).commonAncestorContainer)
    ) {
      range = sel.getRangeAt(0);
    }

    if (range && sel) {
      sel.removeAllRanges();
      sel.addRange(range);
      range.deleteContents();

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const frag = document.createDocumentFragment();
      let node: Node | null = null;
      let lastNode: Node | null = null;
      while ((node = tempDiv.firstChild)) {
        lastNode = frag.appendChild(node);
      }

      range.insertNode(frag);

      if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      }
    } else {
      // Fallback: append to end of editor rather than top
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      while (tempDiv.firstChild) {
        visualRef.current.appendChild(tempDiv.firstChild);
      }
    }

    handleVisualInput();
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMarkdownContent(text);
    const converted = markdownToHtml(text);
    setHtmlContent(converted);
    onChange(converted);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setHtmlContent(text);
    onChange(text);
  };

  // Embedded Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalMode, setLinkModalMode] = useState<"inline" | "card">("inline");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [linkButtonText, setLinkButtonText] = useState("Visit Resource");
  const [linkCategory, setLinkCategory] = useState("Resource");

  const openInsertLink = () => {
    saveSelection();
    const selectedText = getSelectedText();
    setLinkModalMode("inline");
    setLinkTitle(selectedText);
    setLinkUrl("");
    setIsLinkModalOpen(true);
  };

  const openInsertEmbedLink = () => {
    saveSelection();
    const selectedText = getSelectedText();
    setLinkModalMode("card");
    setLinkTitle(selectedText || "Recommended Reading");
    setLinkUrl("");
    setLinkDescription("");
    setLinkButtonText("Explore Resource");
    setLinkCategory("Resource");
    setIsLinkModalOpen(true);
  };

  const handleConfirmInsertLink = () => {
    if (!linkUrl.trim()) return;

    const formattedUrl =
      /^https?:\/\//i.test(linkUrl.trim()) || linkUrl.trim().startsWith("/") || linkUrl.trim().startsWith("#")
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`;

    const displayTitle = linkTitle.trim() || formattedUrl;

    if (linkModalMode === "inline") {
      const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline font-medium cursor-pointer transition-colors">${displayTitle}</a>`;

      if (mode === "visual") {
        insertHtmlAtSavedRange(linkHtml);
      } else if (mode === "markdown") {
        const mdLink = `[${displayTitle}](${formattedUrl})`;
        const start = savedTextareaSelectionRef.current?.start ?? markdownContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? markdownContent.length;
        const before = markdownContent.substring(0, start);
        const after = markdownContent.substring(end);
        const newMarkdown = before + mdLink + after;
        setMarkdownContent(newMarkdown);
        const converted = markdownToHtml(newMarkdown);
        setHtmlContent(converted);
        onChange(converted);

        setTimeout(() => {
          if (markdownTextareaRef.current) {
            markdownTextareaRef.current.focus();
            const pos = start + mdLink.length;
            markdownTextareaRef.current.setSelectionRange(pos, pos);
          }
        }, 10);
      } else {
        const start = savedTextareaSelectionRef.current?.start ?? htmlContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? htmlContent.length;
        const before = htmlContent.substring(0, start);
        const after = htmlContent.substring(end);
        const newHtml = before + linkHtml + after;
        setHtmlContent(newHtml);
        onChange(newHtml);

        setTimeout(() => {
          if (htmlTextareaRef.current) {
            htmlTextareaRef.current.focus();
            const pos = start + linkHtml.length;
            htmlTextareaRef.current.setSelectionRange(pos, pos);
          }
        }, 10);
      }
    } else {
      const cardCategory = linkCategory.trim() || "Resource";
      const cardButton = linkButtonText.trim() || "Visit Resource";
      const cardDesc = linkDescription.trim();

      const embedHtml = `
<div class="my-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 transition-all hover:border-blue-300 not-prose">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div class="space-y-1">
      <span class="inline-block rounded bg-blue-100 px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-700">${cardCategory}</span>
      <h4 class="text-base font-bold text-zinc-900 m-0">
        <a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-zinc-900 hover:text-blue-600 transition-colors cursor-pointer">${displayTitle}</a>
      </h4>
      ${cardDesc ? `<p class="text-xs text-zinc-600 m-0">${cardDesc}</p>` : ""}
    </div>
    <a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 shrink-0 no-underline cursor-pointer">
      <span>${cardButton}</span>
      <span>&rarr;</span>
    </a>
  </div>
</div>
`.trim();

      if (mode === "visual") {
        insertHtmlAtSavedRange(embedHtml + "<p><br></p>");
      } else if (mode === "markdown") {
        const start = savedTextareaSelectionRef.current?.start ?? markdownContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? markdownContent.length;
        const before = markdownContent.substring(0, start);
        const after = markdownContent.substring(end);
        const newMarkdown = before + "\n\n" + embedHtml + "\n\n" + after;
        setMarkdownContent(newMarkdown);
        const converted = markdownToHtml(newMarkdown);
        setHtmlContent(converted);
        onChange(converted);

        setTimeout(() => {
          if (markdownTextareaRef.current) {
            markdownTextareaRef.current.focus();
            const pos = start + embedHtml.length + 4;
            markdownTextareaRef.current.setSelectionRange(pos, pos);
          }
        }, 10);
      } else {
        const start = savedTextareaSelectionRef.current?.start ?? htmlContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? htmlContent.length;
        const before = htmlContent.substring(0, start);
        const after = htmlContent.substring(end);
        const newHtml = before + "\n" + embedHtml + "\n" + after;
        setHtmlContent(newHtml);
        onChange(newHtml);

        setTimeout(() => {
          if (htmlTextareaRef.current) {
            htmlTextareaRef.current.focus();
            const pos = start + embedHtml.length + 2;
            htmlTextareaRef.current.setSelectionRange(pos, pos);
          }
        }, 10);
      }
    }

    setIsLinkModalOpen(false);
  };

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      const defaultAlt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const alt = prompt("Enter Alt Text for SEO & Accessibility:", defaultAlt) || defaultAlt;
      const imgHtml = `<img src="${data.url}" alt="${alt}" class="my-4 rounded-lg max-w-full h-auto" />`;

      if (mode === "visual") {
        insertHtmlAtSavedRange(imgHtml);
      } else if (mode === "markdown") {
        const mdImg = `\n![${alt}](${data.url})\n`;
        const start = savedTextareaSelectionRef.current?.start ?? markdownContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? markdownContent.length;
        const newMarkdown = markdownContent.substring(0, start) + mdImg + markdownContent.substring(end);
        setMarkdownContent(newMarkdown);
        onChange(markdownToHtml(newMarkdown));
      } else {
        const start = savedTextareaSelectionRef.current?.start ?? htmlContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? htmlContent.length;
        const newHtml = htmlContent.substring(0, start) + "\n" + imgHtml + htmlContent.substring(end);
        setHtmlContent(newHtml);
        onChange(newHtml);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error uploading image");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const insertImage = () => {
    saveSelection();
    const url = prompt("Enter Image URL (e.g. https://res.cloudinary.com/... or https://...):");
    if (url) {
      const alt = prompt("Enter Alt Text for SEO & Accessibility:") || "Blog image";
      const imgHtml = `<img src="${url}" alt="${alt}" class="my-4 rounded-lg max-w-full h-auto" />`;
      if (mode === "visual") {
        insertHtmlAtSavedRange(imgHtml);
      } else if (mode === "markdown") {
        const mdImg = `\n![${alt}](${url})\n`;
        const start = savedTextareaSelectionRef.current?.start ?? markdownContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? markdownContent.length;
        const newMarkdown = markdownContent.substring(0, start) + mdImg + markdownContent.substring(end);
        setMarkdownContent(newMarkdown);
        onChange(markdownToHtml(newMarkdown));
      } else {
        const start = savedTextareaSelectionRef.current?.start ?? htmlContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? htmlContent.length;
        const newHtml = htmlContent.substring(0, start) + "\n" + imgHtml + htmlContent.substring(end);
        setHtmlContent(newHtml);
        onChange(newHtml);
      }
    }
  };

  const onImageButtonClick = () => {
    saveSelection();
    const uploadFromFile = window.confirm(
      "Click OK to upload an image directly from your device, or Cancel to enter an image URL."
    );
    if (uploadFromFile) {
      imageInputRef.current?.click();
    } else {
      insertImage();
    }
  };

  const insertVideo = () => {
    saveSelection();
    const url = prompt("Enter YouTube / Video Embed URL (e.g. https://www.youtube.com/embed/...):");
    if (url) {
      const embedHtml = `<div class="aspect-video my-4 w-full overflow-hidden rounded-xl border border-zinc-200"><iframe src="${url}" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>`;
      if (mode === "visual") {
        insertHtmlAtSavedRange(embedHtml);
      } else if (mode === "markdown") {
        const start = savedTextareaSelectionRef.current?.start ?? markdownContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? markdownContent.length;
        const newMarkdown = markdownContent.substring(0, start) + "\n\n" + embedHtml + "\n\n" + markdownContent.substring(end);
        setMarkdownContent(newMarkdown);
        onChange(markdownToHtml(newMarkdown));
      } else {
        const start = savedTextareaSelectionRef.current?.start ?? htmlContent.length;
        const end = savedTextareaSelectionRef.current?.end ?? htmlContent.length;
        const newHtml = htmlContent.substring(0, start) + "\n" + embedHtml + htmlContent.substring(end);
        setHtmlContent(newHtml);
        onChange(newHtml);
      }
    }
  };

  const insertTable = () => {
    saveSelection();
    const tableHtml = `
      <table class="my-4 w-full border-collapse border border-zinc-300 text-sm">
        <thead>
          <tr class="bg-zinc-100">
            <th class="border border-zinc-300 p-2 text-left font-semibold">Model</th>
            <th class="border border-zinc-300 p-2 text-left font-semibold">Parameters</th>
            <th class="border border-zinc-300 p-2 text-left font-semibold">Best Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-zinc-300 p-2">Small LM (SLM)</td>
            <td class="border border-zinc-300 p-2">3B - 7B</td>
            <td class="border border-zinc-300 p-2">On-device, Fast classification</td>
          </tr>
          <tr>
            <td class="border border-zinc-300 p-2">Large LM (LLM)</td>
            <td class="border border-zinc-300 p-2">70B+</td>
            <td class="border border-zinc-300 p-2">Complex reasoning, Multi-step RAG</td>
          </tr>
        </tbody>
      </table>
    `;
    if (mode === "visual") {
      insertHtmlAtSavedRange(tableHtml);
    } else if (mode === "markdown") {
      const start = savedTextareaSelectionRef.current?.start ?? markdownContent.length;
      const end = savedTextareaSelectionRef.current?.end ?? markdownContent.length;
      const newMarkdown = markdownContent.substring(0, start) + "\n\n" + tableHtml + "\n\n" + markdownContent.substring(end);
      setMarkdownContent(newMarkdown);
      onChange(markdownToHtml(newMarkdown));
    } else {
      const start = savedTextareaSelectionRef.current?.start ?? htmlContent.length;
      const end = savedTextareaSelectionRef.current?.end ?? htmlContent.length;
      const newHtml = htmlContent.substring(0, start) + "\n" + tableHtml + htmlContent.substring(end);
      setHtmlContent(newHtml);
      onChange(newHtml);
    }
  };

  const insertSampleTemplate = () => {
    const sample = `
      <h2>1. Understand Your Business Requirements</h2>
      <p>Before selecting an AI model, it is crucial to evaluate your operational constraints, user base, and infrastructure readiness. Different tasks demand different architectures—from fast Small Language Models (SLMs) to enterprise-scale Large Language Models (LLMs).</p>
      
      <h3>Key Performance Evaluation Factors</h3>
      <p>When measuring AI performance in real-world environments, focus on the following dimensions:</p>
      <ul>
        <li><strong>Inference Latency:</strong> How quickly can the model return tokens to the end user?</li>
        <li><strong>Cost per Million Tokens:</strong> Does the budget support continuous multi-turn conversations?</li>
        <li><strong>Accuracy & Domain Precision:</strong> Does the model hallucinate or accurately follow your system prompts?</li>
        <li><strong>Retrieval Augmented Generation (RAG) Compatibility:</strong> Can it seamlessly integrate with external vector databases?</li>
      </ul>

      <blockquote>
        "Choosing the right AI model is not about picking the largest one on the leaderboard; it is about finding the optimal balance between performance, speed, and cost for your specific use case."
      </blockquote>

      <h3>Comparing Model Categories</h3>
      <table class="my-4 w-full border-collapse border border-zinc-300 text-sm">
        <thead>
          <tr class="bg-zinc-100">
            <th class="border border-zinc-300 p-2 text-left font-semibold">Category</th>
            <th class="border border-zinc-300 p-2 text-left font-semibold">Strengths</th>
            <th class="border border-zinc-300 p-2 text-left font-semibold">Ideal Workloads</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-zinc-300 p-2 font-medium">SLMs (Small Language Models)</td>
            <td class="border border-zinc-300 p-2">Ultra-low latency, cost-effective</td>
            <td class="border border-zinc-300 p-2">Edge devices, summaries, chatbots</td>
          </tr>
          <tr>
            <td class="border border-zinc-300 p-2 font-medium">Frontier LLMs</td>
            <td class="border border-zinc-300 p-2">Deep reasoning, multi-modal</td>
            <td class="border border-zinc-300 p-2">Code generation, complex analytics</td>
          </tr>
        </tbody>
      </table>

      <h2>Summary & Recommendations</h2>
      <p>Start small, benchmark with your actual dataset, and iterate. Deploying automated evaluation loops will give you the confidence needed to scale your AI solutions reliably.</p>
    `;

    if (mode === "visual") {
      if (visualRef.current) {
        visualRef.current.innerHTML = sample.trim();
        handleVisualInput();
      }
    } else if (mode === "markdown") {
      setMarkdownContent(htmlToMarkdown(sample.trim()));
      onChange(sample.trim());
    } else {
      setHtmlContent(sample.trim());
      onChange(sample.trim());
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Top Header Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 bg-zinc-50/75 px-4 py-2.5 gap-2">
        <div className="flex items-center gap-1 rounded-lg bg-zinc-200/70 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => switchMode("visual")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all cursor-pointer ${
              mode === "visual"
                ? "bg-white text-zinc-900 shadow-sm font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Eye className="size-3.5" />
            <span>Visual Editor</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode("markdown")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all cursor-pointer ${
              mode === "markdown"
                ? "bg-white text-zinc-900 shadow-sm font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Markdown</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode("html")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all cursor-pointer ${
              mode === "html"
                ? "bg-white text-zinc-900 shadow-sm font-bold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <FileCode className="size-3.5" />
            <span>HTML / Source</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {mode === "markdown" && (
            <button
              type="button"
              onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer shadow-xs"
            >
              <Eye className="size-3.5 text-zinc-500" />
              <span>{showMarkdownPreview ? "Hide Preview" : "Live Preview"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={insertSampleTemplate}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
            title="Load standard rich article template"
          >
            <Sparkles className="size-3.5 text-blue-600" />
            <span>Insert Article Template</span>
          </button>
        </div>
      </div>

      {/* Visual Editor Toolbar */}
      {mode === "visual" && (
        <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-zinc-50/40 p-2 text-zinc-700">
          <div className="flex items-center gap-0.5 border-r border-zinc-200 pr-1.5 mr-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("undo")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Undo"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("redo")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Redo"
            >
              <Redo2 className="size-4" />
            </button>
          </div>

          {/* Heading formats */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 pr-1.5 mr-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("formatBlock", "<h1>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("formatBlock", "<h2>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("formatBlock", "<h3>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Heading 3"
            >
              <Heading3 className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("formatBlock", "<p>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Paragraph"
            >
              <Pilcrow className="size-4" />
            </button>
          </div>

          {/* Inline Styles */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 pr-1.5 mr-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("bold")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Bold"
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("italic")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Italic"
            >
              <Italic className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("underline")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Underline"
            >
              <Underline className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("strikeThrough")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough className="size-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 pr-1.5 mr-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("insertUnorderedList")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Bullet List"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("insertOrderedList")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="size-4" />
            </button>
          </div>

          {/* Blocks & Quote */}
          <div className="flex items-center gap-0.5 border-r border-zinc-200 pr-1.5 mr-1">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("formatBlock", "<blockquote>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Blockquote"
            >
              <Quote className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("formatBlock", "<pre>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Code Block"
            >
              <Code className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => execCmd("insertHorizontalRule")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Horizontal Line"
            >
              <Minus className="size-4" />
            </button>
          </div>

          {/* Inserts */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={openInsertLink}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Insert Text Link (Ctrl+K)"
            >
              <LinkIcon className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={openInsertEmbedLink}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Insert Embedded Link Card (CTA box)"
            >
              <ExternalLink className="size-4" />
            </button>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleContentImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={onImageButtonClick}
              disabled={isUploadingImage}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer disabled:opacity-50"
              title={isUploadingImage ? "Uploading..." : "Insert / Upload Image"}
            >
              {isUploadingImage ? (
                <Loader2 className="size-4 animate-spin text-blue-600" />
              ) : (
                <ImageIcon className="size-4" />
              )}
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={insertVideo}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Insert Video Embed"
            >
              <Video className="size-4" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={insertTable}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Insert Table"
            >
              <TableIcon className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="p-4 sm:p-6 min-h-[360px] bg-white">
        {mode === "visual" && (
          <div
            ref={visualRef}
            contentEditable
            onInput={handleVisualInput}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onSelect={saveSelection}
            onBlur={saveSelection}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                openInsertLink();
              }
            }}
            className="outline-none min-h-[340px] prose prose-zinc max-w-none focus:ring-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-zinc-600 [&_blockquote]:my-3 [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-xs [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_th]:border [&_th]:border-zinc-300 [&_th]:p-2 [&_th]:bg-zinc-100 [&_td]:border [&_td]:border-zinc-300 [&_td]:p-2"
          />
        )}

        {mode === "markdown" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500">
                <span>Markdown Source</span>
                <span className="font-mono text-[11px] text-zinc-400"># H1, ## H2, - List, **Bold**</span>
              </div>
              <textarea
                ref={markdownTextareaRef}
                value={markdownContent}
                onChange={handleMarkdownChange}
                onKeyUp={saveSelection}
                onMouseUp={saveSelection}
                onSelect={saveSelection}
                onBlur={saveSelection}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                    e.preventDefault();
                    openInsertLink();
                  }
                }}
                placeholder="# How to Choose the Right AI Model&#10;&#10;Choosing the right AI model is important for...&#10;&#10;## 1. Understand Your Requirements&#10;&#10;Before selecting an AI model..."
                rows={16}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 font-mono text-xs leading-relaxed text-zinc-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className={showMarkdownPreview ? "block" : "hidden lg:block"}>
              <div className="mb-2 text-xs font-semibold text-zinc-500">Preview</div>
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className="min-h-[330px] rounded-lg border border-zinc-200/80 bg-white p-4 prose prose-zinc max-w-none text-xs leading-relaxed overflow-y-auto max-h-[380px]"
              />
            </div>
          </div>
        )}

        {mode === "html" && (
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>Raw HTML Mode (For Developers & Content Managers)</span>
              <span className="font-mono text-[11px] text-zinc-400">&lt;h2&gt;, &lt;p&gt;, &lt;img&gt;</span>
            </div>
            <textarea
              ref={htmlTextareaRef}
              value={htmlContent}
              onChange={handleHtmlChange}
              onKeyUp={saveSelection}
              onMouseUp={saveSelection}
              onSelect={saveSelection}
              onBlur={saveSelection}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                  e.preventDefault();
                  openInsertLink();
                }
              }}
              placeholder="<h2>Understand Your Requirements</h2>&#10;<p>Before selecting an AI model...</p>"
              rows={16}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-emerald-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Editor Footer / Word Count & SEO Status */}
      <div className="flex flex-wrap items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-4 py-2 text-xs text-zinc-500">
        <div>
          <span>Mode: </span>
          <strong className="capitalize text-zinc-700">{mode} Editor</strong>
        </div>
        <div className="flex items-center gap-4">
          <span>Words: {htmlContent.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length}</span>
          <span>Characters: {htmlContent.replace(/<[^>]*>/g, "").length}</span>
        </div>
      </div>

      {/* Embedded Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 text-blue-600" />
                <h3 className="text-sm font-bold text-zinc-900">
                  {linkModalMode === "card" ? "Insert Embedded Link Card" : "Insert Blue Link"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-1 rounded-md hover:bg-zinc-200/60"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Mode Selector Tabs */}
              <div className="flex rounded-lg bg-zinc-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLinkModalMode("inline")}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                    linkModalMode === "inline"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Inline Blue Link
                </button>
                <button
                  type="button"
                  onClick={() => setLinkModalMode("card")}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
                    linkModalMode === "card"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Embedded Link Card (CTA)
                </button>
              </div>

              {/* Target URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Target URL *</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://ownthedigital.com/services or /blog/ai-guide"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Link Text / Headline */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">
                  {linkModalMode === "card" ? "Card Headline / Title *" : "Anchor / Display Text *"}
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder={
                    linkModalMode === "card"
                      ? "e.g. Recommended Reading: AI Strategy Playbook"
                      : "e.g. Read our complete guide"
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Card Specific Fields */}
              {linkModalMode === "card" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700">Category Badge</label>
                      <input
                        type="text"
                        value={linkCategory}
                        onChange={(e) => setLinkCategory(e.target.value)}
                        placeholder="e.g. Resource, Case Study"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-700">Button Label</label>
                      <input
                        type="text"
                        value={linkButtonText}
                        onChange={(e) => setLinkButtonText(e.target.value)}
                        placeholder="e.g. Explore Resource"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-800 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-700">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={linkDescription}
                      onChange={(e) => setLinkDescription(e.target.value)}
                      placeholder="Brief summary or context to encourage readers to click..."
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-800 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Live Preview Box */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live Preview</span>
                {linkModalMode === "inline" ? (
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Example sentence showing{" "}
                    <a
                      href={linkUrl || "#"}
                      onClick={(e) => e.preventDefault()}
                      className="text-blue-600 hover:text-blue-700 underline font-medium cursor-pointer"
                    >
                      {linkTitle || "Clickable Blue Link"}
                    </a>{" "}
                    embedded inside your blog content.
                  </p>
                ) : (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 not-prose">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                          {linkCategory || "Resource"}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 m-0">
                          <span className="text-blue-600 hover:underline">{linkTitle || "Embedded Link Headline"}</span>
                        </h4>
                        {linkDescription && <p className="text-[11px] text-zinc-600 m-0">{linkDescription}</p>}
                      </div>
                      <div className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs">
                        <span>{linkButtonText || "Visit Link"}</span>
                        <span>&rarr;</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-3 bg-zinc-50">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="rounded-lg border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmInsertLink}
                disabled={!linkUrl.trim()}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer disabled:opacity-50"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
