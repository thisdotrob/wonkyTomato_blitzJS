import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteBreakTime = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteBreakTime),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const breakTime = await db.breakTime.deleteMany({ where: { id } })

    return breakTime
  }
)
