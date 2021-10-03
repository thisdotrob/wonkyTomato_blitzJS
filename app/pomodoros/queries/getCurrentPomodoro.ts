import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const GetCurrentPomodoro = z.any()

export default resolver.pipe(
  resolver.zod(GetCurrentPomodoro),
  resolver.authorize(),
  async (_, ctx) => {
    const { orgId, membershipId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")
    if (!membershipId) throw new Error("Missing session.membershipId")

    const currentPomodoro = await db.pomodoro.findFirst({
      where: { stoppedAt: null, organizationId: orgId, membershipId },
      include: { tasks: true },
    })

    return currentPomodoro
  }
)
