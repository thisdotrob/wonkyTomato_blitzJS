import { Suspense, useEffect, useState } from "react"
import { Link, BlitzPage, useMutation, Routes } from "blitz"
import * as z from "zod"
import Layout from "app/core/layouts/Layout"
import { Form, FORM_ERROR } from "app/core/components/Form"
import { FormTextInput } from "app/core/components/Forms/FormTextInput"
import { FormTextarea } from "app/core/components/Forms/FormTextarea"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { useCurrentActivity } from "app/core/hooks/useCurrentActivity"
import createPomodoro from "app/pomodoros/mutations/createPomodoro"
import stopPomodoro from "app/pomodoros/mutations/stopPomodoro"
import createBreakTime from "app/break-times/mutations/createBreakTime"
import stopBreakTime from "app/break-times/mutations/stopBreakTime"
import createTask from "app/tasks/mutations/createTask"
import updateTask from "app/tasks/mutations/updateTask"
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Text,
  Editable,
  EditablePreview,
  EditableInput,
} from "@chakra-ui/react"
import { BreakTime, Pomodoro } from "db"

const UpdatePomodoroTasksPanel = () => {
  const { currentActivity, refetch } = useCurrentActivity()
  const [createTaskMutation] = useMutation(createTask)
  const [updateTaskMutation] = useMutation(updateTask)

  const [createNewTask, setCreateNewTask] = useState(false)

  return currentActivity?.type === "pomodoro" ? (
    <Accordion>
      {[
        ...currentActivity.activity.tasks.map((t, i) => (
          <AccordionItem key={i}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {t.description}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Editable
                onSubmit={async (detail) => {
                  await updateTaskMutation({ detail, id: t.id })
                  refetch()
                }}
                defaultValue={t.detail ?? undefined}
              >
                <EditablePreview />
                <EditableInput />
              </Editable>
            </AccordionPanel>
          </AccordionItem>
        )),
        <AccordionItem key={currentActivity.activity.tasks.length}>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text as="i">Add new task...</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {createNewTask ? (
              <VStack>
                <Form
                  submitButtonProps={{ size: "md" }}
                  submitText="Submit"
                  onSubmit={async (values: any) => {
                    try {
                      await createTaskMutation({
                        ...values,
                        pomodoroId: currentActivity?.activity.id,
                      })
                    } catch (error) {
                      return {
                        [FORM_ERROR]:
                          "Sorry, we had an unexpected error. Please try again. - " +
                          error.toString(),
                      }
                    }
                    refetch()
                  }}
                  schema={z.object({
                    description: z.string(),
                    detail: z.string(),
                  })}
                  showDevTools
                >
                  <FormTextInput name="description" label="Description" isRequired />
                  <FormTextarea name="detail" label="Detail" isRequired />
                </Form>
                <ChakraLink onClick={() => setCreateNewTask(false)}>Cancel</ChakraLink>
              </VStack>
            ) : (
              <VStack>
                <Text>Add task search functionality here</Text>
                <ChakraLink onClick={() => setCreateNewTask(true)}>Create new task</ChakraLink>
              </VStack>
            )}
          </AccordionPanel>
        </AccordionItem>,
      ]}
    </Accordion>
  ) : null
}

const CurrentActivityPanel = () => {
  const { currentActivity } = useCurrentActivity()

  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (currentActivity === null) return null

  const msLeft = currentActivity.suggestedEndTime.getTime() - now.getTime()

  return (
    <VStack>
      <span>{currentActivity.type === "break" ? "Break" : "Pomodoro"}</span>
      <span>
        {msLeft < 0 ? "- " : null}
        {new Date(Math.abs(msLeft)).toLocaleTimeString()}
      </span>
    </VStack>
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
    <Container maxW="container.md">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <Flex py={4} w="full">
            <Box w="full" p={10}>
              <CurrentActivityPanel />
            </Box>
            <Box w="full" p={10}>
              <UpdatePomodoroTasksPanel />
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
