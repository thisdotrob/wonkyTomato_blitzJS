import { Suspense, useState } from "react"
import { Link, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { useCurrentActivity } from "app/core/hooks/useCurrentActivity"
import createPomodoro from "app/pomodoros/mutations/createPomodoro"
import stopPomodoro from "app/pomodoros/mutations/stopPomodoro"
import createBreakTime from "app/break-times/mutations/createBreakTime"
import stopBreakTime from "app/break-times/mutations/stopBreakTime"
import createTask from "app/tasks/mutations/createTask"
import { TaskForm, FORM_ERROR } from "app/tasks/components/TaskForm"
import logout from "app/auth/mutations/logout"
import {
  Button,
  Link as ChakraLink,
  Container,
  Flex,
  Box,
  Spacer,
  VStack,
  HStack,
} from "@chakra-ui/react"

const UpdatePomodoroTasksPanel = () => {
  const { currentActivity, refetch } = useCurrentActivity()

  const [createTaskMutation] = useMutation(createTask)
  const [addingTask, setAddingTask] = useState(false)

  return currentActivity?.type === "pomodoro" ? (
    addingTask ? (
      <TaskForm
        submitText="Create Task"
        onSubmit={async (values) => {
          try {
            await createTaskMutation({ ...values, pomodoroId: currentActivity.activity.id })
            setAddingTask(false)
            refetch()
          } catch (error) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />
    ) : (
      <VStack>
        {currentActivity.activity.tasks.map((t, i) => (
          <li key={i}>{t.description}</li>
        ))}
        <Button size="sm" onClick={() => setAddingTask(true)}>
          Add task
        </Button>
      </VStack>
    )
  ) : null
}

const CurrentBreakPanel = ({ currentActivity }) => {
  return (
    <VStack>
      <span>Current break</span>
      <span>Started: {currentActivity.activity.createdAt.toLocaleTimeString()}</span>
      <span>Suggested length: {currentActivity.suggestedLength}</span>
      <span>Suggested end time: {currentActivity.suggestedEndTime.toLocaleTimeString()}</span>
    </VStack>
  )
}

const CurrentPomodoroPanel = ({ currentActivity }) => {
  return (
    <VStack>
      <span>Current pomodoro</span>
      <span>Started: {currentActivity.activity.createdAt.toLocaleTimeString()}</span>
      <span>Suggested length: {currentActivity.suggestedLength}</span>
      <span>Suggested end time: {currentActivity.suggestedEndTime.toLocaleTimeString()}</span>
    </VStack>
  )
}

const CurrentActivityPanel = () => {
  const { currentActivity } = useCurrentActivity()

  switch (currentActivity?.type) {
    case "break":
      return <CurrentBreakPanel currentActivity={currentActivity} />
    case "pomodoro":
      return <CurrentPomodoroPanel currentActivity={currentActivity} />
    default:
      return null
  }
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
    <Flex bg="red.50" py={0} w="full">
      <HStack p={4} spacing={5} w={200}>
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
      <Flex p={4} w={200}>
        <Spacer />
        <Logout />
      </Flex>
    </Flex>
  )
}

const StartPomodoroButton = () => {
  const { currentActivity, refetch } = useCurrentActivity()
  const [createPomodoroMutation] = useMutation(createPomodoro)
  const [stopBreakTimeMutation] = useMutation(stopBreakTime)

  return (
    <>
      {currentActivity?.type === "pomodoro" ? null : (
        <Box p={4}>
          <Button
            onClick={async () => {
              await createPomodoroMutation({})
              if (currentActivity) {
                await stopBreakTimeMutation({ id: currentActivity.activity.id })
              }
              refetch()
            }}
          >
            Start Pomodoro
          </Button>
        </Box>
      )}
    </>
  )
}

const StartBreakButton = () => {
  const { currentActivity, refetch } = useCurrentActivity()
  const [stopPomodoroMutation] = useMutation(stopPomodoro)
  const [createBreakTimeMutation] = useMutation(createBreakTime)
  return (
    <>
      {currentActivity?.type !== "pomodoro" ? null : (
        <Box p={4}>
          <Button
            onClick={async () => {
              await Promise.all([
                stopPomodoroMutation({ id: currentActivity.activity.id }),
                createBreakTimeMutation({}),
              ])
              refetch()
            }}
          >
            Start Break
          </Button>
        </Box>
      )}
    </>
  )
}

const StopButton = () => {
  const { currentActivity, refetch } = useCurrentActivity()
  const [stopBreakTimeMutation] = useMutation(stopBreakTime)
  return (
    <>
      {currentActivity?.type !== "break" ? null : (
        <Box p={4}>
          <Button
            onClick={async () => {
              await stopBreakTimeMutation({ id: currentActivity!.activity.id })
              refetch()
            }}
          >
            Stop
          </Button>
        </Box>
      )}
    </>
  )
}

const BottomNav = () => {
  return (
    <Flex bg="yellow.100" py={0} w="full" align="center">
      <Spacer />
      <HStack>
        <StartPomodoroButton />
        <StartBreakButton />
        <StopButton />
      </HStack>
      <Spacer />
    </Flex>
  )
}

const Home: BlitzPage = () => {
  return (
    <Container maxW="container.md">
      <Suspense fallback="Loading...">
        <VStack bg="blue.50" spacing={0}>
          <TopNav />
          <Flex py={4} bg="green.100" w="full">
            <Box w="full" p={10} bg="gray.100">
              <CurrentActivityPanel />
            </Box>
            <VStack w="full" alignItems="flex-start" p={10} spacing={10} bg="gray.50">
              <UpdatePomodoroTasksPanel />
            </VStack>
          </Flex>
          <BottomNav />
        </VStack>
      </Suspense>
    </Container>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
