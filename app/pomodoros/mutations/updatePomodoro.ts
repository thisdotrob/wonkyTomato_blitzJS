import { AuthorizationError, NotFoundError, resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdatePomodoro = z.object({
  id: z.number(),
  createdAt: z.date().optional(),
  stoppedAt: z.date().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdatePomodoro),
  resolver.authorize(),
  async ({ id, ...data }, ctx) => {
    const { orgId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")

    let pomodoro = await db.pomodoro.findUnique({ where: { id } })

    if (pomodoro === null) throw new NotFoundError()

    if (pomodoro.organizationId !== orgId) throw new AuthorizationError()

    pomodoro = await db.pomodoro.update({ where: { id }, data })

    return pomodoro
  }
)
