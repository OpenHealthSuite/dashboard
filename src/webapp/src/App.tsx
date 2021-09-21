import { Helmet } from "react-helmet";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Amplify from 'aws-amplify';
import {
  BrowserRouter as Router,
} from "react-router-dom";

import { Root } from './components/Root' 

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

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

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          <Root />
        </ThemeProvider>
      </LocalizationProvider>
    </Router>
    
  );
}


export default withAuthenticator(App);
