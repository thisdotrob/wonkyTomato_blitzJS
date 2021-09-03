import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetPomodoro = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetPomodoro), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const pomodoro = await db.pomodoro.findFirst({ where: { id }, include: { tasks: true } })

  if (!pomodoro) throw new NotFoundError()

  return pomodoro
})
