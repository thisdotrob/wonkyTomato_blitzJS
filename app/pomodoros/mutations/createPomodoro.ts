import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreatePomodoro = z.object({})

export default resolver.pipe(
  resolver.zod(CreatePomodoro),
  resolver.authorize(),
  async (input, ctx) => {
    const { orgId, membershipId } = ctx.session
    const pomodoro = await db.pomodoro.create({
      data: {
        ...input,
        organization: { connect: { id: orgId } },
        owner: { connect: { id: membershipId } },
      },
      include: { tasks: true },
    })

    return pomodoro
  }
)
