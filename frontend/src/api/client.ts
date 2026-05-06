import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API request failed:', error);
    return Promise.reject(error);
  },
);

export default client;
