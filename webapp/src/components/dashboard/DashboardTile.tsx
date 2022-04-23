import { CardHeader, Card, CardContent } from "@mui/material";
import { useEffect, useState } from "react";

export interface IDashboardTileProps<T> {
  headerText?: string;
  children?: JSX.Element;
  setData: (data: T | undefined) => void;
  dataGet: (
    setErr: (err: boolean) => void,
    setLoading: (lod: boolean) => void,
    setData: (data: T | undefined) => void
  ) => void;
  refreshIntervalms: number;
}

export function DashboardTile<T>({
  headerText,
  children,
  dataGet,
  setData,
  refreshIntervalms,
}: IDashboardTileProps<T>): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isErrored, setIsErrored] = useState<boolean>(false);

  useEffect(() => {
    dataGet(setIsErrored, setIsLoading, setData);
    const interval = setInterval(() => {
      dataGet(setIsErrored, setIsLoading, setData);
    }, refreshIntervalms);
    return () => clearInterval(interval);
  }, [setIsErrored, setIsLoading, setData, dataGet, refreshIntervalms]);

  return (
    <Card>
      {headerText && (
        <CardHeader data-testid="card-header" title={headerText} />
      )}
      <CardContent data-testid="card-content">{children}</CardContent>
      {isLoading && (
        <div className="loading-indicator" data-testid="card-loading">
          Loading...
        </div>
      )}
      {isErrored && (
        <div className="error-indicator" data-testid="card-error">
          Error
        </div>
      )}
    </Card>
  );
}
