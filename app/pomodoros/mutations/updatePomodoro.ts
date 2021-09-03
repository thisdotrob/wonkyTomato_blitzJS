import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdatePomodoro = z.object({
  id: z.number(),
  createdAt: z.date().optional(),
  stoppedAt: z.date().optional(),
  tasks: z
    .object({
      connect: z
        .object({
          id: z.number(),
        })
        .optional(),
      disconnect: z
        .object({
          id: z.number(),
        })
        .optional(),
    })
    .optional(),
})

export default resolver.pipe(
  resolver.zod(UpdatePomodoro),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const pomodoro = await db.pomodoro.update({ where: { id }, data, include: { tasks: true } })

    return pomodoro
  }
)
