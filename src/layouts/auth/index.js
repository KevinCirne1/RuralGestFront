import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import illustration from 'assets/img/auth/auth.png';

export default function AuthLayout() {
  return (
    <Box>
      <Flex position="relative" h="100vh" align="center" justify="center">
        <Box h="100vh" w="100vw" position="absolute" top="0" left="0">
          <img
            src={illustration}
            alt="Auth Illustration"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </Box>
        <Flex
          position="relative"
          zIndex="1"
          w="100%"
          maxW={{ base: '100%', md: '1300px' }}
          alignItems="center"
          justifyContent="center"
        >
          <Outlet />
        </Flex>
      </Flex>
    </Box>
  );
}