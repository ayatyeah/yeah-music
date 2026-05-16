import api from './api';

export const uploadService = {
  uploadTrack: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/uploads/upload', formData);
    return response.data;
  },
};
