const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const ApiError = require('../utils/ApiError');

// Ensure AWS credentials exist
if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
  console.warn("WARNING: AWS S3 environment variables are missing. File uploads will fail.");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @param {string} mimeType - The mime type of the file
 * @param {string} folderPath - The folder path in the bucket (e.g., 'organizations/orgId/employees/empId')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
const uploadFile = async (fileBuffer, fileName, mimeType, folderPath = 'uploads') => {
  try {
    const key = `${folderPath}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      // ACL: 'public-read' // Omit ACL unless strictly needed and bucket allows it
    });

    await s3Client.send(command);

    // Return the formatted URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new ApiError(500, 'Failed to upload file to storage system');
  }
};

/**
 * Delete a file from S3 by URL or Key
 * @param {string} fileIdentifier - The S3 URL or Object Key
 */
const deleteFile = async (fileIdentifier) => {
  if (!fileIdentifier) return;
  
  try {
    let key = fileIdentifier;
    
    // Extract key from URL if it is a URL
    if (fileIdentifier.startsWith('http')) {
      const urlPattern = new RegExp(`^https?://${BUCKET_NAME}\\.s3\\.[a-z0-9-]+\\.amazonaws\\.com/(.+)$`);
      const match = fileIdentifier.match(urlPattern);
      if (match && match[1]) {
        key = match[1];
      } else {
        console.warn(`Could not extract S3 key from URL: ${fileIdentifier}`);
        return;
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new ApiError(500, 'Failed to delete file from storage system');
  }
};

module.exports = {
  uploadFile,
  deleteFile
};
