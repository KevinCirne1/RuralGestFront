import api from './api';

export const getDashboardResumo = async () => {
  try {
    const response = await api.get('/dashboard/resumo');
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar resumo:", error);
    throw error;
  }
};

export const getDashboardGraficos = async () => {
  try {
    const response = await api.get('/dashboard/graficos');
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar gráficos:", error);
    throw error;
  }
};