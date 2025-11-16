import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads/videos',
    'uploads/temp',
    'uploads/covers'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.includes('video')) {
      cb(null, 'uploads/videos');
    } else if (file.mimetype.includes('zip') || file.mimetype.includes('rar')) {
      cb(null, 'uploads/temp');
    } else {
      cb(null, 'uploads');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'video/mp4',
    'video/mkv', 
    'video/avi',
    'video/mov',
    'video/wmv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video and archive files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB limit
  }
});

export default upload;