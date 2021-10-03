import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const GetCurrentBreakTime = z.any()

export default resolver.pipe(
  resolver.zod(GetCurrentBreakTime),
  resolver.authorize(),
  async (_, ctx) => {
    const { orgId, membershipId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")
    if (!membershipId) throw new Error("Missing session.membershipId")

    const currentBreakTime = await db.breakTime.findFirst({
      where: { stoppedAt: null, organizationId: orgId, membershipId },
    })

    return currentBreakTime
  }
)
