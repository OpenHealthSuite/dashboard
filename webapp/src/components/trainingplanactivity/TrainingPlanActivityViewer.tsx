import React from 'react';
import { TrainingPlanActivity, ITrainingPlanActivity } from '../../models/ITrainingPlanActivity';
import Button from '@mui/material/Button';
import * as H from 'history'
import { Link, withRouter } from 'react-router-dom';
import { getActivity, deleteActivity } from '../../services/TrainingPlanActivityService';

interface ITrainingPlanActivityViewerProps {
  trainingPlanId: string,
  trainingPlanActivityId: string,
  match: any,
  location: any,
  history: H.History
}

interface ITrainingPlanActivityViewerState {
  activityLoaded: boolean,
  activityViewing: ITrainingPlanActivity
}

class TrainingPlanActivityViewer extends React.Component<ITrainingPlanActivityViewerProps, ITrainingPlanActivityViewerState> {
  constructor(props: ITrainingPlanActivityViewerProps) {
    super(props);
    this.state = {
      activityLoaded: false,
      activityViewing: new TrainingPlanActivity(new Date())
    };
    this.getStateActivity = this.getStateActivity.bind(this)
    this.handleDeleteTrainingPlanActivity = this.handleDeleteTrainingPlanActivity.bind(this)
  }

  get activityCalendarPath(): string {
    return "/trainingplans/"+this.props.trainingPlanId+"/activities/"
  }

  componentDidMount() {
    this.getStateActivity()
  }

  async getStateActivity() {
    this.setState({
      activityViewing: await getActivity(this.props.trainingPlanId, this.props.trainingPlanActivityId),
      activityLoaded: true
    });
  }

  async handleDeleteTrainingPlanActivity() {
    await deleteActivity(this.props.trainingPlanId, this.props.trainingPlanActivityId)
    this.props.history.push(this.activityCalendarPath)
  }


  render() {
    let content = <div>Loading...</div>
    if (this.state.activityLoaded) {
      content = <div>
        <h2>{this.state.activityViewing.name}</h2>
        <dl>
          <dt>Activity Date</dt>
          <dd>{this.state.activityViewing.activityTime}</dd>
          <dt>Activity Complete</dt>
          <dd>{this.state.activityViewing.complete ? "Yes" : "No"}</dd>
        </dl>
        <hr/>
        <Button color="warning" onClick={this.handleDeleteTrainingPlanActivity}>Delete</Button>
        <hr/>
        <h4>Segments</h4>
        <div>TODO</div>
      </div>
    }
    return (
      <>
      <Button component={Link} to={this.activityCalendarPath}>Back to Activities Calendar</Button>
      <hr/>
      {content}
      </>
    )
  }

}

export default withRouter(TrainingPlanActivityViewer)