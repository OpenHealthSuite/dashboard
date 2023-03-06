import { DashboardSettingsControl } from './sections/DashboardSettingsControl'
import ProviderSettings from './sections/ProviderSettings'

export default function SettingsDashboard() {
    return (<>
        <ProviderSettings />
        <DashboardSettingsControl />
    </>)
}
