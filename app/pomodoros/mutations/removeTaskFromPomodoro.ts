import { AuthorizationError, NotFoundError, resolver } from "blitz"
import db from "db"
import { z } from "zod"

const RemoveTask = z.object({
  id: z.number(),
  taskId: z.number(),
})

export default resolver.pipe(
  resolver.zod(RemoveTask),
  resolver.authorize(),
  async ({ id, taskId }, ctx) => {
    const { orgId, membershipId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")
    if (!membershipId) throw new Error("Missing session.membershipId")

    let pomodoro = await db.pomodoro.findUnique({ where: { id } })

    if (pomodoro === null) throw new NotFoundError()

    if (pomodoro.organizationId !== orgId || pomodoro.membershipId !== membershipId)
      throw new AuthorizationError()

    pomodoro = await db.pomodoro.update({
      where: {
        id,
      },
      data: {
        tasks: {
          disconnect: {
            id: taskId,
          },
        },
      },
    })

    return pomodoro
  }
)
