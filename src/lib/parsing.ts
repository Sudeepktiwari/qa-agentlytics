export function parseSectionBlocks(text: string) {
  const blocks: { title: string; body: string }[] = [];
  const regex =
    /\[SECTION\s+(\d+)\]\s*([^\n]*)\n?([\s\S]*?)(?=(\[SECTION\s+\d+\])|$)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const title = (m[2] || "").trim();
    const body = (m[3] || "").trim();
    blocks.push({ title, body });
  }
  return blocks;
}

export function mergeSmallSectionBlocks(
  blocks: { title: string; body: string }[],
  minChars = 200,
) {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];
  const lengthOf = (body: string) => body.replace(/\s+/g, " ").trim().length;

  const merged: { title: string; body: string }[] = [];
  let current = { ...blocks[0] };

  for (let i = 1; i < blocks.length; i++) {
    const next = blocks[i];
    if (lengthOf(current.body) < minChars) {
      const title =
        current.title || next.title || `Section ${merged.length + 1}`;
      current = {
        title,
        body: `${current.body}\n\n${next.body}`.trim(),
      };
    } else {
      merged.push(current);
      current = { ...next };
    }
  }

  if (merged.length === 0) {
    merged.push(current);
  } else if (lengthOf(current.body) < minChars) {
    const last = merged[merged.length - 1];
    merged[merged.length - 1] = {
      title: last.title || current.title,
      body: `${last.body}\n\n${current.body}`.trim(),
    };
  } else {
    merged.push(current);
  }

  return merged;
}

export function blocksToSectionedText(
  blocks: { title: string; body: string }[],
): string {
  return blocks
    .map((b, idx) => {
      const titlePart = b.title ? ` ${b.title}` : "";
      const body = b.body || "";
      return `[SECTION ${idx + 1}]${titlePart}\n ${body}`;
    })
    .join("\n\n");
}
