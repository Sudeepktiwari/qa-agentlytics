export function chunkText(text: string, chunkSize: number = 1000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    // If the paragraph itself is too long, split it further
    if (para.length > chunkSize) {
      // Finish current chunk if not empty
      if (current) {
        chunks.push(current);
        current = "";
      }

      // Split the large paragraph by sentences or words
      const sentences = para.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.trim()) {
          const sentenceWithPeriod = sentence.trim() + ".";

          if ((current + sentenceWithPeriod).length > chunkSize) {
            if (current) chunks.push(current);
            current = sentenceWithPeriod;
          } else {
            current += (current ? " " : "") + sentenceWithPeriod;
          }
        }
      }
    } else {
      // Normal paragraph processing
      if ((current + para).length > chunkSize) {
        if (current) chunks.push(current);
        current = para;
      } else {
        current += (current ? "\n\n" : "") + para;
      }
    }
  }

  if (current) chunks.push(current);

  // Final safety check: if any chunk is still too long, split it by words
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length > chunkSize) {
      const words = chunk.split(" ");
      let tempChunk = "";
      for (const word of words) {
        if ((tempChunk + " " + word).length > chunkSize) {
          if (tempChunk) finalChunks.push(tempChunk);
          tempChunk = word;
        } else {
          tempChunk += (tempChunk ? " " : "") + word;
        }
      }
      if (tempChunk) finalChunks.push(tempChunk);
    } else {
      finalChunks.push(chunk);
    }
  }

  return finalChunks;
}
