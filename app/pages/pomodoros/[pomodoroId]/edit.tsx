import { Suspense } from "react"
import { useQuery, useParam, BlitzPage } from "blitz"
import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getPomodoro from "app/pomodoros/queries/getPomodoro"
import { TasksPanel } from "app/pomodoros/components/TasksPanel"

export const EditPomodoro = () => {
  const pomodoroId = useParam("pomodoroId", "number")
  const [pomodoro, { refetch }] = useQuery(getPomodoro, { id: pomodoroId })
  return (
    <VStack spacing={8}>
      <Heading size="md">Pomodoro</Heading>
      <TasksPanel pomodoro={pomodoro} refetch={refetch} />
    </VStack>
  )
}

const EditPomodoroPage: BlitzPage = () => {
  return (
    <Container maxW="container.md">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <Flex py={4} w="full">
            <Box w="full" p={10}>
              <EditPomodoro />
            </Box>
          </Flex>
        </VStack>
      </Suspense>
    </Container>
  )
}

EditPomodoroPage.authenticate = true
EditPomodoroPage.getLayout = (page) => <Layout title="Edit Pomodoro">{page}</Layout>

export default EditPomodoroPage
