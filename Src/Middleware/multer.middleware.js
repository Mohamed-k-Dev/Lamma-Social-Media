import multer from "multer";

export default function Multer(allowedFileTypes = []) {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };

  const upload = multer({ fileFilter, storage });
  return upload;
}