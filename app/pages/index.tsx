import { Suspense, useEffect, useState } from "react"
import { BlitzPage, useMutation } from "blitz"
import {
  Button,
  Heading,
  Container,
  Flex,
  Box,
  Spacer,
  VStack,
  HStack,
  Text,
  Checkbox,
  useColorModeValue,
} from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import { useCurrentActivity } from "app/core/hooks/useCurrentActivity"
import { useNow } from "app/core/hooks/useNow"
import { TasksPanel } from "app/pomodoros/components/TasksPanel"
import createPomodoro from "app/pomodoros/mutations/createPomodoro"
import stopPomodoro from "app/pomodoros/mutations/stopPomodoro"
import createBreakTime from "app/break-times/mutations/createBreakTime"
import stopBreakTime from "app/break-times/mutations/stopBreakTime"
import { BreakTime, Pomodoro } from "db"

const RightPanel = () => {
  const { currentActivity, refetch } = useCurrentActivity()
  return currentActivity?.type === "pomodoro" ? (
    <TasksPanel pomodoro={currentActivity.activity} refetch={refetch} />
  ) : (
    <Text>Not implemented</Text>
  )
}

type TimeLeftProps = {
  suggestedEndTime: Date
}

const TimeLeft = (props: TimeLeftProps) => {
  const { suggestedEndTime } = props

  const now = useNow()

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
  const now = useNow()

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
      {currentActivity ? <TimeLeft suggestedEndTime={currentActivity.suggestedEndTime} /> : null}
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
  const bg = useColorModeValue("gray.50", "gray.700")
  return (
    <Container maxW="container.lg">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <Flex py={4} w="full">
            <Box borderRightWidth="1px" borderLeftColor="black" py={4} bg={bg} w="full" px={5}>
              <CurrentActivityPanel />
            </Box>
            <Box py={4} bg={bg} w="full" px={5}>
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
