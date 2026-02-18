import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Button, Icon, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, useDisclosure, FormErrorMessage, Spinner, useToast, Select,
  IconButton, Tooltip, Divider, InputGroup, InputLeftElement, InputRightElement, FormHelperText, Badge
} from "@chakra-ui/react";
import { MdEdit, MdDelete, MdAgriculture, MdMap, MdSearch, MdMyLocation } from "react-icons/md"; 
import Card from "components/card/Card.js";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getAgricultores } from "services/agricultorService";
import { getPropriedades, createPropriedade, updatePropriedade, deletePropriedade } from "services/propriedadeService";
import { formatarCoordenadas, limparCoordenadas } from "utils/formatters";

// Schema de Validação Atualizado
const SignupSchema = Yup.object().shape({
  terreno: Yup.string().required('O nome da propriedade é obrigatório'),
  vinculo: Yup.string().required('O vínculo com a terra é obrigatório'),
  tipo_agricultura: Yup.string().required('O tipo de agricultura é obrigatório'),
  area_total: Yup.number().required('A área total é obrigatória'),
  area_exploravel: Yup.number().required('A área explorável é obrigatória'),
  coordenadas_geograficas: Yup.string().required('As coordenadas são obrigatórias'),
  agricultor_id: Yup.string().required('É preciso selecionar um agricultor'),
  cultura_principal: Yup.string().nullable(),
  quantidade_gado: Yup.number().min(0, 'Valor positivo').nullable()
});

export default function PropriedadesPage() {
  const [propriedades, setPropriedades] = useState([]);
  const [agricultores, setAgricultores] = useState([]);
  const [loading, setLoading] = useState(true);
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
      toast({ title: "Erro ao buscar dados.", status: "error", duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGetLocation = (form) => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocalização não suportada no seu navegador.", status: "error" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        form.setFieldValue('coordenadas_geograficas', coords);
        toast({ title: "Localização capturada com sucesso!", status: "success", duration: 2000 });
      },
      () => {
        toast({ title: "Não foi possível obter sua localização.", status: "warning" });
      }
    );
  };

  const handleOpenMap = (coords) => {
    if (!coords) return;
    const cleanCoords = limparCoordenadas(coords);
    window.open(`http://maps.google.com/?q=${cleanCoords}`, '_blank');
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
          coordenadas_geograficas: limparCoordenadas(values.coordenadas_geograficas),
          quantidade_gado: values.quantidade_gado || 0,
          cultura_principal: values.cultura_principal || 'Outros'
      };

      if (propriedadeSelecionada) {
        await updatePropriedade(propriedadeSelecionada.id, payload); 
        toast({ title: "Propriedade atualizada!", status: "success" });
      } else {
        await createPropriedade(agricultor_id, payload);
        toast({ title: "Propriedade cadastrada!", status: "success" });
      }
      
      onFormClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro na operação.", status: "error" });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      await deletePropriedade(propriedadeParaDeletar.id);
      toast({ title: 'Sucesso!', status: 'success' });
      onDeleteClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Erro ao excluir.', status: 'error' });
      onDeleteClose();
    }
  };

  if (loading) return (<Flex justify='center' align='center' height='50vh'><Spinner size='xl' color="brand.500" /></Flex>);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Lista de Propriedades</Text>
          <Button colorScheme='brand' onClick={() => handleOpenForm()}>Cadastrar Propriedade</Button>
        </Flex>
        
        <InputGroup mb="20px">
            <InputLeftElement pointerEvents='none'><Icon as={MdSearch} color='gray.300' /></InputLeftElement>
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
              <Th>Vínculo</Th>
              <Th>Tipo</Th>
              <Th>Área Total (ha)</Th>
              <Th>Coordenadas</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {propriedades
                .filter(p => p.terreno.toLowerCase().includes(busca.toLowerCase()))
                .map((prop) => {
                  const agricultor = agricultores.find(a => a.id === prop.agricultor_id);
                  return (
                    <Tr key={prop.id}>
                      <Td fontWeight="bold">{prop.terreno}</Td>
                      <Td>{agricultor ? agricultor.nome : 'N/A'}</Td>
                      <Td>
                        {/* Lógica de Cores dos Badges */}
                        <Badge 
                          colorScheme={
                            prop.vinculo === 'Própria' ? 'green' : 
                            prop.vinculo === 'Alugada' ? 'yellow' : 
                            prop.vinculo === 'Cedida' ? 'blue' : 'gray'
                          } 
                          variant="subtle" 
                          borderRadius="md"
                          px="2"
                        >
                          {prop.vinculo || 'N/A'}
                        </Badge>
                      </Td>
                      <Td>{prop.tipo_agricultura}</Td>
                      <Td>{prop.area_total}</Td>
                      <Td fontWeight="medium" color="brand.500">
                        {formatarCoordenadas(prop.coordenadas_geograficas)}
                      </Td>
                      <Td>
                        <Flex gap="5px">
                          <Tooltip label="Ver no Mapa">
                            <IconButton size='sm' colorScheme='blue' icon={<MdMap />} onClick={() => handleOpenMap(prop.coordenadas_geograficas)} />
                          </Tooltip>
                          <Tooltip label="Editar">
                            <IconButton size='sm' colorScheme='brand' icon={<MdEdit />} onClick={() => handleOpenForm(prop)} />
                          </Tooltip>
                          <Tooltip label="Excluir">
                            <IconButton size='sm' colorScheme='red' icon={<MdDelete />} onClick={() => { setPropriedadeParaDeletar(prop); onDeleteOpen(); }} />
                          </Tooltip>
                        </Flex>
                      </Td>
                    </Tr>
                  );
            })}
          </Tbody>
        </Table>
      </Card>

      <Formik 
        initialValues={propriedadeSelecionada ? {
          ...propriedadeSelecionada,
          coordenadas_geograficas: formatarCoordenadas(propriedadeSelecionada.coordenadas_geograficas),
          vinculo: propriedadeSelecionada.vinculo || '',
          cultura_principal: propriedadeSelecionada.cultura_principal || '',
          quantidade_gado: propriedadeSelecionada.quantidade_gado || 0
        } : { 
          terreno: '', vinculo: '', tipo_agricultura: '', area_total: '', area_exploravel: '', coordenadas_geograficas: '', agricultor_id: '',
          cultura_principal: '', quantidade_gado: 0
        }} 
        validationSchema={SignupSchema} 
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps) => (
          <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
            <ModalOverlay /><ModalContent>
              <Form>
                <ModalHeader>{propriedadeSelecionada ? "Editar Propriedade" : "Cadastrar Nova Propriedade"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Flex gap="4">
                    <Field name='terreno'>{({ field, form }) => (<FormControl isInvalid={form.errors.terreno && form.touched.terreno} mb={4} flex="2"><FormLabel>Nome da Propriedade</FormLabel><Input {...field} placeholder="Ex: Sítio Bahamas" /><FormErrorMessage>{form.errors.terreno}</FormErrorMessage></FormControl>)}</Field>
                    
                    <Field name='vinculo'>{({ field, form }) => (
                      <FormControl isInvalid={form.errors.vinculo && form.touched.vinculo} mb={4} flex="1">
                        <FormLabel>Vínculo</FormLabel>
                        <Select {...field} placeholder="Selecione...">
                          <option value="Própria">Própria</option>
                          <option value="Alugada">Alugada</option>
                          <option value="Cedida">Cedida</option>
                        </Select>
                        <FormErrorMessage>{form.errors.vinculo}</FormErrorMessage>
                      </FormControl>
                    )}</Field>
                  </Flex>

                  <Field name='agricultor_id'>{({ field, form }) => (
                    <FormControl isInvalid={form.errors.agricultor_id && form.touched.agricultor_id} mb={4}>
                      <FormLabel>Agricultor Responsável</FormLabel>
                      <Select {...field} placeholder="Selecione um agricultor...">{agricultores.map(ag => (<option key={ag.id} value={ag.id}>{ag.nome}</option>))}</Select>
                      <FormErrorMessage>{form.errors.agricultor_id}</FormErrorMessage>
                    </FormControl>
                  )}</Field>

                  <Flex gap="4">
                    <Field name='area_total'>{({ field, form }) => (<FormControl isInvalid={form.errors.area_total && form.touched.area_total} mb={4}><FormLabel>Área Total (ha)</FormLabel><Input {...field} type="number" /><FormErrorMessage>{form.errors.area_total}</FormErrorMessage></FormControl>)}</Field>
                    <Field name='area_exploravel'>{({ field, form }) => (<FormControl isInvalid={form.errors.area_exploravel && form.touched.area_exploravel} mb={4}><FormLabel>Área Explorável (ha)</FormLabel><Input {...field} type="number" /><FormErrorMessage>{form.errors.area_exploravel}</FormErrorMessage></FormControl>)}</Field>
                  </Flex>

                  <Field name='tipo_agricultura'>{({ field, form }) => (<FormControl isInvalid={form.errors.tipo_agricultura && form.touched.tipo_agricultura} mb={4}><FormLabel>Tipo de Solo / Agricultura</FormLabel><Input {...field} placeholder="Ex: Solo Arenoso, Misto..." /><FormErrorMessage>{form.errors.tipo_agricultura}</FormErrorMessage></FormControl>)}</Field>

                  <Field name='coordenadas_geograficas'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.coordenadas_geograficas && form.touched.coordenadas_geograficas} mb={4}>
                        <FormLabel>Coordenadas (Latitude, Longitude)</FormLabel>
                        <InputGroup>
                          <Input 
                            {...field} 
                            placeholder="-6.7551, -35.6602" 
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d.,\-\s]/g, "");
                              form.setFieldValue('coordenadas_geograficas', val);
                            }}
                          />
                          <InputRightElement width="3rem">
                            <Tooltip label="Minha localização atual">
                              <IconButton h="1.75rem" size="sm" variant="ghost" colorScheme="brand" icon={<MdMyLocation />} onClick={() => handleGetLocation(form)} />
                            </Tooltip>
                          </InputRightElement>
                        </InputGroup>
                        <FormHelperText fontSize="xs">Ex: -6.7511, -35.6601</FormHelperText>
                        <FormErrorMessage>{form.errors.coordenadas_geograficas}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Divider my="20px" borderColor={borderColor} />
                  <Flex align="center" gap="2" mb="15px"><Icon as={MdAgriculture} color="brand.500" /><Text fontSize="sm" fontWeight="bold" color="brand.500">DADOS DE PRODUÇÃO</Text></Flex>

                  <Flex gap="4">
                    <Field name='cultura_principal'>{({ field, form }) => (
                        <FormControl mb={4}>
                            <FormLabel>Cultura Principal</FormLabel>
                            <Select {...field} placeholder="Selecione...">
                                <option value="Milho">Milho</option>
                                <option value="Feijão">Feijão</option>
                                <option value="Mandioca">Mandioca</option>
                                <option value="Fruticultura">Fruticultura</option>
                                <option value="Pasto/Pecuária">Apenas Pasto</option>
                                <option value="Outros">Outros</option>
                            </Select>
                        </FormControl>
                    )}</Field>

                    <Field name='quantidade_gado'>{({ field, form }) => (
                        <FormControl mb={4}>
                            <FormLabel>Quantidade de Gado</FormLabel>
                            <Input {...field} type="number" />
                        </FormControl>
                    )}</Field>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme='brand' mr={3} isLoading={formikProps.isSubmitting} type='submit'>Salvar</Button>
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
          <ModalBody>Deseja excluir a propriedade <strong>{propriedadeParaDeletar?.terreno}</strong>?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleConfirmarExclusao}>Excluir</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}