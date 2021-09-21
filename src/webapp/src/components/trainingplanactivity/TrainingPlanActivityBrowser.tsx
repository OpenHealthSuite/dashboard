import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TrainingPlanActivityEditor from './TrainingPlanActivityEditor';
import { Auth } from 'aws-amplify';
import { ITrainingPlanActivity } from '../../models/ITrainingPlanActivity'
import { ITrainingPlan, TrainingPlan } from '../../models/ITrainingPlan'

interface IProps {
  trainingPlanId: string,
}

interface IState {
  plan: ITrainingPlan,
  existing: ITrainingPlanActivity[]
}

export default class TrainingPlanActivityBrowser extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      this.state = {
        plan: new TrainingPlan(),
        existing: []
      };
    }
  
    async componentDidMount() {
      await this.getUsersTrainingPlan();
      await this.getUsersTrainingPlanActivites();
    }

    createActivityCallback = async (newPlan: ITrainingPlanActivity) => {
      await this.createNewActivity(newPlan)
      await this.getUsersTrainingPlanActivites()
    }


    editActivityCallback = async (editedPlan: ITrainingPlanActivity) => {
      await this.editActivity(editedPlan)
      await this.getUsersTrainingPlanActivites()
    }
  
    async handleDelete(trainingPlanActivityId: string) {
      await this.deleteTrainingPlanActivity(trainingPlanActivityId)
      await this.getUsersTrainingPlanActivites()
    }
  
    async createNewActivity(newActivity: ITrainingPlanActivity) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+this.props.trainingPlanId+"/activities", { 
        method: "POST",
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`, "Content-Type": "application/json"},
        body: JSON.stringify(newActivity)
      })
    }


    async editActivity(editedActivity: ITrainingPlanActivity) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+this.props.trainingPlanId+"/activities/"+editedActivity.id, { 
        method: "PUT",
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`, "Content-Type": "application/json"},
        body: JSON.stringify(editedActivity)
      })
    }

    async getUsersTrainingPlan(){
        let session = await Auth.currentSession()
        let result = await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+this.props.trainingPlanId, { 
            headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
        })
        let body = await result.json()
        this.setState({plan: body});
    }
  
    async getUsersTrainingPlanActivites(){
        let session = await Auth.currentSession()
        let result = await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+this.props.trainingPlanId+"/activities", { 
            headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
        })
        let body = await result.json()
        this.setState({existing: body});
    }
  
    async deleteTrainingPlanActivity(activityId: string) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+this.props.trainingPlanId+"/activities/"+activityId, { 
          method: "DELETE",
          headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
        });
    }
  
  
    render() {
      let existingItems = this.state.existing
        .map((x, i) => {
          return (<Grid key={i} item xs={12} sm={6} md={4} lg={3}>
              <Card elevation={1} style={{backgroundColor: x.complete ? "green" : ""}}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {x.name}
                </Typography>
                </CardContent>
                <CardActions>
                  <TrainingPlanActivityEditor inputActivity={x} submitCallback={this.editActivityCallback}/>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={async () => { await this.handleDelete(x.id) }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>)
        })
      return (
        <>
          <TrainingPlanActivityEditor submitCallback={this.createActivityCallback}/>
          <Grid container spacing={3}>
            {existingItems}
          </Grid>
        </>
      )
    }
  
}