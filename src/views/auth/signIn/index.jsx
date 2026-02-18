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
  VStack
} from '@chakra-ui/react';

import { NavLink, Navigate } from 'react-router-dom';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useAuth } from 'contexts/AuthContext';

function SignIn() {
  const bgForm = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = 'gray.500';
  const brandColor = 'brand.500'; 
  const inputBorder = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();

  const { login, authData } = useAuth();

  //LÓGICA DE LOGIN
  const handleLogin = async (values, actions) => {
    try {
      await login(values.login, values.senha);
      
      toast({
        title: "Bem-vindo de volta!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
      
    } catch (error) {
      console.error("Erro no login:", error);
      toast({
        title: "Falha no acesso",
        description: "Usuário ou senha incorretos. Verifique suas credenciais.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  if (authData?.user) {
    const perfil = authData.user.perfil;
    
    if (perfil === 'agricultor' || perfil === 'produtor') {
        return <Navigate to="/produtor/dashboard" replace />;
    }
    
    if (perfil === 'tecnico' || perfil === 'operador') {
        return <Navigate to="/admin/minha-agenda" replace />;
    }
    
    return <Navigate to="/admin/dashboard" replace />;
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
        p={{ base: '30px', md: '60px', lg: '80px' }}
      >
        <Box w='100%' maxW='450px'>
          <VStack align='start' spacing={3} mb='40px'>
            <Heading color={textColor} fontSize={{ base: '32px', md: '40px' }} fontWeight='800' lineHeight='1.1'>
              Acessar <br/>
              <Text as="span" color={brandColor}>RuralGest</Text>
            </Heading>
            <Text color={textColorSecondary} fontSize='lg'>
              Entre com suas credenciais para gerenciar o sistema.
            </Text>
          </VStack>

          <Formik
            initialValues={{ login: '', senha: '' }}
            validationSchema={Yup.object({
              login: Yup.string().required('Usuário é obrigatório'),
              senha: Yup.string().required('Senha é obrigatória'),
            })}
            onSubmit={handleLogin}
          >
            {(props) => (
              <Form>
                <VStack spacing={5}>
                  
                  <Field name='login'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.login && form.touched.login}>
                        <FormLabel fontWeight='600' color={textColor} ml={1}>Usuário (Email ou CPF)</FormLabel>
                        <Input
                          {...field}
                          variant='outline'
                          placeholder='Digite seu email ou CPF'
                          size='lg' h='56px' bg={inputBg} borderColor={inputBorder} borderRadius='16px'
                          _focus={{ borderColor: brandColor, boxShadow: `0 0 0 1px ${brandColor}`, bg: bgForm }}
                        />
                        <FormErrorMessage ml={1}>{form.errors.login}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name='senha'>
                    {({ field, form }) => (
                      <FormControl isInvalid={form.errors.senha && form.touched.senha}>
                        <FormLabel fontWeight='600' color={textColor} ml={1}>Senha</FormLabel>
                        <InputGroup size='lg'>
                          <Input
                            {...field}
                            placeholder='Digite sua senha'
                            type={show ? 'text' : 'password'}
                            variant='outline'
                            size='lg' h='56px' bg={inputBg} borderColor={inputBorder} borderRadius='16px'
                            _focus={{ borderColor: brandColor, boxShadow: `0 0 0 1px ${brandColor}`, bg: bgForm }}
                          />
                          <InputRightElement h='56px' width='50px' display='flex' alignItems='center'>
                            <Icon color={textColorSecondary} as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye} onClick={handleClick} cursor='pointer' w='22px' h='22px' />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage ml={1}>{form.errors.senha}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Button fontSize='lg' variant='solid' colorScheme='brand' fontWeight='700' w='100%' h='56px' borderRadius='16px' type='submit' isLoading={props.isSubmitting} mt={4} boxShadow='lg'>
                    Entrar
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>

          <Flex justifyContent='center' alignItems='center' mt='30px'>
            <Text color={textColorSecondary} fontSize='md'>
              Ainda não tem acesso?
              <NavLink to='/auth/sign-up'>
                <Text color={brandColor} as='span' ms='5px' fontWeight='700' _hover={{ textDecoration: 'underline' }}>
                  Crie sua conta
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
        <Box
          position='absolute' top='0' left='0' w='100%' h='100%'
          bgImage="url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1074&auto=format&fit=crop')"
          bgSize='cover'
          bgPosition='center'
          zIndex={0}
        />
        <Box
          position='absolute' top='0' left='0' w='100%' h='100%'
          bgGradient="linear(to-t, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)"
          zIndex={1}
        />
        <VStack position='relative' zIndex={2} align='start' spacing={2} maxW='600px' mb='40px'>
          <Heading color='white' fontSize={{ md: '40px', lg: '50px' }} fontWeight='800' lineHeight='1.2' textShadow="2px 2px 4px rgba(0,0,0,0.6)">
            Tecnologia e <br/>Gestão no Campo.
          </Heading>
          <Text color='gray.200' fontSize='xl' fontWeight='400' textShadow="1px 1px 2px rgba(0,0,0,0.6)">
            A solução completa para o gerenciamento de máquinas e serviços agrícolas.
          </Text>
        </VStack>
      </Flex>

    </Flex>
  );
}

export default SignIn;