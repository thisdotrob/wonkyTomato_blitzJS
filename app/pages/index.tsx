import { Suspense, useEffect, useState } from "react"
import { Link, BlitzPage, useMutation, Routes } from "blitz"
import debounce from "lodash.debounce"
import {
  Button,
  Link as ChakraLink,
  Heading,
  Container,
  Flex,
  Box,
  Spacer,
  VStack,
  HStack,
  Text,
  Input,
  Checkbox,
} from "@chakra-ui/react"
import { MdAddCircle, MdRemoveCircle } from "react-icons/md"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import { useCurrentActivity } from "app/core/hooks/useCurrentActivity"
import { useTasks } from "app/core/hooks/useTasks"
import createPomodoro from "app/pomodoros/mutations/createPomodoro"
import stopPomodoro from "app/pomodoros/mutations/stopPomodoro"
import attachTaskToPomodoro from "app/pomodoros/mutations/attachTaskToPomodoro"
import removeTaskFromPomodoro from "app/pomodoros/mutations/removeTaskFromPomodoro"
import createBreakTime from "app/break-times/mutations/createBreakTime"
import stopBreakTime from "app/break-times/mutations/stopBreakTime"
import createTask from "app/tasks/mutations/createTask"
import { BreakTime, Pomodoro, Task } from "db"

type TasksPanelProps = {
  pomodoro: Pomodoro & { tasks: Task[] }
  refetch: () => Promise<unknown>
}

const TasksPanel = (props: TasksPanelProps) => {
  const { pomodoro, refetch } = props
  const currentTasks = pomodoro.tasks

  const [addingTask, setAddingTask] = useState(false)

  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const debounceSetSearchTerm = debounce(setSearchTerm, 500)
  const { tasks, refetch: refetchTasks } = useTasks(searchTerm)
  const searchResults = tasks.filter((t) => !currentTasks.map((ct) => ct.id).includes(t.id))

  const [attachTaskToPomodoroMutation] = useMutation(attachTaskToPomodoro)
  const [removeTaskFromPomodoroMutation] = useMutation(removeTaskFromPomodoro)
  const [createTaskMutation] = useMutation(createTask)

  return (
    <VStack>
      <Heading size="md">Tasks</Heading>
      <VStack alignItems="flex-start">
        {currentTasks.map((t) => (
          <HStack key={t.id}>
            <ChakraLink>
              <Link href={Routes.EditTaskPage({ taskId: t.id })}>
                <Text>{t.description}</Text>
              </Link>
            </ChakraLink>
            <ChakraLink
              onClick={async () => {
                await removeTaskFromPomodoroMutation({ id: pomodoro.id, taskId: t.id })
                await refetch()
                await refetchTasks()
              }}
            >
              <MdRemoveCircle />
            </ChakraLink>
          </HStack>
        ))}
      </VStack>
      {addingTask ? (
        <VStack>
          <HStack>
            <Input
              placeholder="Task description"
              onChange={(event) => debounceSetSearchTerm(event.target.value)}
            />
            <Button
              onClick={async () => {
                if (searchTerm) {
                  await createTaskMutation({
                    description: searchTerm,
                    pomodoroId: pomodoro.id,
                  })
                  await refetch()
                  setSearchTerm(undefined)
                  setAddingTask(false)
                }
              }}
            >
              <MdAddCircle />
            </Button>
          </HStack>
          {searchTerm ? (
            searchResults.length ? (
              searchResults.map((sr) => (
                <HStack key={sr.id}>
                  <Text>{sr.description}</Text>
                  <ChakraLink
                    onClick={async () => {
                      await attachTaskToPomodoroMutation({ taskId: sr.id, id: pomodoro.id })
                      await refetch()
                      setSearchTerm(undefined)
                      setAddingTask(false)
                    }}
                  >
                    <MdAddCircle />
                  </ChakraLink>
                </HStack>
              ))
            ) : (
              <Text>No matching tasks</Text>
            )
          ) : null}
          <ChakraLink
            onClick={() => {
              setSearchTerm(undefined)
              setAddingTask(false)
            }}
          >
            <Text>Cancel</Text>
          </ChakraLink>
        </VStack>
      ) : (
        <ChakraLink onClick={() => setAddingTask(true)}>
          <Text>Add task</Text>
        </ChakraLink>
      )}
    </VStack>
  )
}

const RightPanel = () => {
  const { currentActivity, refetch } = useCurrentActivity()
  return currentActivity?.type === "pomodoro" ? (
    <TasksPanel pomodoro={currentActivity.activity} refetch={refetch} />
  ) : (
    <Text>Not implemented</Text>
  )
}

type TimeLeftProps = {
  now: Date
  suggestedEndTime: Date
}

const TimeLeft = (props: TimeLeftProps) => {
  const { now, suggestedEndTime } = props

  const msLeft = suggestedEndTime.getTime() - now.getTime()

  const timeLeft = new Date(Math.abs(msLeft))

  const padded = (num: number) => (num < 10 ? `0${num}` : num)

  const hoursLeft = padded(timeLeft.getUTCHours())
  const minutesLeft = padded(timeLeft.getUTCMinutes())
  const secondsLeft = padded(timeLeft.getUTCSeconds())

  return (
    <Text>
      {msLeft < 0 ? "- " : null}
      {hoursLeft}:{minutesLeft}:{secondsLeft}
    </Text>
  )
}

const CurrentActivityPanel = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const { currentActivity, refetch } = useCurrentActivity()

  const [stopAutomatically, setStopAutomatically] = useState(false)

  const [stopBreakTimeMutation] = useMutation(stopBreakTime)

  useEffect(() => {
    if (currentActivity !== null && stopAutomatically) {
      const now = new Date()

      const interval = setInterval(async () => {
        await stopBreakTimeMutation({ id: currentActivity.activity.id })
        await refetch()
      }, currentActivity.suggestedEndTime.getTime() - now.getTime())

      return () => {
        clearInterval(interval)
      }
    }
  }, [currentActivity, refetch, stopBreakTimeMutation, stopAutomatically])

  return currentActivity ? (
    <VStack>
      <Heading size="md">{currentActivity.type === "break" ? "Break" : "Pomodoro"}</Heading>
      {currentActivity ? (
        <TimeLeft now={now} suggestedEndTime={currentActivity.suggestedEndTime} />
      ) : null}
      {currentActivity?.type === "break" &&
      now.getTime() < currentActivity.suggestedEndTime.getTime() ? (
        <Checkbox onChange={(e) => setStopAutomatically(e.target.checked)}>
          Stop automatically
        </Checkbox>
      ) : null}
    </VStack>
  ) : null
}

const StartPomodoroButton = ({
  onClick,
  currentBreak,
}: {
  onClick: () => void
  currentBreak?: BreakTime
}) => {
  const [createPomodoroMutation] = useMutation(createPomodoro)
  const [stopBreakTimeMutation] = useMutation(stopBreakTime)

  return (
    <Box p={4}>
      <Button
        onClick={async () => {
          await createPomodoroMutation({})
          if (currentBreak) {
            await stopBreakTimeMutation({ id: currentBreak.id })
          }
          onClick()
        }}
      >
        Start Pomodoro
      </Button>
    </Box>
  )
}

const StartBreakButton = ({
  onClick,
  currentPomodoro,
}: {
  onClick: () => void
  currentPomodoro: Pomodoro
}) => {
  const [stopPomodoroMutation] = useMutation(stopPomodoro)
  const [createBreakTimeMutation] = useMutation(createBreakTime)
  return (
    <Box p={4}>
      <Button
        onClick={async () => {
          await Promise.all([
            stopPomodoroMutation({ id: currentPomodoro.id }),
            createBreakTimeMutation({}),
          ])
          onClick()
        }}
      >
        Start Break
      </Button>
    </Box>
  )
}

const StopButton = ({
  onClick,
  currentBreak,
}: {
  onClick: () => void
  currentBreak: BreakTime
}) => {
  const [stopBreakTimeMutation] = useMutation(stopBreakTime)
  return (
    <Box p={4}>
      <Button
        onClick={async () => {
          await stopBreakTimeMutation({ id: currentBreak.id })
          onClick()
        }}
      >
        Stop
      </Button>
    </Box>
  )
}

const ActivityButtons = () => {
  const { currentActivity, refetch } = useCurrentActivity()

  if (currentActivity?.type === "break") {
    return (
      <>
        <StartPomodoroButton currentBreak={currentActivity.activity} onClick={refetch} />
        <StopButton currentBreak={currentActivity.activity} onClick={refetch} />
      </>
    )
  } else if (currentActivity?.type === "pomodoro") {
    return <StartBreakButton currentPomodoro={currentActivity.activity} onClick={refetch} />
  } else {
    return <StartPomodoroButton onClick={refetch} />
  }
}

const BottomNav = () => {
  return (
    <Flex py={0} w="full" align="center">
      <Spacer />
      <HStack>
        <ActivityButtons />
      </HStack>
      <Spacer />
    </Flex>
  )
}

const Home: BlitzPage = () => {
  return (
    <Container maxW="container.lg">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <Flex py={4} w="full">
            <Box w="full" p={10}>
              <CurrentActivityPanel />
            </Box>
            <Box w="full" p={10}>
              <RightPanel />
            </Box>
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
