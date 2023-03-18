import { useContext, useEffect, useState } from "react";
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
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  if (settingsContext && dashboardSettings) {
    return (
      <Flex width={"100%"} flexDirection={'column'} alignItems={'center'}>
        <Flex display="grid"
          maxWidth={"1280px"}
          gridTemplateColumns={`repeat(${Math.min(Math.floor(screenWidth / 320), 3)}, minmax(320px, 1fr))`}
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
      </Flex>
    );
  }
  if (settingsContext) {
    return <>Error</>;
  }
  return <>Loading</>;
}
