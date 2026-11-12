const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
// const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// We can add auth middleware here later if needed
router.post('/', upload.single('file'), uploadController.uploadFile);

module.exports = router;
