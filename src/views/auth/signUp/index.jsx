// src/views/auth/signUp/index.jsx

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

// <<< IMPORTAÇÃO NECESSÁRIA PARA CADASTRAR O USUÁRIO
import { createUsuario } from 'services/usuarioService';

import { useAuth } from 'contexts/AuthContext';

function SignUp() {
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const textColorBrand = useColorModeValue('brand.500', 'white');
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  
  const { authData } = useAuth();

  // <<< ALTERAÇÃO NA LÓGICA DE CADASTRO
  const handleRegister = async (values, actions) => {
    try {
      const newUser = {
        nome: values.nome,
        login: values.login,
        senha: values.senha, // NOTE: Em um projeto real, a senha deveria ser hash
        perfil: 'produtor' // Define o perfil padrão para 'produtor'
      };
      
      await createUsuario(newUser);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você já pode fazer login no sistema.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      actions.setSubmitting(false);
      // Redireciona o usuário para a página de login
      window.location.href = '/auth/sign-in';
      
    } catch (error) {
      toast({
        title: "Erro ao cadastrar.",
        description: "Não foi possível criar a conta. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      actions.setSubmitting(false);
    }
  };

  if (authData) {
    if (authData.user.perfil === 'produtor') {
      return <Navigate to="/produtor/minhas-solicitacoes" replace />;
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
          <Heading color={textColor} fontSize='36px' mb='10px'>Criar uma Conta</Heading>
          <Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md'>
            Comece a usar o sistema agora!
          </Text>
        </Box>
        <Flex zIndex='2' direction='column' w={{ base: '100%', md: '420px' }} maxW='100%' background='transparent'
          borderRadius='15px' mx={{ base: 'auto', lg: 'unset' }} me='auto' mb={{ base: '20px', md: 'auto' }}
        >
          <Formik
            initialValues={{ nome: '', login: '', senha: '', confirmarSenha: '' }}
            validationSchema={Yup.object({
              nome: Yup.string().required('Nome é obrigatório'),
              login: Yup.string().required('Login é obrigatório'),
              senha: Yup.string().required('Senha é obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
              confirmarSenha: Yup.string().oneOf([Yup.ref('senha'), null], 'As senhas não conferem').required('Confirmação de senha é obrigatória'),
            })}
            onSubmit={handleRegister}
          >
            {(props) => (
              <Form>
                <Field name='nome'>{({ field, form }) => (<FormControl isInvalid={form.errors.nome && form.touched.nome}><FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>Nome Completo*</FormLabel><Input {...field} variant='auth' fontSize='sm' placeholder='Seu nome completo' mb='24px'/><FormErrorMessage>{form.errors.nome}</FormErrorMessage></FormControl>)}</Field>
                <Field name='login'>{({ field, form }) => (<FormControl isInvalid={form.errors.login && form.touched.login}><FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>Login*</FormLabel><Input {...field} variant='auth' fontSize='sm' placeholder='ex: joao.silva' mb='24px'/><FormErrorMessage>{form.errors.login}</FormErrorMessage></FormControl>)}</Field>
                <Field name='senha'>{({ field, form }) => (<FormControl isInvalid={form.errors.senha && form.touched.senha}><FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} display='flex'>Senha*</FormLabel><InputGroup size='md'><Input {...field} fontSize='sm' placeholder='Min. 6 caracteres' mb='24px' size='lg' type={show ? 'text' : 'password'} variant='auth'/><InputRightElement display='flex' alignItems='center' mt='4px'><Icon color={textColorSecondary} _hover={{ cursor: 'pointer' }} as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye} onClick={handleClick} /></InputRightElement></InputGroup><FormErrorMessage>{form.errors.senha}</FormErrorMessage></FormControl>)}</Field>
                <Field name='confirmarSenha'>{({ field, form }) => (<FormControl isInvalid={form.errors.confirmarSenha && form.touched.confirmarSenha}><FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} display='flex'>Confirmar Senha*</FormLabel><InputGroup size='md'><Input {...field} fontSize='sm' placeholder='Repita a senha' mb='24px' size='lg' type='password' variant='auth'/></InputGroup><FormErrorMessage>{form.errors.confirmarSenha}</FormErrorMessage></FormControl>)}</Field>
                <Button fontSize='sm' variant='brand' fontWeight='500' w='100%' h='50' mb='24px' type='submit' isLoading={props.isSubmitting}>Criar Conta</Button>
              </Form>
            )}
          </Formik>
          <Flex flexDirection='column' justifyContent='center' alignItems='start' maxW='100%' mt='0px'>
            <Text color='gray.400' fontWeight='400' fontSize='14px'>
              Já tem uma conta?
              <NavLink to='/auth/sign-in'><Text color={textColorBrand} as='span' ms='5px' fontWeight='500'>Entrar</Text></NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignUp;