import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const StopBreakTime = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(StopBreakTime), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const breakTime = await db.breakTime.update({ where: { id }, data: { stoppedAt: new Date() } })

  return breakTime
})
