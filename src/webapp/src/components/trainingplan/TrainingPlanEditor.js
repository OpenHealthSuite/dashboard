import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Modal from '@material-ui/core/Modal';

export default class TrainingPlanEditor extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        open: false,
        planEditing: {}
      };

      this.handleEditActive = this.handleEditActive.bind(this);
      this.handleEditName = this.handleEditName.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    componentDidMount() {
      this.getUsersTrainingPlans();
    }
  
    handleEditName(event) {    
      this.setState({planEditing: {name: event.target.value}});  
    }

    handleEditActive(event) {    
      this.setState({planEditing: {active: event.target.value}});  
    }

    handleOpen() {
        this.setState(
            {
                open: true,
                planEditing: this.props.inputPlan || { name: "", active: false} 
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
        <form noValidate autoComplete="off" onSubmit={this.handleSubmit}>
        <TextField id="name" label="Name" value={this.state.planEditing.name} onChange={this.handleEditName}/>
            <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            >
            Save
        </Button>
        </form>
        </Modal>
        </>
      )
    }
  
  }
