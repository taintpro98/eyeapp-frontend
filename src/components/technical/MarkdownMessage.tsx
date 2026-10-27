import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Element styling for chat replies — no typography plugin in this app, so map tags to tokens directly. */
const COMPONENTS: Components = {
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-semibold text-text-primary first:mt-0">{children}</h4>,
  h2: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-semibold text-text-primary first:mt-0">{children}</h4>,
  h3: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-semibold text-text-primary first:mt-0">{children}</h4>,
  h4: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-semibold text-text-primary first:mt-0">{children}</h4>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-brand-primary underline dark:text-brand-light">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="rounded bg-surface-border/50 px-1 py-0.5 font-mono text-xs">{children}</code>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-surface-border pl-3 text-text-secondary">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-surface-border px-2 py-1 text-left font-semibold text-text-primary">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-surface-border/60 px-2 py-1 tabular-nums">{children}</td>,
  hr: () => <hr className="my-3 border-surface-border" />,
};

/** Assistant/user chat text as GitHub-flavoured markdown (tables, lists). Raw HTML is not rendered. */
export function MarkdownMessage({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("break-words leading-relaxed", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
