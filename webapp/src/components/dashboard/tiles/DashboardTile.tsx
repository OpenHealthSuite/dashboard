import { CardHeader, Card, CardContent } from '@mui/material';

interface IDashboardTileProps {
  headerText?: string
  children?: JSX.Element
}

export function DashboardTile({ headerText, children }: IDashboardTileProps): JSX.Element {
  const header = headerText ? <CardHeader data-testid="card-header" title={headerText} /> : null
  return <Card>
    {header}
    <CardContent data-testid="card-content">
      {children}
    </CardContent>
  </Card>
}