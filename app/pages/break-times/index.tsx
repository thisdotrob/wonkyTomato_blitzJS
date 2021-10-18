import { Suspense } from "react"
import { usePaginatedQuery, useRouter, BlitzPage } from "blitz"
import { Button, Container, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getBreakTimes from "app/break-times/queries/getBreakTimes"

const ITEMS_PER_PAGE = 100

export const BreakTimesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ breakTimes, hasMore }] = usePaginatedQuery(getBreakTimes, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <VStack>
      {breakTimes.map((pomodoro) => (
        <Text key={pomodoro.id}>
          {pomodoro.createdAt.toLocaleString()}
          {pomodoro.stoppedAt ? ` - ${pomodoro.stoppedAt.toLocaleTimeString()}` : null}
        </Text>
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

const BreakTimesPage: BlitzPage = () => {
  return (
    <Container maxW="container.lg">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <VStack>
            <Heading size="md">Breaks</Heading>
            <BreakTimesList />
          </VStack>
        </VStack>
      </Suspense>
    </Container>
  )
}

BreakTimesPage.authenticate = true
BreakTimesPage.getLayout = (page) => <Layout title="BreakTimes">{page}</Layout>

export default BreakTimesPage
