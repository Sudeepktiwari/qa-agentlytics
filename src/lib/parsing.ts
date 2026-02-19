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
  minChars = 500,
) {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];
  const lengthOf = (body: string) => body.replace(/\s+/g, " ").trim().length;
  const result = blocks.map((b) => ({ ...b }));

  for (let i = 0; i < result.length; i++) {
    if (lengthOf(result[i].body) >= minChars) continue;
    let combined = result[i].body;
    let j = i + 1;
    while (lengthOf(combined) < minChars && j < blocks.length) {
      combined = `${combined}\n\n${blocks[j].body}`.trim();
      j++;
    }
    result[i].body = combined;
  }

  return result;
}
