import { useQuery } from "blitz"
import getCurrentActivity from "app/activities/queries/getCurrentActivity"

export const useCurrentActivity = () => {
  const [currentActivity, { refetch }] = useQuery(getCurrentActivity, null)
  return { currentActivity, refetch }
}
