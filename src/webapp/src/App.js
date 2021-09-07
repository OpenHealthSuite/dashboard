import { Helmet } from "react-helmet";
import { createTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import Amplify, { Auth } from 'aws-amplify';
import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const configuration = {
  apiRoot: process.env.REACT_APP_API_ROOT,
  cognito: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_CLIENTID,
    mandatorySignIn: true,
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    cookieStorage: {
          domain: process.env.REACT_APP_AWS_COOKIE_STORAGE_DOMAIN, //.yourdomain.com
          path: '/',
          expires: 365,
          sameSite: process.env.NODE_ENV !== 'production' ? "lax" : "strict",
          secure: process.env.NODE_ENV !== 'production'
    },
    oauth: {
      domain: process.env.REACT_APP_AWS_OAUTH_DOMAIN,
      scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      redirectSignIn: process.env.REACT_APP_AWS_OAUTH_REDIRECTSIGNIN,
      redirectSignOut: process.env.REACT_APP_AWS_OAUTH_REDIRECTSIGNOUT,
      responseType: 'code'
    }
  }
}

Amplify.configure({
  Auth: configuration.cognito
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

function App() {

  const theme = createTheme({
    palette: {
      type: 'dark',
    },
  });
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Helmet>
      <CssBaseline />

      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            PaceMe
          </Typography>
          <AmplifySignOut></AmplifySignOut>
        </Toolbar>
      </AppBar>
      <TrainingPlanGrid>

      </TrainingPlanGrid>
    </ThemeProvider>
  );
}

class TrainingPlanGrid extends React.Component {
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

  handleSubmit(event) {
    this.createNewPlan(this.state.new).then(() => this.getUsersTrainingPlans())
    event.preventDefault();
  }

  handleDelete(traingPlanId) {
    this.deleteTrainingPlan(traingPlanId).then(() => this.getUsersTrainingPlans())
  }

  createNewPlan(newplan) {
    console.log(newplan)
    return Auth.currentSession().then(session => {
      fetch(configuration.apiRoot+"/trainingplans", { 
        method: "POST",
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`, "Content-Type": "application/json"},
        body: JSON.stringify(newplan)
      }).then(() => this.setState({new: {name: '', userId: newplan.userId}}));
    })
  }

  getUsersTrainingPlans(){
    return Auth.currentSession().then(session => {
      fetch(configuration.apiRoot+"/trainingplans", { 
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
      }).then((res) => 
      {
        return res.json()
      }
      ).then(results => this.setState({existing: results}));
    })
  }

  deleteTrainingPlan(trainingPlanId) {
    return Auth.currentSession().then(session => {
      fetch(configuration.apiRoot+"/trainingplans/"+trainingPlanId, { 
        method: "DELETE",
        headers: {Authorization: `Bearer ${session.getIdToken().getJwtToken()}`}
      });
    })
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
            onClick={() => {this.handleDelete(x.id)}}
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

export default withAuthenticator(App);
