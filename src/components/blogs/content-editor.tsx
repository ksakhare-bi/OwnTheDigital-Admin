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

  // Sync internal state when external value changes
  useEffect(() => {
    setHtmlContent(value || "");
    if (visualRef.current && mode === "visual" && visualRef.current.innerHTML !== (value || "")) {
      visualRef.current.innerHTML = value || "";
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
      onChange(convertedHtml);
    } else if (mode === "html") {
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
  };

  const handleVisualInput = () => {
    if (!visualRef.current) return;
    const html = visualRef.current.innerHTML;
    setHtmlContent(html);
    onChange(html);
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

  const insertLink = () => {
    const url = prompt("Enter URL (e.g. https://ownthedigital.com):");
    if (url) {
      execCmd("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter Image URL (e.g. https://... or /images/...):");
    if (url) {
      const alt = prompt("Enter Alt Text for SEO & Accessibility:") || "Blog image";
      const imgHtml = `<img src="${url}" alt="${alt}" class="my-4 rounded-lg max-w-full h-auto" />`;
      execCmd("insertHTML", imgHtml);
    }
  };

  const insertVideo = () => {
    const url = prompt("Enter YouTube / Video Embed URL (e.g. https://www.youtube.com/embed/...):");
    if (url) {
      const embedHtml = `<div class="aspect-video my-4 w-full overflow-hidden rounded-xl border border-zinc-200"><iframe src="${url}" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>`;
      execCmd("insertHTML", embedHtml);
    }
  };

  const insertTable = () => {
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
    execCmd("insertHTML", tableHtml);
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
              onClick={() => execCmd("undo")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Undo"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
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
              onClick={() => execCmd("formatBlock", "<h1>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<h2>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<h3>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Heading 3"
            >
              <Heading3 className="size-4" />
            </button>
            <button
              type="button"
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
              onClick={() => execCmd("bold")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Bold"
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("italic")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Italic"
            >
              <Italic className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("underline")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Underline"
            >
              <Underline className="size-4" />
            </button>
            <button
              type="button"
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
              onClick={() => execCmd("insertUnorderedList")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Bullet List"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
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
              onClick={() => execCmd("formatBlock", "<blockquote>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Blockquote"
            >
              <Quote className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd("formatBlock", "<pre>")}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Code Block"
            >
              <Code className="size-4" />
            </button>
            <button
              type="button"
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
              onClick={insertLink}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Insert Link"
            >
              <LinkIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={insertImage}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Insert Image"
            >
              <ImageIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={insertVideo}
              className="p-1.5 rounded hover:bg-zinc-200/70 text-zinc-600 hover:text-zinc-900 cursor-pointer"
              title="Insert Video Embed"
            >
              <Video className="size-4" />
            </button>
            <button
              type="button"
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
                value={markdownContent}
                onChange={handleMarkdownChange}
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
              value={htmlContent}
              onChange={handleHtmlChange}
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
    </div>
  );
}
