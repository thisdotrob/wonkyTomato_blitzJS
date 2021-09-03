import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const GetCurrentPomodoro = z.any()

export default resolver.pipe(resolver.zod(GetCurrentPomodoro), resolver.authorize(), async () => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const currentPomodoro = await db.pomodoro.findFirst({
    where: { stoppedAt: null },
    include: { tasks: true },
  })

  return currentPomodoro
})
