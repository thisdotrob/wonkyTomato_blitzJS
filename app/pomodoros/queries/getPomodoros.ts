import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetPomodorosInput
  extends Pick<Prisma.PomodoroFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPomodorosInput, ctx) => {
    const { orgId, membershipId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")
    if (!membershipId) throw new Error("Missing session.membershipId")

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
        db.pomodoro.findMany({
          ...paginateArgs,
          where: { ...where, organizationId: orgId, membershipId },
          orderBy,
          include: { tasks: true },
        }),
    })

    return {
      pomodoros,
      nextPage,
      hasMore,
      count,
    }
  }
)
