// components/Markdown.tsx
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useState } from "react";
import type { Components } from "react-markdown";

const CodeBlock = ({ children, ...props }: React.HTMLProps<HTMLPreElement>) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const code = children?.toString() || "";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 max-w-full overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute top-1 right-2 z-10 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre {...props} className="!m-0">
        {children}
      </pre>
    </div>
  );
};

export default function Markdown({ children }: { children: string }) {
  const components: Components = {
    pre: CodeBlock,
  };

  return (
    <div className="prose prose-invert max-w-none overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
