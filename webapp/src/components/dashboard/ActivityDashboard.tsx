import { useContext } from "react";
import { AvailableTiles, IAvailableTiles } from "./tiles";
import { DashboardSettingsContext } from "../../App";
import { Flex } from "@chakra-ui/react";

interface IDashboardProps {
  availableTiles?: IAvailableTiles;
}

// eslint-disable-next-line no-empty-pattern
export function ActivityDashboard({
  availableTiles = AvailableTiles,
}: IDashboardProps) {
  const settingsContext = useContext(DashboardSettingsContext);
  const dashboardSettings = settingsContext?.dashboardSettings;
  if (settingsContext && dashboardSettings) {
    return (
      <Flex display="grid"
        gridTemplateColumns="repeat(3, minmax(200px, 1fr))"
        gridAutoRows="minmax(100px, auto)"
        gap="1em"
        padding="1em"
        >
        {dashboardSettings.tileSettings
          .filter((ts) =>
            Object.keys(availableTiles).includes(ts.componentName)
          )
          .map((ts) => availableTiles[ts.componentName])
          .map((tile, i) => {
            return (
              <Flex
                border="1px solid gray"
                borderRadius="1em"
                padding="1em"
                key={`gridkey-${i}`}
              >
                <tile.component />
              </Flex>
            );
          })}
      </Flex>
    );
  }
  if (settingsContext) {
    return <>Error</>;
  }
  return <>Loading</>;
}
