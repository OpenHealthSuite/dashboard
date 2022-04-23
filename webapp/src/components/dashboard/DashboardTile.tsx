import { CardHeader, Card, CardContent } from "@mui/material";
import { useEffect, useState } from "react";

export interface IDashboardTileProps<T> {
  headerText?: string;
  children?: JSX.Element;
  dataGetterFunction?: (
    setIsErrored: (err: boolean) => void,
    setIsLoading: (lod: boolean) => void,
    setData: (data: T | undefined) => void,
    dataRetreivalFunction: () => Promise<T>
  ) => Promise<void>,
  setData: (data: T | undefined) => void;
  dataRetreivalFunction: () => Promise<T>;
  refreshIntervalms: number;
}


function baseDataGetterFunction<T>(
  setIsErrored: (err: boolean) => void,
  setIsLoading: (lod: boolean) => void,
  setData: (data: T | undefined) => void,
  dataRetreivalFunction: () => Promise<T>
): Promise<void>{
  return dataRetreivalFunction()
    .then((data: T) => {
      setData(data);
      setIsErrored(false);
    })
    .catch(() => {
      setIsErrored(true);
    })
    .finally(() => {
      setIsLoading(false);
    });
};


export function DashboardTile<T>({
  headerText,
  children,
  dataGetterFunction = baseDataGetterFunction,
  setData,
  dataRetreivalFunction,
  refreshIntervalms,
}: IDashboardTileProps<T>): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isErrored, setIsErrored] = useState<boolean>(false);
  useEffect(() => {
    dataGetterFunction(setIsErrored, setIsLoading, setData, dataRetreivalFunction);
    const interval = setInterval(() => {
      dataGetterFunction(setIsErrored, setIsLoading, setData, dataRetreivalFunction);
    }, refreshIntervalms);
    return () => clearInterval(interval);
  }, [setIsErrored, setIsLoading, setData, dataGetterFunction, dataRetreivalFunction, refreshIntervalms]);

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
