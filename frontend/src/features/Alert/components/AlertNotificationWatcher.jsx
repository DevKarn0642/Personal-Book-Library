import { App as AntdApp } from 'antd'
import { useEffect, useRef } from 'react'
import { listActiveAlerts } from '../services/alertApi.js'

const POLL_INTERVAL_MS = 30_000
const STORAGE_KEY = 'personal-book-library.notified-alert-occurrences'

const repeatLabels = {
  daily: 'ทุกวัน',
  monthly: 'ทุกเดือน',
  weekly: 'ทุกสัปดาห์',
  yearly: 'ทุกปี',
}

function getDateFromValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '')
  if (!match) return null

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return date.getFullYear() === Number(match[1])
    && date.getMonth() === Number(match[2]) - 1
    && date.getDate() === Number(match[3])
    ? date
    : null
}

function getTimeParts(value) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/.exec(value || '')
  if (!match) return null

  return {
    hours: Number(match[1]),
    milliseconds: Math.floor(Number(`0.${match[4] || '0'}`) * 1000),
    minutes: Number(match[2]),
    seconds: Number(match[3] || 0),
  }
}

function formatLocalDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function isAlertDue(alert, now) {
  const alertDate = getDateFromValue(alert.alert_date)
  const alertTime = getTimeParts(alert.alert_time)
  if (!alert.alert_status || !alertDate || !alertTime) return false

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (alertDate > today) return false

  const repeatType = alert.alert_repeat_type || null
  const matchesSchedule = repeatType === 'daily'
    || (repeatType === 'weekly' && alertDate.getDay() === today.getDay())
    || (repeatType === 'monthly' && alertDate.getDate() === today.getDate())
    || (repeatType === 'yearly'
      && alertDate.getMonth() === today.getMonth()
      && alertDate.getDate() === today.getDate())
    || (!repeatType && formatLocalDate(alertDate) === formatLocalDate(today))

  if (!matchesSchedule) return false

  const scheduledTime = new Date(today)
  scheduledTime.setHours(alertTime.hours, alertTime.minutes, alertTime.seconds, alertTime.milliseconds)
  return now >= scheduledTime
}

function getOccurrenceKey(alert, now) {
  return [
    alert.alert_id,
    formatLocalDate(now),
    alert.alert_date,
    alert.alert_time,
    alert.alert_repeat_type || 'once',
  ].join(':')
}

function loadNotifiedOccurrences() {
  try {
    const storedOccurrences = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]')
    return new Set(Array.isArray(storedOccurrences) ? storedOccurrences : [])
  } catch {
    return new Set()
  }
}

function saveNotifiedOccurrences(occurrences) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...occurrences]))
  } catch {
    // A blocked browser storage API should not prevent in-app notifications.
  }
}

function getNotificationDescription(alert) {
  const schedule = repeatLabels[alert.alert_repeat_type] || 'ครั้งเดียว'
  const book = alert.book_name ? `หนังสือ: ${alert.book_name}` : 'ถึงเวลาที่คุณตั้งแจ้งเตือนไว้'
  return `${book}\nรูปแบบ: ${schedule} เวลา ${alert.alert_time.slice(0, 5)} น.`
}

export function AlertNotificationWatcher() {
  const { notification } = AntdApp.useApp()
  const notifiedOccurrencesRef = useRef(loadNotifiedOccurrences())

  useEffect(() => {
    let isCancelled = false
    let timeoutId

    async function checkDueAlerts() {
      try {
        const alerts = await listActiveAlerts()
        if (isCancelled) return

        const now = new Date()
        let hasNewNotification = false

        alerts.filter((alert) => isAlertDue(alert, now)).forEach((alert) => {
          const occurrenceKey = getOccurrenceKey(alert, now)
          if (notifiedOccurrencesRef.current.has(occurrenceKey)) return

          notifiedOccurrencesRef.current.add(occurrenceKey)
          hasNewNotification = true
          notification.info({
            description: getNotificationDescription(alert),
            duration: 8,
            key: `alert-${occurrenceKey}`,
            message: 'ถึงเวลาการแจ้งเตือน',
            placement: 'topRight',
          })
        })

        if (hasNewNotification) {
          saveNotifiedOccurrences(notifiedOccurrencesRef.current)
        }
      } catch {
        // Polling failures are intentionally silent so a transient failure does not interrupt reading.
      } finally {
        if (!isCancelled) {
          timeoutId = window.setTimeout(checkDueAlerts, POLL_INTERVAL_MS)
        }
      }
    }

    checkDueAlerts()

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [notification])

  return null
}
