import React from 'react';
import { Auth } from 'aws-amplify';
import { TrainingPlanActivity, ITrainingPlanActivity } from '../../models/ITrainingPlanActivity';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

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
    }

    componentDidMount() {
      this.getActivity()
    }

    async getActivity() {
      let session = await Auth.currentSession()
      let result = await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+this.props.trainingPlanId+"/activities/"+this.props.trainingPlanActivityId, { 
          headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
      })
      let body = await result.json()
      this.setState({activityViewing: body, activityLoaded: true});
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
