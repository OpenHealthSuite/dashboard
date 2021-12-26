import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TrainingPlanEditor from './TrainingPlanEditor';
import { ITrainingPlan } from '../../models/ITrainingPlan';

import { 
  createNewPlan,
  deletePlan,
  editPlan,
  getUserPlans 
} from '../../services/TrainingPlanService';

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
      await createNewPlan(newPlan)
      await this.getUsersTrainingPlans()
    }

    editPlanCallback = async (editedPlan: ITrainingPlan) => {
      await editPlan(editedPlan)
      await this.getUsersTrainingPlans()
    }
  
    async handleDelete(trainingPlanId: string) {
      await deletePlan(trainingPlanId)
      await this.getUsersTrainingPlans()
    }
  
    async getUsersTrainingPlans(){
        this.setState({existing: await getUserPlans()});
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