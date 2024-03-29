import { DataProvider, ICaloriesIn, IDatedCaloriesConsumed } from '../types'
type FoodLog = {
  id: string,
  name: string,
  labels: string[],
  time: {
      start: Date,
      end: Date
  },
  metrics: {
      [key: string]: number
  }
}
export const openFoodDiaryDataProvider = {
  async caloriesIngestedForGivenDay (userId: string, date: Date): Promise<ICaloriesIn | undefined> {
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

    const res = await fetch(`${process.env.OPEN_FOOD_DIARY_API}/logs?` + new URLSearchParams({
      startDate: startDate.toISOString(), endDate: endDate.toISOString()
    }), {
      method: 'GET',
      headers: {
        [process.env.OPEN_FOOD_DIARY_API_HEADER!]: userId
      }
    })
    if (res.status === 200) {
      const logs: FoodLog[] = await res.json()
      return { caloriesIn: logs.reduce((acc, curr) => acc + (curr.metrics.calories ?? 0), 0) }
    }
    return undefined
  },
  async caloriesIngestedForRangeOfDays (userId: string, dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesConsumed[] | undefined> {
    const [startDate, endDate] = dateStart.getTime() < dateEnd.getTime() ? [dateStart, dateEnd] : [dateEnd, dateStart]
    endDate.setHours(23)
    endDate.setMinutes(59)
    endDate.setSeconds(59)
    const res = await fetch(`${process.env.OPEN_FOOD_DIARY_API}/logs?` + new URLSearchParams({
      startDate: new Date(startDate.toISOString().split('T')[0]).toISOString(),
      endDate: endDate.toISOString()
    }), {
      method: 'GET',
      headers: {
        [process.env.OPEN_FOOD_DIARY_API_HEADER!]: userId
      }
    })
    if (res.status === 200) {
      const logs: FoodLog[] = await res.json()
      return Object.entries(logs.reduce<{ [key: string]: number }>((acc, curr) => {
        const date = new Date(curr.time.start).toISOString().split('T')[0]
        if (acc[date]) {
          acc[date] += (curr.metrics.calories ?? 0)
        } else {
          acc[date] = curr.metrics.calories
        }
        return acc
      }, {}))
        .map(([date, caloriesIn]) => ({
          date: new Date(date),
          caloriesIn
        }))
    }
    return undefined
  }
} as DataProvider
