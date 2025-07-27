import multer from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '..', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = join(uploadsDir, req.user?.id || 'anonymous');
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'text/html',
    'text/javascript',
    'application/javascript',
    'text/css',
    'text/plain',
    'application/json',
    'text/xml',
    'application/xml'
  ];

  const allowedExtensions = [
    '.html', '.htm', '.js', '.jsx', '.ts', '.tsx',
    '.css', '.scss', '.sass', '.less',
    '.php', '.py', '.rb', '.java', '.c', '.cpp',
    '.json', '.xml', '.yaml', '.yml',
    '.md', '.txt', '.sql'
  ];

  const fileExtension = extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: parseInt(process.env.MAX_FILES) || 20 // 20 files default
  }
});

export default upload;