import { useCallback, useState } from "react";
import { motion } from "framer-motion";



interface Props {
  onFileSelected: (path: string) => void;
  onBack: () => void;
}

export function UploadStep({ onFileSelected, onBack }: Props) {
  const [isDragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleBrowse = async () => {
    document.getElementById("file-input")?.click();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      // In Tauri, dropped files give us a path
      const path = (file as any).path ?? file.name;
      setSelectedPath(path);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "32px 40px",
        gap: 20,
      }}
    >
      <button
        onClick={onBack}
        style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}
      >
        ← Back
      </button>

      <div>
        <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 12, color: "#e2e8f0", marginBottom: 8 }}>
          UPLOAD A PHOTO
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 13 }}>
          A person, a character, a friend — we'll turn them into a pixel companion
        </p>
      </div>

      <motion.div
        onClick={handleBrowse}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        animate={{ borderColor: isDragOver ? "#6366f1" : "rgba(255,255,255,0.12)" }}
        style={{
          flex: 1,
          border: "2px dashed rgba(255,255,255,0.12)",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          cursor: "pointer",
          background: isDragOver ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
          transition: "background 0.2s",
          minHeight: 200,
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ maxHeight: 140, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }}
          />
        ) : (
          <>
            <span style={{ fontSize: 48 }}>📸</span>
            <span style={{ color: "#94a3b8", fontSize: 14 }}>
              Drop image here or click to browse
            </span>
            <span style={{ color: "#475569", fontSize: 11 }}>PNG, JPG, WEBP supported</span>
          </>
        )}
      </motion.div>

      {selectedPath && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFileSelected(selectedPath)}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "13px 28px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Create my companion →
        </motion.button>
      )}
    </div>
  );
}
