import { CardHeader, Card, CardContent } from '@mui/material';

interface IDashboardTileProps {
  headerText?: string
  children?: JSX.Element
  loading?: boolean
  error?: boolean
}

export function DashboardTile({ headerText, children, loading, error }: IDashboardTileProps): JSX.Element {
  const header = headerText ? <CardHeader data-testid="card-header" title={headerText} /> : null
  return <Card>
    {header}
    <CardContent data-testid="card-content">
      {children}
    </CardContent>
    {loading && <div className="loading-indicator" data-testid="card-loading">Loading...</div>}
    {error && <div className="error-indicator" data-testid="card-error">Error</div>}
  </Card>
}