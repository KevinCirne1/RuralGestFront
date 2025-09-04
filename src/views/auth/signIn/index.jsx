// src/views/auth/signIn/index.jsx

import React from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, FormErrorMessage, Heading, Icon,
  Input, InputGroup, InputRightElement, Text, useColorModeValue, useToast
} from '@chakra-ui/react';

import { NavLink, Navigate } from 'react-router-dom'; 
import DefaultAuth from 'layouts/auth/Default';
import illustration from 'assets/img/auth/auth.png';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { useAuth } from 'contexts/AuthContext';

function SignIn() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();

  
  const { login, authData } = useAuth(); 

  const handleLogin = async (values, actions) => {
    try {
      await login(values.login, values.senha);
      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando para o painel.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro no Login",
        description: "Usuário ou senha inválidos. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  
  if (authData) {
    if (authData.user.perfil === 'produtor') {
      return <Navigate to="/produtor" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex maxW={{ base: '100%', md: 'max-content' }} w='100%' mx={{ base: 'auto', lg: '0px' }} me='auto' h='100%'
        alignItems='start' justifyContent='center' mb={{ base: '30px', md: '60px' }} px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }} flexDirection='column'
      >
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>Acessar Sistema</Heading>
          <Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md'>
            Digite seu login e senha para entrar!
          </Text>
        </Box>
        <Flex zIndex='2' direction='column' w={{ base: '100%', md: '420px' }} maxW='100%' background='transparent'
          borderRadius='15px' mx={{ base: 'auto', lg: 'unset' }} me='auto' mb={{ base: '20px', md: 'auto' }}
        >
          <Formik
            initialValues={{ login: '', senha: '' }}
            validationSchema={Yup.object({
              login: Yup.string().required('Login é obrigatório'),
              senha: Yup.string().required('Senha é obrigatória'),
            })}
            onSubmit={handleLogin}
          >
            {(props) => (
              <Form>
                <Field name='login'>{({ field, form }) => (<FormControl isInvalid={form.errors.login && form.touched.login}><FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>Login*</FormLabel><Input {...field} variant='auth' fontSize='sm' placeholder='ex: ana.gestora' mb='24px' /><FormErrorMessage>{form.errors.login}</FormErrorMessage></FormControl>)}</Field>
                <Field name='senha'>{({ field, form }) => (<FormControl isInvalid={form.errors.senha && form.touched.senha}><FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} display='flex'>Senha*</FormLabel><InputGroup size='md'><Input {...field} fontSize='sm' placeholder='Digite sua senha' mb='24px' size='lg' type={show ? 'text' : 'password'} variant='auth' /><InputRightElement display='flex' alignItems='center' mt='4px'><Icon color={textColorSecondary} _hover={{ cursor: 'pointer' }} as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye} onClick={handleClick} /></InputRightElement></InputGroup><FormErrorMessage>{form.errors.senha}</FormErrorMessage></FormControl>)}</Field>
                <Button fontSize='sm' variant='brand' fontWeight='500' w='100%' h='50' mb='24px' type='submit' isLoading={props.isSubmitting}>Entrar</Button>
              </Form>
            )}
          </Formik>
          <Flex flexDirection='column' justifyContent='center' alignItems='start' maxW='100%' mt='0px'>
            <Text color='gray.400' fontWeight='400' fontSize='14px'>
              Não é cadastrado?
              <NavLink to='/auth/sign-up'><Text color={textColorBrand} as='span' ms='5px' fontWeight='500'>Criar uma conta</Text></NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;