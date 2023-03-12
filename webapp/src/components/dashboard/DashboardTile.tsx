import { Box, Flex, Text } from "@chakra-ui/react";
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
    <Flex 
      minHeight="100%"
      width="100%"
      position="relative"
      flexDirection="column"
      justifyContent="center"
      data-testid="card" onClick={() => dataGetterFunction(setIsErrored, setIsLoading, setData, dataRetreivalFunction)}>
      <Box data-testid="card-content" paddingBottom="3rem">{children}</Box>
      {headerText && <Text as="span" data-testid="card-header" 
        width="100%"
        textAlign="center"
        position="absolute"
        bottom="0"
        >{headerText}</Text>}
      <Flex position="absolute"
        bottom="0"
        width="100%"
        flexDirection="row"
        padding="0.3rem">
        {isLoading && <Text as="span" data-testid="card-loading">Loading</Text>}
        {isErrored && <Text as="span" data-testid="card-error">Error</Text>}
      </Flex>
    </Flex>
  );
}
