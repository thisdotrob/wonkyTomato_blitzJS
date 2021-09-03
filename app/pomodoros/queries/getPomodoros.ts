import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetPomodorosInput
  extends Pick<Prisma.PomodoroFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPomodorosInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: pomodoros,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.pomodoro.count({ where }),
      query: (paginateArgs) =>
        db.pomodoro.findMany({ ...paginateArgs, where, orderBy, include: { tasks: true } }),
    })

    return {
      pomodoros,
      nextPage,
      hasMore,
      count,
    }
  }
)
