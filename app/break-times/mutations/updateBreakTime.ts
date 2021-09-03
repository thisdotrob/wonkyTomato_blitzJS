import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateBreakTime = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateBreakTime),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const breakTime = await db.breakTime.update({ where: { id }, data })

    return breakTime
  }
)
