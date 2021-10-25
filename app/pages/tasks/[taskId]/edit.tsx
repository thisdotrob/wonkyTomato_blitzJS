import { useState, Suspense } from "react"
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
import * as validations from "app/auth/validations"
import { Form, FORM_ERROR } from "app/core/components/Form"
import { FormTextarea } from "app/core/components/Forms/FormTextarea"
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

  console.log("hello?")
  console.log("body", taskDetail.body)

  return (
    <Editable
      borderWidth="1px"
      borderRadius="lg"
      px={2}
      w={600}
      onSubmit={async (body) => {
        console.log("body")
        console.log(body)
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
          <EditablePreview px={2} w={600} whiteSpace="pre-wrap" />
          <EditableInput px={2} w={600} h={300} whiteSpace="pre-wrap" />
        </Box>
      </VStack>
    </Editable>
  )
}

type CreateTaskDetailProps = {
  taskId: number
  onSuccess: () => Promise<any>
}

const CreateTaskDetail = (props: CreateTaskDetailProps) => {
  const { onSuccess, taskId } = props
  const [createTaskDetailMutation] = useMutation(createTaskDetail)

  return (
    <VStack>
      <Form
        submitText="Add task detail"
        schema={validations.TaskDetail}
        initialValues={{ body: "" }}
        onSubmit={async (values) => {
          console.log("values")
          console.log(values)
          try {
            await createTaskDetailMutation({ taskId, ...values })
            await onSuccess()
          } catch (error) {
            return {
              [FORM_ERROR]:
                "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
            }
          }
        }}
        submitButtonProps={{
          size: "sm",
        }}
        stackProps={{
          direction: "row",
        }}
      >
        <FormTextarea name="body" placeholder="Detail" />
      </Form>
    </VStack>
  )
}

export const EditTask = () => {
  const taskId = useParam("taskId", "number")
  const [task, { refetch }] = useQuery(getTask, { id: taskId })
  const [updateTaskMutation] = useMutation(updateTask)
  const [creatingTaskDetail, setCreatingTaskDetail] = useState(false)
  const onCreateTaskDetailSuccess = async () => {
    setCreatingTaskDetail(false)
    await refetch()
  }

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
      {creatingTaskDetail ? (
        <CreateTaskDetail onSuccess={onCreateTaskDetailSuccess} taskId={task.id} />
      ) : (
        <ChakraLink onClick={() => setCreatingTaskDetail(true)}>Add detail...</ChakraLink>
      )}
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
