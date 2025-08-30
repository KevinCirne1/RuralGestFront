import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import DefaultCard from 'components/card/Default';

// Importa os serviços necessários
import { getAgricultores } from 'services/agricultorService';
import { getPropriedades } from 'services/propriedadeService';
import { getSolicitacoes } from 'services/solicitacaoService';

export default function Dashboard() {
  const [totalAgricultores, setTotalAgricultores] = useState(0);
  const [totalPropriedades, setTotalPropriedades] = useState(0);
  const [servicosEmAndamento, setServicosEmAndamento] = useState(0);
  const [servicosConcluidos, setServicosConcluidos] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        agricultoresResponse,
        propriedadesResponse,
        solicitacoesResponse
      ] = await Promise.all([
        getAgricultores(),
        getPropriedades(),
        getSolicitacoes()
      ]);
      
      const agricultoresCount = agricultoresResponse.data.length;
      const propriedadesCount = propriedadesResponse.data.length;
      
      const solicitacoes = solicitacoesResponse.data;
      const emAndamento = solicitacoes.filter(sol => sol.status === "Em Andamento" || sol.status === "Pendente").length;
      const concluidos = solicitacoes.filter(sol => sol.status === "Concluído").length;

      setTotalAgricultores(agricultoresCount);
      setTotalPropriedades(propriedadesCount);
      setServicosEmAndamento(emAndamento);
      setServicosConcluidos(concluidos);
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize="2xl" fontWeight="bold" mb='20px'>
        Painel de Monitoramento
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px'>
        <DefaultCard title="Total de Agricultores" value={totalAgricultores} />
        <DefaultCard title="Serviços em Andamento" value={servicosEmAndamento} />
        <DefaultCard title="Serviços Concluídos" value={servicosConcluidos} />
        <DefaultCard title="Total de Propriedades" value={totalPropriedades} />
      </SimpleGrid>
      
    </Box>
  );
}