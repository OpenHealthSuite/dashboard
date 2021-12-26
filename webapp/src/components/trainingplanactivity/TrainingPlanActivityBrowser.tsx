import React from 'react';
import Button from '@mui/material/Button';
import TrainingPlanActivityEditor from './TrainingPlanActivityEditor';
import { ITrainingPlanActivity } from '../../models/ITrainingPlanActivity'
import { ITrainingPlan, TrainingPlan } from '../../models/ITrainingPlan'

import {
  getPlan 
} from '../../services/TrainingPlanService';

import {
  getActivities,
  createNewActivity
} from '../../services/TrainingPlanActivityService';

import './TrainingPlanActivityBrowser.css';
import { Link } from 'react-router-dom';

interface IProps {
  trainingPlanId: string,
}

interface IState {
  plan: ITrainingPlan,
  existing: ITrainingPlanActivity[],
  viewingMonth: Date,
  openEditor: boolean,
  inputDate: Date
}

export default class TrainingPlanActivityBrowser extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      const viewingMonth = new Date();
      viewingMonth.setDate(1);
      this.state = {
        plan: new TrainingPlan(),
        existing: [],
        viewingMonth: viewingMonth,
        openEditor: false,
        inputDate: viewingMonth
      };


      this.activitiesOnDate = this.activitiesOnDate.bind(this);
      this.mondaysOfWeekInMonth = this.mondaysOfWeekInMonth.bind(this);
      this.changeMonth = this.changeMonth.bind(this);
      this.openEditor = this.openEditor.bind(this);
      this.createActivityCallback = this.createActivityCallback.bind(this);
      this.closeModalCallback = this.closeModalCallback.bind(this);
    }
  
    async componentDidMount() {
      await this.getUsersTrainingPlan();
      await this.getUsersTrainingPlanActivites();
    }

    createActivityCallback = async (newPlan: ITrainingPlanActivity) => {
      await this.createNewActivity(newPlan)
      await this.getUsersTrainingPlanActivites()
      this.setState({ openEditor: false })
    }

    closeModalCallback = () => {
      this.setState({ openEditor: false })
    }
  
    async createNewActivity(newActivity: ITrainingPlanActivity) {
      await createNewActivity(this.props.trainingPlanId, newActivity)
    }

    async getUsersTrainingPlan(){
        this.setState({plan: await getPlan(this.props.trainingPlanId)});
    }
  
    async getUsersTrainingPlanActivites(){
        this.setState({existing: await getActivities(this.props.trainingPlanId)});
    }
  
  
    mondaysOfWeekInMonth(): Date[] {
      var dateUnderCheck = new Date(this.state.viewingMonth);
      var month = this.state.viewingMonth.getMonth();
      const monday = 1
      while(dateUnderCheck.getDay() !== monday){
          dateUnderCheck.setDate(dateUnderCheck.getDate()-1);
      }
      var returnValue: Date[] = [];
      returnValue.push(new Date(dateUnderCheck));
      dateUnderCheck.setDate(dateUnderCheck.getDate() + 7);
      while(dateUnderCheck.getMonth() === month){
          returnValue.push(new Date(dateUnderCheck));
          dateUnderCheck.setDate(dateUnderCheck.getDate() + 7)
      }
      return returnValue;
    }
  
    changeMonth(monthsToMove: number) {
      const newViewingMonth = new Date(this.state.viewingMonth);
      newViewingMonth.setMonth(newViewingMonth.getMonth() + monthsToMove)
      this.setState({viewingMonth: newViewingMonth})
    }
    
    activitiesOnDate(date: Date): ITrainingPlanActivity[] {
      return this.state.existing.filter(x => x.activityTime && (new Date(x.activityTime)).toDateString() === date.toDateString())
    }

    openEditor(date: Date) {
      this.setState({
        inputDate: date,
        openEditor: true 
      })
    }
  
    
    render() {

      const calendarRows = this.mondaysOfWeekInMonth().map((week, wi) => {
        const days = [...Array(7).keys()].map((dayOfWeek, i) => {
          const dayDate = new Date(week);
          dayDate.setDate(week.getDate() + dayOfWeek);
          return (
            <div className="activity-calendar-cell" key={i+'-calendar-cell'} onClick={() => {this.openEditor(dayDate)}}>
            <label className='activity-calendar-day-label'>{dayDate.getDate()}</label>
            {this.activitiesOnDate(dayDate).map((activity, ai) => {
              return (
                <Button className='calendar-activity' key={ai+'-calendar-cell'} component={Link} to={"/trainingplans/"+activity.trainingPlanId+"/activities/"+activity.id}>
                  {activity.name}
                </Button>
              )
            })}
            </div>
          )
        })
        return (
          <div className="activity-calendar-row" key={`${wi}-calendar-row`}>
            {days}
          </div>
        )
      })
      return (
        <>
          <Button onClick={() => {this.changeMonth(-1)}}>
            Back
          </Button>
          <Button onClick={() => {this.changeMonth(1)}}>
            Forward
          </Button>
          <TrainingPlanActivityEditor 
            inputDate={this.state.inputDate} 
            submitCallback={this.createActivityCallback} 
            closeModalCallback={this.closeModalCallback} 
            open={this.state.openEditor}></TrainingPlanActivityEditor>
          <div className="activity-calendar">
            <div className="activity-calendar-header">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(head => <div className="activity-calendar-header-cell">{head}</div>)}
            </div>
            <div className="activity-calendar-body">
              {calendarRows}
            </div>
          </div>
        </>
  
    )
  }
}