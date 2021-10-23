import { AuthorizationError, NotFoundError, resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateBreakTime = z.object({
  id: z.number(),
  createdAt: z.date().optional(),
  stoppedAt: z.date().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateBreakTime),
  resolver.authorize(),
  async ({ id, ...data }, ctx) => {
    const { orgId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")

    let breakTime = await db.breakTime.findUnique({ where: { id } })

    if (breakTime === null) throw new NotFoundError()

    if (breakTime.organizationId !== orgId) throw new AuthorizationError()

    breakTime = await db.breakTime.update({ where: { id }, data })

    return breakTime
  }
)
