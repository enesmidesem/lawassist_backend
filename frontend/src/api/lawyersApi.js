import axiosInstance from './axiosInstance';

const lawyersApi = {
  getProfile: (id) => axiosInstance.get(`/lawyers/${id}`),
  updateProfile: (id, data) => axiosInstance.put(`/lawyers/${id}`, data),
  deleteProfile: (id) => axiosInstance.delete(`/lawyers/${id}`),
  getListings: (id, status) => axiosInstance.get(`/lawyers/${id}/listings`, { params: status ? { status } : {} }),
};

export default lawyersApi;
