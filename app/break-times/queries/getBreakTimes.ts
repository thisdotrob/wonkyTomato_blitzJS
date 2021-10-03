import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetBreakTimesInput
  extends Pick<Prisma.BreakTimeFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetBreakTimesInput, ctx) => {
    const { orgId, membershipId } = ctx.session

    if (!orgId) throw new Error("Missing session.orgId")
    if (!membershipId) throw new Error("Missing session.membershipId")

    const {
      items: breakTimes,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.breakTime.count({ where }),
      query: (paginateArgs) =>
        db.breakTime.findMany({
          ...paginateArgs,
          where: { ...where, organizationId: orgId, membershipId },
          orderBy,
        }),
    })

    return {
      breakTimes,
      nextPage,
      hasMore,
      count,
    }
  }
)
