import { useState } from "react"
import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Link } from "@chakra-ui/react"

const getNotificationStatus = (): null | "not-supported" | "granted" | "denied" | "default" => {
  if (typeof window === "undefined") {
    return "default"
  }
  if (!("Notification" in window)) {
    return "not-supported"
  } else {
    return Notification.permission
  }
}

const requestPermission = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("request Permission called server side."))
  }
  if (!("Notification" in window)) {
    return Promise.reject(new Error("Notifications not supported in this browser"))
  } else {
    const requestPermissionPromise = () =>
      new Promise((resolve) => Notification.requestPermission(resolve))

    let hasPromise = true

    try {
      Notification.requestPermission().then()
    } catch (e) {
      hasPromise = false
    }

    if (hasPromise) {
      return Notification.requestPermission()
    } else {
      return requestPermissionPromise()
    }
  }
}

export const NotificationsAlert = () => {
  const [dismissed, setDismissed] = useState(false)

  const notificationStatus = getNotificationStatus()

  if (dismissed || notificationStatus === "granted") {
    return null
  }

  if (notificationStatus === "not-supported") {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Notifications are not supported by your browser!</AlertTitle>
        <AlertDescription>
          You will not receive a notification at the end of an activity.
        </AlertDescription>
        <CloseButton onClick={() => setDismissed(true)} position="absolute" right="8px" top="8px" />
      </Alert>
    )
  }

  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle mr={2}>You have not given permission to show notifications!</AlertTitle>
      <AlertDescription>
        Click{" "}
        <Link
          onClick={async () => {
            await requestPermission()
            setDismissed(true)
          }}
        >
          here
        </Link>{" "}
        to enable them.
      </AlertDescription>
      <CloseButton onClick={() => setDismissed(true)} position="absolute" right="8px" top="8px" />
    </Alert>
  )
}
