import { useQuery } from "blitz"
import getTasks from "app/tasks/queries/getTasks"

export const useTasks = (searchTerm: string | undefined) => {
  const joined = searchTerm
    ?.split(" ")
    .filter((s) => s !== "")
    .join(" & ")

  const where = {
    description: {
      search: joined,
    },
  }

  const [data, { refetch }] = useQuery(getTasks, { where })

  return { tasks: data.tasks, refetch }
}
