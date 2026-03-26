import axiosInstance from './axiosInstance';

const applicationsApi = {
  approve: (applicationId) => axiosInstance.patch(`/applications/${applicationId}/approve`),
  reject: (applicationId) => axiosInstance.patch(`/applications/${applicationId}/reject`),
};

export default applicationsApi;
