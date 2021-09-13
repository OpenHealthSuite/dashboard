import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Modal from '@material-ui/core/Modal';

export default class TrainingPlanActivityEditor extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        open: false,
        activityEditing: {}
      };
      this.handleOpen = this.handleOpen.bind(this);
      this.handleClose = this.handleClose.bind(this);

      this.handleEditComplete = this.handleEditComplete.bind(this);
      this.handleEditName = this.handleEditName.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleEditName(event) {    
      var plan = {...this.state.activityEditing}
      plan.name = event.target.value
      this.setState({activityEditing: plan});  
    }

    handleEditComplete(event) {    
      var plan = {...this.state.activityEditing}
      plan.complete = event.target.checked
      this.setState({activityEditing: plan});  
    }

    handleOpen() {
        this.setState(
            {
                open: true,
                activityEditing: this.props.inputActivity || { name: "", active: false} 
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


    async handleSubmit(event) {
        event.preventDefault();
        this.props.submitCallback(this.state.activityEditing);
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
            {this.props.inputPlan ? "Edit Activity" : "Create Activity"}
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
                {this.props.inputPlan ? "Edit Activity" : "Create Activity"}
              </Typography>
              <TextField id="name" label="Name" value={this.state.activityEditing.name} onChange={this.handleEditName}/>
              <FormGroup row>
                <FormControlLabel
                  control={<Switch checked={this.state.activityEditing.complete} onChange={this.handleEditComplete} name="Complete" />}
                  label="Complete"
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
