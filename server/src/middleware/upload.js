import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/[^\w.-]/g, "_")}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = [".pdf", ".doc", ".docx", ".txt", ".webm", ".mp3", ".wav", ".m4a"].includes(
      path.extname(file.originalname).toLowerCase()
    );
    cb(ok ? null : new Error("Unsupported file type"), ok);
  },
});
