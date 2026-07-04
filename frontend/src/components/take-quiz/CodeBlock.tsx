import React from "react";

/* ─── Minimal keyword-based syntax highlighter (light theme) ─── */
function highlight(code: string, lang: string): React.ReactNode[] {
  const jsKeywords = /\b(const|let|var|function|return|if|else|for|while|of|in|new|this|class|extends|import|export|default|typeof|instanceof|true|false|null|undefined|async|await|=>)\b/g;
  const pyKeywords = /\b(def|return|if|elif|else|for|while|in|not|and|or|True|False|None|import|from|class|self|lambda|with|as|pass|break|continue|yield|print)\b/g;
  const cppKeywords = /\b(int|char|float|double|void|bool|struct|class|public|private|return|if|else|for|while|new|delete|nullptr|NULL|true|false|cout|cin|include|using|namespace|std|const|static)\b/g;
  const strings = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  const comments = /(\/\/.*|#.*)/g;
  const numbers = /\b(\d+)\b/g;

  const keywords =
    lang === "python" ? pyKeywords : lang === "cpp" || lang === "c" || lang === "java" ? cppKeywords : jsKeywords;
  const lines = code.split("\n");

  return lines.map((line, li) => {
    type Match = { start: number; end: number; cls: string; text: string };
    const matches: Match[] = [];
    const patterns: { re: RegExp; cls: string }[] = [
      { re: new RegExp(comments.source, "g"), cls: "text-slate-400 italic" },
      { re: new RegExp(strings.source, "g"), cls: "text-emerald-600" },
      { re: new RegExp(keywords.source, "g"), cls: "text-violet-600 font-semibold" },
      { re: new RegExp(numbers.source, "g"), cls: "text-amber-600" },
    ];
    for (const { re, cls } of patterns) {
      const r = new RegExp(re.source, "g");
      let m: RegExpExecArray | null;
      while ((m = r.exec(line)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length, cls, text: m[0] });
      }
    }
    matches.sort((a, b) => a.start - b.start);
    const used: Match[] = [];
    let cursor = 0;
    for (const m of matches) {
      if (m.start >= cursor) {
        used.push(m);
        cursor = m.end;
      }
    }
    const nodes: React.ReactNode[] = [];
    let idx = 0;
    for (const m of used) {
      if (m.start > idx) nodes.push(line.slice(idx, m.start));
      nodes.push(
        <span key={m.start} className={m.cls}>
          {m.text}
        </span>
      );
      idx = m.end;
    }
    if (idx < line.length) nodes.push(line.slice(idx));
    return (
      <div key={li} className="flex">
        <span className="select-none w-8 shrink-0 text-right pr-4 text-slate-300 text-xs">{li + 1}</span>
        <span>{nodes.length ? nodes : " "}</span>
      </div>
    );
  });
}

const langLabel: Record<string, string> = {
  javascript: "JavaScript", js: "JavaScript", typescript: "TypeScript", ts: "TypeScript",
  python: "Python", py: "Python", cpp: "C++", c: "C", java: "Java", csharp: "C#",
};

export function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
      <div className="flex items-center gap-2 bg-zinc-100 px-4 py-2.5 border-b border-zinc-200">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="ml-2 text-xs text-zinc-500 font-medium">{langLabel[language] ?? language ?? "Code"}</span>
      </div>
      <pre className="bg-zinc-50 text-zinc-800 text-sm leading-relaxed p-4 overflow-x-auto font-mono">
        {highlight(code, language)}
      </pre>
    </div>
  );
}
