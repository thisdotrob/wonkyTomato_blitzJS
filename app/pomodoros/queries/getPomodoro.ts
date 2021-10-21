import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetPomodoro = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetPomodoro),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const { orgId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")

    const pomodoro = await db.pomodoro.findFirst({
      where: { id, organizationId: orgId },
      include: { tasks: true },
    })

    if (!pomodoro) throw new NotFoundError()

    return pomodoro
  }
)
