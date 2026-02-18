import React from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  SimpleGrid 
} from '@chakra-ui/react';
import { NavLink, Navigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye, MdArrowBack } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { createUsuario } from 'services/usuarioService';
import { useAuth } from 'contexts/AuthContext';

function SignUp() {
  const bgForm = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = 'gray.500';
  const brandColor = 'brand.500';
  
  const inputBorder = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  
  const { authData } = useAuth();

  //LÓGICA DE CADASTRO 
  const handleRegister = async (values, actions) => {
    try {
      const newUser = {
        nome: values.nome,
        login: values.login,
        senha: values.senha,
        cpf: values.cpf,
        comunidade: values.comunidade,
        contato: values.contato, 
        perfil: 'agricultor' 
      };
      
      await createUsuario(newUser);
    
      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });

      actions.setSubmitting(false);
      
      setTimeout(() => {
         window.location.href = '/auth/sign-in';
      }, 1000);
      
    } catch (error) {

      const mensagemErro = error.response?.data?.message || "Verifique os dados e tente novamente.";
      
      toast({
        title: "Erro ao cadastrar.",
        description: mensagemErro,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
      actions.setSubmitting(false);
    }
  };

  if (authData) {
    if (authData.user.perfil === 'agricultor') {
      return <Navigate to="/produtor/minhas-solicitacoes" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return (
    <Flex position='relative' h='100vh' w='100%' overflow='hidden'>
      
      <Flex
        h='100%'
        w={{ base: '100%', md: '50%', lg: '45%' }}
        bg={bgForm}
        justifyContent='center'
        alignItems='center'
        direction='column'
        p={{ base: '30px', md: '60px' }}
        overflowY="auto"
      >
        <Box w='100%' maxW='450px'>
          
          <Box mb="20px">
             <NavLink to='/auth/sign-in'>
                <Flex align="center" color={textColorSecondary} _hover={{ color: brandColor }} transition="all 0.2s">
                    <Icon as={MdArrowBack} mr="5px" />
                    <Text fontSize="sm" fontWeight="600">Voltar para Login</Text>
                </Flex>
             </NavLink>
          </Box>

          <VStack align='start' spacing={2} mb='30px'>
            <Heading color={textColor} fontSize={{ base: '30px', md: '36px' }} fontWeight='800' lineHeight='1.1'>
              Crie sua conta <br/>
              <Text as="span" color={brandColor}>RuralGest</Text>
            </Heading>
            <Text color={textColorSecondary} fontSize='md'>
              Preencha os dados completos para o cadastro rural.
            </Text>
          </VStack>

          <Formik
            initialValues={{ 
                nome: '', 
                cpf: '', 
                comunidade: '', 
                contato: '', 
                login: '', 
                senha: '', 
                confirmarSenha: '' 
            }}
            validationSchema={Yup.object({
              nome: Yup.string().required('Nome é obrigatório'),
              cpf: Yup.string().required('CPF é obrigatório').min(11, 'CPF incompleto'),
              comunidade: Yup.string().required('Comunidade é obrigatória'),
              contato: Yup.string().required('Telefone é obrigatório'),
              login: Yup.string().required('Usuário é obrigatório'),
              senha: Yup.string().required('Senha é obrigatória').min(6, 'Mínimo de 6 caracteres'),
              confirmarSenha: Yup.string().oneOf([Yup.ref('senha'), null], 'As senhas não conferem').required('Confirmação obrigatória'),
            })}
            onSubmit={handleRegister}
          >
            {(props) => (
              <Form>
                <VStack spacing={4}>
                  
                  <Field name='nome'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.nome && form.touched.nome}>
                        <FormLabel fontWeight='600' color={textColor} fontSize='sm' ml={1}>Nome Completo</FormLabel>
                        <Input {...field} placeholder='ex: João da Silva' size='lg' h='50px' bg={inputBg} borderColor={inputBorder} borderRadius='16px' _focus={{ borderColor: brandColor }} />
                        <FormErrorMessage ml={1}>{form.errors.nome}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                      <Field name='cpf'>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.cpf && form.touched.cpf}>
                            <FormLabel fontWeight='600' color={textColor} fontSize='sm' ml={1}>CPF</FormLabel>
                            <Input {...field} placeholder='000.000.000-00' size='lg' h='50px' bg={inputBg} borderColor={inputBorder} borderRadius='16px' _focus={{ borderColor: brandColor }} />
                            <FormErrorMessage ml={1}>{form.errors.cpf}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Field name='contato'>
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.contato && form.touched.contato}>
                            <FormLabel fontWeight='600' color={textColor} fontSize='sm' ml={1}>Telefone</FormLabel>
                            <Input {...field} placeholder='(83) 99999-9999' size='lg' h='50px' bg={inputBg} borderColor={inputBorder} borderRadius='16px' _focus={{ borderColor: brandColor }} />
                            <FormErrorMessage ml={1}>{form.errors.contato}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                  </SimpleGrid>

                  <Field name='comunidade'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.comunidade && form.touched.comunidade}>
                        <FormLabel fontWeight='600' color={textColor} fontSize='sm' ml={1}>Comunidade Rural</FormLabel>
                        <Input {...field} placeholder='ex: Sítio Cajueiro' size='lg' h='50px' bg={inputBg} borderColor={inputBorder} borderRadius='16px' _focus={{ borderColor: brandColor }} />
                        <FormErrorMessage ml={1}>{form.errors.comunidade}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name='login'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.login && form.touched.login}>
                        <FormLabel fontWeight='600' color={textColor} fontSize='sm' ml={1}>Usuário (Login)</FormLabel>
                        <Input {...field} placeholder='ex: joao.silva' size='lg' h='50px' bg={inputBg} borderColor={inputBorder} borderRadius='16px' _focus={{ borderColor: brandColor }} />
                        <FormErrorMessage ml={1}>{form.errors.login}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name='senha'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.senha && form.touched.senha}>
                        <FormLabel fontWeight='600' color={textColor} fontSize='sm' ml={1}>Senha</FormLabel>
                        <InputGroup size='lg'>
                          <Input {...field} placeholder='Mínimo 6 caracteres' type={show ? 'text' : 'password'} h='50px' bg={inputBg} borderColor={inputBorder} borderRadius='16px' _focus={{ borderColor: brandColor }} />
                          <InputRightElement h='50px' width='50px' display='flex' alignItems='center'>
                            <Icon color={textColorSecondary} as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye} onClick={handleClick} cursor='pointer' />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage ml={1}>{form.errors.senha}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name='confirmarSenha'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.confirmarSenha && form.touched.confirmarSenha}>
                        <FormLabel fontWeight='600' color={textColor} fontSize='sm' ml={1}>Confirmar Senha</FormLabel>
                        <Input {...field} placeholder='Repita a senha' type='password' h='50px' bg={inputBg} borderColor={inputBorder} borderRadius='16px' _focus={{ borderColor: brandColor }} />
                        <FormErrorMessage ml={1}>{form.errors.confirmarSenha}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Button fontSize='lg' variant='solid' colorScheme='brand' fontWeight='bold' w='100%' h='56px' borderRadius='16px' type='submit' isLoading={props.isSubmitting} mt={4} boxShadow='lg'>
                    Criar Conta
                  </Button>

                </VStack>
              </Form>
            )}
          </Formik>

          <Flex justifyContent='center' alignItems='center' mt='30px' mb='20px'>
            <Text color={textColorSecondary} fontSize='sm'>
              Já tem uma conta?
              <NavLink to='/auth/sign-in'>
                <Text color={brandColor} as='span' ms='5px' fontWeight='bold' _hover={{ textDecoration: 'underline' }}>
                  Acesse aqui
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Flex
        w={{ base: '0%', md: '50%', lg: '55%' }}
        h='100%'
        display={{ base: 'none', md: 'flex' }}
        position='relative'
        justifyContent='center'
        alignItems='flex-end'
        p='80px'
        bg='gray.900'
      >
        <Box position='absolute' top='0' left='0' w='100%' h='100%' bgImage="url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1074&auto=format&fit=crop')" bgSize='cover' bgPosition='center' zIndex={0} />
        <Box position='absolute' top='0' left='0' w='100%' h='100%' bgGradient="linear(to-t, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)" zIndex={1} />
        <VStack position='relative' zIndex={2} align='start' spacing={3} maxW='600px' mb='40px'>
          <Heading color='white' fontSize={{ md: '40px', lg: '48px' }} fontWeight='800' lineHeight='1.1' textShadow="2px 2px 4px rgba(0,0,0,0.6)">
            Junte-se ao <br/>RuralGest.
          </Heading>
          <Text color='gray.200' fontSize='xl' fontWeight='400' maxW="480px" textShadow="1px 1px 2px rgba(0,0,0,0.6)">
            Faça seu cadastro completo e comece a gerenciar suas solicitações.
          </Text>
        </VStack>
      </Flex>

    </Flex>
  );
}

export default SignUp;