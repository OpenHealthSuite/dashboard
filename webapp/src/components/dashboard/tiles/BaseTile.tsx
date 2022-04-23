import { ReactNode } from 'react';
import { CardHeader, Card, CardContent } from '@mui/material';
import { LoadingCard } from '../../shared/LoadingCard';

interface IDashboardTileProps {
  headerText?: string,
  children: ReactNode,
  loading?: boolean,
  errored?: boolean,
  refreshDetails?: {
    refreshInterval: number,
    remaining: number
  }
}

export function DashboardTile({ headerText, children, loading = false, errored = false, refreshDetails }: IDashboardTileProps) {
  const cardHeader = headerText ? <CardHeader title={headerText} /> : null
  const refreshBar = refreshDetails ? <div style={{ height: "0.5em", width: `${(refreshDetails.remaining / refreshDetails.refreshInterval) * 100}%`, backgroundColor: "rgba(255,255,255,0.2)" }}></div> : null
  return (<Card>
    {cardHeader}
    <CardContent>
      <LoadingCard loading={loading}>
        {errored ? <>Something has gone wrong...</> : children}
      </LoadingCard>
    </CardContent>
    {refreshBar}
  </Card>)
}