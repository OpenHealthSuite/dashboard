import { ReactNode } from 'react'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface ILoadingProps {
    children: ReactNode,
    loading: boolean
}

export function LoadingIndicator(props: ILoadingProps) {
    if (props.loading) {
        return <div className="loading-fill">
            <Card>
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                    Loading...
                    </Typography>
                </CardContent>
            </Card>
        </div>
    }
    return(
        <>{props.children}</>
    )
}