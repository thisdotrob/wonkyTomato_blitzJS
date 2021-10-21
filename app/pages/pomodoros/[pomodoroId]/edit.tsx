import { Suspense, useState } from "react"
import { useQuery, useParam, BlitzPage, useMutation } from "blitz"
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react"
import Layout from "app/core/layouts/Layout"
import { TopNav } from "app/core/components/TopNav"
import getPomodoro from "app/pomodoros/queries/getPomodoro"
import updatePomodoro from "app/pomodoros/mutations/updatePomodoro"
import { TasksPanel } from "app/pomodoros/components/TasksPanel"
import { Pomodoro } from "db"

type EditPomodoroDurationProps = {
  onCancel: () => void
  onSave: () => void
  pomodoro: Pomodoro
}

const EditPomodoroDuration = (props: EditPomodoroDurationProps) => {
  const [updatePomodoroMutation] = useMutation(updatePomodoro)
  const { onCancel, onSave, pomodoro } = props

  const rangeStartDate = new Date(pomodoro.createdAt)
  rangeStartDate.setMilliseconds(0)
  rangeStartDate.setSeconds(0)
  const rangeStart = rangeStartDate.getTime() - 1000 * 60 * 30 // 30 mins

  const rangeEndDate = new Date(pomodoro.stoppedAt!)
  rangeEndDate.setMilliseconds(0)
  rangeEndDate.setSeconds(0)
  const rangeEnd = rangeEndDate.getTime() + 1000 * 60 * 30

  const normalisedCreatedAt = new Date(pomodoro.createdAt)
  normalisedCreatedAt.setMilliseconds(0)
  normalisedCreatedAt.setSeconds(0)

  const normalisedStoppedAt = new Date(pomodoro.stoppedAt!)
  normalisedStoppedAt.setMilliseconds(0)
  normalisedStoppedAt.setSeconds(0)

  const [[start, end], setStartEnd] = useState([normalisedCreatedAt, normalisedStoppedAt])

  const save = async () => {
    await updatePomodoroMutation({ id: pomodoro.id, createdAt: start, stoppedAt: end })
    onSave()
  }

  const defaultValue = [pomodoro.createdAt.getTime(), pomodoro.stoppedAt!.getTime()]

  const hasChanges = defaultValue[0] !== start.getTime() || defaultValue[1] !== end.getTime()

  return (
    <VStack width={400}>
      <RangeSlider
        step={1000 * 60} // minute
        onChange={(val: [number, number]) => setStartEnd([new Date(val[0]), new Date(val[1])])}
        min={rangeStart}
        max={rangeEnd}
        defaultValue={defaultValue}
        marginBottom={3}
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb boxSize={10} index={0}>
          <Box>
            <Text fontSize="xs">{start.toLocaleTimeString().substring(0, 5)}</Text>
          </Box>
        </RangeSliderThumb>
        <RangeSliderThumb boxSize={10} index={1}>
          <Box>
            <Text fontSize="xs">{end.toLocaleTimeString().substring(0, 5)}</Text>
          </Box>
        </RangeSliderThumb>
      </RangeSlider>
      <HStack>
        <Button size="sm" disabled={!hasChanges} onClick={save}>
          Save
        </Button>
        <Button size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </HStack>
    </VStack>
  )
}

export const EditPomodoro = () => {
  const pomodoroId = useParam("pomodoroId", "number")
  const [pomodoro, { refetch }] = useQuery(getPomodoro, { id: pomodoroId })
  const [isEditingDuration, setIsEditingDuration] = useState(false)
  const onClick = () => setIsEditingDuration(!isEditingDuration)
  return (
    <VStack spacing={8}>
      <Heading size="md">Pomodoro ({pomodoro.createdAt.toLocaleDateString()})</Heading>
      <VStack>
        <Heading size="sm">Duration</Heading>
        {isEditingDuration ? (
          <EditPomodoroDuration
            pomodoro={pomodoro}
            onCancel={() => setIsEditingDuration(false)}
            onSave={() => {
              setIsEditingDuration(false)
              refetch()
            }}
          />
        ) : (
          <VStack>
            <Text>Started: {pomodoro.createdAt.toLocaleTimeString()}</Text>
            <Text>
              Stopped: {pomodoro.stoppedAt ? pomodoro.stoppedAt.toLocaleTimeString() : null}
            </Text>
            <Link onClick={onClick}>Edit...</Link>
          </VStack>
        )}
      </VStack>
      <VStack>
        <Heading size="sm">Tasks</Heading>
        <TasksPanel pomodoro={pomodoro} refetch={refetch} />
      </VStack>
    </VStack>
  )
}

const EditPomodoroPage: BlitzPage = () => {
  return (
    <Container maxW="container.md">
      <Suspense fallback="Loading...">
        <VStack spacing={0}>
          <TopNav />
          <Flex py={4} w="full">
            <Box w="full" p={10}>
              <EditPomodoro />
            </Box>
          </Flex>
        </VStack>
      </Suspense>
    </Container>
  )
}

EditPomodoroPage.authenticate = true
EditPomodoroPage.getLayout = (page) => <Layout title="Edit Pomodoro">{page}</Layout>

export default EditPomodoroPage
