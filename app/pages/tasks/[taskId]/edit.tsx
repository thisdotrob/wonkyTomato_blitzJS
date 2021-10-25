import { Suspense } from "react"
import ResizeTextarea from "react-textarea-autosize"
import { useQuery, useMutation, useParam, BlitzPage } from "blitz"
import {
  Box,
  ButtonGroup,
  Container,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link as ChakraLink,
  Text,
  VStack,
  useEditableControls,
  Spacer,
} from "@chakra-ui/react"
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getTask from "app/tasks/queries/getTask"
import updateTask from "app/tasks/mutations/updateTask"
import createTaskDetail from "app/taskDetails/mutations/createTaskDetail"
import updateTaskDetail from "app/taskDetails/mutations/updateTaskDetail"
import { TaskDetail } from "db"

function EditableControls() {
  const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } =
    useEditableControls()

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="sm">
      <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} aria-label="submit" />
      <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} aria-label="cancel" />
    </ButtonGroup>
  ) : (
    <Flex justifyContent="center">
      <IconButton size="sm" icon={<EditIcon />} {...getEditButtonProps()} aria-label="edit" />
    </Flex>
  )
}

type EditableTaskDetailProps = {
  taskDetail: TaskDetail
}

const EditableTaskDetail = (props: EditableTaskDetailProps) => {
  const { taskDetail } = props

  const [updateTaskDetailMutation] = useMutation(updateTaskDetail)

  return (
    <Editable
      startWithEditView={taskDetail.body === ""}
      placeholder="Enter detail..."
      borderWidth="1px"
      borderRadius="lg"
      px={2}
      w={600}
      onSubmit={async (body) => {
        await updateTaskDetailMutation({ body, id: taskDetail.id })
      }}
      defaultValue={taskDetail.body}
    >
      <VStack>
        <Box pl={2} w={600}>
          <HStack>
            <Text fontStyle="italic">{taskDetail.createdAt.toLocaleString().substring(0, 17)}</Text>
            <Spacer />
            <EditableControls />
          </HStack>
        </Box>
        <Box>
          <EditablePreview px={2} w={600} />
          <EditableInput as={ResizeTextarea} autoFocus={taskDetail.body === ""} px={2} w={600} />
        </Box>
      </VStack>
    </Editable>
  )
}

export const EditTask = () => {
  const taskId = useParam("taskId", "number")
  const [task, { refetch }] = useQuery(getTask, { id: taskId })
  const [updateTaskMutation] = useMutation(updateTask)
  const [createTaskDetailMutation] = useMutation(createTaskDetail)

  return (
    <VStack>
      <Heading size="md">
        <Editable
          onSubmit={async (description) => {
            await updateTaskMutation({ description, id: task.id })
          }}
          defaultValue={task.description}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
      </Heading>
      <VStack>
        {task.details.map((d) => (
          <EditableTaskDetail key={d.id} taskDetail={d} />
        ))}
      </VStack>
      <ChakraLink
        onClick={async () => {
          await createTaskDetailMutation({ body: "", taskId: task.id })
          refetch()
        }}
      >
        Add detail...
      </ChakraLink>
    </VStack>
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
