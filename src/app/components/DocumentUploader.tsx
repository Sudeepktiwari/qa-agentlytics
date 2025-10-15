"use client";

import React, { useState } from "react";

interface DocumentUploaderProps {
  onUploadDone?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadDone,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("");
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus("");
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        // Include cookies for admin authentication and scoping
        xhr.withCredentials = true;
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              setStatus(`Uploaded ${data.filename} (${data.chunks} chunks)`);
              if (onUploadDone) onUploadDone();
            } else {
              setStatus("Upload failed");
            }
            resolve();
          } else {
            setStatus("Error uploading file");
            reject();
          }
        };
        xhr.onerror = () => {
          setStatus("Error uploading file");
          reject();
        };
        xhr.send(formData);
      });
    } catch {
      setStatus("Error uploading file");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
      }}
    >
      <h3>Upload Document</h3>
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        disabled={loading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ marginLeft: 8 }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {loading && progress > 0 && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              background: "#eee",
              borderRadius: 4,
              height: 10,
              width: 200,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                background: "#0070f3",
                height: "100%",
                borderRadius: 4,
                transition: "width 0.2s",
              }}
            />
          </div>
          <div style={{ fontSize: 12 }}>{progress}%</div>
        </div>
      )}
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
};

export default DocumentUploader;
