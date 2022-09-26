import { Helmet } from "react-helmet";
import {
  BrowserRouter as Router,
} from "react-router-dom";

import { Root } from './components/Root' 

function App() {
  return (
    <Router>
      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Helmet>
      <Root />
    </Router>
    
  );
}


export default App;
