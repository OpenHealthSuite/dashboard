import { CardHeader, Card, CardContent } from "@mui/material";
import { Error, Pending } from '@mui/icons-material';
import { useEffect, useState } from "react";
import "./DashboardTile.scss";

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


export function baseDataGetterFunction<T>(
  setIsErrored: (err: boolean) => void,
  setIsLoading: (lod: boolean) => void,
  setData: (data: T | undefined) => void,
  dataRetreivalFunction: () => Promise<T>
): Promise<void>{
  setIsLoading(true);
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
      {headerText && <CardHeader data-testid="card-header" title={headerText} />}
      <CardContent data-testid="card-content">{children}</CardContent>
      <div className="status-bar">
        {isLoading && <Pending data-testid="card-loading" />}
        {isErrored && <Error data-testid="card-error"/>}
      </div>
    </Card>
  );
}
