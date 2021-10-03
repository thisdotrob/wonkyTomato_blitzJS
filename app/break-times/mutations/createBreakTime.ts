import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateBreakTime = z.object({})

export default resolver.pipe(
  resolver.zod(CreateBreakTime),
  resolver.authorize(),
  async (input, ctx) => {
    const { orgId, membershipId } = ctx.session
    const breakTime = await db.breakTime.create({
      data: {
        ...input,
        organization: { connect: { id: orgId } },
        owner: { connect: { id: membershipId } },
      },
    })

    return breakTime
  }
)
