import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetBreakTime = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetBreakTime), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const breakTime = await db.breakTime.findFirst({ where: { id } })

  if (!breakTime) throw new NotFoundError()

  return breakTime
})
