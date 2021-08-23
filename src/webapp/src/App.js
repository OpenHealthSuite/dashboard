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
  apiRoot: "http://localhost:3030"
}

Amplify.configure({
  Auth: {

      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      //identityPoolId: 'arn:aws:cognito-idp:us-east-1:553904485373:userpool/us-east-1_ecXTzrIg3',

      // REQUIRED - Amazon Cognito Region
      region: 'us-east-1',

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: 'us-east-1_ecXTzrIg3',

      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolWebClientId: '7umnq9tgbavli9duos9353qsnq',

      // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
      mandatorySignIn: true,

      // OPTIONAL - Configuration for cookie storage
      // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
      cookieStorage: {
      // REQUIRED - Cookie domain (only required if cookieStorage is provided)
          domain: 'localhost', //.yourdomain.com
      // OPTIONAL - Cookie path
          path: '/',
      // OPTIONAL - Cookie expiration in days
          expires: 365,
      // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
          sameSite: "lax",//"strict" | 
      // OPTIONAL - Cookie secure flag
      // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
          secure: false
      },

      // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
      authenticationFlowType: 'USER_PASSWORD_AUTH',

      oauth: {
          domain: 'pacemewebapp.auth.us-east-1.amazoncognito.com',
          scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: 'http://localhost:3000/',
          redirectSignOut: 'http://localhost:3000/',
          responseType: 'code'
      }
  }
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
