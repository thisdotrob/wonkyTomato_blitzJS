import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useParam, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getPomodoro from "app/pomodoros/queries/getPomodoro"
import deletePomodoro from "app/pomodoros/mutations/deletePomodoro"

export const Pomodoro = () => {
  const router = useRouter()
  const pomodoroId = useParam("pomodoroId", "number")
  const [deletePomodoroMutation] = useMutation(deletePomodoro)
  const [pomodoro] = useQuery(getPomodoro, { id: pomodoroId })

  return (
    <>
      <Head>
        <title>Pomodoro {pomodoro.id}</title>
      </Head>

      <div>
        <h1>
          Pomodoro {pomodoro.id} {pomodoro.createdAt.toISOString()}
        </h1>
        <ul>
          {pomodoro.tasks.map((task) => (
            <li key={task.id}>{task.description}</li>
          ))}
        </ul>

        <Link href={Routes.EditPomodoroPage({ pomodoroId: pomodoro.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deletePomodoroMutation({ id: pomodoro.id })
              router.push(Routes.PomodorosPage())
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

const ShowPomodoroPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.PomodorosPage()}>
          <a>Pomodoros</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Pomodoro />
      </Suspense>
    </div>
  )
}

ShowPomodoroPage.authenticate = true
ShowPomodoroPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowPomodoroPage
