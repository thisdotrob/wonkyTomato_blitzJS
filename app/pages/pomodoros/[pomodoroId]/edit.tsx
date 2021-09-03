import { Suspense, useState, useMemo, useEffect } from "react"
import debounce from "lodash.debounce"
import { Head, Link, useQuery, useMutation, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getPomodoro from "app/pomodoros/queries/getPomodoro"
import updatePomodoro from "app/pomodoros/mutations/updatePomodoro"
import getTasks from "app/tasks/queries/getTasks"

const AssociatedTasks = (props) => {
  const [pomodoro, { setQueryData }] = useQuery(getPomodoro, { id: props.pomodoroId })

  const [updatePomodoroMutation] = useMutation(updatePomodoro)

  const removeTaskFromPomodoro = (taskId: number) => async () => {
    const updated = await updatePomodoroMutation({
      id: pomodoro.id,
      tasks: { disconnect: { id: taskId } },
    })
    await setQueryData(updated)
  }

  return (
    <>
      <h3>Tasks</h3>

      {pomodoro.tasks.map((t) => (
        <div key={t.id}>
          <span>{t.description}</span>{" "}
          <Link href="#">
            <a onClick={removeTaskFromPomodoro(t.id)}>remove</a>
          </Link>
          {" | "}
          <Link href={Routes.EditTaskPage({ taskId: t.id })}>
            <a>edit</a>
          </Link>
        </div>
      ))}
    </>
  )
}

const ExistingTaskSelection = (props) => {
  const [pomodoro, { setQueryData }] = useQuery(getPomodoro, { id: props.pomodoroId })

  const [updatePomodoroMutation] = useMutation(updatePomodoro)

  const [searchTerm, setSearchTerm] = useState("")

  const debouncedSetSearchTerm = useMemo(() => debounce(setSearchTerm, 300), [])

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel()
    }
  })

  const [getTasksResponse] = useQuery(getTasks, {
    orderBy: { description: "asc" },
    where: searchTerm
      ? { description: { search: searchTerm.trim().replaceAll(" ", " & ") } }
      : undefined,
  })

  const { tasks } = getTasksResponse

  const addTaskToPomodoro = (taskId: number) => async () => {
    const updated = await updatePomodoroMutation({
      id: pomodoro.id,
      tasks: { connect: { id: taskId } },
    })
    await setQueryData(updated)
  }

  return (
    <div>
      <p>
        <label>
          Search:
          <input onChange={(event) => debouncedSetSearchTerm(event.target.value)} />
        </label>
      </p>

      <p>
        {tasks
          .filter((t) => !pomodoro.tasks.map((t) => t.id).includes(t.id))
          .map((t) => (
            <div key={t.id}>
              <span>{t.description}</span>{" "}
              <Link href="#">
                <a onClick={addTaskToPomodoro(t.id)}>add</a>
              </Link>
              {" | "}
              <Link href={Routes.EditTaskPage({ taskId: t.id })}>
                <a>edit</a>
              </Link>
            </div>
          ))}
      </p>
    </div>
  )
}

const NewTaskSelection = (props) => {
  return null
}

const TaskSelection = (props) => {
  const [selectedTab, setSelectedTab] = useState<"existingTask" | "newTask">("existingTask")

  return (
    <>
      <h3>Add task</h3>
      <a href="#">add existing</a>
      {" | "}
      <a href="#">add new</a>
      {selectedTab === "existingTask" ? (
        <ExistingTaskSelection pomodoroId={props.pomodoroId} />
      ) : (
        <NewTaskSelection pomodoroId={props.pomodoroId} />
      )}
    </>
  )
}

export const EditPomodoro = () => {
  const pomodoroId = useParam("pomodoroId", "number")

  const [pomodoro] = useQuery(getPomodoro, { id: pomodoroId })

  return (
    <>
      <Head>
        <title>Edit Pomodoro {pomodoro.id}</title>
      </Head>

      <div>
        <h1>Edit Pomodoro</h1>

        <div>
          {pomodoro.createdAt.toLocaleString()}
          {pomodoro.stoppedAt ? ` - ${pomodoro.stoppedAt.toLocaleTimeString()}` : null}
        </div>

        <AssociatedTasks pomodoroId={pomodoro.id} />

        <TaskSelection pomodoroId={pomodoro.id} />
      </div>
    </>
  )
}

const EditPomodoroPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.Home()}>
          <a>Home</a>
        </Link>
        {" | "}
        <Link href={Routes.PomodorosPage()}>
          <a>Pomodoros</a>
        </Link>
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <EditPomodoro />
      </Suspense>
    </div>
  )
}

EditPomodoroPage.authenticate = true
EditPomodoroPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditPomodoroPage
