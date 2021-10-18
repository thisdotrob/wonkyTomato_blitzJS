import { Link, Routes, RouteUrlObject, useMutation, useRouter } from "blitz"
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

type TopNavLinkProps = {
  currentPath: string
  route: RouteUrlObject
  linkText: string
}

const TopNavLink = (props: TopNavLinkProps) => {
  const { currentPath, route, linkText } = props

  return (
    <Link href={route}>
      {currentPath === route.pathname ? (
        <ChakraLink textDecoration="underline">{linkText}</ChakraLink>
      ) : (
        <ChakraLink>{linkText}</ChakraLink>
      )}
    </Link>
  )
}

export const TopNav = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()
  return (
    <Flex py={0} w="full">
      <HStack p={4} spacing={5} w={340}>
        <TopNavLink currentPath={router.pathname} route={Routes.Home()} linkText="Home" />
        <TopNavLink currentPath={router.pathname} route={Routes.TasksPage()} linkText="Tasks" />
        <TopNavLink
          currentPath={router.pathname}
          route={Routes.PomodorosPage()}
          linkText="Pomodoros"
        />
        <TopNavLink
          currentPath={router.pathname}
          route={Routes.BreakTimesPage()}
          linkText="Breaks"
        />
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
