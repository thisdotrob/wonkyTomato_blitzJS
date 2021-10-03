import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"
import { Membership, MembershipRole, Organization, User } from "db"

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<MembershipRole>
    PublicData: {
      userId: User["id"]
      membershipId: Membership["id"]
      roles: Array<MembershipRole>
      orgId: Organization["id"]
    }
  }
}
