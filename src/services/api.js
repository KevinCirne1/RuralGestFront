import axios from "axios";

// Instância do Axios simplificada, sem interceptors
const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
