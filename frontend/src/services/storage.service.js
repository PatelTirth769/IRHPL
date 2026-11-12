import api from './api';

export const storageService = {
  /**
   * Upload a file to S3 via the backend API
   * @param {File} file - The file to upload
   * @param {string} folderPath - The folder path in S3 bucket
   * @returns {Promise<string>} The public URL of the uploaded file
   */
  uploadFile: async (file, folderPath) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderPath) {
      formData.append('folderPath', folderPath);
    }

    const response = await api.post('/storage', formData);

    return response.data?.data?.fileUrl;
  }
};
