import { openFoodDiaryDataProvider } from './OpenFoodDiaryProvider'
import { randomUUID } from 'node:crypto'
import { IDatedCaloriesConsumed } from '../types'

describe('openFoodDiaryDataProvider', () => {
  const TEST_OPEN_FOOD_DIARY_API = 'http://localhost:3421/api'
  const TEST_OPEN_FOOD_DIARY_API_HEADER = 'x-test-uerid-header'
  let ogUrl: string | undefined
  let ogHeader: string | undefined
  beforeAll(() => {
    ogUrl = process.env.OPEN_FOOD_DIARY_API
    ogHeader = process.env.OPEN_FOOD_DIARY_API_HEADER
    process.env.OPEN_FOOD_DIARY_API = TEST_OPEN_FOOD_DIARY_API
    process.env.OPEN_FOOD_DIARY_API_HEADER = TEST_OPEN_FOOD_DIARY_API_HEADER
  })
  beforeEach(() => jest.resetAllMocks())
  afterAll(() => {
    process.env.OPEN_FOOD_DIARY_API = ogUrl
    process.env.OPEN_FOOD_DIARY_API_HEADER = ogHeader
  })
  describe('dailyCaloriesConsumedProvider', () => {
    test('Gets open food diary logs :: translates to CaloriesIn', async () => {
      const mockData = [
        {
          time: {
            start: new Date(2017, 10, 12, 12, 39, 10).toISOString(),
            end: new Date(2017, 10, 12, 12, 39, 12).toISOString()
          },
          metrics: {
            calories: 123
          }
        },
        {
          time: {
            start: new Date(2017, 10, 12, 12, 39, 10).toISOString(),
            end: new Date(2017, 10, 12, 12, 39, 12).toISOString()
          },
          metrics: {
            notCalories: 234
          }
        },
        {
          time: {
            start: new Date(2017, 10, 12, 12, 39, 10).toISOString(),
            end: new Date(2017, 10, 12, 12, 39, 12).toISOString()
          },
          metrics: {
            calories: 642
          }
        }
      ]
      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockData),
        status: 200
      }
      const spy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse as any)
      const userId = randomUUID()
      const date = new Date(2017, 10, 12, 12, 39, 10)
      const startDate = new Date(2017, 10, 12)
      const endDate = new Date(2017, 10, 12, 23, 59, 59)
      const res = await openFoodDiaryDataProvider.dailyCaloriesConsumedProvider!(userId, date)

      expect(spy).toBeCalledWith(TEST_OPEN_FOOD_DIARY_API + '/logs?' + new URLSearchParams({
        startDate: startDate.toISOString(), endDate: endDate.toISOString()
      }), {
        method: 'GET',
        headers: {
          [TEST_OPEN_FOOD_DIARY_API_HEADER]: userId
        }
      })

      expect(res).not.toBeUndefined()
      expect(res!).toEqual({ caloriesIn: mockData.reduce((acc, curr) => acc + (curr.metrics.calories ?? 0), 0) })
    })
  })
  describe('dateRangeCaloriesConsumedProvider', () => {
    test('Gets open food diary logs :: translates to DatedCaloriesIn', async () => {
      const mockData = [
        {
          time: {
            start: new Date(2017, 10, 9, 12, 39, 10).toISOString(),
            end: new Date(2017, 10, 9, 12, 39, 12).toISOString()
          },
          metrics: {
            calories: 123
          }
        },
        {
          time: {
            start: new Date(2017, 10, 11, 12, 39, 10).toISOString(),
            end: new Date(2017, 10, 11, 12, 39, 12).toISOString()
          },
          metrics: {
            calories: 234
          }
        },
        {
          time: {
            start: new Date(2017, 10, 11, 12, 52, 10).toISOString(),
            end: new Date(2017, 10, 11, 12, 56, 12).toISOString()
          },
          metrics: {
            notCalories: 832
          }
        },
        {
          time: {
            start: new Date(2017, 10, 11, 12, 42, 10).toISOString(),
            end: new Date(2017, 10, 11, 12, 44, 12).toISOString()
          },
          metrics: {
            calories: 832
          }
        },
        {
          time: {
            start: new Date(2017, 10, 12, 12, 39, 10).toISOString(),
            end: new Date(2017, 10, 12, 12, 39, 12).toISOString()
          },
          metrics: {
            calories: 642
          }
        }
      ]

      const expected: IDatedCaloriesConsumed[] = [
        { caloriesIn: 123, date: new Date(2017, 10, 9) },
        { caloriesIn: 234 + 832, date: new Date(2017, 10, 11) },
        { caloriesIn: 642, date: new Date(2017, 10, 12) }
      ]
      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockData),
        status: 200
      }
      const spy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse as any)
      const userId = randomUUID()
      const startDate = new Date(2017, 10, 9, 9, 2, 12)
      const endDate = new Date(2017, 10, 12, 22, 12, 10)
      const res = await openFoodDiaryDataProvider.dateRangeCaloriesConsumedProvider!(userId, startDate, endDate)

      expect(spy).toBeCalledWith(TEST_OPEN_FOOD_DIARY_API + '/logs?' + new URLSearchParams({
        startDate: startDate.toISOString(), endDate: endDate.toISOString()
      }), {
        method: 'GET',
        headers: {
          [TEST_OPEN_FOOD_DIARY_API_HEADER]: userId
        }
      })

      expect(res).not.toBeUndefined()
      expect(res!).toEqual(expected)
    })

    test('orders dates', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue([]),
        status: 200
      }
      const spy = jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse as any)
      const userId = randomUUID()
      const endDate = new Date(2017, 10, 9, 9, 2, 12)
      const startDate = new Date(2017, 10, 12, 22, 12, 10)
      await openFoodDiaryDataProvider.dateRangeCaloriesConsumedProvider!(userId, startDate, endDate)

      expect(spy).toBeCalledWith(TEST_OPEN_FOOD_DIARY_API + '/logs?' + new URLSearchParams({
        startDate: endDate.toISOString(), endDate: startDate.toISOString()
      }), {
        method: 'GET',
        headers: {
          [TEST_OPEN_FOOD_DIARY_API_HEADER]: userId
        }
      })
    })
  })
})
