const s3Service = require('../services/s3.service');
const ApiError = require('../utils/ApiError');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file provided');
    }

    // folderPath can be passed from the frontend to determine where it goes
    // default to 'uploads' if not provided
    const folderPath = req.body.folderPath || 'uploads';
    
    // Validate folderPath to prevent arbitrary path traversal or invalid structures
    // For now we allow typical alphanumeric and slash paths
    if (!/^[a-zA-Z0-9_\-\/\s]+$/.test(folderPath)) {
      throw new ApiError(400, 'Invalid folderPath provided');
    }

    const fileUrl = await s3Service.uploadFile(
      req.file.buffer, 
      req.file.originalname, 
      req.file.mimetype, 
      folderPath
    );

    res.status(200).json({
      success: true,
      data: {
        fileUrl,
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile
};
