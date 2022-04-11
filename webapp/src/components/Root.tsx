import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import Drawer from '@mui/material/Drawer';
import ActivityDashboard from './dashboard/ActivityDashboard'
import SettingsDashboard from './settings/SettingsDashboard'

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
import { redeemCode } from '../services/ProvidersService'
import { Fab } from '@mui/material';


interface ICallbackParameters {
    serviceId: string
}

function CallbackRouteChild() {
    const { serviceId } = useParams<ICallbackParameters>();  
    const searchParams = new URLSearchParams(useLocation().search);
    const navigate = useHistory();
    
    switch (serviceId) {
        case "fitbitauth":
            redeemCode('fitbit', searchParams.get('code') ?? '').finally(() => navigate.push('/settings'))
            return <>Redeeming Fitbit Authentication Token...</>;
        default:
            // TODO: Error into a snackbar
            navigate.push('/settings')
            return <>Error redeeming token</>;
    }
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
            </Drawer>
            <div className={classes.fabContainer}>
                <Fab color="primary" aria-label="menu" onClick={toggleDrawer(true)} >
                    <MenuIcon />
                </Fab>
            </div>
            <Switch>
                <Route path="/callback/:serviceId" children={<CallbackRouteChild />}/>
                <Route path="/settings" children={<SettingsDashboard />} />
                <Route path="/" children={<ActivityDashboard />} />
            </Switch>
        </>
    )
}