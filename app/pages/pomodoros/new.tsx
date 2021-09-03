import { Link, useRouter, useMutation, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import createPomodoro from "app/pomodoros/mutations/createPomodoro"
import { PomodoroForm, FORM_ERROR } from "app/pomodoros/components/PomodoroForm"

const NewPomodoroPage: BlitzPage = () => {
  const router = useRouter()
  const [createPomodoroMutation] = useMutation(createPomodoro)

  return (
    <div>
      <h1>Create New Pomodoro</h1>

      <PomodoroForm
        submitText="Create Pomodoro"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreatePomodoro}
        initialValues={{ tasks: [] }}
        onSubmit={async (values) => {
          try {
            const pomodoro = await createPomodoroMutation(values)
            router.push(Routes.ShowPomodoroPage({ pomodoroId: pomodoro.id }))
          } catch (error) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.PomodorosPage()}>
          <a>Pomodoros</a>
        </Link>
      </p>
    </div>
  )
}

NewPomodoroPage.authenticate = true
NewPomodoroPage.getLayout = (page) => <Layout title={"Create New Pomodoro"}>{page}</Layout>

export default NewPomodoroPage
