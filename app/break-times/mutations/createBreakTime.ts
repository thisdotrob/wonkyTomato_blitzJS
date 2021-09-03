import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateBreakTime = z.object({})

export default resolver.pipe(resolver.zod(CreateBreakTime), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const breakTime = await db.breakTime.create({ data: input })

  return breakTime
})
