import { Helmet } from "react-helmet";
import { createTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import Amplify from 'aws-amplify';
import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import TrainingPlanGrid from './components/trainingplan/TrainingPlanGrid'
import TrainingPlanActivityBrowser from './components/trainingplanactivity/TrainingPlanActivityBrowser'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

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
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const classes = useStyles();
  const toggleDrawer = (open: boolean) => (event: any) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setDrawerOpen(open);
  };
  return (
    <Router>
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
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <List>
            <ListItem button component={Link} to="/" key="dashboard">
              Dashboard
            </ListItem>
            <ListItem button component={Link} to="/trainingplans" key="trainingplans">
              Training Plans
            </ListItem>
          </List>
        </Drawer>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" onClick={toggleDrawer(true)} className={classes.menuButton} color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              PaceMe
            </Typography>
            <AmplifySignOut></AmplifySignOut>
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path="/trainingplans/:trainingPlanId" children={<TrainingPlanRouteChild />} />
          <Route path="/trainingplans">
            <TrainingPlanGrid/>
          </Route>
          <Route path="/">
            <div>dashboard</div>
          </Route>
        </Switch>
      </ThemeProvider>
    </Router>
    
  );
}

interface IRouteParameters {
  trainingPlanId: string
}

function TrainingPlanRouteChild() {
  // We can use the `useParams` hook here to access
  // the dynamic pieces of the URL.
  const { trainingPlanId } = useParams<IRouteParameters>();

  return (
    <TrainingPlanActivityBrowser trainingPlanId={trainingPlanId} />
  );
}

export default withAuthenticator(App);
