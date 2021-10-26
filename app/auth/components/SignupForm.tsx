import { useState } from "react"
import { useColorModeValue } from "@chakra-ui/color-mode"
import { Box, Text } from "@chakra-ui/layout"
import { HStack, Link as ChakraLink } from "@chakra-ui/react"
import signup from "app/auth/mutations/signup"
import { Signup } from "app/auth/validations"
import { Card } from "app/core/components/Card"
import { Form, FORM_ERROR } from "app/core/components/Form"
import { FormTextInput } from "app/core/components/Forms/FormTextInput"
import { Link } from "app/core/components/Link"
import { PageTitle } from "app/core/components/PageTitle"
import { Routes, useMutation } from "blitz"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)

  const [isOrg, setIsOrg] = useState(false)

  return (
    <Card>
      <PageTitle>Create an Account</PageTitle>

      <Form
        submitText="Create Account"
        schema={Signup}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            await signupMutation(values)
            props.onSuccess?.()
          } catch (error) {
            if (error.code === "P2002" && error.meta?.target?.includes("email")) {
              // This error comes from Prisma
              return { email: "This email is already being used" }
            } else {
              return { [FORM_ERROR]: error.toString() }
            }
          }
        }}
      >
        <FormTextInput type="email" name="email" label="Email" placeholder="Email" />
        <FormTextInput type="password" name="password" label="Password" placeholder="Password" />
        {isOrg ? (
          <FormTextInput name="organization" label="Organization" placeholder="Organization" />
        ) : (
          <HStack>
            <Text>Part of an organization? </Text>
            <ChakraLink onClick={() => setIsOrg(true)}>Click here...</ChakraLink>
          </HStack>
        )}
      </Form>

      <Box
        mt={5}
        textAlign="center"
        borderTop="1px solid"
        borderTopColor={useColorModeValue("gray.100", "gray.700")}
        pt={5}
      >
        <Text>
          Already have an account?{" "}
          <Link href={Routes.LoginPage()} colorScheme="brand">
            Login
          </Link>
        </Text>
      </Box>
    </Card>
  )
}

export default SignupForm
