import { Suspense } from "react"
import { Head, Link, usePaginatedQuery, useRouter, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
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
    <div>
      <ul>
        {breakTimes.map((breakTime) => (
          <li key={breakTime.id}>
            {breakTime.createdAt.toLocaleString()}
            {breakTime.stoppedAt ? ` - ${breakTime.stoppedAt.toLocaleTimeString()}` : null}
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const BreakTimesPage: BlitzPage = () => {
  return (
    <>
      <Head>
        <title>BreakTimes</title>
      </Head>

      <p>
        <Link href={Routes.Home()}>
          <a>Home</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <BreakTimesList />
      </Suspense>
    </>
  )
}

BreakTimesPage.authenticate = true
BreakTimesPage.getLayout = (page) => <Layout>{page}</Layout>

export default BreakTimesPage
