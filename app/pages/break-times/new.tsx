import { Link, useRouter, useMutation, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import createBreakTime from "app/break-times/mutations/createBreakTime"
import { BreakTimeForm, FORM_ERROR } from "app/break-times/components/BreakTimeForm"

const NewBreakTimePage: BlitzPage = () => {
  const router = useRouter()
  const [createBreakTimeMutation] = useMutation(createBreakTime)

  return (
    <div>
      <h1>Create New BreakTime</h1>

      <BreakTimeForm
        submitText="Create BreakTime"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateBreakTime}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const breakTime = await createBreakTimeMutation(values)
            router.push(Routes.ShowBreakTimePage({ breakTimeId: breakTime.id }))
          } catch (error) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.BreakTimesPage()}>
          <a>BreakTimes</a>
        </Link>
      </p>
    </div>
  )
}

NewBreakTimePage.authenticate = true
NewBreakTimePage.getLayout = (page) => <Layout title={"Create New BreakTime"}>{page}</Layout>

export default NewBreakTimePage
