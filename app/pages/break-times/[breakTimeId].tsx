import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useParam, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getBreakTime from "app/break-times/queries/getBreakTime"
import deleteBreakTime from "app/break-times/mutations/deleteBreakTime"

export const BreakTime = () => {
  const router = useRouter()
  const breakTimeId = useParam("breakTimeId", "number")
  const [deleteBreakTimeMutation] = useMutation(deleteBreakTime)
  const [breakTime] = useQuery(getBreakTime, { id: breakTimeId })

  return (
    <>
      <Head>
        <title>BreakTime {breakTime.id}</title>
      </Head>

      <div>
        <h1>BreakTime {breakTime.id}</h1>
        <pre>{JSON.stringify(breakTime, null, 2)}</pre>

        <Link href={Routes.EditBreakTimePage({ breakTimeId: breakTime.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteBreakTimeMutation({ id: breakTime.id })
              router.push(Routes.BreakTimesPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowBreakTimePage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.BreakTimesPage()}>
          <a>BreakTimes</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <BreakTime />
      </Suspense>
    </div>
  )
}

ShowBreakTimePage.authenticate = true
ShowBreakTimePage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowBreakTimePage
