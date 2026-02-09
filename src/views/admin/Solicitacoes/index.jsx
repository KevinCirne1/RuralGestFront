import React, { useState, useEffect } from "react";
import {
  Box, Flex, Button, Text, useColorModeValue, SimpleGrid,
  Icon, Badge, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Select, Textarea, Input, useToast, Spinner
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdPrint, MdLocalShipping, MdEvent } from "react-icons/md";
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from "services/api"; 
import { format } from 'date-fns';

// Esquema de Validação
const SolicitacaoSchema = Yup.object().shape({
  status: Yup.string().required('Status é obrigatório'),
  agricultor_id: Yup.number().required('Agricultor é obrigatório'),
  propriedade_id: Yup.number().required('Propriedade é obrigatória'),
  servico_id: Yup.number().required('Serviço é obrigatório'),
  veiculo_id: Yup.number().nullable(),
  observacoes: Yup.string().nullable()
});

export default function SolicitacoesPage() {
  // Estados
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [propriedades, setPropriedades] = useState([]); 
  const [agricultores, setAgricultores] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Controle do Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const toast = useToast();

  // Função de Busca Geral
  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqSol, reqServ, reqVeic, reqProp, reqAgri] = await Promise.all([
        api.get('/solicitacoes'),
        api.get('/servicos'),
        api.get('/veiculos'),
        api.get('/propriedades'),
        api.get('/agricultores') 
      ]);

      setSolicitacoes(reqSol.data || []);
      setServicos(reqServ.data || []);
      setVeiculos(reqVeic.data || []);
      setPropriedades(reqProp.data || []);
      setAgricultores(reqAgri.data || []);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ title: "Erro de conexão", description: "Não foi possível carregar os dados.", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- NOVA FUNÇÃO: Abrir Modal para CRIAR ---
  const handleNovaDemanda = () => {
    setSolicitacaoSelecionada(null); // Limpa (modo criação)
    onOpen();
  };

  // Abrir Modal para EDITAR
  const handleGerenciar = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao); // Preenche (modo edição)
    onOpen();
  };

  // Salvar Alterações (Serve para Criar e Editar)
  const handleSubmit = async (values, actions) => {
    try {
      if (solicitacaoSelecionada) {
        // EDIÇÃO (PUT)
        await api.put(`/solicitacoes/${solicitacaoSelecionada.id}`, values);
        toast({ title: "Solicitação atualizada!", status: "success", duration: 3000, isClosable: true });
      } else {
        // CRIAÇÃO (POST)
        const payload = { 
            ...values, 
            data_solicitacao: new Date().toISOString().split('T')[0] 
        };
        await api.post('/solicitacoes', payload);
        toast({ title: "Solicitação criada!", status: "success", duration: 3000, isClosable: true });
      }
      
      fetchData(); 
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar.", description: "Verifique os dados.", status: "error", duration: 3000, isClosable: true });
    } finally {
      actions.setSubmitting(false);
    }
  };

  // --- CORES DOS STATUS ATUALIZADAS ---
  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    if (s === 'APROVADA') return 'blue';      // Azul
    if (s === 'EM ANDAMENTO') return 'purple'; // Roxo (Diferente de Concluída e Aprovada)
    if (s === 'CONCLUÍDA') return 'green';    // Verde
    if (s === 'RECUSADA') return 'red';       // Vermelho
    return 'yellow';                          // Pendente (Amarelo)
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      
      {/* Cabeçalho */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Text fontSize='2xl' fontWeight='700' color={textColor}>Central de Solicitações</Text>
        <Button 
            leftIcon={<MdAdd />} 
            colorScheme='brand' 
            variant='solid' 
            onClick={handleNovaDemanda}
        >
            Nova Demanda
        </Button>
      </Flex>

      {/* Grid de Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap='20px'>
        {solicitacoes.map((sol) => (
          <Card key={sol.id} p='20px'>
            <Flex justify='space-between' mb='10px'>
              <Badge colorScheme={getStatusColor(sol.status)} borderRadius='8px' px='10px' py='5px'>
                {sol.status}
              </Badge>
              <Text fontSize='xs' color='gray.400'>#{sol.id}</Text>
            </Flex>

            {/* Título do Serviço */}
            <Flex align='center' mb='10px'>
               <Icon as={MdEvent} color='brand.500' w='20px' h='20px' mr='10px' />
               <Text fontWeight='bold' fontSize='lg'>
                 {sol.servico?.nome_servico || "Serviço N/A"}
               </Text>
            </Flex>

            {/* Detalhes */}
            <Box mb='20px'>
               <Text fontSize='sm' color='gray.500'>
                 <Text as='span' fontWeight='bold'>Agricultor: </Text> {sol.agricultor?.nome}
               </Text>
               <Text fontSize='sm' color='gray.500'>
                 <Text as='span' fontWeight='bold'>Local: </Text> {sol.propriedade?.terreno}
               </Text>
               <Text fontSize='sm' color='gray.500'>
                 <Text as='span' fontWeight='bold'>Data: </Text> 
                 {sol.data_solicitacao ? format(new Date(sol.data_solicitacao), 'dd/MM/yyyy') : '-'}
               </Text>
               
               {/* Veículo alocado */}
               {sol.veiculo && (
                 <Flex mt='2' align='center' color='blue.500'>
                    <Icon as={MdLocalShipping} mr='1' />
                    <Text fontSize='sm' fontWeight='bold'>{sol.veiculo.nome}</Text>
                 </Flex>
               )}
            </Box>

            {/* Ações */}
            <Flex justify='space-between' mt='auto'>
               <Button leftIcon={<MdPrint />} size='sm' variant='ghost'>Imprimir</Button>
               <Button 
                 leftIcon={<MdEdit />} 
                 size='sm' 
                 colorScheme='brand' 
                 variant='outline'
                 onClick={() => handleGerenciar(sol)}
               >
                 Gerenciar
               </Button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>

      {/* Mensagem se lista vazia */}
      {!loading && solicitacoes.length === 0 && (
        <Flex direction="column" align="center" justify="center" mt="50px" color="gray.500">
            <Icon as={MdLocalShipping} w={16} h={16} mb={4} opacity={0.3} />
            <Text fontSize="lg" fontWeight="500">Nenhuma solicitação encontrada.</Text>
            <Text fontSize="sm">Clique em "Nova Demanda" para começar.</Text>
        </Flex>
      )}

      {/* MODAL GERENCIAR/CRIAR DEMANDA */}
      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{solicitacaoSelecionada ? `Gerenciar Demanda #${solicitacaoSelecionada.id}` : "Nova Demanda Manual"}</ModalHeader>
            <ModalCloseButton />
            
            <Formik
                key={solicitacaoSelecionada ? solicitacaoSelecionada.id : 'nova'}
                
                initialValues={{
                    status: solicitacaoSelecionada?.status || 'PENDENTE',
                    agricultor_id: solicitacaoSelecionada?.agricultor?.id || '',
                    propriedade_id: solicitacaoSelecionada?.propriedade?.id || '',
                    servico_id: solicitacaoSelecionada?.servico?.id || '',
                    veiculo_id: solicitacaoSelecionada?.veiculo?.id || '',
                    observacoes: solicitacaoSelecionada?.observacoes || ''
                }}
                validationSchema={SolicitacaoSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true} 
            >
                {(props) => (
                    <Form>
                        <ModalBody>
                            {/* --- STATUS --- */}
                            <Field name='status'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Status</FormLabel>
                                        <Select {...field}>
                                            <option value="PENDENTE">PENDENTE</option>
                                            <option value="APROVADA">APROVADA</option>
                                            <option value="EM ANDAMENTO">EM ANDAMENTO</option>
                                            <option value="CONCLUÍDA">CONCLUÍDA</option>
                                            <option value="RECUSADA">RECUSADA</option>
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            {/* --- AGRICULTOR --- */}
                            <Field name='agricultor_id'>
                                {({ field }) => (
                                    <FormControl mb={4} isInvalid={props.errors.agricultor_id && props.touched.agricultor_id}>
                                        <FormLabel>Agricultor</FormLabel>
                                        <Select 
                                            {...field} 
                                            disabled={!!solicitacaoSelecionada} 
                                            bg={!!solicitacaoSelecionada ? 'gray.100' : 'white'}
                                            placeholder="Selecione o agricultor..."
                                        >
                                            {agricultores.map(ag => (
                                                <option key={ag.id} value={ag.id}>{ag.nome}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            {/* --- PROPRIEDADE --- */}
                            <Field name='propriedade_id'>
                                {({ field }) => (
                                    <FormControl mb={4} isInvalid={props.errors.propriedade_id && props.touched.propriedade_id}>
                                        <FormLabel>Propriedade (Local)</FormLabel>
                                        <Select 
                                            {...field} 
                                            disabled={!!solicitacaoSelecionada} 
                                            bg={!!solicitacaoSelecionada ? 'gray.100' : 'white'}
                                            placeholder="Selecione a propriedade..."
                                        >
                                            {propriedades
                                                .filter(p => !props.values.agricultor_id || String(p.agricultor_id) === String(props.values.agricultor_id))
                                                .map(p => (
                                                <option key={p.id} value={p.id}>{p.terreno}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            {/* --- SERVIÇO --- */}
                            <Field name='servico_id'>
                                {({ field }) => (
                                    <FormControl mb={4} isInvalid={props.errors.servico_id && props.touched.servico_id}>
                                        <FormLabel>Serviço Solicitado</FormLabel>
                                        <Select 
                                            {...field} 
                                            disabled={!!solicitacaoSelecionada} 
                                            bg={!!solicitacaoSelecionada ? 'gray.100' : 'white'}
                                            placeholder="Selecione o serviço..."
                                        >
                                            {servicos.map(s => (
                                                <option key={s.id} value={s.id}>{s.nome_servico}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            {/* --- MÁQUINA --- */}
                            <Field name='veiculo_id'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel color='brand.500' fontWeight='bold'>Alocar Máquina</FormLabel>
                                        <Select {...field} placeholder="Selecione a máquina (Opcional)...">
                                            {veiculos.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.nome} ({v.status})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            <Field name='observacoes'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Observações</FormLabel>
                                        <Textarea {...field} placeholder="Detalhes da execução..." />
                                    </FormControl>
                                )}
                            </Field>

                        </ModalBody>
                        <ModalFooter>
                            <Button variant='ghost' mr={3} onClick={onClose}>Cancelar</Button>
                            <Button colorScheme='brand' type='submit' isLoading={props.isSubmitting}>Salvar</Button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </ModalContent>
      </Modal>
    </Box>
  );
}