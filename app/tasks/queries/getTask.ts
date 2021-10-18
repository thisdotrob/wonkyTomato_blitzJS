import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetTask = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetTask), resolver.authorize(), async ({ id }, ctx) => {
  const { orgId } = ctx.session

  if (!orgId) throw new Error("Missing session.orgId")

  const task = await db.task.findFirst({
    where: { id, organizationId: orgId },
    include: { details: true },
  })

  if (!task) throw new NotFoundError()

  return task
})
