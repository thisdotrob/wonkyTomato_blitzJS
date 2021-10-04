import { Suspense, useState } from "react"
import { Link, BlitzPage, useMutation, useQuery, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import createPomodoro from "app/pomodoros/mutations/createPomodoro"
import stopPomodoro from "app/pomodoros/mutations/stopPomodoro"
import getCurrentPomodoro from "app/pomodoros/queries/getCurrentPomodoro"
import createBreakTime from "app/break-times/mutations/createBreakTime"
import stopBreakTime from "app/break-times/mutations/stopBreakTime"
import createTask from "app/tasks/mutations/createTask"
import { TaskForm, FORM_ERROR } from "app/tasks/components/TaskForm"
import getCurrentActivity from "app/activities/queries/getCurrentActivity"
import logout from "app/auth/mutations/logout"

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <>
        <button
          className="button small"
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Link href={Routes.SignupPage()}>
          <a className="button small">
            <strong>Sign Up</strong>
          </a>
        </Link>
        <Link href={Routes.LoginPage()}>
          <a className="button small">
            <strong>Login</strong>
          </a>
        </Link>
      </>
    )
  }
}

const UpdatePomodoroTasksPanel = () => {
  const [currentPomodoro, { remove }] = useQuery(getCurrentPomodoro, null)
  const [createTaskMutation] = useMutation(createTask)
  const [addingTask, setAddingTask] = useState(false)
  return currentPomodoro ? (
    <>
      {currentPomodoro.tasks.map((t, i) => (
        <li key={i}>{t.description}</li>
      ))}
      {addingTask ? (
        <TaskForm
          submitText="Create Task"
          onSubmit={async (values) => {
            try {
              await createTaskMutation({ ...values, pomodoroId: currentPomodoro.id })
              remove()
              setAddingTask(false)
            } catch (error) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      ) : (
        <button onClick={() => setAddingTask(true)}>Add task</button>
      )}
    </>
  ) : null
}

const CurrentActivityPanel = () => {
  const [createPomodoroMutation] = useMutation(createPomodoro)
  const [stopPomodoroMutation] = useMutation(stopPomodoro)
  const [createBreakTimeMutation] = useMutation(createBreakTime)
  const [stopBreakTimeMutation] = useMutation(stopBreakTime)
  const [currentActivity, { remove }] = useQuery(getCurrentActivity, null)

  return (
    <>
      {currentActivity?.type === "break" && (
        <>
          <span>
            Current break started at: {currentActivity.activity.createdAt.toLocaleString()}
          </span>
          <br />
          <span>Suggested length: {currentActivity.suggestedLength}</span>
          <br />
          <span>Suggested end time: {currentActivity.suggestedEndTime.toLocaleTimeString()}</span>
          <br />
          <button
            onClick={async () => {
              await Promise.all([
                createPomodoroMutation({}),
                stopBreakTimeMutation({ id: currentActivity.activity.id }),
              ])
              remove()
            }}
          >
            Start Pomodoro
          </button>
          <button
            onClick={async () => {
              await stopBreakTimeMutation({ id: currentActivity.activity.id })
              remove()
            }}
          >
            Stop
          </button>
        </>
      )}

      {currentActivity?.type === "pomodoro" && (
        <>
          <span>
            Current pomodoro started at: {currentActivity.activity.createdAt.toLocaleString()}
          </span>
          <br />
          <span>Suggested length: {currentActivity.suggestedLength}</span>
          <br />
          <span>Suggested end time: {currentActivity.suggestedEndTime.toLocaleTimeString()}</span>
          <br />
          <UpdatePomodoroTasksPanel />
          <br />
          <button
            onClick={async () => {
              await Promise.all([
                stopPomodoroMutation({ id: currentActivity.activity.id }),
                createBreakTimeMutation({}),
              ])
              remove()
            }}
          >
            Start Break
          </button>
        </>
      )}

      {currentActivity === null && (
        <button
          onClick={async () => {
            await createPomodoroMutation({})
            remove()
          }}
        >
          Start Pomodoro
        </button>
      )}
    </>
  )
}

const Home: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.TasksPage()}>
          <a>Tasks</a>
        </Link>
        {" | "}
        <Link href={Routes.PomodorosPage()}>
          <a>Pomodoros</a>
        </Link>
        {" | "}
        <Link href={Routes.BreakTimesPage()}>
          <a>Breaks</a>
        </Link>
      </p>
      <div>
        <Suspense fallback="Loading current activity...">
          <CurrentActivityPanel />
        </Suspense>
      </div>
      <div>
        <Suspense fallback="Loading user info...">
          <UserInfo />
        </Suspense>
      </div>
    </div>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
