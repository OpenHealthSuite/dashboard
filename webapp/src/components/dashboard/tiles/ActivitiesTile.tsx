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
  const plans = (await getUserPlans()).filter(x => x.active)
  const allActivePlanActivities = (await Promise.all(plans.map(async p => await getActivities(p.id)))).flat()
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

async function markActivityComplete(activity: ITrainingPlanActivity) {
  activity.complete = true;
  await editActivity(activity)
  // TODO: Refresh activities
}

interface IActivitiesTileProps {
  fnGetNextActivities?: () => Promise<ITrainingPlanActivity[]>
}

export function ActivitiesTile({ fnGetNextActivities = getNextActivities }: IActivitiesTileProps) {
  const [pendingActivities, setPendingActivities] = useState<ITrainingPlanActivity[]>([])

  useEffect(() => {
    const getSteps = async () => {
      setPendingActivities(await fnGetNextActivities())
    }
    if (pendingActivities.length === 0) {
      getSteps()
    }
  }, [pendingActivities.length, fnGetNextActivities])

  return (<DashboardTile headerText='Activities' loading={pendingActivities.length === 0}>
    {pendingActivities.map((x, i) =>
      <div key={`pendact-${i}`}>
        <h2>{x.activityTime.toISOString().split('T')[0]}</h2>
        <h3>{x.name}</h3>
        <div>
          <Button component={Link} to={"/trainingplans/" + x.trainingPlanId + "/activities/" + x.id}>View</Button>
          <Button disabled={!dayIsToday(x.activityTime)} onClick={async () => { await markActivityComplete(x) }}>Mark Complete</Button>
        </div>
      </div>
    )}
  </DashboardTile>)
}