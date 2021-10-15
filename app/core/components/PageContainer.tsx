import { BoxProps, Container, useColorModeValue } from "@chakra-ui/react"
import React from "react"

export interface PageContainerProps extends BoxProps {
  centerPage?: boolean
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, centerPage, ...props }) => {
  const centerProps = centerPage ? { justify: "center", align: "center" } : {}
  return (
    <Container
      bg={useColorModeValue("gray.200", "gray.900")}
      minH="100vh"
      maxW="container.md"
      {...centerProps}
      {...props}
    >
      {children}
    </Container>
  )
}
