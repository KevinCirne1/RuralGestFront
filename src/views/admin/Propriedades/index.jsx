import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast, Select,
  IconButton, Tooltip, Divider, InputGroup, InputLeftElement
} from "@chakra-ui/react";
// Adicionei MdMap e MdSearch nos ícones
import { MdEdit, MdDelete, MdAgriculture, MdMap, MdSearch } from "react-icons/md"; 
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getAgricultores } from "services/agricultorService";
import { getPropriedades, createPropriedade, updatePropriedade, deletePropriedade } from "services/propriedadeService";

const SignupSchema = Yup.object().shape({
  // Campos Obrigatórios
  terreno: Yup.string().required('O nome da propriedade é obrigatório'),
  tipo_agricultura: Yup.string().required('O tipo de agricultura é obrigatório'),
  area_total: Yup.number().required('A área total é obrigatória'),
  area_exploravel: Yup.number().required('A área explorável é obrigatória'),
  coordenadas_geograficas: Yup.string().required('As coordenadas são obrigatórias'),
  agricultor_id: Yup.string().required('É preciso selecionar um agricultor'),
  
  // Campos Opcionais
  cultura_principal: Yup.string().nullable(),
  quantidade_gado: Yup.number().min(0, 'Valor positivo').nullable()
});

export default function PropriedadesPage() {
  const [propriedades, setPropriedades] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- NOVO ESTADO PARA A BUSCA ---
  const [busca, setBusca] = useState("");

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [propriedadeParaDeletar, setPropriedadeParaDeletar] = useState(null);
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState(null);
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const toast = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propriedadesResponse, agricultoresResponse] = await Promise.all([
        getPropriedades(),
        getAgricultores()
      ]);
      setPropriedades(propriedadesResponse.data);
      setAgricultores(agricultoresResponse.data);
    } catch (error) {
      toast({ title: "Erro ao buscar dados.", description: "Verifique a conexão com a API.", status: "error", duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FUNÇÃO PARA ABRIR O MAPA ---
  const handleOpenMap = (coords) => {
    if (!coords) {
        toast({ title: "Sem coordenadas", status: "warning", duration: 2000 });
        return;
    }
    // Remove espaços em branco para garantir que a URL fique certa
    const cleanCoords = coords.replace(/\s/g, '');
    // Abre o Google Maps em nova aba
    window.open(`https://www.google.com/maps?q=${cleanCoords}`, '_blank');
  };

  const handleOpenForm = (propriedade = null) => {
    setPropriedadeSelecionada(propriedade);
    onFormOpen();
  };

  const handleSubmit = async (values, actions) => {
    try {
      const { agricultor_id, ...dadosPropriedade } = values;

      const payload = {
          ...dadosPropriedade,
          quantidade_gado: values.quantidade_gado || 0,
          cultura_principal: values.cultura_principal || 'Outros'
      };

      if (propriedadeSelecionada) {
        await updatePropriedade(propriedadeSelecionada.id, values); 
        toast({ title: "Propriedade atualizada!", status: "success", duration: 5000, isClosable: true });
      } else {
        await createPropriedade(agricultor_id, payload);
        toast({ title: "Propriedade cadastrada!", status: "success", duration: 5000, isClosable: true });
      }
      
      actions.setSubmitting(false);
      onFormClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro na operação.", description: error.message, status: "error", duration: 5000, isClosable: true });
      actions.setSubmitting(false);
    }
  };

  const handleAbrirModalExclusao = (propriedade) => {
    setPropriedadeParaDeletar(propriedade);
    onDeleteOpen();
  };

  const handleConfirmarExclusao = async () => {
    if (!propriedadeParaDeletar) return;
    try {
      await deletePropriedade(propriedadeParaDeletar.id);
      toast({ title: 'Sucesso!', description: `Propriedade excluída.`, status: 'success', duration: 3000, isClosable: true });
      onDeleteClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', description: 'Não foi possível remover a propriedade.', status: 'error', duration: 5000, isClosable: true });
      onDeleteClose();
    }
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Propriedades</Text>
          <Button colorScheme='brand' onClick={() => handleOpenForm()}>Cadastrar Propriedade</Button>
        </Flex>
        
        {/* --- BARRA DE PESQUISA (NOVA) --- */}
        <InputGroup mb="20px">
            <InputLeftElement pointerEvents='none'>
                <Icon as={MdSearch} color='gray.300' />
            </InputLeftElement>
            <Input 
                placeholder="Buscar por nome da propriedade..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                borderRadius="10px"
            />
        </InputGroup>

        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>Propriedade</Th>
              <Th>Agricultor</Th>
              <Th>Tipo</Th>
              <Th>Área Total (ha)</Th>
              <Th>Área Explorável (ha)</Th>
              <Th>Coordenadas</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* --- FILTRAGEM DOS DADOS ANTES DE EXIBIR --- */}
            {propriedades
                .filter(p => p.terreno.toLowerCase().includes(busca.toLowerCase()))
                .map((prop) => {
                  const agricultor = agricultores.find(a => a.id === prop.agricultor_id);
                  return (
                    <Tr key={prop.id}>
                      <Td fontWeight="bold">{prop.terreno}</Td>
                      <Td>{agricultor ? agricultor.nome : 'N/A'}</Td>
                      <Td>{prop.tipo_agricultura}</Td>
                      <Td>{prop.area_total}</Td>
                      <Td>{prop.area_exploravel}</Td>
                      <Td>{prop.coordenadas_geograficas}</Td>
                      <Td>
                        <Flex gap="5px">
                          {/* --- BOTÃO DO GOOGLE MAPS (NOVO) --- */}
                          <Tooltip label="Ver no Google Maps">
                            <IconButton 
                                size='sm' 
                                colorScheme='blue' 
                                icon={<MdMap />} 
                                onClick={() => handleOpenMap(prop.coordenadas_geograficas)} 
                            />
                          </Tooltip>

                          <Tooltip label="Editar Propriedade">
                            <IconButton size='sm' colorScheme='brand' icon={<MdEdit />} onClick={() => handleOpenForm(prop)} />
                          </Tooltip>
                          <Tooltip label="Excluir Propriedade">
                            <IconButton size='sm' colorScheme='red' icon={<MdDelete />} onClick={() => handleAbrirModalExclusao(prop)} />
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
                  );
            })}
            
            {/* Mensagem caso não encontre nada na busca */}
            {propriedades.filter(p => p.terreno.toLowerCase().includes(busca.toLowerCase())).length === 0 && (
                <Tr>
                    <Td colSpan={7} textAlign="center" py="4" color="gray.500">
                        Nenhuma propriedade encontrada.
                    </Td>
                </Tr>
            )}
          </Tbody>
        </Table>
      </Card>

      <Formik 
        initialValues={propriedadeSelecionada ? {
          terreno: propriedadeSelecionada.terreno,
          tipo_agricultura: propriedadeSelecionada.tipo_agricultura,
          area_total: propriedadeSelecionada.area_total,
          area_exploravel: propriedadeSelecionada.area_exploravel,
          coordenadas_geograficas: propriedadeSelecionada.coordenadas_geograficas,
          agricultor_id: propriedadeSelecionada.agricultor_id,
          cultura_principal: propriedadeSelecionada.cultura_principal || '',
          quantidade_gado: propriedadeSelecionada.quantidade_gado || 0
        } : { 
          terreno: '', tipo_agricultura: '', area_total: '', area_exploravel: '', coordenadas_geograficas: '', agricultor_id: '',
          cultura_principal: '', quantidade_gado: 0
        }} 
        validationSchema={SignupSchema} 
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(props) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
            <ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>{propriedadeSelecionada ? "Editar Propriedade" : "Cadastrar Nova Propriedade"}</ModalHeader><ModalCloseButton />
                <ModalBody>
                  {/* Campos do Formulário (Dados Gerais) */}
                  <Flex gap="4">
                    <Field name='terreno'>{({ field, form }) => (<FormControl isInvalid={form.errors.terreno && form.touched.terreno} mb={4}><FormLabel>Nome da Propriedade</FormLabel><Input {...field} /><FormErrorMessage>{form.errors.terreno}</FormErrorMessage></FormControl>)}</Field>
                    <Field name='agricultor_id'>{({ field, form }) => (
                      <FormControl isInvalid={form.errors.agricultor_id && form.touched.agricultor_id} mb={4}>
                        <FormLabel>Agricultor Responsável</FormLabel>
                        <Select {...field} placeholder="Selecione...">{agricultores.map(ag => (<option key={ag.id} value={ag.id}>{ag.nome}</option>))}</Select>
                        <FormErrorMessage>{form.errors.agricultor_id}</FormErrorMessage>
                      </FormControl>
                    )}</Field>
                  </Flex>

                  <Flex gap="4">
                    <Field name='area_total'>{({ field, form }) => (<FormControl isInvalid={form.errors.area_total && form.touched.area_total} mb={4}><FormLabel>Área Total (ha)</FormLabel><Input {...field} type="number" /><FormErrorMessage>{form.errors.area_total}</FormErrorMessage></FormControl>)}</Field>
                    <Field name='area_exploravel'>{({ field, form }) => (<FormControl isInvalid={form.errors.area_exploravel && form.touched.area_exploravel} mb={4}><FormLabel>Área Explorável (ha)</FormLabel><Input {...field} type="number" /><FormErrorMessage>{form.errors.area_exploravel}</FormErrorMessage></FormControl>)}</Field>
                  </Flex>

                  <Field name='tipo_agricultura'>{({ field, form }) => (<FormControl isInvalid={form.errors.tipo_agricultura && form.touched.tipo_agricultura} mb={4}><FormLabel>Tipo de Solo / Agricultura</FormLabel><Input {...field} placeholder="Ex: Solo Arenoso, Misto..." /><FormErrorMessage>{form.errors.tipo_agricultura}</FormErrorMessage></FormControl>)}</Field>

                  <Field name='coordenadas_geograficas'>{({ field, form }) => (<FormControl isInvalid={form.errors.coordenadas_geograficas && form.touched.coordenadas_geograficas} mb={4}><FormLabel>Coordenadas Geográficas</FormLabel><Input {...field} placeholder="-7.123, -35.567" /><FormErrorMessage>{form.errors.coordenadas_geograficas}</FormErrorMessage></FormControl>)}</Field>

                  <Divider my="20px" borderColor={borderColor} />
                  
                  {/* Dados de Produção */}
                  <Flex align="center" gap="2" mb="15px">
                     <Icon as={MdAgriculture} color="brand.500" />
                     <Text fontSize="sm" fontWeight="bold" color="brand.500">DADOS DE PRODUÇÃO (PARA O DASHBOARD)</Text>
                  </Flex>

                  <Flex gap="4">
                    <Field name='cultura_principal'>{({ field, form }) => (
                        <FormControl isInvalid={form.errors.cultura_principal && form.touched.cultura_principal} mb={4}>
                            <FormLabel>O que se cultiva aqui?</FormLabel>
                            <Select {...field} placeholder="Selecione a cultura principal...">
                                <option value="Milho">Milho</option>
                                <option value="Feijão">Feijão</option>
                                <option value="Mandioca">Mandioca</option>
                                <option value="Algodão">Algodão</option>
                                <option value="Fruticultura">Fruticultura</option>
                                <option value="Hortaliças">Hortaliças</option>
                                <option value="Pasto/Pecuária">Apenas Pasto</option>
                                <option value="Outros">Outros</option>
                            </Select>
                        </FormControl>
                    )}</Field>

                    <Field name='quantidade_gado'>{({ field, form }) => (
                        <FormControl isInvalid={form.errors.quantidade_gado && form.touched.quantidade_gado} mb={4}>
                            <FormLabel>Possui gado? (Qtd.)</FormLabel>
                            <Input {...field} type="number" placeholder="0 se não tiver" />
                        </FormControl>
                    )}</Field>
                  </Flex>

                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='brand' mr={3} isLoading={props.isSubmitting} type='submit'>Salvar</Button>
                  <Button variant='ghost' onClick={onFormClose}>Cancelar</Button>
                </ModalFooter>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </Formik>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay /><ModalContent>
          <ModalHeader>Confirmar Exclusão</ModalHeader><ModalCloseButton />
          <ModalBody>Você tem certeza que deseja excluir a propriedade <strong>{propriedadeParaDeletar?.terreno}</strong>?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleConfirmarExclusao}>Excluir</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}