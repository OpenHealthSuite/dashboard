import { ReactNode } from 'react';
import { CardHeader, Card, CardContent } from '@mui/material';
import { LoadingIndicator } from '../../shared/LoadingIndicator';

interface IDashboardTileProps {
  headerText?: string,
  children: ReactNode,
  loading?: boolean
}

export function DashboardTile({ headerText, children, loading = false }: IDashboardTileProps) {
  const cardHeader = headerText ? <CardHeader title={headerText} /> : null
  return (<Card>
    {cardHeader}
    <CardContent>
      <LoadingIndicator loading={loading}>
        {children}
      </LoadingIndicator>
    </CardContent>

  </Card>)
}