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
import { TrainingPlanActivity, ITrainingPlanActivity } from '../../models/ITrainingPlanActivity';
import MobileDatePicker from '@mui/lab/MobileDatePicker';

interface ITrainingPlanActivityEditorProps {
  inputActivity?: ITrainingPlanActivity,
  inputDate?: Date,
  submitCallback: (activity: ITrainingPlanActivity) => any,
  open: boolean
}

interface ITrainingPlanActivityEditorState {
  activityEditing: ITrainingPlanActivity,
  open: boolean
}

export default class TrainingPlanActivityEditor extends React.Component<ITrainingPlanActivityEditorProps, ITrainingPlanActivityEditorState> {
    constructor(props: ITrainingPlanActivityEditorProps) {
      super(props);
      this.state = {
        open: false,
        activityEditing: new TrainingPlanActivity(new Date())
      };
      this.handleOpen = this.handleOpen.bind(this);
      this.handleClose = this.handleClose.bind(this);

      this.handleEditComplete = this.handleEditComplete.bind(this);
      this.handleEditName = this.handleEditName.bind(this);
      this.handleEditDateTime = this.handleEditDateTime.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleEditName(event: any) {    
      var plan = {...this.state.activityEditing}
      plan.name = event.target.value
      this.setState({activityEditing: plan});  
    }

    handleEditComplete(event: any) {    
      var plan = {...this.state.activityEditing}
      plan.complete = event.target.checked
      this.setState({activityEditing: plan});  
    }

    handleEditDateTime(date: Date | null) {    
      var plan = {...this.state.activityEditing}
      plan.activityTime = date ?? new Date();
      this.setState({activityEditing: plan});  
    }

    componentDidUpdate(prevProps: ITrainingPlanActivityEditorProps) {
      if (!prevProps.open && this.props.open) {
        this.handleOpen()
      }
    }


    handleOpen() {
        this.setState(
            {
                open: true,
                activityEditing: this.props.inputActivity || new TrainingPlanActivity(this.props.inputDate || new Date())
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
        this.props.submitCallback(this.state.activityEditing);
        this.handleClose()
    }
  
    render() {
      return (
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
                {this.props.inputActivity ? "Edit Activity" : "Create Activity"}
              </Typography>
              <TextField id="name" label="Name" value={this.state.activityEditing.name} onChange={this.handleEditName}/>
              <FormGroup row>
                <FormControlLabel
                  control={<Switch checked={this.state.activityEditing.complete} onChange={this.handleEditComplete} name="Complete" />}
                  label="Complete"
                />
              </FormGroup>
              <FormGroup>
                <MobileDatePicker
                  label="Activity Date"
                  inputFormat="yyyy/MM/dd"
                  value={this.state.activityEditing.activityTime}
                  onChange={this.handleEditDateTime}
                  renderInput={(params) => <TextField {...params} />}
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
      )
    }
  
  }
