import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function CodeBlock({ inline, className, children }) {
  const match = /language-([a-zA-Z0-9_-]+)/.exec(className || '');
  const language = match?.[1] || 'text';
  const code = String(children).replace(/\n$/, '');

  if (inline) {
    return <code className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.95em] text-cyan-100">{children}</code>;
  }

  return (
    <div className="my-4 overflow-hidden rounded-3xl border border-white/10 bg-[#050505] shadow-glow">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">
        <span>{language}</span>
        <span>Code</span>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem 1.1rem',
          background: '#050505',
          fontSize: '0.9rem',
          lineHeight: '1.65'
        }}
        codeTagProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' } }}
        wrapLongLines
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={['flex w-full gap-3 animate-fadeUp', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      {!isUser ? (
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-glow">
          <Bot className="h-5 w-5" />
        </div>
      ) : null}

      <div className={['max-w-[min(78%,44rem)] rounded-3xl border px-4 py-3 sm:px-5 sm:py-4', isUser ? 'border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-fuchsia-500/20 text-white' : 'border-white/10 bg-white/[0.03] text-white'].join(' ')}>
        <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:mb-2 prose-headings:mt-0 prose-headings:leading-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-li:marker:text-white/55 prose-a:text-cyan-300 prose-a:no-underline prose-strong:text-white prose-blockquote:border-white/15 prose-blockquote:text-white/70 prose-code:rounded-md prose-code:border prose-code:border-white/10 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.95em] prose-code:text-cyan-100 prose-pre:bg-transparent prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
              a: ({ children, ...props }) => (
                <a {...props} target="_blank" rel="noreferrer" className="text-cyan-300 underline decoration-white/20 underline-offset-4 transition hover:text-cyan-200">
                  {children}
                </a>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className={['mt-3 text-xs text-white/45', isUser ? 'text-right' : 'text-left'].join(' ')}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
