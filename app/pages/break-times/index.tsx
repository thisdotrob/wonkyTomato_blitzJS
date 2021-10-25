import { Suspense } from "react"
import { usePaginatedQuery, useRouter, BlitzPage } from "blitz"
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  VStack,
} from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getBreakTimes from "app/break-times/queries/getBreakTimes"
import { EditActivityDuration } from "app/activities/components/EditActivityDuration"
import { BreakTime } from "db"

const ITEMS_PER_PAGE = 100

export const BreakTimesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ breakTimes, hasMore }] = usePaginatedQuery(getBreakTimes, {
    where: { stoppedAt: { not: null } },
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const durationMins = (breakTime: BreakTime) => {
    const { createdAt, stoppedAt } = breakTime
    const durationMs = stoppedAt!.getTime() - createdAt.getTime()
    const durationSecs = durationMs / 1000
    return Math.round(durationSecs / 60)
  }

  return (
    <VStack>
      <Accordion>
        {breakTimes.map((bt) => (
          <AccordionItem key={bt.id}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {`${bt.createdAt.toLocaleDateString()} ${bt.createdAt
                  .toLocaleTimeString()
                  .substring(0, 5)} (${durationMins(bt)} mins)`}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pt={8} pb={4}>
              <EditActivityDuration activity={bt} spacing={10} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
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
