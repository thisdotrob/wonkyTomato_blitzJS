import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const GetCurrentBreakTime = z.any()

export default resolver.pipe(resolver.zod(GetCurrentBreakTime), resolver.authorize(), async () => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const currentBreakTime = await db.breakTime.findFirst({
    where: { stoppedAt: null },
  })

  return currentBreakTime
})
