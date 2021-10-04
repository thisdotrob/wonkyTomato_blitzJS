import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateTask = z.object({
  description: z.string(),
  detail: z.string(),
  pomodoroId: z.number().optional(),
})

export default resolver.pipe(resolver.zod(CreateTask), resolver.authorize(), async (input, ctx) => {
  const { orgId, membershipId } = ctx.session
  const { pomodoroId, ...restInput } = input
  const task = await db.task.create({
    data: {
      ...restInput,
      organization: { connect: { id: orgId } },
      owner: { connect: { id: membershipId } },
      pomodoros: { connect: { id: pomodoroId } },
    },
  })

  return task
})
