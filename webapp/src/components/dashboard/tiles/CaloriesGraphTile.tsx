import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { getDateRangeCalories, IDatedCaloriesInOut } from '../../../services/StatsService'
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

const yesterDate = new Date()
yesterDate.setDate(yesterDate.getDate() - 1)
const lastWeekDate = new Date()
lastWeekDate.setDate(lastWeekDate.getDate() - 7)

interface CaloriesGraphTileProps {
  fnGetDateRangeCalories?: (startDate: Date, endDate: Date) => Promise<IDatedCaloriesInOut[]>
}

export function CaloriesGraphTile({ fnGetDateRangeCalories = getDateRangeCalories }: CaloriesGraphTileProps) {
  const [caloriesArray, setCaloriesArray] = useState<IDatedCaloriesInOut[]>([])
  const refreshIntervalMilliseconds = 300000;
  const [refreshRemaining, setRefreshRemaining] = useState<number>(refreshIntervalMilliseconds)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  useEffect(() => {
    const getInitialCalories = async () => { setCaloriesArray(await fnGetDateRangeCalories(lastWeekDate, yesterDate)) }
    getInitialCalories()
  }, [setCaloriesArray, fnGetDateRangeCalories])

  useEffect(() => {
    const getCalories = async () => {
      setIsRefreshing(true)
      setCaloriesArray(await fnGetDateRangeCalories(lastWeekDate, yesterDate))
      setIsRefreshing(false)
    }
    const timer = setTimeout(() => {
      setRefreshRemaining(refreshRemaining - 500)
      if (refreshRemaining < 0 && !isRefreshing) {
        getCalories()
      }
    }, 500)
    return () => clearTimeout(timer);
  }, [isRefreshing, refreshRemaining, setRefreshRemaining, setCaloriesArray, fnGetDateRangeCalories])

  const caloriesInTotal = caloriesArray.map(x => x.caloriesIn - 0).reduce((partial, a) => a + partial, 0)
  const caloriesOutTotal = caloriesArray.map(x => x.caloriesOut - 0).reduce((partial, a) => a + partial, 0)
  const caloriesDelta = caloriesInTotal - caloriesOutTotal
  const caloriesString = `In: ${caloriesInTotal.toLocaleString()}  |  Out: ${caloriesOutTotal.toLocaleString()}  |  Delta: ${caloriesDelta.toLocaleString()}`
  return (<DashboardTile headerText='Last Week Calories' loading={caloriesArray.length === 0} refreshDetails={{refreshInterval: refreshIntervalMilliseconds, remaining: refreshRemaining}}>
    <>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart

          data={caloriesArray.map(x => {
            return {
              dateLabel: dayLabels[new Date(x.date).getDay()],
              caloriesIn: x.caloriesIn,
              caloriesOut: x.caloriesOut
            }
          })}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis dataKey="dateLabel" />
          <YAxis orientation="right" />
          <Bar type="monotone" dataKey="caloriesIn" fill={colors.caloriesIn} yAxisId={0} />
          <Bar type="monotone" dataKey="caloriesOut" fill={colors.caloriesOut} yAxisId={0} />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ textAlign: "center" }}>{caloriesString}</p>
    </>
  </DashboardTile>)
}