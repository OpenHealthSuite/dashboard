import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import React from 'react';
import Drawer from '@mui/material/Drawer';
import TrainingPlanGrid from './trainingplan/TrainingPlanGrid'
import TrainingPlanActivityBrowser from './trainingplanactivity/TrainingPlanActivityBrowser'
import TrainingPlanActivityViewer from './trainingplanactivity/TrainingPlanActivityViewer'

import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import {
    Switch,
    Route,
    Link,
    useParams
} from "react-router-dom";

interface IRouteParameters {
    trainingPlanId: string,
    trainingPlanActivityId: string
}

function TrainingPlanRouteChild() {
    // We can use the `useParams` hook here to access
    // the dynamic pieces of the URL.
    const { trainingPlanId } = useParams<IRouteParameters>();

    return (
        <TrainingPlanActivityBrowser trainingPlanId={trainingPlanId} />
    );
}

function TrainingPlanActivityRouteChild() {
    // We can use the `useParams` hook here to access
    // the dynamic pieces of the URL.
    const { trainingPlanId, trainingPlanActivityId} = useParams<IRouteParameters>();

    return (
        <TrainingPlanActivityViewer trainingPlanId={trainingPlanId} trainingPlanActivityId={trainingPlanActivityId} />
    );
}

const useStyles = makeStyles((theme: any) => ({
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
export function Root() {
    const classes = useStyles();

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const toggleDrawer = (open: boolean) => (event: any) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setDrawerOpen(open);
    };

    const sidebarItems = 
    [
        { linkDest: '/', name: 'Dashboard' },
        { linkDest: '/trainingplans', name: 'TrainingPlans' }
    ].map(item => 
        <ListItem 
            button 
            component={Link} 
            onClick={toggleDrawer(false)} 
            to={item.linkDest} 
            key={item.name.toLowerCase().replace(' ', '')}>
                {item.name}
        </ListItem>
    )
    
    return (
        <>
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <List>
                    {sidebarItems}
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
                <Route path="/trainingplans/:trainingPlanId/activities/:trainingPlanActivityId" children={<TrainingPlanActivityRouteChild />} />
                <Route path="/trainingplans/:trainingPlanId" children={<TrainingPlanRouteChild />} />
                <Route path="/trainingplans">
                    <TrainingPlanGrid />
                </Route>
                <Route path="/">
                    <div>dashboard</div>
                </Route>
            </Switch>
        </>
    )
}