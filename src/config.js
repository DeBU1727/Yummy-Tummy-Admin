const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  return 'http://localhost:9090';
};

const getMainAppUrl = () => {
  if (process.env.REACT_APP_MAIN_APP_URL) {
    return process.env.REACT_APP_MAIN_APP_URL;
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();
export const MAIN_APP_URL = getMainAppUrl();
