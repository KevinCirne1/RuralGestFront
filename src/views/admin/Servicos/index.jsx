import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip 
} from "@chakra-ui/react";
import { MdAdd, MdBuild, MdEdit, MdDelete, MdDirectionsCar } from "react-icons/md";
import Card from "components/card/Card";
import api from "services/api";

export default function Servicos() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("brand.500", "white");

  const [servicos, setServicos] = useState([]);
  
  // Estados do Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Estados do Alerta de Exclusão
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const cancelRef = useRef();

  const toast = useToast();

  // Estados do Formulário
  const [idServico, setIdServico] = useState(null);
  const [nomeServico, setNomeServico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState(""); 

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      const response = await api.get("/servicos");
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços", error);
    }
  };

  const handleNovo = () => {
    setIdServico(null);
    setNomeServico("");
    setDescricao("");
    setTipoVeiculo(""); 
    onOpen();
  };

  const handleEditar = (servico) => {
    setIdServico(servico.id);
    setNomeServico(servico.nome_servico);
    setDescricao(servico.descricao || "");
    setTipoVeiculo(servico.tipo_veiculo || ""); 
    onOpen();
  };

  const handleExcluirConfirmacao = (servico) => {
    setIdServico(servico.id);
    onDeleteOpen();
  };

  const handleSalvar = async () => {
    if (!nomeServico) {
      toast({ title: "Nome do serviço obrigatório", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const dados = { 
        nome_servico: nomeServico, 
        descricao,
        tipo_veiculo: tipoVeiculo || null 
    };

    try {
      if (idServico) {
        await api.put(`/servicos/${idServico}`, dados);
        toast({ title: "Serviço atualizado!", status: "success", duration: 3000, isClosable: true });
      } else {
        await api.post("/servicos", dados);
        toast({ title: "Serviço cadastrado!", status: "success", duration: 3000, isClosable: true });
      }
      onClose();
      carregarServicos();
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Erro no backend.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleExcluir = async () => {
    try {
      await api.delete(`/servicos/${idServico}`);
      toast({ title: "Serviço excluído!", status: "info", duration: 3000, isClosable: true });
      onDeleteClose();
      carregarServicos();
    } catch (error) {
      toast({ title: "Erro ao excluir", description: "O serviço pode estar em uso.", status: "error", duration: 3000, isClosable: true });
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex justifyContent="space-between" mb="20px" align="center">
        <Text color={textColor} fontSize="2xl" fontWeight="700">
          Catálogo de Serviços
        </Text>
        <Button leftIcon={<MdAdd />} colorScheme="brand" variant="solid" onClick={handleNovo}>
          Novo Serviço
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
        {servicos.map((servico) => (
          <Card key={servico.id} p="20px">
            <Flex justify="space-between" align="start" mb="20px">
              <Flex align="center">
                <Box bg={iconColor} p="10px" borderRadius="50%" color="white" mr="15px">
                  <Icon as={MdBuild} w="24px" h="24px" />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{servico.nome_servico}</Text>
                  
                  {servico.tipo_veiculo ? (
                      <Flex align="center" mt="5px">
                        <Icon as={MdDirectionsCar} color="gray.500" w="14px" h="14px" mr="5px"/>
                        <Text fontSize="xs" color="gray.500" fontWeight="600">
                            Requer: {servico.tipo_veiculo}
                        </Text>
                      </Flex>
                  ) : (
                      <Text fontSize="xs" color="gray.400" mt="5px">Não requer maquinário</Text>
                  )}
                  
                </Box>
              </Flex>
              
              {/* --- BOTÕES DE AÇÃO PADRONIZADOS --- */}
              <Flex align="center" gap="5px">
                <Tooltip label="Editar Serviço">
                    <IconButton
                        size="sm"
                        colorScheme="brand"
                        icon={<MdEdit />}
                        onClick={() => handleEditar(servico)}
                    />
                </Tooltip>
                <Tooltip label="Excluir Serviço">
                    <IconButton
                        size="sm"
                        colorScheme="red"
                        icon={<MdDelete />}
                        onClick={() => handleExcluirConfirmacao(servico)}
                    />
                </Tooltip>
              </Flex>
            </Flex>

            <Text color="gray.500" fontSize="sm" noOfLines={2}>
              {servico.descricao || "Sem descrição definida."}
            </Text>
          </Card>
        ))}

        {servicos.length === 0 && (
            <Text color="gray.500" mt="20px">Nenhum serviço cadastrado.</Text>
        )}
      </SimpleGrid>

      {/* --- MODAL DE CADASTRO / EDIÇÃO --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{idServico ? "Editar Serviço" : "Novo Serviço"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="15px">
              <FormLabel>Nome do Serviço</FormLabel>
              <Input 
                placeholder="Ex: Corte de Terra" 
                value={nomeServico}
                onChange={(e) => setNomeServico(e.target.value)}
              />
            </FormControl>

            <FormControl mb="15px">
              <FormLabel>Veículo Necessário (Opcional)</FormLabel>
              <Select 
                placeholder="Selecione se precisar de máquina..." 
                value={tipoVeiculo} 
                onChange={(e) => setTipoVeiculo(e.target.value)}
              >
                <option value="">Nenhum (Apenas mão de obra)</option>
                <option value="Trator">Trator</option>
                <option value="Caminhão">Caminhão</option>
                <option value="Retroescavadeira">Retroescavadeira</option>
                <option value="Motoniveladora">Motoniveladora</option>
                <option value="Pá Mecânica">Pá Mecânica</option>
                {/* REMOVIDO: Opção "Arado" - Arado é implemento, não veículo */}
              </Select>
              <Text fontSize="xs" color="gray.400" mt="5px">
                Isso ajuda a filtrar a frota disponível na hora da solicitação.
              </Text>
            </FormControl>

            <FormControl mb="15px">
              <FormLabel>Descrição</FormLabel>
              <Textarea 
                placeholder="Detalhes sobre como o serviço é realizado..." 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleSalvar}>
              {idServico ? "Atualizar" : "Salvar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- ALERTA DE EXCLUSÃO --- */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Excluir Serviço</AlertDialogHeader>
            <AlertDialogBody>Tem certeza? Isso pode afetar solicitações antigas.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>Cancelar</Button>
              <Button colorScheme="red" onClick={handleExcluir} ml={3}>Excluir</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}