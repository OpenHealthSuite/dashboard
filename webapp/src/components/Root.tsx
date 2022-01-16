import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import TrainingPlanGrid from './trainingplan/TrainingPlanGrid'
import TrainingPlanActivityBrowser from './trainingplanactivity/TrainingPlanActivityBrowser'
import TrainingPlanActivityViewer from './trainingplanactivity/TrainingPlanActivityViewer'
import ActivityDashboard from './dashboard/ActivityDashboard'

import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import {
    Switch,
    Route,
    Link,
    useParams,
    useLocation,
    useHistory
} from "react-router-dom";
import { getProviderStatuses, startChallenge, redeemCode, IProviderStatus } from '../services/ProvidersService'

interface IRouteParameters {
    trainingPlanId: string,
    trainingPlanActivityId: string
}

interface ICallbackParameters {
    serviceId: string
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
    const { trainingPlanId, trainingPlanActivityId} = useParams<IRouteParameters>();

    return (
        <TrainingPlanActivityViewer trainingPlanId={trainingPlanId} trainingPlanActivityId={trainingPlanActivityId} />
    );
}

function SettingsChild() {
    const [statuses, setStatuses] = useState<IProviderStatus[]>([]);
    const [loading, setLoading] = useState(true)

    const getStatuses = async () => {
        setLoading(false)
        setStatuses(await getProviderStatuses())
    }

    useEffect(() => {
        if (loading) {
            getStatuses()
        }
    }, [loading])

    return <ul>
        {statuses.map(s => <li key={s.key}>{s.name} - {s.authenticated ? 'Authed':'Unauthed'}: <button onClick={() => GetChallenge(s.key)}>Authenticate</button></li>)}
        </ul>
}

async function GetChallenge(key: string) {
    // Send post to api.address/users/:userId/providers/:key/start to get URL w/ challenge
    // Send user to retreived URL
    const { authUrl } = await startChallenge(key)

    window.location.href = authUrl
}

function CallbackRouteChild() {
    const { serviceId } = useParams<ICallbackParameters>();  
    const searchParams = new URLSearchParams(useLocation().search);

    const [processing, setProcessing] = useState(true)

    const redeemCodeSync = async (key: string, code: string) => {
        await redeemCode(key, code)
        setProcessing(false)
    }

    const navigate = useHistory();

    useEffect(() => {
        if (!processing) {
            navigate.push('/settings')
        }
    }, [processing, navigate])

    switch (serviceId) {
        case "fitbitauth":
            //handle fitbit
            // TODO: Get code from query parameters
            // post code to api.address/users/:userId/providers/fitbit/redeem in body { code: "code" }
            // await happy response
            redeemCodeSync('fitbit', searchParams.get('code') ?? '')
            break;
        default:
            //error message
    }
    return <>Processing...</>
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
        { linkDest: '/trainingplans', name: 'TrainingPlans' },
        { linkDest: '/settings', name: 'Settings' }
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
                <Route path="/trainingplans" children={<TrainingPlanGrid />}/>
                <Route path="/callback/:serviceId" children={<CallbackRouteChild />}/>
                <Route path="/settings" children={<SettingsChild />} />
                <Route path="/" children={<ActivityDashboard />} />
            </Switch>
        </>
    )
}