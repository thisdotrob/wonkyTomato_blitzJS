import { useState } from "react"
import { Link, useMutation, Routes } from "blitz"
import debounce from "lodash.debounce"
import { Button, Link as ChakraLink, Heading, VStack, HStack, Text, Input } from "@chakra-ui/react"
import { MdAddCircle, MdRemoveCircle } from "react-icons/md"
import { useTasks } from "app/core/hooks/useTasks"
import attachTaskToPomodoro from "app/pomodoros/mutations/attachTaskToPomodoro"
import removeTaskFromPomodoro from "app/pomodoros/mutations/removeTaskFromPomodoro"
import createTask from "app/tasks/mutations/createTask"
import { Pomodoro, Task } from "db"

export type TasksPanelProps = {
  pomodoro: Pomodoro & { tasks: Task[] }
  refetch: () => Promise<unknown>
}

export const TasksPanel = (props: TasksPanelProps) => {
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
      <VStack alignItems="flex-start">
        {currentTasks.map((t) => (
          <HStack key={t.id}>
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
