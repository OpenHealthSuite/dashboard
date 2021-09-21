import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import { ITrainingPlan, TrainingPlan } from '../../models/ITrainingPlan'

interface IProps {
  inputPlan?: ITrainingPlan
  submitCallback: (activity: ITrainingPlan) => any
}

interface IState {
  open: boolean,
  planEditing: ITrainingPlan
}

export default class TrainingPlanEditor extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      this.state = {
        open: false,
        planEditing: new TrainingPlan()
      };
      this.handleOpen = this.handleOpen.bind(this);
      this.handleClose = this.handleClose.bind(this);

      this.handleEditActive = this.handleEditActive.bind(this);
      this.handleEditName = this.handleEditName.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleEditName(event: any) {    
      var plan = {...this.state.planEditing}
      plan.name = event.target.value
      this.setState({planEditing: plan});  
    }

    handleEditActive(event: any) {    
      var plan = {...this.state.planEditing}
      plan.active = event.target.checked
      this.setState({planEditing: plan});  
    }

    handleOpen() {
        this.setState(
            {
                open: true,
                planEditing: this.props.inputPlan || new TrainingPlan()
            }
        )
    }

    handleClose() {
        this.setState(
            {
                open: false
            }
        )
    }


    async handleSubmit(event: any) {
        event.preventDefault();
        this.props.submitCallback(this.state.planEditing);
        this.handleClose()
    }
  
    render() {
      return (
          <>
        <Button type="button" 
            variant="contained"
            color="primary"
            size="large"
            onClick={this.handleOpen}>
            {this.props.inputPlan ? "Edit Plan" : "Create Plan"}
        </Button>
        <Modal
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        >
          <Card elevation={3}>
            <form noValidate autoComplete="off" onSubmit={this.handleSubmit}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {this.props.inputPlan ? "Edit Plan" : "Create Plan"}
              </Typography>
              <TextField id="name" label="Name" value={this.state.planEditing.name} onChange={this.handleEditName}/>
              <FormGroup row>
                <FormControlLabel
                  control={<Switch checked={this.state.planEditing.active} onChange={this.handleEditActive} name="Active" />}
                  label="Active"
                />
              </FormGroup>
            </CardContent>
            <CardActions>
                <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                >
                Save
            </Button>
            </CardActions>
            </form>
          </Card>
        </Modal>
        </>
      )
    }
  
  }
