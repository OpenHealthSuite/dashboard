import { useContext } from 'react';
import { DashboardSettingsContext } from '../../../App';
import { AvailableTiles, IAvailableTile } from '../../dashboard/tiles'
import { Button, Container, Flex, Heading, ListItem, UnorderedList, Text } from '@chakra-ui/react';

export const DashboardSettingsControl = () => {
    const settingsContext = useContext(DashboardSettingsContext);
    const enabledTileKeys = (settingsContext?.dashboardSettings.tileSettings ?? []).map(x => x.componentName);
    const disabled = Object.entries(AvailableTiles);

    const enabled= enabledTileKeys.reduce<[string, IAvailableTile][]>((en, tile) => {
        const inx = disabled.findIndex(x => x[0] === tile)
        if (inx > -1) {
            const tile = disabled.splice(inx, 1)[0];
            return [...en, [tile[0], tile[1]]]
        }
        return en;
    }, [])

    const lastIndex = Object.keys(enabled).length - 1;
    
    return <Flex flexWrap="wrap">
        <Container maxWidth="420px">
            <Heading as="h5">Enabled Tiles</Heading>
            <UnorderedList margin={0} 
                gap={"0.5em"} 
                display={"flex"}
                flexDirection={"column"}
                listStyleType={"none"}>
            {enabled.map(([key, tile], i) => {
                return <ListItem key={key}
                    display={"flex"}
                    justifyContent="flex-start"
                    alignItems="center">
                    <Flex minWidth={"100px"}
                        alignItems={"center"} 
                        justifyContent={"space-between"}
                        marginRight="1em">
                        {i !== 0 && <Button justifySelf={"flex-start"} aria-label="up" onClick={() => {
                            if (settingsContext) {
                                let {dashboardSettings, setDashboardSettings} = settingsContext;
                                let reinsert = dashboardSettings.tileSettings.splice(i, 1);
                                dashboardSettings.tileSettings = [
                                    ...dashboardSettings.tileSettings.splice(0, i - 1),
                                    ...reinsert,
                                    ...dashboardSettings.tileSettings,
                                ]
                                setDashboardSettings(dashboardSettings);
                            }
                        }}>&uarr;</Button>}
                        {i !== lastIndex && <Button justifySelf={"flex-end"} aria-label="down" onClick={() => {
                            if (settingsContext) {
                                let {dashboardSettings, setDashboardSettings} = settingsContext;
                                let reinsert = dashboardSettings.tileSettings.splice(i, 1);
                                dashboardSettings.tileSettings = [
                                    ...dashboardSettings.tileSettings.splice(0, i + 1),
                                    ...reinsert,
                                    ...dashboardSettings.tileSettings,
                                ]
                                setDashboardSettings(dashboardSettings);
                            }
                        }}>&darr;</Button>}
                    </Flex>
                    <Text as="span">{tile.displayName}</Text>
                    <Button marginLeft="auto" onClick={() => {
                        if (settingsContext) {
                            let {dashboardSettings, setDashboardSettings} = settingsContext;
                            dashboardSettings.tileSettings = dashboardSettings.tileSettings.filter(x => x.componentName !== key)
                            setDashboardSettings(dashboardSettings);
                        }
                    }}>Disable</Button>
                </ListItem>
            })}
            </UnorderedList>
        </Container>
        <Container maxWidth="420px">
        <Heading as="h5">Other Available Tiles</Heading>
        <UnorderedList margin={0} 
                gap={"0.5em"} 
                display={"flex"}
                flexDirection={"column"}
                listStyleType={"none"}>
            {disabled.map(([key, tile], i) => {
                return <ListItem key={key}  
                        display={"flex"}
                        justifyContent="flex-start"
                        alignItems="center">
                    <Text as="span">{tile.displayName}</Text>
                    <Button marginLeft="auto" onClick={() => {
                        if (settingsContext) {
                            let {dashboardSettings, setDashboardSettings} = settingsContext;
                            dashboardSettings.tileSettings.push({ componentName: key })
                            setDashboardSettings(dashboardSettings);
                        }
                    }}>Enable</Button>
                </ListItem>
            })}

        </UnorderedList>
        </Container>
    </Flex>
}