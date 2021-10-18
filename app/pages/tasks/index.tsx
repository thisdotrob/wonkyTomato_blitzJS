import { Suspense } from "react"
import { Link, usePaginatedQuery, useRouter, BlitzPage, Routes } from "blitz"
import { Button, Link as ChakraLink, Container, Heading, HStack, VStack } from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getTasks from "app/tasks/queries/getTasks"

const ITEMS_PER_PAGE = 100

export const TasksList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ tasks, hasMore }] = usePaginatedQuery(getTasks, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <VStack>
      {tasks.map((task) => (
        <Link key={task.id} href={Routes.EditTaskPage({ taskId: task.id })}>
          <ChakraLink>{task.description}</ChakraLink>
        </Link>
      ))}

      <HStack>
        <Button disabled={page === 0} onClick={goToPreviousPage}>
          Previous
        </Button>
        <Button disabled={!hasMore} onClick={goToNextPage}>
          Next
        </Button>
      </HStack>
    </VStack>
  )
}

const TasksPage: BlitzPage = () => {
  return (
    <Container maxW="container.lg">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <VStack>
            <Heading size="md">Tasks</Heading>
            <TasksList />
          </VStack>
        </VStack>
      </Suspense>
    </Container>
  )
}

TasksPage.authenticate = true
TasksPage.getLayout = (page) => <Layout>{page}</Layout>

export default TasksPage
