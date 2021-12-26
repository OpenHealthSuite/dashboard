import React from 'react';
import { TrainingPlanActivity, ITrainingPlanActivity } from '../../models/ITrainingPlanActivity';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { getActivity } from '../../services/TrainingPlanActivityService';

interface ITrainingPlanActivityViewerProps {
  trainingPlanId: string,
  trainingPlanActivityId: string
}

interface ITrainingPlanActivityViewerState {
  activityLoaded: boolean,
  activityViewing: ITrainingPlanActivity
}

export default class TrainingPlanActivityViewer extends React.Component<ITrainingPlanActivityViewerProps, ITrainingPlanActivityViewerState> {
    constructor(props: ITrainingPlanActivityViewerProps) {
      super(props);
      this.state = {
        activityLoaded: false,
        activityViewing: new TrainingPlanActivity(new Date())
      };
      this.getStateActivity = this.getStateActivity.bind(this)
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
          <h4>Segments</h4>
          Segments go here
        </div>
      }
      return (
       <>
        <Button component={Link} to={"/trainingplans/"+this.props.trainingPlanId+"/activities/"}>
          Back to Activities Calendar
        </Button>
        {content}
       </>
      )
    }
  
  }
