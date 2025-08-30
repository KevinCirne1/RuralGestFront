// src/services/api.js

import axios from 'axios';

const api = axios.create({
  // CORREÇÃO: Altere a porta para 5000, onde o seu json-server está rodando
  baseURL: 'http://localhost:5000', 
});

export default api;