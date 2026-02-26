export function parseSectionBlocks(text: string) {
  const blocks: { title: string; body: string }[] = [];
  const regex =
    /\[SECTION\s+(\d+)\]\s*([^\n]*)\n?([\s\S]*?)(?=(\[SECTION\s+\d+\])|$)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const title = (m[2] || "").trim();
    const body = (m[3] || "").trim();
    if (title && body) {
      blocks.push({ title, body });
    }
  }
  return blocks;
}

export function mergeSmallSectionBlocks(
  blocks: { title: string; body: string }[],
  minChars = 300,
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

  // Limit total sections to 10 to prevent timeout on very long pages
  // Apply limit AFTER merging small sections to ensure we don't drop content unnecessarily
  if (merged.length > 10) {
    const limitedMerged = merged.slice(0, 10);
    // Combine the rest into the last block if needed, or just truncate
    const remaining = merged.slice(10);
    if (remaining.length > 0) {
      limitedMerged[9].body +=
        "\n\n" + remaining.map((b) => b.body).join("\n\n");
    }
    return limitedMerged;
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
