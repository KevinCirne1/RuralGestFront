import React, { useEffect, useState, useCallback } from "react";
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
  Select,
  useDisclosure,
  useToast,
  Badge,
  Textarea
} from "@chakra-ui/react";
import { MdAdd, MdEdit, MdAssignment, MdPrint } from "react-icons/md";
import Card from "components/card/Card";
import api from "services/api";

export default function Solicitacoes() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("brand.500", "white");

  // --- Função Data Local ---
  const getDataLocal = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  // --- Estados ---
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [propriedades, setPropriedades] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);

  // Modal e Form
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  
  const [propriedadeId, setPropriedadeId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [dataSolicitacao, setDataSolicitacao] = useState(getDataLocal());
  const [observacao, setObservacao] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [motivoRecusa, setMotivoRecusa] = useState(""); 
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [resSol, resProp, resServ, resVeic] = await Promise.all([
        api.get("/solicitacoes"),
        api.get("/propriedades"),
        api.get("/servicos"),
        api.get("/veiculos")
      ]);
      setSolicitacoes(resSol.data);
      setPropriedades(resProp.data);
      setServicos(resServ.data);
      setVeiculos(resVeic.data);
    } catch (error) { console.error("Erro dados", error); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- AÇÕES ---
  const handleNovo = () => {
    setSolicitacaoSelecionada(null);
    setPropriedadeId("");
    setServicoId("");
    setDataSolicitacao(getDataLocal());
    setObservacao("");
    setVeiculoId("");
    setStatus("PENDENTE");
    setMotivoRecusa("");
    onOpen();
  };

  const handleEditar = (sol) => {
    setSolicitacaoSelecionada(sol);
    setPropriedadeId(sol.propriedade_id);
    setServicoId(sol.servico_id);
    setDataSolicitacao(sol.data_solicitacao ? sol.data_solicitacao.split('T')[0] : "");
    setObservacao(sol.observacao || "");
    setVeiculoId(sol.veiculo_id || "");
    setStatus(sol.status || "PENDENTE");
    setMotivoRecusa(sol.motivo_recusa || "");
    onOpen();
  };

  const handleSalvar = async () => {
    if (!propriedadeId || !servicoId) {
        toast({ title: "Campos obrigatórios", status: "warning" });
        return;
    }
    const propObj = propriedades.find(p => p.id == propriedadeId);
    const idAgricultor = propObj ? propObj.agricultor_id : solicitacaoSelecionada?.agricultor?.id;

    if (!idAgricultor) {
        toast({ title: "Erro", description: "Agricultor não identificado.", status: "error" });
        return;
    }
    const payload = {
      propriedade_id: parseInt(propriedadeId),
      servico_id: parseInt(servicoId),
      agricultor_id: idAgricultor,
      data_solicitacao: dataSolicitacao,
      observacao: observacao,
      status: solicitacaoSelecionada ? status : "PENDENTE",
      veiculo_id: (solicitacaoSelecionada && veiculoId) ? parseInt(veiculoId) : null,
      motivo_recusa: status === 'RECUSADA' ? motivoRecusa : null 
    };

    try {
      if (solicitacaoSelecionada) {
        await api.put(`/solicitacoes/${solicitacaoSelecionada.id}`, payload);
        toast({ title: "Solicitação Atualizada!", status: "success" });
      } else {
        await api.post("/solicitacoes", payload);
        toast({ title: "Criado com sucesso!", status: "success" });
      }
      onClose();
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Verifique os dados.", status: "error" });
    }
  };

  // --- NOVA LÓGICA DE IMPRESSÃO (INFALÍVEL) ---
  const imprimirDocumento = (sol) => {
    // 1. Cria um iframe invisível
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // 2. Prepara os dados
    const titulo = sol.status === 'CONCLUÍDA' ? "ATESTE DE CONCLUSÃO DE SERVIÇO" : "COMPROVANTE DE SOLICITAÇÃO";
    const dataF = new Date(sol.data_solicitacao).toLocaleDateString();
    const obs = sol.observacao ? `<div style="border: 1px dashed #666; padding: 10px; margin-bottom: 20px;"><strong>OBSERVAÇÕES:</strong><br/>${sol.observacao}</div>` : '';
    
    const textoAteste = sol.status === 'CONCLUÍDA' 
        ? `<p style="text-align: justify; margin-bottom: 40px; line-height: 1.5;">Declaro para os devidos fins que o serviço descrito acima foi realizado em minha propriedade pela máquina da prefeitura, estando de acordo com a qualidade e a quantidade de horas trabalhadas.</p>` 
        : '';

    // 3. Monta o HTML do documento
    const conteudo = `
      <html>
        <head>
          <title>Impressão RuralGest</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: black; }
            h1, h2, h3, p, div, span { color: black !important; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid black; padding-bottom: 20px; }
            .titulo { text-align: center; font-size: 22px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .item { margin-bottom: 15px; }
            .label { font-weight: bold; font-size: 14px; display: block; }
            .valor { font-size: 16px; display: block; margin-top: 5px; }
            .assinaturas { margin-top: 80px; display: flex; justify-content: space-between; }
            .ass-box { width: 45%; border-top: 1px solid black; text-align: center; padding-top: 10px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0; font-size: 18px;">PREFEITURA MUNICIPAL DE SOLÂNEA</h2>
            <p style="margin:5px 0; font-size: 14px;">SECRETARIA DE AGRICULTURA E DESENVOLVIMENTO RURAL</p>
            <p style="margin:0; font-size: 12px;">Sistema RuralGest - Gestão de Máquinas</p>
          </div>

          <div class="titulo">${titulo}</div>

          <div class="grid">
            <div class="item"><span class="label">PROTOCOLO:</span><span class="valor">#${sol.id}</span></div>
            <div class="item"><span class="label">DATA:</span><span class="valor">${dataF}</span></div>
            <div class="item"><span class="label">AGRICULTOR:</span><span class="valor">${sol.agricultor?.nome || "---"}</span></div>
            <div class="item"><span class="label">CPF:</span><span class="valor">${sol.agricultor?.cpf || "---"}</span></div>
            <div class="item"><span class="label">PROPRIEDADE:</span><span class="valor">${sol.propriedade?.terreno || "---"}</span></div>
            <div class="item"><span class="label">SERVIÇO:</span><span class="valor">${sol.servico?.nome_servico || "---"}</span></div>
            <div class="item"><span class="label">STATUS:</span><span class="valor">${sol.status}</span></div>
            <div class="item"><span class="label">MÁQUINA:</span><span class="valor">${sol.veiculo?.nome || "Aguardando"}</span></div>
          </div>

          ${obs}
          ${textoAteste}

          <div class="assinaturas">
            <div class="ass-box">
                <strong>SECRETÁRIO DE AGRICULTURA</strong><br/>Assinatura / Carimbo
            </div>
            <div class="ass-box">
                <strong>${sol.agricultor?.nome || "BENEFICIÁRIO"}</strong><br/>Beneficiário
            </div>
          </div>

          <p style="text-align: center; font-size: 10px; margin-top: 50px; color: #666;">Documento gerado em ${new Date().toLocaleDateString()}</p>
        </body>
      </html>
    `;

    // 4. Escreve no Iframe e Imprime
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(conteudo);
    doc.close();

    // Pequeno delay para garantir que o navegador renderizou o HTML interno
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Remove o iframe depois (opcional, para limpar memória)
        setTimeout(() => { document.body.removeChild(iframe); }, 1000);
    }, 500);
  };

  const getStatusColor = (st) => {
    if (st === 'CONCLUÍDA') return 'green';
    if (st === 'APROVADA') return 'blue';
    if (st === 'RECUSADA' || st === 'CANCELADA') return 'red';
    return 'yellow';
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Flex justifyContent="space-between" mb="20px" align="center">
        <Text color={textColor} fontSize="2xl" fontWeight="700">Central de Solicitações</Text>
        <Button leftIcon={<MdAdd />} colorScheme="brand" onClick={handleNovo}>Nova Demanda</Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px">
        {solicitacoes.map((sol) => (
          <Card key={sol.id} p="20px" borderLeft="4px solid" borderColor={`${getStatusColor(sol.status)}.400`}>
            <Flex justify="space-between" mb="10px">
                <Badge colorScheme={getStatusColor(sol.status)}>{sol.status || "PENDENTE"}</Badge>
                <Text fontSize="xs" color="gray.400">#{sol.id}</Text>
            </Flex>
            <Flex align="center" mb="10px">
              <Icon as={MdAssignment} color={iconColor} w="20px" h="20px" mr="10px"/>
              <Text fontWeight="bold" fontSize="md" color={textColor}>{sol.servico?.nome_servico}</Text>
            </Flex>
            <Text fontSize="sm" color="gray.500"><strong>Agricultor:</strong> {sol.agricultor?.nome}</Text>
            <Text fontSize="sm" color="gray.500"><strong>Local:</strong> {sol.propriedade?.terreno}</Text>
            <Text fontSize="sm" color="gray.500"><strong>Data:</strong> {new Date(sol.data_solicitacao).toLocaleDateString()}</Text>
            {sol.veiculo && <Text fontSize="sm" color="brand.500" fontWeight="bold" mt="1">🚜 {sol.veiculo.nome}</Text>}

            <Flex justify="space-between" mt="15px">
               {/* Chama a nova função de impressão */}
               <Button size="sm" variant="ghost" colorScheme="gray" leftIcon={<MdPrint />} onClick={() => imprimirDocumento(sol)}>
                 Imprimir
               </Button>
               <Button size="sm" variant="outline" colorScheme="brand" leftIcon={<MdEdit />} onClick={() => handleEditar(sol)}>
                 Gerenciar
               </Button>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>

      {/* MODAL (FORMULÁRIO) */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{solicitacaoSelecionada ? "Gerenciar Demanda" : "Nova Demanda"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap="4" mb="4">
                <FormControl><FormLabel>Data</FormLabel><Input type="date" value={dataSolicitacao} readOnly /></FormControl>
                {solicitacaoSelecionada && (
                    <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select value={status} onChange={(e) => setStatus(e.target.value)} bg={getStatusColor(status) + ".50"}>
                            <option value="PENDENTE">PENDENTE</option>
                            <option value="APROVADA">APROVADA (Em Execução)</option>
                            <option value="CONCLUÍDA">CONCLUÍDA (Finalizada)</option>
                            <option value="RECUSADA">RECUSADA</option>
                        </Select>
                    </FormControl>
                )}
            </Flex>
            <FormControl mb="4" isRequired><FormLabel>Propriedade</FormLabel>
              <Select placeholder="Selecione..." value={propriedadeId} onChange={(e) => setPropriedadeId(e.target.value)}>
                {propriedades.map(p => <option key={p.id} value={p.id}>{p.terreno || p.nome || `Propriedade #${p.id}`}</option>)}
              </Select>
            </FormControl>
            <FormControl mb="4" isRequired><FormLabel>Serviço</FormLabel>
              <Select placeholder="Selecione..." value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
                {servicos.map(s => <option key={s.id} value={s.id}>{s.nome_servico}</option>)}
              </Select>
            </FormControl>
            {solicitacaoSelecionada && status !== 'RECUSADA' && (
                <Box p="3" bg="gray.50" borderRadius="md" mb="4" border="1px dashed" borderColor="gray.300">
                    <FormControl>
                        <FormLabel color="brand.600" fontWeight="bold">Alocar Máquina</FormLabel>
                        <Select placeholder="Escolha a máquina..." value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} bg="white">
                            <option value="">-- Aguardando --</option>
                            {veiculos.map(v => <option key={v.id} value={v.id}>{v.nome} - {v.placa} ({v.status})</option>)}
                        </Select>
                    </FormControl>
                </Box>
            )}
            {status === 'RECUSADA' && (
                <FormControl mb="4" isRequired>
                    <FormLabel color="red.500">Motivo da Recusa</FormLabel>
                    <Input placeholder="Ex: Chuvas fortes..." value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)} borderColor="red.300" />
                </FormControl>
            )}
            <FormControl><FormLabel>Observações</FormLabel><Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} /></FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="brand" onClick={handleSalvar}>Salvar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}