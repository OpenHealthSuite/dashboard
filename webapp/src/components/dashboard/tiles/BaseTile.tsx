import { ReactNode } from 'react';
import { CardHeader, Card, CardContent } from '@mui/material';
import { LoadingIndicator } from '../../shared/LoadingIndicator';

interface IDashboardTileProps {
  headerText?: string,
  children: ReactNode,
  loading?: boolean,
  refreshDetails?: {
    refreshInterval: number,
    remaining: number
  }
}

export function DashboardTile({ headerText, children, loading = false, refreshDetails }: IDashboardTileProps) {
  const cardHeader = headerText ? <CardHeader title={headerText} /> : null
  const refreshBar = refreshDetails ? <div style={{ height: "0.5em", width: `${(refreshDetails.remaining / refreshDetails.refreshInterval) * 100}%`, backgroundColor: "rgba(255,255,255,0.2)" }}></div> : null
  return (<Card>
    {cardHeader}
    <CardContent>
      <LoadingIndicator loading={loading}>
        {children}
      </LoadingIndicator>
    </CardContent>
    {refreshBar}
  </Card>)
}