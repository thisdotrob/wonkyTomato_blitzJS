import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useMutation, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getBreakTime from "app/break-times/queries/getBreakTime"
import updateBreakTime from "app/break-times/mutations/updateBreakTime"
import { BreakTimeForm, FORM_ERROR } from "app/break-times/components/BreakTimeForm"

export const EditBreakTime = () => {
  const router = useRouter()
  const breakTimeId = useParam("breakTimeId", "number")
  const [breakTime, { setQueryData }] = useQuery(
    getBreakTime,
    { id: breakTimeId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateBreakTimeMutation] = useMutation(updateBreakTime)

  return (
    <>
      <Head>
        <title>Edit BreakTime {breakTime.id}</title>
      </Head>

      <div>
        <h1>Edit BreakTime {breakTime.id}</h1>
        <pre>{JSON.stringify(breakTime)}</pre>

        <BreakTimeForm
          submitText="Update BreakTime"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateBreakTime}
          initialValues={breakTime}
          onSubmit={async (values) => {
            try {
              const updated = await updateBreakTimeMutation({
                id: breakTime.id,
                ...values,
              })
              await setQueryData(updated)
              router.push(Routes.ShowBreakTimePage({ breakTimeId: updated.id }))
            } catch (error) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </div>
    </>
  )
}

const EditBreakTimePage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditBreakTime />
      </Suspense>

      <p>
        <Link href={Routes.BreakTimesPage()}>
          <a>BreakTimes</a>
        </Link>
      </p>
    </div>
  )
}

EditBreakTimePage.authenticate = true
EditBreakTimePage.getLayout = (page) => <Layout>{page}</Layout>

export default EditBreakTimePage
