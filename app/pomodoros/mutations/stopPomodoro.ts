import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const StopPomodoro = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(StopPomodoro), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const pomodoro = await db.pomodoro.update({ where: { id }, data: { stoppedAt: new Date() } })

  return pomodoro
})
