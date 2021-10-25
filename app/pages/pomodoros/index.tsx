import { Suspense } from "react"
import { usePaginatedQuery, useRouter, BlitzPage, Link, Routes } from "blitz"
import {
  Button,
  Container,
  Heading,
  HStack,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getPomodoros from "app/pomodoros/queries/getPomodoros"
import { Pomodoro } from "db"

const ITEMS_PER_PAGE = 100

export const PomodorosList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ pomodoros, hasMore }] = usePaginatedQuery(getPomodoros, {
    where: { stoppedAt: { not: null } },
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const durationMins = (pomodoro: Pomodoro) => {
    const { createdAt, stoppedAt } = pomodoro
    const durationMs = stoppedAt!.getTime() - createdAt.getTime()
    const durationSecs = durationMs / 1000
    return Math.round(durationSecs / 60)
  }

  return (
    <VStack>
      {pomodoros.map((pomodoro) => (
        <ChakraLink key={pomodoro.id}>
          <Link href={Routes.EditPomodoroPage({ pomodoroId: pomodoro.id })}>
            <Text>
              {`${pomodoro.createdAt.toLocaleDateString()} ${pomodoro.createdAt
                .toLocaleTimeString()
                .substring(0, 5)} (${durationMins(pomodoro)} mins)`}
            </Text>
          </Link>
        </ChakraLink>
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

const PomodorosPage: BlitzPage = () => {
  return (
    <Container maxW="container.lg">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <VStack>
            <Heading size="md">Pomodoros</Heading>
            <PomodorosList />
          </VStack>
        </VStack>
      </Suspense>
    </Container>
  )
}

PomodorosPage.authenticate = true
PomodorosPage.getLayout = (page) => <Layout title="Pomodoros">{page}</Layout>

export default PomodorosPage
