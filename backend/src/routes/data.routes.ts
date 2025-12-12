import { fileController } from '../controllers/file.controller';
import { textController } from '../controllers/text.controller';
import { upload, handleMulterError } from '../middleware/file-upload';
import { fileUploadLimiter, fileDownloadLimiter } from '../middleware/rate-limiter';
import { Router } from 'express';

const router = Router();

// Text operations
router.post('/:address/text', textController.saveText);
router.get('/:address/text', textController.getText);
router.get('/:address/text/:id', textController.getTextById);

// File operations
router.post('/:address/file', fileUploadLimiter, upload.single('file'), handleMulterError, fileController.uploadFile);
router.get('/:address/file/:id', fileDownloadLimiter, fileController.downloadFile);

// List all data
router.get('/:address/list', fileController.listData);

// Delete all data
router.delete('/:address', fileController.deleteData);

export default router;
