import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Badge,
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
  Tooltip // --- ADICIONADO: Tooltip para consistência
} from "@chakra-ui/react";
import { MdAdd, MdDirectionsCar, MdEdit, MdDelete } from "react-icons/md";
import Card from "components/card/Card";
import api from "services/api";

export default function Veiculos() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("brand.500", "white");

  const [veiculos, setVeiculos] = useState([]);

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

  const [idVeiculo, setIdVeiculo] = useState(null);
  const [nome, setNome] = useState("");
  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState("Caminhão Caçamba");

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    try {
      const response = await api.get("/veiculos");
      setVeiculos(response.data);
    } catch (error) {
      console.error("Erro ao buscar veículos", error);
    }
  };

  const handleNovo = () => {
    setIdVeiculo(null);
    setNome("");
    setPlaca("");
    setTipo("Caminhão Caçamba");
    onOpen();
  };

  const handleEditar = (veiculo) => {
    setIdVeiculo(veiculo.id);
    setNome(veiculo.nome);
    setPlaca(veiculo.placa || "");
    setTipo(veiculo.tipo);
    onOpen();
  };

  const handleExcluirConfirmacao = (veiculo) => {
    setIdVeiculo(veiculo.id);
    onDeleteOpen();
  };

  const handleSalvar = async () => {
    if (!nome) {
      toast({ title: "Nome obrigatório", status: "warning", duration: 3000, isClosable: true });
      return;
    }

    const dados = { nome, placa, tipo, status: "DISPONIVEL" };

    try {
      if (idVeiculo) {
        await api.put(`/veiculos/${idVeiculo}`, dados);
        toast({ title: "Veículo atualizado!", status: "success", duration: 3000, isClosable: true });
      } else {
        await api.post("/veiculos", dados);
        toast({ title: "Veículo cadastrado!", status: "success", duration: 3000, isClosable: true });
      }

      onClose();
      carregarVeiculos();
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Erro no backend.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleExcluir = async () => {
    try {
      await api.delete(`/veiculos/${idVeiculo}`);
      toast({ title: "Veículo excluído!", status: "info", duration: 3000, isClosable: true });
      onDeleteClose();
      carregarVeiculos();
    } catch (error) {
      toast({ title: "Erro ao excluir", description: "O veículo pode estar em uso.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const getStatusColor = (status) => {
    if (status === 'DISPONIVEL') return 'green';
    if (status === 'EM_USO') return 'orange';
    if (status === 'MANUTENCAO') return 'red';
    return 'gray';
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex justifyContent="space-between" mb="20px" align="center">
        <Text color={textColor} fontSize="2xl" fontWeight="700">
          Frota de Veículos
        </Text>
        <Button leftIcon={<MdAdd />} colorScheme="brand" variant="solid" onClick={handleNovo}>
          Novo Veículo
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
        {veiculos.map((veiculo) => (
          <Card key={veiculo.id} p="20px">
            <Flex justify="space-between" align="start" mb="20px">
              <Flex align="center">
                <Box bg={iconColor} p="10px" borderRadius="50%" color="white" mr="15px">
                  <Icon as={MdDirectionsCar} w="24px" h="24px" />
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{veiculo.nome}</Text>
                  <Text fontSize="sm" color="gray.500">{veiculo.tipo} • {veiculo.placa || "S/ Placa"}</Text>
                </Box>
              </Flex>
              
              {/* --- BOTÕES DE AÇÃO PADRONIZADOS --- */}
              <Flex align="center" gap="5px">
                <Tooltip label="Editar Veículo">
                    <IconButton 
                        size="sm"
                        colorScheme="brand"
                        icon={<MdEdit />}
                        onClick={() => handleEditar(veiculo)}
                    />
                </Tooltip>
                
                <Tooltip label="Excluir Veículo">
                    <IconButton 
                        size="sm"
                        colorScheme="red"
                        icon={<MdDelete />}
                        onClick={() => handleExcluirConfirmacao(veiculo)}
                    />
                </Tooltip>
              </Flex>
            </Flex>

            <Flex justify="space-between" align="center">
              <Badge colorScheme={getStatusColor(veiculo.status)} p="5px 10px" borderRadius="8px">
                {veiculo.status}
              </Badge>
            </Flex>
          </Card>
        ))}
        
        {veiculos.length === 0 && (
            <Text color="gray.500" mt="20px">Nenhum veículo cadastrado na frota.</Text>
        )}
      </SimpleGrid>

      {/* --- MODAL DE CADASTRO / EDIÇÃO --- */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{idVeiculo ? "Editar Veículo" : "Cadastrar Novo Veículo"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="15px">
              <FormLabel>Nome / Modelo</FormLabel>
              <Input 
                placeholder="Ex: Trator John Deere 5078" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </FormControl>

            <FormControl mb="15px">
              <FormLabel>Placa (Opcional)</FormLabel>
              <Input 
                placeholder="Ex: PM-0001" 
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
              />
            </FormControl>

            <FormControl mb="15px">
              <FormLabel>Tipo</FormLabel>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="Caminhão Caçamba">Caminhão Caçamba</option>
                <option value="Retroescavadeira">Retroescavadeira</option>
                <option value="Motoniveladora">Motoniveladora</option>
                <option value="Pá Mecânica">Pá Mecânica</option>
                <option value="Trator com grade">Trator com grade</option>
                <option value="Trator com carroção">Trator com carroção</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleSalvar}>
              {idVeiculo ? "Atualizar" : "Salvar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- ALERTA DE EXCLUSÃO --- */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Veículo
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza? Essa ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleExcluir} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}