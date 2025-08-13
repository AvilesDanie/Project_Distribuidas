import api from './api';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/eventos/eventos/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
};