import { DashboardTile } from './BaseTile'
import { ISleep, getTodaySleep } from '../../../services/StatsService'
import { useEffect, useState } from 'react'

function formatMinutesToText(minutes: number, startString: string = ""): string {
  if (minutes === 0) {
    return startString
  }
  if (minutes < 60) {
    return `${startString} ${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  return formatMinutesToText(minutes - (hours * 60), `${hours} hours`)
}

interface SleepDailyTileProps {
  fnGetDaySleep?: () => Promise<ISleep | undefined>
}

export function SleepDailyTile({ fnGetDaySleep = getTodaySleep }: SleepDailyTileProps) {
  const [sleep, setSleep] = useState<ISleep>()
  // TODO: This should be changed to refresh every day unless hasn't been reported - API needs updating first though
  const refreshIntervalMilliseconds = 1000 * 60 * 60; // Every hour
  const [refreshRemaining, setRefreshRemaining] = useState<number>(refreshIntervalMilliseconds)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isErrored, setIsErrored] = useState<boolean>(false)

  useEffect(() => {
    const getInitialCalories = async () => { 
      const sleep = await fnGetDaySleep()
      if (sleep === undefined) {
        setIsErrored(true)
      } else {
        setSleep(sleep)
        setIsErrored(false)
      }
      setIsLoading(false)
    }
    getInitialCalories()
  }, [setSleep, setIsErrored, fnGetDaySleep, setIsLoading])

  useEffect(() => {
    const getCalories = async () => {
      setIsRefreshing(true)
      const sleep = await fnGetDaySleep()
      if (sleep === undefined) {
        setIsErrored(true)
      } else {
        setSleep(sleep)
        setIsErrored(false)
        setIsLoading(false)
      }
      setIsRefreshing(false)
      setRefreshRemaining(refreshIntervalMilliseconds)
    }
    const timer = setTimeout(() => {
      setRefreshRemaining(refreshRemaining - 500)
      if (refreshRemaining < 0 && !isRefreshing) {
        getCalories()
      }
    }, 500)
    return () => clearTimeout(timer);
  }, [refreshIntervalMilliseconds, isRefreshing, refreshRemaining, setIsErrored, setRefreshRemaining, setSleep, fnGetDaySleep])

  let content;
  if (sleep) {
    content = <div style={{ textAlign: "center" }}>
      <h1>{formatMinutesToText(sleep.asleep)}</h1>
      <h3>REM: {formatMinutesToText(sleep.rem)}</h3>
      <h4>Awake: {formatMinutesToText(sleep.awake)}</h4>
    </div>
  }
  return (<DashboardTile headerText='Sleep' loading={isLoading} errored={isErrored} refreshDetails={{refreshInterval: refreshIntervalMilliseconds, remaining: refreshRemaining}}>
    {content}
  </DashboardTile>)
}