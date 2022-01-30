import { 
  pacemeGetRequest
} from './BasePaceMeApiService';

// /activity/:date/steps
const activitiesRoot = '/activities'
const sleepRoot = '/sleep'

interface IStepCount {
  count: number
}

interface ICalories {
  in: number,
  out: number
}

export interface ISleep {
  asleep: number,
  rem: number,
  awake: number
}

export interface IDatedSteps {
  steps: number,
  date: Date
}

export interface IDatedCaloriesInOut {
  caloriesIn: number,
  caloriesOut: number,
  date: Date
}

export async function getTodaysSteps(): Promise<IStepCount> {
  return await pacemeGetRequest<IStepCount>([activitiesRoot, (new Date()).toISOString().split('T')[0], 'steps'].join('/'))
}

export async function getTodaysCalories(): Promise<ICalories> {
  return await pacemeGetRequest<ICalories>([activitiesRoot, (new Date()).toISOString().split('T')[0], 'calories'].join('/'))
}

export async function getTodaySleep(): Promise<ISleep> {
  return await pacemeGetRequest<ISleep>([sleepRoot, (new Date()).toISOString().split('T')[0]].join('/'))
}

export async function getDateRangeSteps(dateStart: Date, dateEnd: Date): Promise<IDatedSteps[]> {
  return await pacemeGetRequest<IDatedSteps[]>([activitiesRoot, dateStart.toISOString().split('T')[0], dateEnd.toISOString().split('T')[0], 'steps'].join('/'))
}

export async function getDateRangeCalories(dateStart: Date, dateEnd: Date): Promise<IDatedCaloriesInOut[]> {
  return await pacemeGetRequest<IDatedCaloriesInOut[]>([activitiesRoot, dateStart.toISOString().split('T')[0], dateEnd.toISOString().split('T')[0], 'calories'].join('/'))
}