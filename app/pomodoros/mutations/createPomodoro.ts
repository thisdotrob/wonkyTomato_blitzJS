import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreatePomodoro = z.object({})

export default resolver.pipe(resolver.zod(CreatePomodoro), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const pomodoro = await db.pomodoro.create({ data: input, include: { tasks: true } })

  return pomodoro
})
