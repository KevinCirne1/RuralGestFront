import React, { useEffect, useState } from "react";
import {
  Box,
  SimpleGrid,
  Text,
  useColorModeValue,
  Flex,
  Icon,
  Spinner
} from "@chakra-ui/react";

// Ícones
import {
  MdBarChart,
  MdAgriculture, 
  MdAssignment,  
  MdTerrain,     
  MdAccessTime,  
  MdCheckCircle
} from "react-icons/md";

// Componentes Visuais
import IconBox from "components/icons/IconBox";
import Card from "components/card/Card";
import ReactApexChart from "react-apexcharts";

// Serviços
import { getDashboardResumo, getDashboardGraficos } from "services/dashboardService";

// --- COMPONENTE MINI STATISTICS (Interno) ---
const MiniStatistics = ({ startContent, name, value }) => {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");

  return (
    <Card py='15px'>
      <Flex
        my='auto'
        h='100%'
        align={{ base: "center", xl: "start" }}
        justify={{ base: "center", xl: "center" }}>
        {startContent}

        <Box ms={startContent ? "18px" : "0px"}>
          <Text
            color={textColorSecondary}
            fontSize={{ base: "xs" }}
            fontWeight='500'
            me='14px'>
            {name}
          </Text>
          <Text
            color={textColor}
            fontSize={{ base: "2xl" }}
            fontWeight='700'
            lineHeight='100%'>
            {value}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
};

export default function Dashboard() {
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  
  // Dados do Resumo
  const [stats, setStats] = useState({
    total_agricultores: 0,
    total_solicitacoes: 0,
    total_hectares_cadastrados: 0,
    solicitacoes_status: {
      pendentes: 0,
      em_andamento: 0,
      concluidas: 0
    }
  });

  // Dados dos Gráficos
  const [graficoServicos, setGraficoServicos] = useState({ categories: [], data: [] });
  const [graficoStatus, setGraficoStatus] = useState([]);

  // Cores do Tema
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  // --- BUSCA DE DADOS ---
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Busca Resumo
        const resumoData = await getDashboardResumo();
        const dadosSeguros = resumoData || {
            total_agricultores: 0,
            total_solicitacoes: 0,
            total_hectares_cadastrados: 0,
            solicitacoes_status: { pendentes: 0, em_andamento: 0, concluidas: 0 }
        };
        setStats(dadosSeguros);

        // Prepara dados para o Gráfico de Rosca
        setGraficoStatus([
            dadosSeguros.solicitacoes_status?.pendentes || 0,
            dadosSeguros.solicitacoes_status?.em_andamento || 0,
            dadosSeguros.solicitacoes_status?.concluidas || 0
        ]);

        // 2. Busca Gráficos
        const graficosData = await getDashboardGraficos();
        if (graficosData && graficosData.servicos_populares) {
            const categories = graficosData.servicos_populares.map(item => item.name);
            const data = graficosData.servicos_populares.map(item => item.value);
            setGraficoServicos({ categories, data });
        }

      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- OPÇÕES DOS GRÁFICOS ---
  
  // 1. Barras (Serviços)
  const barChartOptions = {
    chart: { toolbar: { show: false } },
    tooltip: { theme: "dark" },
    xaxis: { 
      categories: graficoServicos.categories,
      labels: { style: { colors: "#A3AED0", fontSize: "12px", fontWeight: "500" } }
    },
    yaxis: { show: false },
    grid: { show: false, strokeDashArray: 5, yaxis: { lines: { show: true } } },
    fill: { type: "solid", colors: ["#4318FF"] },
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "40px" } }
  };
  const barChartSeries = [{ name: "Solicitações", data: graficoServicos.data }];

  // 2. Rosca (Donut) - Status
  const donutChartOptions = {
    labels: ["Pendentes", "Em Andamento", "Concluídas"],
    colors: ["#FFB547", "#4318FF", "#05CD99"], 
    chart: { width: "100%" },
    states: { hover: { filter: { type: "none" } } },
    legend: { show: true, position: "bottom" },
    dataLabels: { enabled: false },
    hover: { mode: null },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
              label: "Total",
              fontSize: "22px",
              fontWeight: "bold",
              color: textColor,
            },
            value: { fontSize: "30px", show: true, color: textColor }
          }
        }
      }
    },
    tooltip: { enabled: true, theme: "dark" },
  };

  if (loading) return (<Flex justify='center' align='center' h='50vh'><Spinner size='xl' color={brandColor} /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      
      {/* LINHA 1: CARTÕES */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={<IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdAgriculture} color={brandColor} />} />}
          name='Agricultores' value={stats.total_agricultores}
        />
        <MiniStatistics
          startContent={<IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdAssignment} color={brandColor} />} />}
          name='Total Pedidos' value={stats.total_solicitacoes}
        />
        <MiniStatistics
          startContent={<IconBox w='56px' h='56px' bg={boxBg} icon={<Icon w='32px' h='32px' as={MdTerrain} color='green.500' />} />}
          name='Hectares Totais' value={stats.total_hectares_cadastrados}
        />
        <MiniStatistics
          startContent={<IconBox w='56px' h='56px' bg='orange.100' icon={<Icon w='32px' h='32px' as={MdAccessTime} color='orange.500' />} />}
          name='Pendências' value={stats.solicitacoes_status?.pendentes || 0}
        />
      </SimpleGrid>

      {/* LINHA 2: GRÁFICOS */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px' mb='20px'>
        <Card p='20px' align='center' direction='column' w='100%'>
            <Flex justify='space-between' align='center' w='100%' mb='20px'>
                <Text color={textColor} fontSize='lg' fontWeight='700'>Serviços Mais Solicitados</Text>
                <Icon as={MdBarChart} color={brandColor} w='24px' h='24px' />
            </Flex>
            <Box h='240px' w='100%'>
                <ReactApexChart options={barChartOptions} series={barChartSeries} type='bar' width='100%' height='100%' />
            </Box>
        </Card>

        <Card p='20px' align='center' direction='column' w='100%'>
            <Flex justify='space-between' align='center' w='100%' mb='8px'>
                <Text color={textColor} fontSize='lg' fontWeight='700'>Status das Solicitações</Text>
                <Icon as={MdCheckCircle} color='green.500' w='24px' h='24px' />
            </Flex>
            <Box h='250px' mt='auto' w='100%'>
                <ReactApexChart options={donutChartOptions} series={graficoStatus} type='donut' width='100%' height='100%' />
            </Box>
        </Card>
      </SimpleGrid>
    </Box>
  );
}