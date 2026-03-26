import axiosInstance from './axiosInstance';

const adminApi = {
  login: (data) => axiosInstance.post('/admin/login', data),
  getLawyers: (params) => axiosInstance.get('/admin/lawyers', { params }),
  getLawyerById: (id) => axiosInstance.get(`/admin/lawyers/${id}`),
  updateLawyer: (id, data) => axiosInstance.put(`/admin/lawyers/${id}`, data),
  deleteLawyer: (id) => axiosInstance.delete(`/admin/lawyers/${id}`),
  suspendLawyer: (id, data) => axiosInstance.patch(`/admin/lawyers/${id}/suspend`, data),
  getListings: (params) => axiosInstance.get('/admin/listings', { params }),
};

export default adminApi;