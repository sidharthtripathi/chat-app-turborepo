import axios from "axios";
export const server = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});
server.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalRequest = err.config;
    if (err.response.status === 401) {
      try {
        await axios.get("/api/access-token", {
          withCredentials: true,
          baseURL: import.meta.env.VITE_BACKEND_URL,
        });
        const res = await axios(originalRequest);
        return Promise.resolve(res);
      } catch (error) {
        return Promise.reject(error)
      }
    }
    return Promise.reject(err)
  } 
);
