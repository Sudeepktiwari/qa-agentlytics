import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(
  file: Buffer,
  mimetype: string
): Promise<string> {
  if (mimetype === "application/pdf") {
    const data = await pdfParse(file);
    return data.text;
  } else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({ buffer: file });
    return value;
  } else if (mimetype === "text/plain") {
    return file.toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }
}
