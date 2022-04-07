import { Helmet } from "react-helmet";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  BrowserRouter as Router,
} from "react-router-dom";

import { Root } from './components/Root' 

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

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


export default App;
