import axios, { AxiosInstance } from 'axios';
import { Auth } from './services';
import { API_URL } from './api-urls';

function configureApi (baseUrl: string, client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const headers = config.headers || {};
    if (Auth.isAuthenticated()) {
      const token = Auth.getAccessToken();
      const commonHeaders = Object.assign({}, headers.common, { Authorization: `Bearer ${token}` });
      headers.common = commonHeaders;
    }
    const newConfig = Object.assign({
      baseURL: baseUrl,
      headers
    }, config);
    return newConfig;
  });
}

configureApi(API_URL, axios);