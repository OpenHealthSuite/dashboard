import { useContext } from 'react';
import { DashboardSettingsContext } from '../../../App';
import { AvailableTiles, IAvailableTile } from '../../dashboard/tiles'
import './DashboardSettingsControl.scss'

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
    
    return <div className='container'>
        <div>
            <h3>Enabled Tiles</h3>
            <ol>
            {enabled.map(([key, tile], i) => {
                return <li key={key} className="dashboard-setting">
                    <div className="order-buttons">
                        {i !== 0 && <button aria-label="up" onClick={() => {
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
                        }}>&uarr;</button>}
                        {i !== lastIndex && <button aria-label="down" onClick={() => {
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
                        }}>&darr;</button>}
                    </div>
                    <div>{tile.displayName}</div>
                    <div>
                        <button onClick={() => {
                            if (settingsContext) {
                                let {dashboardSettings, setDashboardSettings} = settingsContext;
                                dashboardSettings.tileSettings = dashboardSettings.tileSettings.filter(x => x.componentName !== key)
                                setDashboardSettings(dashboardSettings);
                            }
                        }}>Disable</button>
                    </div>
                </li>
            })}
            </ol>
        </div>
        <div>
        <h5>Other Available Tiles</h5>
        <ul>
            {disabled.map(([key, tile], i) => {
                return <li key={key} className="dashboard-setting">
                    <div>{tile.displayName}</div>
                    <div>
                        <button onClick={() => {
                            if (settingsContext) {
                                let {dashboardSettings, setDashboardSettings} = settingsContext;
                                dashboardSettings.tileSettings.push({ componentName: key })
                                setDashboardSettings(dashboardSettings);
                            }
                        }}>Enable</button>
                    </div>
                </li>
            })}

        </ul>
        </div>
    </div>
}