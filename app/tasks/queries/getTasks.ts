import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetTasksInput
  extends Pick<Prisma.TaskFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetTasksInput, ctx) => {
    const { orgId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")

    const {
      items: tasks,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.task.count({ where }),
      query: (paginateArgs) =>
        db.task.findMany({ ...paginateArgs, where: { ...where, organizationId: orgId }, orderBy }),
    })

    return {
      tasks,
      nextPage,
      hasMore,
      count,
    }
  }
)
