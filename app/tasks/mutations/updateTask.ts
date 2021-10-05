import { AuthorizationError, NotFoundError, resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateTask = z.object({
  id: z.number(),
  description: z.string().optional(),
  detail: z.string().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateTask),
  resolver.authorize(),
  async ({ id, ...data }, ctx) => {
    const { orgId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")

    let task = await db.task.findUnique({ where: { id } })

    if (task === null) throw new NotFoundError()

    if (task.organizationId !== orgId) throw new AuthorizationError()

    task = await db.task.update({ where: { id }, data })

    return task
  }
)
