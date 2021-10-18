import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateTaskDetail = z.object({
  body: z.string(),
  taskId: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateTaskDetail),
  resolver.authorize(),
  async (input, ctx) => {
    const { orgId, membershipId } = ctx.session
    const { taskId, ...restInput } = input
    const taskDetail = await db.taskDetail.create({
      data: {
        ...restInput,
        organization: { connect: { id: orgId } },
        owner: { connect: { id: membershipId } },
        task: { connect: { id: taskId } },
      },
    })

    return taskDetail
  }
)
