import { 
  pacemeGetRequest
} from './BasePaceMeApiService';

// /activity/:date/steps
const activitiesRoot = '/activities'
const sleepRoot = '/sleep'

export interface IStepCount {
  count: number
}

export interface ICalories {
  caloriesIn: number,
  caloriesOut: number
}

export interface ISleep {
  asleep: number,
  rem: number,
  awake: number
}


export async function getTodaysSteps(): Promise<IStepCount | undefined> {
  return await pacemeGetRequest<IStepCount>([activitiesRoot, (new Date()).toISOString().split('T')[0], 'steps'].join('/'))
}

export async function getTodaysCalories(): Promise<ICalories | undefined> {
  return await pacemeGetRequest<ICalories>([activitiesRoot, (new Date()).toISOString().split('T')[0], 'calories'].join('/'))
}

export async function getTodaySleep(): Promise<ISleep | undefined> {
  return await pacemeGetRequest<ISleep>([sleepRoot, (new Date()).toISOString().split('T')[0]].join('/'))
}
