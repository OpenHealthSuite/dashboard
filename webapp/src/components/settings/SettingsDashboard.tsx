import { Flex } from '@chakra-ui/react'
import { DashboardSettingsControl } from './sections/DashboardSettingsControl'
import ProviderSettings from './sections/ProviderSettings'

export default function SettingsDashboard() {
    return (<Flex gap="2em" flexDirection="column">
        <ProviderSettings />
        <DashboardSettingsControl />
    </Flex>)
}
