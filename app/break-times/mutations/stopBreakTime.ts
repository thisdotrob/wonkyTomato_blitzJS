import { AuthorizationError, NotFoundError, resolver } from "blitz"
import db from "db"
import { z } from "zod"

const StopBreakTime = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(StopBreakTime),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const { orgId, membershipId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")
    if (!membershipId) throw new Error("Missing session.membershipId")

    let breakTime = await db.breakTime.findUnique({ where: { id } })

    if (breakTime === null) throw new NotFoundError()

    if (breakTime.organizationId !== orgId || breakTime.membershipId !== membershipId)
      throw new AuthorizationError()

    breakTime = await db.breakTime.update({ where: { id }, data: { stoppedAt: new Date() } })

    return breakTime
  }
)
