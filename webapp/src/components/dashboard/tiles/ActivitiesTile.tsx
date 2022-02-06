import { DashboardTile } from './BaseTile'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom';
import { getActivities, editActivity } from '../../../services/TrainingPlanActivityService'
import { getUserPlans } from '../../../services/TrainingPlanService'
import { ITrainingPlanActivity } from '../../../models/ITrainingPlanActivity'
import { useEffect, useState } from 'react';

function dayIsToday(date: Date): boolean {
  // TODO: Probably go find a library to do this
  return dateDaysMatch(date, new Date())
}

function dateDaysMatch(dateOne: Date, dateTwo: Date): boolean {
  // TODO: Probably go find a library to do this
  const dateOneDate = dateOne.toISOString().split('T')[0]
  const dateTwoDate = dateTwo.toISOString().split('T')[0]
  return dateOneDate === dateTwoDate;
}

function dayIsTodayOrLater(date: Date): boolean {
  // TODO: Probably go find a library to do this
  const dateDate = date.toISOString().split('T')[0].split('-').map(x => parseInt(x))
  const todayDate = (new Date()).toISOString().split('T')[0].split('-').map(x => parseInt(x))
  return dateDate[0] >= todayDate[0] && dateDate[1] >= todayDate[1] && dateDate[2] >= todayDate[2]
}

async function getNextActivities(): Promise<ITrainingPlanActivity[]> {
  const allPlans = await getUserPlans()
  if (allPlans === undefined) {
    return []
  }
  const plans = allPlans.filter(x => x.active)
  const allActivePlanActivities = (await Promise.all(plans.map(async p => await getActivities(p.id)))).flat().filter(x => x !== undefined) as ITrainingPlanActivity[]
  if (allActivePlanActivities.length === 0) {
    return []
  }
  const comingActivites = allActivePlanActivities.filter(x => !x.complete && dayIsTodayOrLater(x.activityTime))
  if (comingActivites.length === 0) {
    return []
  }
  const nextActivityDate = comingActivites.sort((a, b) => new Date(a.activityTime).getTime() - new Date(b.activityTime).getTime())[0].activityTime
  return comingActivites.filter(x => dateDaysMatch(nextActivityDate, x.activityTime));
}

async function markActivityComplete(activity: ITrainingPlanActivity, refreshActivities: () => Promise<void>) {
  activity.complete = true;
  await editActivity(activity)
  await refreshActivities()
}

interface IActivitiesTileProps {
  fnGetNextActivities?: () => Promise<ITrainingPlanActivity[]>
}

// No timer hookup for this tile - this should probably be our first websocket tile
export function ActivitiesTile({ fnGetNextActivities = getNextActivities }: IActivitiesTileProps) {
  const [pendingActivities, setPendingActivities] = useState<ITrainingPlanActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastLoadDay, setLastLoadDay] = useState((new Date()).getDay())
  useEffect(() => {
    const getActivities = async () => {
      setPendingActivities(await fnGetNextActivities())
      setIsLoading(false)
    }
    getActivities()
  }, [setIsLoading, fnGetNextActivities, setPendingActivities])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const currentDay = (new Date()).getDay()
      if (currentDay !== lastLoadDay) {
        setLastLoadDay(currentDay)
        setPendingActivities(await fnGetNextActivities())
        setIsLoading(false)
      }
    }, 30000)
    return () => clearTimeout(timer);
  }, [lastLoadDay, setLastLoadDay, fnGetNextActivities])

  const refreshActivities =  async () => {
    setPendingActivities(await fnGetNextActivities())
  }

  const content = pendingActivities.length === 0 ? <>No Activities Scheduled</> : pendingActivities.map((x, i) =>
    <div key={`pendact-${i}`}>
      <h2>{x.activityTime.toISOString().split('T')[0]}</h2>
      <h3>{x.name}</h3>
      <div>
        <Button component={Link} to={"/trainingplans/" + x.trainingPlanId + "/activities/" + x.id}>View</Button>
        <Button disabled={!dayIsToday(x.activityTime)} onClick={async () => { await markActivityComplete(x, refreshActivities) }}>Mark Complete</Button>
      </div>
    </div>
  )
  return (<DashboardTile headerText='Activities' loading={isLoading}>
    {content}
  </DashboardTile>)
}