import { resolver, SecurePassword } from "blitz"
import { MembershipRole } from "db"
import db from "db"
import { Signup } from "app/auth/validations"

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ email, password, organization }, ctx) => {
    const hashedPassword = await SecurePassword.hash(password.trim())
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        hashedPassword,
        role: "USER",
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: organization ?? email.toLowerCase().trim(),
              },
            },
          },
        },
      },
      select: { id: true, name: true, email: true, role: true, memberships: true },
    })

    const membership = user.memberships[0]!

    await ctx.session.$create({
      userId: user.id,
      membershipId: membership.id,
      roles: [user.role as MembershipRole, membership.role],
      orgId: membership.organizationId,
    })

    return user
  }
)
