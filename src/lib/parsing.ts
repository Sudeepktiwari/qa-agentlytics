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
