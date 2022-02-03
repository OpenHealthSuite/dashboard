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
import { Fab } from '@mui/material';

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
    const navigate = useHistory();
    
    // TODO: This is all kinds of awful
    const redeemCodeSync = async (navigate: any, serviceIdFn: string, searchParams: URLSearchParams) => {
        switch (serviceIdFn) {
            case "fitbitauth":
                //handle fitbit
                // TODO: Get code from query parameters
                // post code to api.address/users/:userId/providers/fitbit/redeem in body { code: "code" }
                // await happy response
                await redeemCode('fitbit', searchParams.get('code') ?? '')
                break;
            default:
                //error message
        }

        navigate.push('/settings')
    }



    return <button onClick={() => redeemCodeSync(navigate, serviceId, searchParams)}>Redeem Code</button>
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
    fabContainer: {
        position: 'absolute',
        right: theme.spacing(2),
        bottom: theme.spacing(2)
    }
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
            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                <List>
                    {sidebarItems}
                </List>
                <AmplifySignOut></AmplifySignOut>
            </Drawer>
            <div className={classes.fabContainer}>
                <Fab color="primary" aria-label="menu" onClick={toggleDrawer(true)} >
                    <MenuIcon />
                </Fab>
            </div>
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