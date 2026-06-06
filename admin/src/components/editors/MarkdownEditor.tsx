"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2,
  Eye,
  Edit3,
  Columns,
} from "lucide-react";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: boolean;
}

type ViewMode = "edit" | "preview" | "split";

export function MarkdownEditor({
  content,
  onChange,
  placeholder = "Start writing in markdown...",
  error,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = useCallback(
    (before: string, after: string = "", placeholder: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end) || placeholder;

      const newContent =
        content.substring(0, start) +
        before +
        selectedText +
        after +
        content.substring(end);

      onChange(newContent);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [content, onChange]
  );

  type ToolbarAction = 
    | { type: "divider" }
    | {
        icon: React.ComponentType<{ className?: string }>;
        action: () => void;
        title: string;
      };

  const toolbarActions: ToolbarAction[] = [
    {
      icon: Bold,
      action: () => insertMarkdown("**", "**", "bold text"),
      title: "Bold",
    },
    {
      icon: Italic,
      action: () => insertMarkdown("*", "*", "italic text"),
      title: "Italic",
    },
    {
      icon: Code,
      action: () => insertMarkdown("`", "`", "code"),
      title: "Inline Code",
    },
    { type: "divider" },
    {
      icon: Heading1,
      action: () => insertMarkdown("\n# ", "\n", "Heading 1"),
      title: "H1",
    },
    {
      icon: Heading2,
      action: () => insertMarkdown("\n## ", "\n", "Heading 2"),
      title: "H2",
    },
    {
      icon: Heading3,
      action: () => insertMarkdown("\n### ", "\n", "Heading 3"),
      title: "H3",
    },
    { type: "divider" },
    {
      icon: List,
      action: () => insertMarkdown("\n- ", "\n", "list item"),
      title: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => insertMarkdown("\n1. ", "\n", "item"),
      title: "Numbered List",
    },
    {
      icon: Quote,
      action: () => insertMarkdown("\n> ", "\n", "quote"),
      title: "Blockquote",
    },
    {
      icon: Code2,
      action: () => insertMarkdown("\n```\n", "\n```\n", "code"),
      title: "Code Block",
    },
    { type: "divider" },
    {
      icon: LinkIcon,
      action: () => insertMarkdown("[", "](url)", "link text"),
      title: "Link",
    },
    {
      icon: ImageIcon,
      action: () => insertMarkdown("![", "](url)", "alt text"),
      title: "Image",
    },
  ];

  const ToolbarButton = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
    >
      {children}
    </button>
  );

  const ViewButton = ({
    mode,
    icon: Icon,
    title,
  }: {
    mode: ViewMode;
    icon: typeof Eye;
    title: string;
  }) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors",
        viewMode === mode
          ? "bg-primary-100 text-primary-700"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div
      className={cn(
        "rounded-lg border bg-white overflow-hidden",
        error ? "border-red-500" : "border-gray-300"
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {toolbarActions.map((action, index) => {
            if ("type" in action && action.type === "divider") {
              return <div key={index} className="mx-1 h-6 w-px bg-gray-300" />;
            }
            if ("icon" in action) {
              const Icon = action.icon;
              return (
                <ToolbarButton
                  key={index}
                  onClick={action.action}
                  title={action.title}
                >
                  <Icon className="h-4 w-4" />
                </ToolbarButton>
              );
            }
            return null;
          })}
        </div>

        <div className="flex items-center gap-0.5">
          <ViewButton mode="edit" icon={Edit3} title="Edit" />
          <ViewButton mode="split" icon={Columns} title="Split" />
          <ViewButton mode="preview" icon={Eye} title="Preview" />
        </div>
      </div>

      {/* Editor / Preview */}
      <div
        className={cn(
          "min-h-[400px]",
          viewMode === "split" && "grid grid-cols-2 divide-x divide-gray-200"
        )}
      >
        {(viewMode === "edit" || viewMode === "split") && (
          <textarea
            ref={textareaRef}
            id="markdown-textarea"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full min-h-[400px] resize-none border-0 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-0",
              viewMode === "split" && "h-full"
            )}
          />
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={cn(
              "prose prose-sm max-w-none p-4 overflow-auto",
              viewMode === "preview" && "min-h-[400px]"
            )}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <span>{content.length} characters</span>
        <span>Markdown Mode</span>
      </div>
    </div>
  );
}


