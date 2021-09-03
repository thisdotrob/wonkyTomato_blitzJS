import { Suspense } from "react"
import { Head, Link, usePaginatedQuery, useRouter, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getPomodoros from "app/pomodoros/queries/getPomodoros"

const ITEMS_PER_PAGE = 100

export const PomodorosList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ pomodoros, hasMore }] = usePaginatedQuery(getPomodoros, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {pomodoros.map((pomodoro) => (
          <li key={pomodoro.id}>
            <Link href={Routes.EditPomodoroPage({ pomodoroId: pomodoro.id })}>
              <a>
                {pomodoro.createdAt.toLocaleString()}
                {pomodoro.stoppedAt ? ` - ${pomodoro.stoppedAt.toLocaleTimeString()}` : null}
              </a>
            </Link>
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

const PomodorosPage: BlitzPage = () => {
  return (
    <>
      <Head>
        <title>Pomodoros</title>
      </Head>

      <p>
        <Link href={Routes.Home()}>
          <a>Home</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <PomodorosList />
      </Suspense>
    </>
  )
}

PomodorosPage.authenticate = true
PomodorosPage.getLayout = (page) => <Layout>{page}</Layout>

export default PomodorosPage
