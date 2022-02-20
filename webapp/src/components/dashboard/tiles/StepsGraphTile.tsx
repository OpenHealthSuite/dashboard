import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { getDateRangeSteps, IDatedSteps } from '../../../services/StatsService'
import { DashboardTile } from './BaseTile'

const dayLabels = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
]

const colors = {
  caloriesIn: "#3A3",
  caloriesOut: "#A33",
  steps: "#44C"
}

interface StepsGraphTileProps {
  fnGetDateRangeSteps?: (startDate: Date, endDate: Date) => Promise<IDatedSteps[] | undefined>
}

export function StepsGraphTile({ fnGetDateRangeSteps = getDateRangeSteps }: StepsGraphTileProps) {
  const [lastWeekSteps, setLastWeekSteps] = useState<IDatedSteps[]>([])
  
  const refreshIntervalMilliseconds = 1000 * 60 * 60; // Every hour
  const [refreshRemaining, setRefreshRemaining] = useState<number>(refreshIntervalMilliseconds)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isErrored, setIsErrored] = useState<boolean>(false)

  useEffect(() => {
    const getInitialCalories = async () => { 
      const yesterDate = new Date()
      yesterDate.setDate(yesterDate.getDate() - 1)
      const lastWeekDate = new Date()
      lastWeekDate.setDate(lastWeekDate.getDate() - 7)
      const steps = await fnGetDateRangeSteps(lastWeekDate, yesterDate)
      if (steps === undefined) {
        setIsErrored(true)
      } else {
        setLastWeekSteps(steps)
        setIsErrored(false)
      }
      setIsLoading(false)
    }
    getInitialCalories()
  }, [setLastWeekSteps, fnGetDateRangeSteps, setIsErrored, setIsLoading])

  useEffect(() => {
    const getCalories = async () => {
      const yesterDate = new Date()
      yesterDate.setDate(yesterDate.getDate() - 1)
      const lastWeekDate = new Date()
      lastWeekDate.setDate(lastWeekDate.getDate() - 7)
      setIsRefreshing(true)
      const steps = await fnGetDateRangeSteps(lastWeekDate, yesterDate)
      if (steps === undefined) {
        setIsErrored(true)
      } else {
        setLastWeekSteps(steps)
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
  }, [refreshIntervalMilliseconds, isRefreshing, refreshRemaining, setIsErrored, setRefreshRemaining, setLastWeekSteps, fnGetDateRangeSteps])

  const maxBarSize = Math.max(...lastWeekSteps.map(x => x.steps))
  const totalSteps = lastWeekSteps.map(x => x.steps - 0).reduce((partial, a) => a + partial, 0)
  return (<DashboardTile headerText='Last Week Steps' loading={isLoading} errored={isErrored} refreshDetails={{refreshInterval: refreshIntervalMilliseconds, remaining: refreshRemaining}}>
    <>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart

          data={lastWeekSteps.map(x => {
            return {
              dateLabel: dayLabels[new Date(x.date).getDay()],
              steps: x.steps
            }
          })}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis dataKey="dateLabel" />
          <YAxis orientation="right" type="number" domain={[0, maxBarSize]} />
          <Bar type="monotone" dataKey="steps" fill={colors.steps} yAxisId={0} />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ textAlign: "center" }}>{totalSteps.toLocaleString()} Total Steps | {Math.floor(totalSteps / lastWeekSteps.length).toLocaleString()} Avg.</p>
    </>
  </DashboardTile>)
}