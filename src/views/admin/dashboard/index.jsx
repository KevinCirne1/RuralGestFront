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

import {
  MdBarChart,
  MdAgriculture, 
  MdAssignment,    
  MdCheckCircle
} from "react-icons/md";

import IconBox from "components/icons/IconBox";
import Card from "components/card/Card";
import ReactApexChart from "react-apexcharts";
import { getDashboardResumo, getDashboardGraficos } from "services/dashboardService";

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
            fontSize={{ base: "sm" }}
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
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    total_agricultores: 0,
    total_solicitacoes: 0,
    solicitacoes_status: { pendentes: 0, em_andamento: 0, concluidas: 0 }
  });

  const [graficoServicos, setGraficoServicos] = useState({ categories: [], data: [] });
  const [graficoStatus, setGraficoStatus] = useState([]);

  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("secondaryGray.900", "white"); 
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white"); 

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

  //GRÁFICO DE Serviços
  const barChartOptions = {
    chart: { toolbar: { show: false } },
    tooltip: { theme: "dark" },
    xaxis: { 
      categories: graficoServicos.categories,
      labels: { 
        style: { 
            colors: textColor, 
            fontSize: "12px", 
            fontWeight: "500" 
        } 
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
        labels: {
            style: {
                colors: textColorSecondary, 
                fontSize: "12px",
                fontWeight: "500"
            }
        }
    },
    grid: {
        strokeDashArray: 5,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }, 
    },
    fill: { type: "solid", colors: ["#4318FF"] },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "40px" } },
    dataLabels: { enabled: false }
  };
  
  const barChartSeries = [{ name: "Solicitações", data: graficoServicos.data }];

  //GRÁFICO DE STATUS
  const donutChartOptions = {
    labels: ["Pendentes", "Em Andamento", "Concluídas"],
    colors: ["#FFB547", "#805AD5", "#05CD99"], 
    chart: { width: "100%" },
    legend: { 
        show: true, 
        position: "bottom",
        labels: {
            colors: textColor, 
            useSeriesColors: false
        },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: textColorSecondary, 
            },
            value: {
                show: true,
                fontSize: '24px', 
                fontWeight: '700',
                color: textColor, 
                formatter: function (val) { return val; }
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: "600",
              color: textColor, 
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0)
              }
            }
          }
        }
      }
    }
  };

  if (loading) return (<Flex justify='center' align='center' h='50vh'><Spinner size='xl' color={brandColor} /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox 
              w='56px' 
              h='56px' 
              bg={boxBg} 
              icon={<Icon w='32px' h='32px' as={MdAgriculture} color={brandColor} />} 
            />
          }
          name='Agricultores Cadastrados' 
          value={stats.total_agricultores}
        />
        <MiniStatistics
          startContent={
            <IconBox 
              w='56px' 
              h='56px' 
              bg={boxBg} 
              icon={<Icon w='32px' h='32px' as={MdAssignment} color={brandColor} />} 
            />
          }
          name='Total de Pedidos' 
          value={stats.total_solicitacoes}
        />
      </SimpleGrid>

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