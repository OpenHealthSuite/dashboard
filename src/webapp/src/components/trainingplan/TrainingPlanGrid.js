import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Auth } from 'aws-amplify';

export default class TrainingPlanGrid extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        existing: [],
        new: {name: ''}
      };
  
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    componentDidMount() {
      this.getUsersTrainingPlans();
    }
  
    handleChange(event) {    
      this.setState({new: {name: event.target.value}});  
    }
  
    async handleSubmit(event) {
      event.preventDefault();
      await this.createNewPlan(this.state.new)
      await this.getUsersTrainingPlans()
    }
  
    async handleDelete(traingPlanId) {
      await this.deleteTrainingPlan(traingPlanId)
      await this.getUsersTrainingPlans()
    }
  
    async createNewPlan(newplan) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans", { 
        method: "POST",
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`, "Content-Type": "application/json"},
        body: JSON.stringify(newplan)
      })
      this.setState({new: {name: '', userId: newplan.userId}})
    }
  
    async getUsersTrainingPlans(){
        let session = await Auth.currentSession()
        let result = await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans", { 
            headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
        })
        let body = await result.json()
        this.setState({existing: body});
    }
  
    async deleteTrainingPlan(trainingPlanId) {
      let session = await Auth.currentSession()
      await fetch(process.env.REACT_APP_API_ROOT+"/trainingplans/"+trainingPlanId, { 
          method: "DELETE",
          headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
        });
    }
  
  
    render() {
      let existingItems = this.state.existing.map((x, i) => {
        return (<Grid key={i} item xs={12}>
            <Paper>{x.name}
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              onClick={async () => { await this.handleDelete(x.id) }}
            >
              Delete
            </Button>
            </Paper>
          </Grid>)
      })
      return (
        <Grid container spacing={3}>
          {existingItems}
          <Grid item xs={12}>
          <form noValidate autoComplete="off" onSubmit={this.handleSubmit}>
            <TextField id="name" label="Name" value={this.state.value} onChange={this.handleChange}/>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Save
            </Button>
          </form>
          </Grid>
        </Grid>
      )
    }
  
  }