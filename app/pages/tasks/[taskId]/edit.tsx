import { Suspense } from "react"
import { Link, useQuery, useMutation, useParam, BlitzPage, Routes } from "blitz"
import {
  Box,
  Container,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  Spacer,
  VStack,
} from "@chakra-ui/react"
import logout from "app/auth/mutations/logout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import Layout from "app/core/layouts/Layout"
import getTask from "app/tasks/queries/getTask"
import updateTask from "app/tasks/mutations/updateTask"

export const EditTask = () => {
  const taskId = useParam("taskId", "number")
  const [task] = useQuery(
    getTask,
    { id: taskId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateTaskMutation] = useMutation(updateTask)

  return (
    <>
      <Heading size="md">
        <Editable
          onSubmit={async (description) => {
            await updateTaskMutation({ description, id: task.id })
          }}
          defaultValue={task.description}
          placeholder="Click here to add detail"
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
      </Heading>

      <Editable
        onSubmit={async (detail) => {
          await updateTaskMutation({ detail, id: task.id })
        }}
        defaultValue={task.detail ?? undefined}
        placeholder="Click here to add detail"
      >
        <EditablePreview />
        <EditableInput />
      </Editable>
    </>
  )
}

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

const TopNav = () => {
  const currentUser = useCurrentUser()
  return (
    <Flex py={0} w="full">
      <HStack p={4} spacing={5} w={200}>
        <Link href={Routes.Home()}>
          <ChakraLink>Current Activity</ChakraLink>
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
      <Flex p={4} w={200}>
        <Spacer />
        <Logout />
      </Flex>
    </Flex>
  )
}

const EditTaskPage: BlitzPage = () => {
  return (
    <Container maxW="container.md">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <Flex py={4} w="full">
            <Box w="full" p={10}>
              <EditTask />
            </Box>
          </Flex>
        </VStack>
      </Suspense>
    </Container>
  )
}

EditTaskPage.authenticate = true
EditTaskPage.getLayout = (page) => <Layout title="Edit Task">{page}</Layout>

export default EditTaskPage
