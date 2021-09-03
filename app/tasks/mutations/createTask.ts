import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateTask = z.object({
  description: z.string(),
  detail: z.string(),
})

export default resolver.pipe(resolver.zod(CreateTask), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const task = await db.task.create({ data: input })

  return task
})
