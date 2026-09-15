import { App } from 'antd'
import { useEffect, useId, useRef } from 'react'

function useLatest(value) {
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  return valueRef
}

export function useFeedbackMessage({
  error,
  errorContent,
  errorDuration,
  onErrorShown,
  onSuccessShown,
  successContent,
  successDuration,
  successMessage,
}) {
  const { message } = App.useApp()
  const errorKey = useId()
  const successKey = useId()
  const errorContentRef = useLatest(errorContent)
  const errorDurationRef = useLatest(errorDuration)
  const onErrorShownRef = useLatest(onErrorShown)
  const onSuccessShownRef = useLatest(onSuccessShown)
  const successContentRef = useLatest(successContent)
  const successDurationRef = useLatest(successDuration)

  useEffect(() => {
    if (!error) return

    const dismiss = () => message.destroy(errorKey)
    const content = errorContentRef.current?.(error, dismiss) ?? error

    message.error({
      content,
      duration: errorDurationRef.current,
      key: errorKey,
    })
    onErrorShownRef.current?.()
  }, [error, errorContentRef, errorDurationRef, errorKey, message, onErrorShownRef])

  useEffect(() => {
    if (!successMessage) return

    const dismiss = () => message.destroy(successKey)
    const content = successContentRef.current?.(successMessage, dismiss) ?? successMessage

    message.success({
      content,
      duration: successDurationRef.current,
      key: successKey,
    })
    onSuccessShownRef.current?.()
  }, [message, onSuccessShownRef, successContentRef, successDurationRef, successKey, successMessage])
}
