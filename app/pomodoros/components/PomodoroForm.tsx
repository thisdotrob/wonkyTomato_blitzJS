import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { z } from "zod"
export { FORM_ERROR } from "app/core/components/Form"

export function PomodoroForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="task.0.description" label="Task 1" />
      <LabeledTextField name="task.1.description" label="Task 2" />
      <LabeledTextField name="task.2.description" label="Task 3" />
      <LabeledTextField name="task.3.description" label="Task 4" />
    </Form>
  )
}
