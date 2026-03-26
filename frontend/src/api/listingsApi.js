import axiosInstance from './axiosInstance';

const listingsApi = {
  getAll: (params) => axiosInstance.get('/listings', { params }),
  create: (data) => axiosInstance.post('/listings', data),
  update: (id, data) => axiosInstance.put(`/listings/${id}`, data),
  remove: (id) => axiosInstance.delete(`/listings/${id}`),
  getApplications: (listingId) => axiosInstance.get(`/listings/${listingId}/applications`),
  apply: (listingId, data) => axiosInstance.post(`/listings/${listingId}/applications`, data),
  cancelApplication: (listingId, applicationId) => axiosInstance.delete(`/listings/${listingId}/applications/${applicationId}`),
};

export default listingsApi;
