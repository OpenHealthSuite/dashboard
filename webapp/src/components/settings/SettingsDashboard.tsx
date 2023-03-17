import { Flex } from '@chakra-ui/react'
import { DashboardSettingsControl } from './sections/DashboardSettingsControl'
import ProviderAuthenticationSettings from './sections/ProviderAuthenticationSettings'
import { ProviderSettingsControl } from './sections/ProviderSettingsControl'

export default function SettingsDashboard() {
    return (<Flex gap="2em" flexDirection="column">
        <ProviderAuthenticationSettings />
        <ProviderSettingsControl />
        <DashboardSettingsControl />
    </Flex>)
}
