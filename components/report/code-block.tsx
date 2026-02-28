"use client";

import { useState } from "react";
import { CheckCircle, Copy } from "lucide-react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative mt-3 overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-xs leading-relaxed text-foreground">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Copy"
      >
        {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
      </button>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );
}
