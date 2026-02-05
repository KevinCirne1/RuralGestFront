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
  veiculo_id: Yup.number().nullable(),
  observacoes: Yup.string().nullable()
});

export default function SolicitacoesPage() {
  // Estados
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [propriedades, setPropriedades] = useState([]); 
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
      // Busca tudo em paralelo
      const [reqSol, reqServ, reqVeic, reqProp] = await Promise.all([
        api.get('/solicitacoes'),
        api.get('/servicos'),
        api.get('/veiculos'),
        api.get('/propriedades')
      ]);

      setSolicitacoes(reqSol.data || []);
      setServicos(reqServ.data || []);
      setVeiculos(reqVeic.data || []);
      setPropriedades(reqProp.data || []);

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

  // Abrir Modal
  const handleGerenciar = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    onOpen();
  };

  // Salvar Alterações
  const handleSubmit = async (values, actions) => {
    try {
      await api.put(`/solicitacoes/${solicitacaoSelecionada.id}`, values);
      toast({ title: "Solicitação atualizada!", status: "success", duration: 3000, isClosable: true });
      fetchData(); 
      onClose();
    } catch (error) {
      toast({ title: "Erro ao atualizar.", status: "error", duration: 3000, isClosable: true });
    } finally {
      actions.setSubmitting(false);
    }
  };

  // Cores dos Status
  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    if (s === 'APROVADA' || s === 'EM ANDAMENTO') return 'blue';
    if (s === 'CONCLUÍDA') return 'green';
    if (s === 'RECUSADA') return 'red';
    return 'yellow'; // Pendente
  };

  if (loading) return <Flex justify='center' mt='100px'><Spinner size='xl' /></Flex>;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      
      {/* Cabeçalho */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Text fontSize='2xl' fontWeight='700' color={textColor}>Central de Solicitações</Text>
        <Button leftIcon={<MdAdd />} colorScheme='brand' variant='solid'>Nova Demanda</Button>
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

      {/* MODAL GERENCIAR DEMANDA */}
      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Gerenciar Demanda #{solicitacaoSelecionada?.id}</ModalHeader>
            <ModalCloseButton />
            
            <Formik
                // A CHAVE (KEY) FORÇA O FORMULÁRIO A REINICIAR QUANDO TROCA DE SOLICITAÇÃO
                key={solicitacaoSelecionada ? solicitacaoSelecionada.id : 'empty'}
                
                initialValues={{
                    status: solicitacaoSelecionada?.status || 'PENDENTE',
                    // Garante que pega o ID dentro do objeto
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
                            <Flex gap='4'>
                                <FormControl mb={4}>
                                    <FormLabel>Data</FormLabel>
                                    <Input 
                                      value={solicitacaoSelecionada?.data_solicitacao ? format(new Date(solicitacaoSelecionada.data_solicitacao), 'dd/MM/yyyy') : ''} 
                                      isReadOnly 
                                      bg='gray.100' 
                                    />
                                </FormControl>
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
                            </Flex>

                            {/* SELECT DE PROPRIEDADE (Só leitura para não alterar o local do pedido) */}
                            <Field name='propriedade_id'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Propriedade (Local)</FormLabel>
                                        <Select {...field} disabled bg='gray.50'>
                                            {/* Se a lista estiver vazia, cria uma opção "fantasma" só para exibir o valor atual */}
                                            {propriedades.length === 0 && solicitacaoSelecionada?.propriedade && (
                                                <option value={solicitacaoSelecionada.propriedade.id}>
                                                    {solicitacaoSelecionada.propriedade.terreno}
                                                </option>
                                            )}
                                            
                                            {propriedades.map(p => (
                                                <option key={p.id} value={p.id}>{p.terreno}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            {/* SELECT DE SERVIÇO */}
                            <Field name='servico_id'>
                                {({ field }) => (
                                    <FormControl mb={4}>
                                        <FormLabel>Serviço Solicitado</FormLabel>
                                        <Select {...field} disabled bg='gray.50'>
                                             {servicos.length === 0 && solicitacaoSelecionada?.servico && (
                                                <option value={solicitacaoSelecionada.servico.id}>
                                                    {solicitacaoSelecionada.servico.nome_servico}
                                                </option>
                                            )}
                                            
                                            {servicos.map(s => (
                                                <option key={s.id} value={s.id}>{s.nome_servico}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>

                            {/* ALOCAR MÁQUINA */}
                            <Field name='veiculo_id'>
                                {({ field, form }) => (
                                    <FormControl mb={4} isInvalid={form.errors.veiculo_id && form.touched.veiculo_id}>
                                        <FormLabel color='brand.500' fontWeight='bold'>Alocar Máquina</FormLabel>
                                        <Select {...field} placeholder="Selecione a máquina...">
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