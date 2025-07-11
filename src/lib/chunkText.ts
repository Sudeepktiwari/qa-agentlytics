export function chunkText(text: string, chunkSize: number = 1000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + para).length > chunkSize) {
      if (current) chunks.push(current);
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
