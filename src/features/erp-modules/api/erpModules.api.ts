import axiosInstance from '../../../lib/axios';

/** `null` means "not restricted" — show every module, same as before this existed. */
export const getEnabledModulePaths = async (): Promise<string[] | null> => {
  const response = await axiosInstance.get('/erp-modules/enabled');
  return response.data?.enabledPaths ?? null;
};
