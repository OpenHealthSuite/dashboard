import { dateRangeSleepProvider } from './FitbitStatProvider'

describe('FitbitStatProvider', () => {
  describe('dateRangeSleepProvider', () => {
    test('Happy Path :: Extracts data from result', async () => {
      // Arrange
      const fakeData = {
        sleep: [
          {
            dateOfSleep: '2021-12-12T08:23:38.487Z',
            minutesAwake: 1,
            minutesAsleep: 3,
            levels: {
              summary: {
                rem: {
                  minutes: 5
                }
              }
            }
          },
          {
            dateOfSleep: '2021-12-13T08:23:38.487Z',
            minutesAwake: 2,
            minutesAsleep: 4,
            levels: {
              summary: {
                rem: {
                  minutes: 6
                }
              }
            }
          }
        ]
      }
      const fakeDataProvider = jest.fn().mockResolvedValue(fakeData)
      const userId = 'myfakeuserid'
      const dateStart = new Date(2021, 12, 12)
      const dateEnd = new Date(2021, 12, 13)
      // Act
      const result = await dateRangeSleepProvider(userId, dateStart, dateEnd, fakeDataProvider)
      // Assert
      expect(result).not.toBe(undefined)
      // doing a little ts swallow
      if (result === undefined) {
        return
      }
      expect(fakeDataProvider).toBeCalledWith(userId, dateStart, dateEnd)
      expect(result.length).toBe(2)
      const dateOne = result.find(x => new Date(x.date).toISOString() === new Date('2021-12-12').toISOString())
      const dateTwo = result.find(x => new Date(x.date).toISOString() === new Date('2021-12-13').toISOString())

      expect(dateOne).not.toBe(undefined)
      expect(dateTwo).not.toBe(undefined)
      // doing a little ts swallow
      if (dateOne === undefined || dateTwo === undefined) {
        return
      }

      expect(dateOne.sleep.awake).toBe(1)
      expect(dateOne.sleep.asleep).toBe(3)
      expect(dateOne.sleep.rem).toBe(5)

      expect(dateTwo.sleep.awake).toBe(2)
      expect(dateTwo.sleep.asleep).toBe(4)
      expect(dateTwo.sleep.rem).toBe(6)
    })
  })
})
