import { useEffect, useState } from "react";
import { AvailableTiles } from "../../dashboard/tiles";
import * as React from "react";
import { pacemeUserRouteGetRequest, pacemeUserRoutePutRequest } from "../../../services/PaceMeApiService";

export interface ITileSettings { 
  componentName: string
}

export interface IDashboardSettings { 
  spacing: number, 
  tileSizes: { 
      xs: number, 
      sm: number, 
      md: number
  },
  tileSettings: ITileSettings[]
}

export const DEFAULT_DASHBOARD_SETTINGS: IDashboardSettings = {
  spacing: 2,
  tileSizes: {
      xs: 12,
      sm: 6,
      md: 4
  },
  tileSettings: [
      { componentName: 'CaloriesDailyTile' },
      { componentName: 'SleepDailyTile' },
      { componentName: 'StepsGraphTile' },
      { componentName: 'CaloriesGraphTile' }
  ]
}


async function getSettings<T>(settingId: string): Promise<T | undefined> {
  return await pacemeUserRouteGetRequest<T>(['/userSettings', settingId].join('/'))
}

async function updateSettings<T>(settingId: string, details: T): Promise<void> {
  return pacemeUserRoutePutRequest(['/userSettings', settingId].join('/'), details)
}

interface ActivityDashboardSettingsProps {
  fnGetSettings?: <T>(settingId: string) => Promise<T | undefined>;
  fnUpdateSettings?: <T>(settingId: string, settings: T) => Promise<void>;
}

interface IAvailableTileSetting {
  componentName: string;
  componentNiceName: string;
}

const ALL_AVAILABLE_TILES: IAvailableTileSetting[] = Object.keys(
  AvailableTiles
).map((key) => {
  return {
    componentName: key,
    componentNiceName: AvailableTiles[key].displayName,
  };
});

export default function ActivityDashboardSettings({
  fnGetSettings = getSettings,
  fnUpdateSettings = updateSettings,
}: ActivityDashboardSettingsProps) {
  const [dashboardSettings, setDashboardSettings] =
    useState<IDashboardSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isErrored, setIsErrored] = useState<boolean>(false);

  useEffect(() => {
    fnGetSettings<IDashboardSettings>("dashboard")
      .then(setDashboardSettings)
      .catch(err => {
        setDashboardSettings(DEFAULT_DASHBOARD_SETTINGS)
        fnUpdateSettings('dashboard', DEFAULT_DASHBOARD_SETTINGS)
      })
      .finally(() => setIsLoading(false));
  }, [
    fnGetSettings,
    fnUpdateSettings,
    setIsLoading,
    setIsErrored,
    setDashboardSettings,
  ]);

  return (
    <div>
      <div>Activity Dashboard Settings</div>
      <div>
        {isLoading && "Pending"}
        {isErrored && "Error"}
        {dashboardSettings && (
          <TransferList dashboardSettings={dashboardSettings} />
        )}
      </div>
    </div>
  );
}

function not(
  a: readonly IAvailableTileSetting[],
  b: readonly IAvailableTileSetting[]
) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(
  a: readonly IAvailableTileSetting[],
  b: readonly IAvailableTileSetting[]
) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

export function TransferList({
  dashboardSettings,
  fnUpdateSettings = updateSettings,
}: {
  dashboardSettings: IDashboardSettings;
  fnUpdateSettings?: <T>(settingId: string, details: T) => Promise<void>;
}) {
  const { tileSettings } = dashboardSettings;
  const [checked, setChecked] = React.useState<IAvailableTileSetting[]>([]);
  const [enabled, setEnabled] = React.useState<IAvailableTileSetting[]>(
    ALL_AVAILABLE_TILES.filter((x) =>
      tileSettings.map((y) => y.componentName).includes(x.componentName)
    )
  );
  const [disabled, setDisabled] = React.useState<IAvailableTileSetting[]>(
    ALL_AVAILABLE_TILES.filter(
      (x) => !tileSettings.map((y) => y.componentName).includes(x.componentName)
    )
  );

  const enabledChecked = intersection(checked, enabled);
  const disabledChecked = intersection(checked, disabled);

  const handleToggle = (value: IAvailableTileSetting) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  useEffect(() => {
    const updateSettings = async () => {
      dashboardSettings.tileSettings = enabled.map((e) => {
        return { componentName: e.componentName };
      });
      fnUpdateSettings("dashboard", dashboardSettings);
    };
    updateSettings();
  }, [enabled, dashboardSettings, fnUpdateSettings]);

  const handleAllDisable = () => {
    setDisabled(disabled.concat(enabled));
    setEnabled([]);
  };

  const handleCheckedDisable = () => {
    setDisabled(disabled.concat(enabledChecked));
    setEnabled(not(enabled, enabledChecked));
    setChecked(not(checked, enabledChecked));
  };

  const handleCheckedEnable = () => {
    setEnabled(enabled.concat(disabledChecked));
    setDisabled(not(disabled, disabledChecked));
    setChecked(not(checked, disabledChecked));
  };

  const handleAllEnable = () => {
    setEnabled(enabled.concat(disabled));
    setDisabled([]);
  };

  const adjustEnabledIndex = (index: number, adjustment: number) => {
    const newEnabled = enabled;
    const newIndex = index + adjustment;
    const oldValue = newEnabled[newIndex];
    newEnabled[newIndex] = newEnabled[index];
    newEnabled[index] = oldValue;
    setEnabled(newEnabled);
    // This bit is filth. I don't know why I have to duplicate this
    const updateSettings = async () => {
      dashboardSettings.tileSettings = enabled.map((e) => {
        return { componentName: e.componentName };
      });
      fnUpdateSettings("dashboard", dashboardSettings);
    };
    updateSettings();
  };

  // Definitely should take this to a component...
  const customList = (
    items: readonly IAvailableTileSetting[],
    isEnabledList: boolean = false
  ) => (
    <div>
      <div role="list">
        {items.map((value: IAvailableTileSetting, index: number) => {
          const labelId = `transfer-list-item-${value}-label`;
          let buttons = <></>;
          if (isEnabledList && items.length > 1) {
            buttons = (
              <>
                <button onClick={() => adjustEnabledIndex(index, 1)}>
                  ▼
                </button>
                <button onClick={() => adjustEnabledIndex(index, -1)}>
                  ▲
                </button>
              </>
            );
            if (index === 0) {
              buttons = (
                <button onClick={() => adjustEnabledIndex(index, 1)}>
                  ▼
                </button>
              );
            } else if (index === items.length - 1) {
              buttons = (
                <button onClick={() => adjustEnabledIndex(index, -1)}>
                  ▲
                </button>
              );
            }
          }
          return (
            <button
              key={value.componentName}
              role="listitem"
              onClick={handleToggle(value)}
              style={{ justifyContent: "flex-start" }}
            >
                <input type="checkbox"
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  aria-labelledby={labelId}
                />
              {buttons}
              <label id={labelId}>{value.componentNiceName}</label>
            </button>
          );
        })}
        <div />
      </div>
    </div>
  );

  return (
    <div style={{ flexGrow: 1 }}>
      <div>
        <div>
          {customList(enabled, true)}
        </div>
        <div>
          <div>
            <button
              onClick={handleAllDisable}
              disabled={enabled.length === 0}
              aria-label="disable all"
            >
              ≫
            </button>
            <button
              onClick={handleCheckedDisable}
              disabled={enabledChecked.length === 0}
              aria-label="disable selected"
            >
              &gt;
            </button>
            <button
              onClick={handleCheckedEnable}
              disabled={disabledChecked.length === 0}
              aria-label="enable selected"
            >
              &lt;
            </button>
            <button
              onClick={handleAllEnable}
              disabled={disabled.length === 0}
              aria-label="enable all"
            >
              ≪
            </button>
          </div>
        </div>
        <div>
          {customList(disabled)}
        </div>
      </div>
    </div>
  );
}
