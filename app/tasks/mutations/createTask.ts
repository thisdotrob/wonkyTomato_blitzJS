import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateTask = z.object({
  description: z.string(),
  detail: z.string(),
})

export default resolver.pipe(resolver.zod(CreateTask), resolver.authorize(), async (input, ctx) => {
  const { orgId, membershipId } = ctx.session
  const task = await db.task.create({
    data: {
      ...input,
      organization: { connect: { id: orgId } },
      owner: { connect: { id: membershipId } },
    },
  })

  return task
})
