import { useEffect, useState } from 'react'
import { getTodaysCalories, getTodaysSteps, ICalories, IStepCount } from '../../../services/StatsService'
import { DashboardTile } from './BaseTile'

const colors = {
  caloriesIn: "#3A3",
  caloriesOut: "#A33",
  steps: "#44C"
}

interface CaloriesStepsDailyTileProps {
  fnGetTodaysSteps?: () => Promise<IStepCount>
  fnGetTodayCalories?: () => Promise<ICalories>
}

export function CaloriesStepsDailyTile({ fnGetTodayCalories = getTodaysCalories, fnGetTodaysSteps = getTodaysSteps }: CaloriesStepsDailyTileProps){
  const [stepCount, setStepCount] = useState<IStepCount>()
  const [calories, setCalories] = useState<ICalories>()
  
  useEffect(() => {
    const getValues = async () => {
      setCalories(await fnGetTodayCalories())
      setStepCount(await fnGetTodaysSteps())
    }
    if(!stepCount && !calories) {
      getValues()
    }
  }, [stepCount, fnGetTodaysSteps, calories, fnGetTodayCalories])
  
  let content;
  if (calories && stepCount) {
    const todayCalorieDelta = (calories.caloriesIn - calories.caloriesOut)
    content = <div style={{textAlign:"center"}}>
      <h1>
          <span style={{color: colors.caloriesIn}}>{calories.caloriesIn.toLocaleString()} In</span> - <span style={{color: colors.caloriesOut}}>{calories.caloriesOut.toLocaleString()} Out</span>
      </h1>
      <h2 style={{color: todayCalorieDelta < 0 ? colors.caloriesOut : colors.caloriesIn}}>{todayCalorieDelta.toLocaleString()} Calories Delta</h2>
      <h2 style={{color: colors.steps}}>{stepCount.count.toLocaleString()} Steps</h2>
    </div>
  }

  return (<DashboardTile headerText='Today' loading={!stepCount || !calories}>
  {content}
  </DashboardTile>)
}
