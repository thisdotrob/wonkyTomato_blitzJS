import { AuthorizationError, NotFoundError, resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateTaskDetail = z.object({
  id: z.number(),
  body: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateTaskDetail),
  resolver.authorize(),
  async ({ id, ...data }, ctx) => {
    const { orgId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")

    let taskDetail = await db.taskDetail.findUnique({ where: { id } })

    if (taskDetail === null) throw new NotFoundError()

    if (taskDetail.organizationId !== orgId) throw new AuthorizationError()

    taskDetail = await db.taskDetail.update({ where: { id }, data })

    return taskDetail
  }
)
