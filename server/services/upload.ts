import path from 'path';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedExtensions = new Set(['.pdf', '.docx']);

export function isSupportedResume(file: Pick<Express.Multer.File, 'mimetype' | 'originalname'>) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  return allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(ext);
}
