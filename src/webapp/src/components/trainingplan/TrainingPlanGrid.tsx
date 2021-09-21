import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TrainingPlanEditor from './TrainingPlanEditor';
import { Auth } from 'aws-amplify';
import { ITrainingPlan } from '../../models/ITrainingPlan';

import {
  Link
} from "react-router-dom";
interface IProps {

}

interface IState {
  existing: ITrainingPlan[]
}

export default class TrainingPlanGrid extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      this.state = {
        existing: []
      };
    }
  
    async componentDidMount() {
      await this.getUsersTrainingPlans();
    }

    createPlanCallback = async (newPlan: ITrainingPlan) => {
      await this.createNewPlan(newPlan)
      await this.getUsersTrainingPlans()
    }


    editPlanCallback = async (editedPlan: ITrainingPlan) => {
      await this.editPlan(editedPlan)
      await this.getUsersTrainingPlans()
    }
  
    async handleDelete(traingPlanId: string) {
      await this.deleteTrainingPlan(traingPlanId)
      await this.getUsersTrainingPlans()
    }
  
    async createNewPlan(newplan: ITrainingPlan) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans", { 
        method: "POST",
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`, "Content-Type": "application/json"},
        body: JSON.stringify(newplan)
      })
    }


    async editPlan(editedPlan: ITrainingPlan) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+editedPlan.id, { 
        method: "PUT",
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`, "Content-Type": "application/json"},
        body: JSON.stringify(editedPlan)
      })
    }
  
    async getUsersTrainingPlans(){
        let session = await Auth.currentSession()
        let result = await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans", { 
            headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
        })
        let body = await result.json()
        this.setState({existing: body});
    }
  
    async deleteTrainingPlan(trainingPlanId: string) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+trainingPlanId, { 
          method: "DELETE",
          headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
        });
    }
  
  
    render() {
      let existingItems = this.state.existing
        .map((x, i) => {
          return (<Grid key={i} item xs={12} sm={6} md={4} lg={3}>
              <Card elevation={1} style={{backgroundColor: x.active ? "green" : ""}}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {x.name}
                </Typography>
                </CardContent>
                <CardActions>                
                  <Button variant="contained" color="primary" component={Link} to={"/trainingplans/"+x.id}>
                    Activities
                  </Button>
                  <TrainingPlanEditor inputPlan={x} submitCallback={this.editPlanCallback}/>
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
          <TrainingPlanEditor submitCallback={this.createPlanCallback}/>
          <Grid container spacing={3}>
            {existingItems}
          </Grid>
        </>
      )
    }
  
}