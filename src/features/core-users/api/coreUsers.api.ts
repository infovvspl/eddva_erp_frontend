import axiosInstance from '../../../lib/axios';

export interface CoreUser {
  id: string;
  name: string;
  email: string;
  status: string;
  roleId: string;
  roleName: string;
  isAdmin: boolean;
  createdAt: string;
}

export const listCoreUsers = async (): Promise<CoreUser[]> => {
  const response = await axiosInstance.get('/users');
  return response.data?.data ?? response.data ?? [];
};

export const setCoreUserAdminRole = async (userId: string, isAdmin: boolean): Promise<CoreUser> => {
  const response = await axiosInstance.patch(`/users/${userId}/admin-role`, { isAdmin });
  return response.data?.data ?? response.data;
};
