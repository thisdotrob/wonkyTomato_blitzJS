import { Link, Routes, useMutation } from "blitz"
import { Link as ChakraLink, Flex, Box, Spacer, HStack } from "@chakra-ui/react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"

const Logout = () => {
  const [logoutMutation] = useMutation(logout)
  return (
    <ChakraLink
      onClick={async () => {
        await logoutMutation()
      }}
    >
      Logout
    </ChakraLink>
  )
}

export const TopNav = () => {
  const currentUser = useCurrentUser()
  return (
    <Flex py={0} w="full">
      <HStack p={4} spacing={5} w={340}>
        <Link href={Routes.Home()}>
          <ChakraLink>Home</ChakraLink>
        </Link>
        <Link href={Routes.TasksPage()}>
          <ChakraLink>Tasks</ChakraLink>
        </Link>
        <Link href={Routes.PomodorosPage()}>
          <ChakraLink>Pomodoros</ChakraLink>
        </Link>
        <Link href={Routes.BreakTimesPage()}>
          <ChakraLink>Breaks</ChakraLink>
        </Link>
      </HStack>
      <Spacer />
      <Box p={4}>{currentUser?.email}</Box>
      <Spacer />
      <Flex p={4} w={340}>
        <Spacer />
        <Logout />
      </Flex>
    </Flex>
  )
}
