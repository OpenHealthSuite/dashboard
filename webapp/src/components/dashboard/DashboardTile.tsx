import { CardHeader, Card, CardContent } from '@mui/material';

export interface IDashboardTileProps {
  headerText?: string
  children?: JSX.Element
  loading?: boolean
  error?: boolean
}

export function DashboardTile({ headerText, children, loading, error }: IDashboardTileProps): JSX.Element {
  return <Card>
    {headerText && <CardHeader data-testid="card-header" title={headerText} />}
    <CardContent data-testid="card-content">
      {children}
    </CardContent>
    {loading && <div className="loading-indicator" data-testid="card-loading">Loading...</div>}
    {error && <div className="error-indicator" data-testid="card-error">Error</div>}
  </Card>
}