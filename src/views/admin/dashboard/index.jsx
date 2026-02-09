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
  MdCheckCircle
} from "react-icons/md";

// Componentes Visuais
import IconBox from "components/icons/IconBox";
import Card from "components/card/Card";
import ReactApexChart from "react-apexcharts";

// Serviços
import { getDashboardResumo, getDashboardGraficos } from "services/dashboardService";

// --- COMPONENTE MINI STATISTICS (Turbinado) ---
const MiniStatistics = ({ startContent, name, value }) => {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");

  return (
    <Card py='30px'> {/* Aumentado o padding vertical */}
      <Flex
        my='auto'
        h='100%'
        align={{ base: "center", xl: "center" }}
        justify={{ base: "center", xl: "center" }}>
        {startContent}

        <Box ms={startContent ? "25px" : "0px"}>
          <Text
            color={textColorSecondary}
            fontSize={{ base: "sm" }} // Aumentado o tamanho da legenda
            fontWeight='600'
            me='14px'>
            {name}
          </Text>
          <Text
            color={textColor}
            fontSize={{ base: "4xl" }} // Aumentado o tamanho do valor para 4xl
            fontWeight='800'
            lineHeight='100%'>
            {value}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  // Dados do Resumo
  const [stats, setStats] = useState({
    total_agricultores: 0,
    total_solicitacoes: 0,
    solicitacoes_status: {
      pendentes: 0,
      em_andamento: 0,
      concluidas: 0
    }
  });

  const [graficoServicos, setGraficoServicos] = useState({ categories: [], data: [] });
  const [graficoStatus, setGraficoStatus] = useState([]);

  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("secondaryGray.900", "white");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const resumoData = await getDashboardResumo();
        const dadosSeguros = resumoData || {
            total_agricultores: 0,
            total_solicitacoes: 0,
            solicitacoes_status: { pendentes: 0, em_andamento: 0, concluidas: 0 }
        };
        setStats(dadosSeguros);

        setGraficoStatus([
            dadosSeguros.solicitacoes_status?.pendentes || 0,
            dadosSeguros.solicitacoes_status?.em_andamento || 0,
            dadosSeguros.solicitacoes_status?.concluidas || 0
        ]);

        const graficosData = await getDashboardGraficos();
        if (graficosData && graficosData.servicos_populares) {
            setGraficoServicos({
                categories: graficosData.servicos_populares.map(item => item.name),
                data: graficosData.servicos_populares.map(item => item.value)
            });
        }
      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const barChartOptions = {
    chart: { toolbar: { show: false } },
    tooltip: { theme: "dark" },
    xaxis: { 
      categories: graficoServicos.categories,
      labels: { style: { colors: "#A3AED0", fontSize: "12px", fontWeight: "500" } }
    },
    fill: { type: "solid", colors: ["#4318FF"] },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "40px" } }
  };
  const barChartSeries = [{ name: "Solicitações", data: graficoServicos.data }];

  const donutChartOptions = {
    labels: ["Pendentes", "Em Andamento", "Concluídas"],
    colors: ["#FFB547", "#805AD5", "#05CD99"], 
    chart: { width: "100%" },
    legend: { show: true, position: "bottom" },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "22px",
              fontWeight: "bold",
              color: textColor,
            }
          }
        }
      }
    }
  };

  if (loading) return (<Flex justify='center' align='center' h='50vh'><Spinner size='xl' color={brandColor} /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      
      {/* LINHA 1: CARTÕES (Agora com 2 colunas e maiores) */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox 
              w='80px' 
              h='80px' 
              bg={boxBg} 
              icon={<Icon w='40px' h='40px' as={MdAgriculture} color={brandColor} />} 
            />
          }
          name='Agricultores Cadastrados' 
          value={stats.total_agricultores}
        />
        <MiniStatistics
          startContent={
            <IconBox 
              w='80px' 
              h='80px' 
              bg={boxBg} 
              icon={<Icon w='40px' h='40px' as={MdAssignment} color={brandColor} />} 
            />
          }
          name='Total de Pedidos Realizados' 
          value={stats.total_solicitacoes}
        />
      </SimpleGrid>

      {/* LINHA 2: GRÁFICOS */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px' mb='20px'>
        <Card p='20px' align='center' direction='column' w='100%'>
            <Flex justify='space-between' align='center' w='100%' mb='20px'>
                <Text color={textColor} fontSize='lg' fontWeight='700'>Serviços Mais Solicitados</Text>
                <Icon as={MdBarChart} color={brandColor} w='24px' h='24px' />
            </Flex>
            <Box h='280px' w='100%'>
                <ReactApexChart options={barChartOptions} series={barChartSeries} type='bar' width='100%' height='100%' />
            </Box>
        </Card>

        <Card p='20px' align='center' direction='column' w='100%'>
            <Flex justify='space-between' align='center' w='100%' mb='8px'>
                <Text color={textColor} fontSize='lg' fontWeight='700'>Status das Solicitações</Text>
                <Icon as={MdCheckCircle} color='green.500' w='24px' h='24px' />
            </Flex>
            <Box h='280px' mt='auto' w='100%'>
                <ReactApexChart options={donutChartOptions} series={graficoStatus} type='donut' width='100%' height='100%' />
            </Box>
        </Card>
      </SimpleGrid>
    </Box>
  );
}