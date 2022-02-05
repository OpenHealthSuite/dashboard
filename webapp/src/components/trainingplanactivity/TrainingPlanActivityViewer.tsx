import React from 'react';
import { TrainingPlanActivity, ITrainingPlanActivity, ITrainingPlanActivitySegment, ITrainingPlanActivitySegmentIntervals } from '../../models/ITrainingPlanActivity';
import Button from '@mui/material/Button';
import * as H from 'history'
import Modal from '@mui/material/Modal';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import { Link, withRouter } from 'react-router-dom';
import { getActivity, deleteActivity, editActivity } from '../../services/TrainingPlanActivityService';

interface ITrainingPlanActivityViewerProps {
  trainingPlanId: string,
  trainingPlanActivityId: string,
  match: any,
  location: any,
  history: H.History
}

interface ITrainingPlanActivityViewerState {
  activityLoaded: boolean,
  activityViewing: ITrainingPlanActivity,
  segmentEditorOpen: boolean
}

interface IActivityEditorProps {
  inputSegment?: ITrainingPlanActivitySegment,
  closeModalCallback: () => void,
  submitCallback: (segment: ITrainingPlanActivitySegment) => Promise<void>,
  open: boolean
}


interface IActivityEditorState {
  segment: ITrainingPlanActivitySegment,
  newInterval: ITrainingPlanActivitySegmentIntervals
}

class ActivitySegmentEditor extends React.Component<IActivityEditorProps, IActivityEditorState> {

  constructor(props: IActivityEditorProps) {
    super(props)
    this.state = {
      segment: props.inputSegment ?? {
        order: 0,
        details: '',
        repetitions: 1,
        intervals: []
      },
      newInterval: {
        note: '',
        durationSeconds: 0,
        order: 0
      }
    }
    this.updateDetails = this.updateDetails.bind(this)
    this.updateRepetitions = this.updateRepetitions.bind(this)

    this.updateNewDurationSeconds = this.updateNewDurationSeconds.bind(this)    

    this.updateNewIntervalNote = this.updateNewIntervalNote.bind(this)   
    
    this.deleteIntervalIndex = this.deleteIntervalIndex.bind(this)
    this.addInterval = this.addInterval.bind(this)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidUpdate(prevProps: IActivityEditorProps) {
    if (!prevProps.open && this.props.open) {
      this.setState({
        segment: this.props.inputSegment ?? {
          order: 0,
          details: '',
          repetitions: 1,
          intervals: []
        }
      })
    }
  }

  updateDetails(event: any) {    
    const segment = {...this.state.segment}
    segment.details = event.target.value
    this.setState({segment: segment});  
  }

  updateRepetitions(event: any) {    
    const segment = {...this.state.segment}
    segment.repetitions = event.target.value
    this.setState({segment: segment});  
  }

  updateNewDurationSeconds(event: any) {
    const interval = {...this.state.newInterval}
    interval.durationSeconds = event.target.value
    this.setState({newInterval: interval});  
  }

  updateNewIntervalNote(event: any) {
    const interval = {...this.state.newInterval}
    interval.note = event.target.value
    this.setState({newInterval: interval});  
  }

  deleteIntervalIndex(index: number) {
    const segment = this.state.segment
    segment.intervals.splice(index, 1)
    segment.intervals = segment.intervals.map((x, i) => { x.order = i; return x })
    this.setState({ segment: segment })
  }

  addInterval() {
    const interval = this.state.newInterval
    const segment = this.state.segment
    interval.order = Math.max(...segment.intervals.map(x => x.order)) + 1
    segment.intervals.push(interval)
    this.setState({
      segment: segment,
      newInterval: {
        note: '',
        durationSeconds: 0,
        order: 0
      }
    })
  }

  get newIntervalInvalid(): boolean {
    return !this.state.newInterval.note || 
      !this.state.newInterval.note.trim() || 
      !this.state.newInterval.durationSeconds || 
      this.state.newInterval.durationSeconds < 1
  }
  
  async handleSubmit(event: any) {
    event.preventDefault();
    await this.props.submitCallback(this.state.segment)
  }

  handleClose() {
    this.props.closeModalCallback()
  }

  render() {
    return (
      <Modal
      open={this.props.open}
      onClose={this.handleClose}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description" 
      >
        <Card elevation={3}>
          <form noValidate autoComplete="off" onSubmit={this.handleSubmit}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {this.props.inputSegment ? "Edit Segment" : "Create Segment"}
            </Typography>
            <TextField id="details" label="Details" value={this.state.segment.details} onChange={this.updateDetails}/>
            <TextField InputProps={{ inputProps: { min: 1, max: 1000 } }} id="repetitions" type="number" label="Repetitions" value={this.state.segment.repetitions} onChange={this.updateRepetitions}/>
            <h4>Intervals</h4>
            <ul>
            {this.state.segment.intervals.map((val, i) => <li key={`interval-${i}`}>
              {val.durationSeconds} seconds, {val.note}
              <Button type="button" onClick={() => { this.deleteIntervalIndex(i) }}></Button>
            </li>)}
            </ul>
            <FormGroup key={`intervalform`}>
              <TextField type="number" InputProps={{ inputProps: { min: 1 } }} id="durationSeconds" label="Duration (seconds)" value={this.state.newInterval.durationSeconds} onChange={this.updateNewDurationSeconds}/>
              <TextField id="note" label="Note" value={this.state.newInterval.note} onChange={this.updateNewIntervalNote}/>
            </FormGroup>
            <Button type="button" disabled={this.newIntervalInvalid} onClick={() => this.addInterval()}>Add Interval</Button>
          </CardContent>
          <CardActions>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              >
              {this.props.inputSegment ? "Update" : "Create"}
            </Button>
          </CardActions>
          </form>
        </Card>
      </Modal>
    )
  }
}

class TrainingPlanActivityViewer extends React.Component<ITrainingPlanActivityViewerProps, ITrainingPlanActivityViewerState> {
  constructor(props: ITrainingPlanActivityViewerProps) {
    super(props);
    this.state = {
      activityLoaded: false,
      activityViewing: new TrainingPlanActivity(new Date()),
      segmentEditorOpen: false
    };
    this.getStateActivity = this.getStateActivity.bind(this)
    this.handleDeleteTrainingPlanActivity = this.handleDeleteTrainingPlanActivity.bind(this)
    this.createSegment = this.createSegment.bind(this)
    this.createSegmentCallback = this.createSegmentCallback.bind(this)
    this.closeEditor = this.closeEditor.bind(this)
  }

  get activityCalendarPath(): string {
    return "/trainingplans/"+this.props.trainingPlanId+"/activities/"
  }

  componentDidMount() {
    this.getStateActivity()
  }

  async getStateActivity() {
    const activity = await getActivity(this.props.trainingPlanId, this.props.trainingPlanActivityId)
    if (activity === undefined) {
      // TODO: Add a toast saying something has gone wrong
      window.location.href = '/'
    } else {
      this.setState({
        activityViewing: activity,
        activityLoaded: true
      });
    }
  }

  async handleDeleteTrainingPlanActivity() {
    await deleteActivity(this.props.trainingPlanId, this.props.trainingPlanActivityId)
    this.props.history.push(this.activityCalendarPath)
  }

  async handleDeleteSegment(segmentIndex: number) {
    const activity = this.state.activityViewing
    activity.segments.splice(segmentIndex, 1)
    activity.segments = activity.segments.sort((a, b) => a.order - b.order).map((x, i) => { x.order = i; return x})
    this.setState({ activityViewing: activity })
    await editActivity(this.state.activityViewing)
  }

  createSegment() {
    this.setState({segmentEditorOpen: true})
  }

  async createSegmentCallback(segment: ITrainingPlanActivitySegment): Promise<void> {
    const activity = this.state.activityViewing
    segment.order = Math.max(...activity.segments.map(x => x.order)) + 1
    activity.segments.push(segment)
    await editActivity(activity)
    this.closeEditor()
  }

  closeEditor() {
    this.setState({segmentEditorOpen: false})
  }

  render() {
    let content = <div>Loading...</div>
    if (this.state.activityLoaded) {
      content = <div>
        <h2>{this.state.activityViewing.name}</h2>
        <dl>
          <dt>Activity Date</dt>
          <dd>{this.state.activityViewing.activityTime.toISOString()}</dd>
          <dt>Activity Complete</dt>
          <dd>{this.state.activityViewing.complete ? "Yes" : "No"}</dd>
        </dl>
        <hr/>
        <Button color="warning" onClick={this.handleDeleteTrainingPlanActivity}>Delete</Button>
        <hr/>
        <h4>Segments</h4>
        <ul>
          {this.state.activityViewing.segments.map((x: ITrainingPlanActivitySegment, i: number) => <li key={`segment-${x.order}`}>{x.details}
          <Button color="warning" onClick={() => { this.handleDeleteSegment(i) }}>Delete</Button></li>)}
        </ul>
        <ActivitySegmentEditor open={this.state.segmentEditorOpen} submitCallback={this.createSegmentCallback} closeModalCallback={this.closeEditor} ></ActivitySegmentEditor>
        <Button color="primary" onClick={this.createSegment}>Add Segment</Button>
      </div>
    }
    return (
      <>
      <Button component={Link} to={this.activityCalendarPath}>Back to Activities Calendar</Button>
      <hr/>
      {content}
      </>
    )
  }
}

export default withRouter(TrainingPlanActivityViewer)