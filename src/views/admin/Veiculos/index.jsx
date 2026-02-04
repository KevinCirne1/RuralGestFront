// src/views/admin/Veiculos/index.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Select, useDisclosure, useToast, IconButton, Badge, Icon
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdDelete, MdDirectionsCar, MdLocalShipping, MdAgriculture } from "react-icons/md";
import Card from "components/card/Card";
import api from "services/api";

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  
  // Campos do Formulário
  const [nome, setNome] = useState("");
  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState("Trator");
  
  const toast = useToast();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const carregarVeiculos = async () => {
    try {
      const res = await api.get("/veiculos");
      setVeiculos(res.data);
    } catch (error) { console.error("Erro ao buscar veículos", error); }
  };

  useEffect(() => { carregarVeiculos(); }, []);

  const handleSalvar = async () => {
    const payload = { nome, placa, tipo };
    try {
      if (veiculoSelecionado) {
        await api.put(`/veiculos/${veiculoSelecionado.id}`, payload);
        toast({ title: "Veículo atualizado!", status: "success" });
      } else {
        await api.post("/veiculos", payload);
        toast({ title: "Veículo cadastrado!", status: "success" });
      }
      onClose();
      carregarVeiculos();
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Verifique os dados.", status: "error" });
    }
  };

  const handleNovo = () => {
    setVeiculoSelecionado(null);
    setNome(""); setPlaca(""); setTipo("Trator");
    onOpen();
  };

  const handleEditar = (v) => {
    setVeiculoSelecionado(v);
    setNome(v.nome); setPlaca(v.placa); setTipo(v.tipo);
    onOpen();
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir?")) {
        try {
            await api.delete(`/veiculos/${id}`);
            toast({ title: "Veículo excluído.", status: "info" });
            carregarVeiculos();
        } catch (e) {
            toast({ title: "Não foi possível excluir.", description: "Ele pode estar em uso.", status: "error" });
        }
    }
  };

  const getIcon = (tipo) => {
      if (tipo === 'Caminhão') return MdLocalShipping;
      if (tipo === 'Trator') return MdAgriculture;
      return MdDirectionsCar;
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Card>
        <Flex justify='space-between' align='center' mb='20px'>
          <Text fontSize='2xl' fontWeight='700' color={textColor}>Frota Municipal</Text>
          <Button leftIcon={<MdAdd />} colorScheme='brand' onClick={handleNovo}>Novo Veículo</Button>
        </Flex>
        <Table variant='simple'>
          <Thead><Tr><Th>Veículo</Th><Th>Placa</Th><Th>Tipo</Th><Th>Status</Th><Th>Ações</Th></Tr></Thead>
          <Tbody>
            {veiculos.map((v) => (
              <Tr key={v.id}>
                <Td fontWeight="bold">
                    <Flex align="center" gap="2">
                        <Icon as={getIcon(v.tipo)} w={5} h={5} color="brand.500" /> 
                        {v.nome}
                    </Flex>
                </Td>
                <Td>{v.placa || "S/ Placa"}</Td>
                <Td>{v.tipo}</Td>
                <Td>
                    <Badge colorScheme={v.status === 'DISPONIVEL' ? 'green' : 'red'}>
                        {v.status}
                    </Badge>
                </Td>
                <Td>
                  <IconButton icon={<MdEdit />} size="sm" onClick={() => handleEditar(v)} mr="2" />
                  <IconButton icon={<MdDelete />} size="sm" colorScheme="red" onClick={() => handleExcluir(v.id)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay /><ModalContent>
          <ModalHeader>{veiculoSelecionado ? "Editar Veículo" : "Novo Veículo"}</ModalHeader><ModalCloseButton />
          <ModalBody>
            <FormControl mb="3"><FormLabel>Modelo / Nome</FormLabel><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Trator Valtra A950" /></FormControl>
            <FormControl mb="3"><FormLabel>Placa (Opcional)</FormLabel><Input value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="XYZ-1234" /></FormControl>
            <FormControl mb="3"><FormLabel>Tipo</FormLabel>
                <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <option value="Trator">Trator</option>
                    <option value="Retroescavadeira">Retroescavadeira</option>
                    <option value="Caminhão">Caminhão</option>
                    <option value="Motoniveladora">Motoniveladora</option>
                </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr="3">Cancelar</Button>
            <Button colorScheme="brand" onClick={handleSalvar}>Salvar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}