import { Suspense, useState } from "react"
import { useQuery, useParam, BlitzPage } from "blitz"
import { Box, Container, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getPomodoro from "app/pomodoros/queries/getPomodoro"
import { TasksPanel } from "app/pomodoros/components/TasksPanel"
import { EditActivityDuration } from "app/activities/components/EditActivityDuration"

export const EditPomodoro = () => {
  const pomodoroId = useParam("pomodoroId", "number")
  const [pomodoro, { refetch }] = useQuery(getPomodoro, { id: pomodoroId })
  const [isEditingDuration, setIsEditingDuration] = useState(false)
  const onClick = () => setIsEditingDuration(!isEditingDuration)
  return (
    <VStack spacing={8}>
      <Heading size="md">Pomodoro ({pomodoro.createdAt.toLocaleDateString()})</Heading>
      <VStack>
        <Heading size="sm">Duration</Heading>
        {isEditingDuration ? (
          <EditActivityDuration
            activity={pomodoro}
            onCancel={() => setIsEditingDuration(false)}
            onSave={() => {
              setIsEditingDuration(false)
              refetch()
            }}
          />
        ) : (
          <VStack>
            <Text>Started: {pomodoro.createdAt.toLocaleTimeString()}</Text>
            <Text>
              Stopped: {pomodoro.stoppedAt ? pomodoro.stoppedAt.toLocaleTimeString() : null}
            </Text>
            <Link onClick={onClick}>Edit...</Link>
          </VStack>
        )}
      </VStack>
      <VStack>
        <Heading size="sm">Tasks</Heading>
        <TasksPanel pomodoro={pomodoro} refetch={refetch} />
      </VStack>
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
