import { Flex } from '@chakra-ui/react'
import { DashboardSettingsControl } from './sections/DashboardSettingsControl'
import ProviderAuthenticationSettings from './sections/ProviderAuthenticationSettings'

export default function SettingsDashboard() {
    return (<Flex gap="2em" flexDirection="column">
        <ProviderAuthenticationSettings />
        <DashboardSettingsControl />
    </Flex>)
}
