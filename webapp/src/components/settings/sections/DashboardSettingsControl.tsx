import { useContext } from 'react';
import { DashboardSettingsContext } from '../../../App';
import { AvailableTiles, IAvailableTile } from '../../dashboard/tiles'

export const DashboardSettingsControl = () => {
    const settingsContext = useContext(DashboardSettingsContext);
    const enabledTileKeys = (settingsContext?.dashboardSettings.tileSettings ?? []).map(x => x.componentName);
    const [enabled, disabled] = Object.entries(AvailableTiles)
    .reduce<[typeof AvailableTiles, typeof AvailableTiles]>(([en, dis], tile) => {
        if (enabledTileKeys.includes(tile[0])) {
            return [{...en, [tile[0]]: tile[1]}, dis]
        }
        return [en, {...dis, [tile[0]]: tile[1]}];
    }, [{}, {}])

    const lastIndex = Object.keys(enabled).length - 1;
    
    return <div>
        <div>
            <h3>Enabled Tiles</h3>
            {Object.entries(enabled).map(([key, tile], i) => {
                return <div key={key}>
                    <div>
                        {i !== 0 && <button>&uarr;</button>}
                        {i !== lastIndex && <button>&darr;</button>}
                    </div>
                    <div>{tile.displayName}</div>
                    <div>
                        <button>Disable</button>
                    </div>
                </div>
            })}
        </div>
        <div>
        <h5>Other Available Tiles</h5>
            {Object.entries(disabled).map(([key, tile]) => {
                return <div key={key}>
                    <div>{tile.displayName}</div>
                    <div>
                        <button>Enable</button>
                    </div>
                </div>
            })}
        </div>
    </div>
}