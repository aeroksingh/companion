import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";

interface Props {
  onFileSelected: (path: string) => void;
  onBack: () => void;
}

export function UploadStep({ onFileSelected, onBack }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isDragOver, setDragOver] = useState(false);

  const handleBrowse = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "webp"] }],
      });
      if (selected && typeof selected === "string") {
        setSelectedPath(selected);
        setPreview(selected);
      }
    } catch {
      // fallback to input
      document.getElementById("companion-file-input")?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    // @ts-ignore
    setSelectedPath((file as any).path || url);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    // @ts-ignore
    setSelectedPath((file as any).path || url);
  }, []);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"32px 40px", gap:20 }}>
      <button onClick={onBack} style={{ alignSelf:"flex-start", background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:13 }}>
        ← Back
      </button>

      <div>
        <h2 style={{ fontFamily:'"Press Start 2P"', fontSize:12, color:"#e2e8f0", marginBottom:8 }}>
          UPLOAD A PHOTO
        </h2>
        <p style={{ color:"#94a3b8", fontSize:13 }}>
          A person, character, or friend — we'll turn them into a pixel companion
        </p>
      </div>

      <motion.div
        onClick={handleBrowse}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        animate={{ borderColor: isDragOver ? "#6366f1" : "rgba(255,255,255,0.12)" }}
        style={{
          flex:1, border:"2px dashed rgba(255,255,255,0.12)", borderRadius:16,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          gap:16, cursor:"pointer", minHeight:200,
          background: isDragOver ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ maxHeight:160, maxWidth:"100%", borderRadius:8, objectFit:"contain" }}
          />
        ) : (
          <>
            <span style={{ fontSize:48 }}>📸</span>
            <span style={{ color:"#94a3b8", fontSize:14 }}>Click to browse or drop image here</span>
            <span style={{ color:"#475569", fontSize:11 }}>PNG · JPG · WEBP</span>
          </>
        )}
      </motion.div>

      <input
        id="companion-file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display:"none" }}
        onChange={handleInputChange}
      />

      {selectedPath && (
        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.98 }}
          onClick={() => onFileSelected(selectedPath)}
          style={{
            background:"linear-gradient(135deg, #6366f1, #8b5cf6)",
            color:"#fff", border:"none", borderRadius:12,
            padding:"13px 28px", fontSize:14, fontWeight:600, cursor:"pointer",
          }}
        >
          Create my companion →
        </motion.button>
      )}
    </div>
  );
}