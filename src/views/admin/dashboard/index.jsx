import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, SimpleGrid, Text, useColorModeValue, Flex, Icon, Spinner 
} from '@chakra-ui/react';
// Ícones
import { 
  MdBarChart, 
  MdPerson, 
  MdLocalShipping, // Caminhão/Trator
  MdCheckCircle, 
  MdPets, // Ícone para Gado/Pecuária
  MdEco   // Ícone para Agricultura/Produção
} from 'react-icons/md';

// Componentes Visuais
import Card from 'components/card/Card'; 
import ReactApexChart from 'react-apexcharts'; 

// Serviços
import { getAgricultores } from 'services/agricultorService';
import { getPropriedades } from 'services/propriedadeService';
import { getSolicitacoes } from 'services/solicitacaoService';
import api from 'services/api'; 

// --- COMPONENTE DE MINI-STAT ---
const MiniStatistics = ({ title, amount, icon, color }) => {
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");

  return (
    <Card py='15px'>
      <Flex direction='row' align='center' justify='center'>
        <Flex
          align='center' justify='center' borderRadius='50%' w='56px' h='56px' bg={color} me='18px'
        >
          <Icon w='28px' h='28px' as={icon} color={iconBoxInside} />
        </Flex>
        <Flex direction='column'>
          <Text color={textColorSecondary} fontSize='sm' fontWeight='500'>{title}</Text>
          <Text color={textColor} fontSize='2xl' fontWeight='700'>{amount}</Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default function Dashboard() {
  // --- ESTADOS ---
  const [kpis, setKpis] = useState({
    totalAgricultores: 0,
    totalGado: 0, // Novo KPI
    veiculosEmUso: 0,
    totalSolicitacoes: 0
  });

  // Dados para os Gráficos
  const [pieStatusData, setPieStatusData] = useState([0, 0, 0]); 
  const [barServicosData, setBarServicosData] = useState({ categories: [], series: [] }); 
  
  // Novo Estado para o Gráfico de Produção
  const [pieCulturaData, setPieCulturaData] = useState({ labels: [], series: [] });

  const [loading, setLoading] = useState(true);

  // --- CORES DO TEMA ---
  const textColor = useColorModeValue("secondaryGray.900", "white");

  // --- BUSCA DE DADOS ---
  const fetchData = useCallback(async () => {
    try {
      const [agricultoresRes, propriedadesRes, solicitacoesRes, veiculosRes] = await Promise.all([
        getAgricultores(),
        getPropriedades(),
        getSolicitacoes(),
        api.get('/veiculos')
      ]);

      const solicitacoes = solicitacoesRes.data;
      const veiculos = veiculosRes.data;
      const propriedades = propriedadesRes.data;

      // 1. CALCULAR KPIS
      const veiculosOcupados = veiculos.filter(v => v.status === 'EM_USO').length;
      
      // Soma total de gado de todas as propriedades
      const totalGado = propriedades.reduce((acc, curr) => acc + (curr.quantidade_gado || 0), 0);

      setKpis({
        totalAgricultores: agricultoresRes.data.length,
        totalGado: totalGado,
        veiculosEmUso: veiculosOcupados,
        totalSolicitacoes: solicitacoes.length
      });

      // 2. GRÁFICO 1: STATUS PEDIDOS (PIZZA)
      const aprovadas = solicitacoes.filter(s => s.status === 'APROVADA' || s.status === 'Concluído').length;
      const pendentes = solicitacoes.filter(s => s.status === 'Pendente' || s.status === 'PENDENTE').length;
      const recusadas = solicitacoes.filter(s => s.status === 'RECUSADA' || s.status === 'CANCELADA').length;
      setPieStatusData([aprovadas, pendentes, recusadas]);

      // 3. GRÁFICO 2: SERVIÇOS MAIS PEDIDOS (BARRAS)
      const contagemServicos = {};
      solicitacoes.forEach(sol => {
        const nome = sol.servico ? sol.servico.nome_servico : 'Outros';
        contagemServicos[nome] = (contagemServicos[nome] || 0) + 1;
      });
      const nomesServicos = Object.keys(contagemServicos);
      const qtdServicos = Object.values(contagemServicos);
      setBarServicosData({
        categories: nomesServicos,
        series: [{ name: 'Pedidos', data: qtdServicos }]
      });

      // 4. GRÁFICO 3: PRODUÇÃO AGRÍCOLA (NOVO - PIZZA/ROSCA)
      const contagemCulturas = {};
      propriedades.forEach(prop => {
          const cultura = prop.cultura_principal || 'Não Informado';
          contagemCulturas[cultura] = (contagemCulturas[cultura] || 0) + 1;
      });
      const labelsCultura = Object.keys(contagemCulturas);
      const seriesCultura = Object.values(contagemCulturas);
      setPieCulturaData({ labels: labelsCultura, series: seriesCultura });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CONFIGURAÇÕES VISUAIS DOS GRÁFICOS ---
  
  // 1. Status (Pizza)
  const pieStatusOptions = {
    labels: ["Aprovadas", "Pendentes", "Recusadas/Canc."],
    colors: ["#01B574", "#FFB547", "#E31A1A"], 
    chart: { width: "100%" },
    legend: { position: 'bottom' },
    dataLabels: { enabled: true }
  };

  // 2. Serviços (Barras)
  const barServicosOptions = {
    chart: { toolbar: { show: false } },
    tooltip: { style: { fontSize: '12px' }, theme: 'dark' },
    xaxis: { categories: barServicosData.categories },
    colors: ["#4318FF"], 
    plotOptions: {
      bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' }
    },
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 5, yaxis: { lines: { show: true } } }
  };

  // 3. Produção (Rosca/Donut - Novo!)
  const pieCulturaOptions = {
    labels: pieCulturaData.labels,
    colors: ["#6AD2FF", "#4318FF", "#EFF4FB", "#01B574", "#FFB547"], // Paleta variada
    chart: { type: 'donut' },
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: 'Propriedades',
                fontSize: '22px',
                fontWeight: 'bold',
                color: textColor,
              }
            }
          }
        }
    }
  };

  if (loading) return (<Flex justify='center' align='center' h='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      
      {/* 1. LINHA DO TOPO: CARDS DE ESTATÍSTICAS */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <MiniStatistics title="Total de Agricultores" amount={kpis.totalAgricultores} icon={MdPerson} color='brand.500' />
        <MiniStatistics title="Solicitações Totais" amount={kpis.totalSolicitacoes} icon={MdBarChart} color='blue.500' />
        <MiniStatistics title="Veículos em Uso" amount={kpis.veiculosEmUso} icon={MdLocalShipping} color='orange.500' />
        {/* --- NOVO CARD DE INTELECTO: GADO --- */}
        <MiniStatistics title="Censo Pecuário (Cabeças)" amount={kpis.totalGado} icon={MdPets} color='green.500' />
      </SimpleGrid>

      {/* 2. LINHA DO MEIO: GRÁFICOS PRINCIPAIS */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px' mb='20px'>
        
        {/* STATUS DOS PEDIDOS */}
        <Card p='20px' align='center' direction='column' w='100%'>
          <Flex justify='space-between' align='center' w='100%' mb='8px'>
            <Text fontSize='lg' color={textColor} fontWeight='700'>Status dos Pedidos</Text>
            <Icon as={MdCheckCircle} color='green.500' w='24px' h='24px' />
          </Flex>
          <Box h='250px' mt='auto'>
            <ReactApexChart 
              options={pieStatusOptions} 
              series={pieStatusData} 
              type="pie" 
              width="100%" 
              height="100%" 
            />
          </Box>
        </Card>

        {/* SERVIÇOS MAIS PEDIDOS */}
        <Card p='20px' align='center' direction='column' w='100%'>
          <Flex justify='space-between' align='center' w='100%' mb='8px'>
            <Text fontSize='lg' color={textColor} fontWeight='700'>Serviços Mais Pedidos</Text>
            <Icon as={MdBarChart} color='brand.500' w='24px' h='24px' />
          </Flex>
          <Box h='250px' w='100%'>
            <ReactApexChart 
              options={barServicosOptions} 
              series={barServicosData.series} 
              type="bar" 
              width="100%" 
              height="100%" 
            />
          </Box>
        </Card>

      </SimpleGrid>

      {/* 3. LINHA INFERIOR: GRÁFICO DE PRODUÇÃO (NOVO) */}
      <SimpleGrid columns={{ base: 1 }} gap='20px' mb='20px'>
          <Card p='20px' align='center' direction='column' w='100%'>
            <Flex justify='space-between' align='center' w='100%' mb='8px'>
                <Text fontSize='lg' color={textColor} fontWeight='700'>Produção Agrícola da Região</Text>
                <Icon as={MdEco} color='green.400' w='24px' h='24px' />
            </Flex>
            <Text fontSize='sm' color='gray.500' alignSelf='start' mb='20px'>
                Distribuição baseada na cultura principal cadastrada nas propriedades.
            </Text>
            <Box h='300px' w='100%'>
                <ReactApexChart 
                    options={pieCulturaOptions} 
                    series={pieCulturaData.series} 
                    type="donut" 
                    width="100%" 
                    height="100%" 
                />
            </Box>
          </Card>
      </SimpleGrid>

    </Box>
  );
}