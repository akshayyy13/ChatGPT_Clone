"use client";
import Markdown from "@/components/Markdown";
import type { Msg, TextContent } from "@/app/types";
import { BiCopy, BiLike, BiDislike, BiTrash } from "react-icons/bi";
import { GrFormEdit } from "react-icons/gr";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { RiShare2Fill } from "react-icons/ri";
import { BsArrowRepeat } from "react-icons/bs";
import { useState } from "react";

export default function MessageBubble({
  msg,
  onEdit,
  onCopy,
  onDelete, // ✅ new
}: {
  msg: Msg;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void; // ✅ new
}) {
  const isUser = msg.role === "user";
  const text =
    (msg.content.find((c) => c.type === "text") as TextContent | undefined)
      ?.text ?? "";

  const iconBtn =
    "inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition cursor-pointer text-[var(--text-secondary)] opacity-95";

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCodeToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const CodeBlock = ({
    children,
    className,
  }: {
    children: any;
    className?: string;
  }) => {
    const language = className?.replace("language-", "") || "text";
    const code =
      typeof children === "string"
        ? children.trim()
        : Array.isArray(children)
        ? children.join("").trim()
        : String(children || "").trim();

    return (
      <div className="my-4 rounded-lg overflow-hidden bg-[#0d1117] border border-[#30363d]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28ca42]"></div>
            </div>
            <span className="text-[#7d8590] text-sm font-mono ml-2">
              {language}
            </span>
          </div>
          <button
            onClick={() => copyCodeToClipboard(code)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#7d8590] hover:text-[#f0f6fc] hover:bg-[#30363d] rounded transition-colors"
          >
            <BiCopy size={14} />
            {copiedCode === code ? "Copied!" : "Copy code"}
          </button>
        </div>
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
            <code className="text-[#f0f6fc] font-mono whitespace-pre">
              {code}
            </code>
          </pre>
        </div>
      </div>
    );
  };

  const InlineCode = ({ children }: { children: string }) => (
    <code className="bg-[#6e768166] text-[#f0f6fc] px-1.5 py-0.5 rounded text-sm font-mono border border-[#30363d]">
      {children}
    </code>
  );

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "relative group rounded-3xl break-words max-w-full sm:max-w-[80%] md:max-w-[70%] p-3",
          isUser
            ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
            : "bg-[var(--bg-primary)] text-white",
        ].join(" ")}
      >
        <div className="w-full break-words">
          <Markdown
            components={{
              pre: ({ children, ...props }) => {
                const child = children as any;
                const code = child?.props?.children || "";
                const className = child?.props?.className || "";

                return (
                  <div className="my-2">
                    {/* Terminal-like container */}
                    <div className="bg-[#1e1e1e] text-white rounded-md overflow-auto shadow-md">
                      <div className="flex justify-between items-center px-2 py-1 border-b border-gray-700 text-xs font-mono">
                        <span>Code</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(code)}
                          className="hover:text-gray-300"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className={`p-4 font-mono ${className}`} {...props}>
                        <code>{code}</code>
                      </pre>
                    </div>
                  </div>
                );
              },
              code: ({ children, className, ...props }) => {
                // Inline code
                if (className?.startsWith("language-")) {
                  return <code {...props}>{children}</code>;
                }
                return (
                  <span className="bg-gray-200 text-gray-900 px-1 py-0.5 rounded text-sm font-mono">
                    {children as string}
                  </span>
                );
              },
            }}
          >
            {text}
          </Markdown>
        </div>

        {/* User message actions */}
        {isUser && (
          <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] shadow-md backdrop-blur-sm">
              <button
                onClick={onCopy}
                type="button"
                aria-label="Copy message"
                className={iconBtn}
                title="Copy"
              >
                <BiCopy size={20} />
              </button>

              {onEdit && (
                <button
                  onClick={onEdit}
                  type="button"
                  aria-label="Edit message"
                  className={iconBtn}
                  title="Edit"
                >
                  <GrFormEdit size={20} />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={onDelete}
                  type="button"
                  aria-label="Delete message"
                  className={iconBtn}
                  title="Delete"
                >
                  <BiTrash size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Assistant message actions */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <button
              onClick={onCopy}
              type="button"
              className={iconBtn}
              title="Copy"
            >
              <BiCopy size={20} />
            </button>
            <button type="button" className={iconBtn} title="Like">
              <BiLike size={20} />
            </button>
            <button type="button" className={iconBtn} title="DisLike">
              <BiDislike size={20} />
            </button>
            <button type="button" className={iconBtn} title="Speak Aloud">
              <HiOutlineSpeakerWave size={20} />
            </button>
            <button type="button" className={iconBtn} title="Share">
              <RiShare2Fill size={20} />
            </button>
            <button type="button" className={iconBtn} title="Try Again">
              <BsArrowRepeat size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
