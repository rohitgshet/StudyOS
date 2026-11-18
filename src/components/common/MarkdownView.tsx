import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  // Helper to parse inline formatting (bold, italic, code)
  const formatInline = (text: string): React.ReactNode[] => {
    // Split by inline code, bold, italic
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline code `code`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`([\s\S]*)$/);
      // Bold **text**
      const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*([\s\S]*)$/);

      if (codeMatch && (!boldMatch || codeMatch[1].length <= boldMatch[1].length)) {
        if (codeMatch[1]) parts.push(formatItalics(codeMatch[1], keyIdx++));
        parts.push(
          <code
            key={keyIdx++}
            className="font-mono text-[11px] bg-black/[0.06] dark:bg-white/[0.08] px-1.5 py-0.5 rounded-md text-[#0071E3] dark:text-[#38BDF8]"
          >
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
      } else if (boldMatch) {
        if (boldMatch[1]) parts.push(formatItalics(boldMatch[1], keyIdx++));
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-foreground">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
      } else {
        parts.push(formatItalics(remaining, keyIdx++));
        break;
      }
    }

    return parts;
  };

  const formatItalics = (text: string, baseKey: number): React.ReactNode => {
    const parts = text.split(/\*([^*]+)\*/g);
    if (parts.length === 1) return text;
    return (
      <span key={baseKey}>
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <em key={i} className="italic text-foreground/90">
              {p}
            </em>
          ) : (
            p
          )
        )}
      </span>
    );
  };

  // Split into structural blocks
  const blocks = content.split(/\n\n+/);

  return (
    <div className={`space-y-3 font-sans text-xs leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // 1. Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-base font-bold text-foreground border-b border-black/[0.06] dark:border-white/[0.08] pb-1.5 pt-2">
              {formatInline(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }

        // 2. Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-sm font-semibold text-foreground pt-2">
              {formatInline(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        // 3. Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1 flex items-center gap-1.5">
              {formatInline(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // 4. Heading 4
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-xs font-semibold text-foreground pt-1">
              {formatInline(trimmed.replace(/^####\s+/, ''))}
            </h4>
          );
        }

        // 5. Code Block
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const code = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined).join('\n');
          return (
            <pre
              key={idx}
              className="p-3.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] font-mono text-[11px] overflow-x-auto text-foreground"
            >
              <code>{code}</code>
            </pre>
          );
        }

        // 6. Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-[#0071E3] pl-3 py-1 bg-[#0071E3]/5 text-muted-foreground italic rounded-r-xl text-xs"
            >
              {formatInline(trimmed.replace(/^>\s+/, ''))}
            </blockquote>
          );
        }

        // 7. Markdown Table
        if (trimmed.includes('|') && trimmed.split('\n').every(l => l.trim().startsWith('|') && l.trim().endsWith('|'))) {
          const rows = trimmed.split('\n').map(r => r.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim()));
          const header = rows[0];
          const body = rows.slice(2); // Skip separator row

          return (
            <div key={idx} className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.02]">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08]">
                  <tr>
                    {header.map((col, cIdx) => (
                      <th key={cIdx} className="p-2.5 font-semibold text-foreground">
                        {formatInline(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02]">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-foreground/90">
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 8. Bullet / Numbered List
        if (trimmed.split('\n').some(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s+/.test(l.trim()))) {
          const lines = trimmed.split('\n');
          return (
            <div key={idx} className="space-y-1.5 pl-1">
              {lines.map((l, lIdx) => {
                const lineTrimmed = l.trim();
                const isBullet = lineTrimmed.startsWith('- ') || lineTrimmed.startsWith('* ');
                const isNumbered = /^\d+\.\s+/.test(lineTrimmed);

                if (isBullet) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] shrink-0 mt-1.5" />
                      <span className="flex-1">{formatInline(lineTrimmed.replace(/^[-*]\s+/, ''))}</span>
                    </div>
                  );
                } else if (isNumbered) {
                  const num = lineTrimmed.match(/^(\d+)\.\s+/)?.[1] || `${lIdx + 1}`;
                  return (
                    <div key={lIdx} className="flex items-start gap-2 text-xs">
                      <span className="font-semibold text-[#0071E3] shrink-0 min-w-4 text-[11px]">{num}.</span>
                      <span className="flex-1">{formatInline(lineTrimmed.replace(/^\d+\.\s+/, ''))}</span>
                    </div>
                  );
                } else {
                  return (
                    <p key={lIdx} className="text-xs text-foreground/90">
                      {formatInline(lineTrimmed)}
                    </p>
                  );
                }
              })}
            </div>
          );
        }

        // 9. Standard Paragraph
        return (
          <p key={idx} className="text-xs leading-relaxed text-foreground/90">
            {formatInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
