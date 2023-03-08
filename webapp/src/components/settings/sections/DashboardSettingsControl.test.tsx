import { fireEvent, render, screen, within } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { DashboardSettingsContext, DashboardSettingsContextType } from "../../../App";
import { DashboardSettingsControl } from "./DashboardSettingsControl";

vi.mock('../../dashboard/tiles', () => ({
    AvailableTiles: {
        ThirdTile: {
            displayName: "Third Tile",
            component: () => <>Third Tile Comp</>
        },
        SecondTile: {
            displayName: "Second Tile",
            component: () => <>Second Tile Comp</>
        },
        FirstTile: {
            displayName: "First Tile",
            component: () => <>First Tile Comp</>
        },
        FifthTile: {
            displayName: "Fifth Tile",
            component: () => <>Fifth Tile Comp</>
        },
        FourthTile: {
            displayName: "Fourth Tile",
            component: () => <>Fourth Tile Comp</>
        },
    }
}));

const TestDashboardSettingsContextProvider = (props: PropsWithChildren<{ context: DashboardSettingsContextType }>) => {
    return <DashboardSettingsContext.Provider value={props.context}>
        {props.children}
    </DashboardSettingsContext.Provider>
}

describe("DashboardSettingsControl", () => {
    describe("Flat Renders", () => {
        const dashboardSettings = {
            spacing: 2,
            tileSizes: {
                xs: 12,
                sm: 6,
                md: 4,
            },
            tileSettings: [
                { componentName: "FirstTile" },
                { componentName: "SecondTile" },
                { componentName: "ThirdTile" },
                { componentName: "UnknownTile" },
            ],
            }

        beforeEach(() => {
            render(
                <TestDashboardSettingsContextProvider context={{
                    dashboardSettings: dashboardSettings,
                    setDashboardSettings: vi.fn()
                }}>
                    <DashboardSettingsControl />
                </TestDashboardSettingsContextProvider>
            );
        })

        it("Has All Tiles Listed", () => {
            expect(screen.getByText("First Tile")).toBeInTheDocument()
            expect(screen.getByText("Second Tile")).toBeInTheDocument()
            expect(screen.getByText("Third Tile")).toBeInTheDocument()
            expect(screen.getByText("Fourth Tile")).toBeInTheDocument()
            expect(screen.getByText("Fifth Tile")).toBeInTheDocument()
        })

        it("Doesn't display unknown tile", () => {
            expect(screen.queryByText("Unknown")).not.toBeInTheDocument()
        })

        it("Lists Tiles in context as enabled", () => {
            const label = screen.getByText("Enabled Tiles");
            expect(label).toBeInTheDocument();
            expect(label.parentElement).toHaveTextContent("First Tile");
            expect(label.parentElement).toHaveTextContent("Second Tile");
            expect(label.parentElement).toHaveTextContent("Third Tile");
        })

        it("Orders using index not module order", () => {
            const items = within(screen.getByText("Enabled Tiles").parentElement!).getAllByRole("listitem");
            expect(items[0]).toHaveTextContent("First Tile");
            expect(items[1]).toHaveTextContent("Second Tile");
            expect(items[2]).toHaveTextContent("Third Tile");
        })

        it("Lists Tiles not in context as disabled", () => {
            const label = screen.getByText("Other Available Tiles");
            expect(label).toBeInTheDocument();
            expect(label.parentElement).not.toHaveTextContent("First Tile");
            expect(label.parentElement).not.toHaveTextContent("Second Tile");
            expect(label.parentElement).not.toHaveTextContent("Third Tile");
            expect(label.parentElement).toHaveTextContent("Fourth Tile");
            expect(label.parentElement).toHaveTextContent("Fifth Tile");
        })

        it.each(["First Tile", "Second Tile", "Third Tile"])
            ("Enabled entries have disable buttons", (tile) => {
            const label = within(screen.getByText(tile).parentElement!);
            expect(label.getByRole("button", { name: "Disable" })).toBeInTheDocument();
        })

        it("Expect buttons for reordering", () => {
            const labelOne = within(screen.getByText("First Tile").parentElement!);
            expect(labelOne.queryByRole("button", { name: "up" })).not.toBeInTheDocument();
            expect(labelOne.queryByRole("button", { name: "down" })).toBeInTheDocument();
            const labelTwo = within(screen.getByText("Second Tile").parentElement!);
            expect(labelTwo.queryByRole("button", { name: "up" })).toBeInTheDocument();
            expect(labelTwo.queryByRole("button", { name: "down" })).toBeInTheDocument();
            const labelThree = within(screen.getByText("Third Tile").parentElement!);
            expect(labelThree.queryByRole("button", { name: "up" })).toBeInTheDocument();
            expect(labelThree.queryByRole("button", { name: "down" })).not.toBeInTheDocument();
        })

        it.each(["Fourth Tile", "Fifth Tile"])("Disabled entries have enable buttons", (tile) => {
            const label = within(screen.getByText(tile).parentElement!);
            expect(label.getByRole("button", { name: "Enable" })).toBeInTheDocument();
        })
    });

    describe("Interactions", () => {
        const dashboardSettings = {
            spacing: 2,
            tileSizes: {
                xs: 12,
                sm: 6,
                md: 4,
            },
            tileSettings: [
                { componentName: "FirstTile" },
                { componentName: "SecondTile" },
                { componentName: "ThirdTile" },
            ],
        }

        const mockSetDashboardSettings = vi.fn();

        beforeEach(() => {
            vi.clearAllMocks();
            render(
                <TestDashboardSettingsContextProvider context={{
                    dashboardSettings: structuredClone(dashboardSettings),
                    setDashboardSettings: mockSetDashboardSettings
                }}>
                    <DashboardSettingsControl />
                </TestDashboardSettingsContextProvider>
            );
        })

        const startingEnabledTiles = [
            ["FirstTile", "First Tile"],
            ["SecondTile", "Second Tile"],
            ["ThirdTile", "Third Tile"],
        ]
        const startingDisabledTiles = [
            ["FourthTile", "Fourth Tile"],
            ["FifthTile", "Fifth Tile"]
        ]

        it.each(startingEnabledTiles)
            ("Can disable % tile", (key, tileLabel) => {
            const label = within(screen.getByText(tileLabel).parentElement!);
            const button = label.getByRole("button", { name: "Disable" });
            fireEvent.click(button);
            let testTileSettings = structuredClone(dashboardSettings);
            testTileSettings.tileSettings = testTileSettings.tileSettings.filter(x => x.componentName !== key)
            expect(mockSetDashboardSettings).toBeCalledTimes(1);
            expect(mockSetDashboardSettings).toBeCalledWith(testTileSettings)
        })

        it("Top click down :: moves down", () => {
            const label = within(screen.getByText("First Tile").parentElement!);
            const button = label.getByRole("button", { name: "down" });
            fireEvent.click(button);
            let testTileSettings = structuredClone(dashboardSettings);
            testTileSettings.tileSettings = [
                { ...testTileSettings.tileSettings[1] },
                { ...testTileSettings.tileSettings[0] },
                { ...testTileSettings.tileSettings[2] },
            ]
            expect(mockSetDashboardSettings).toBeCalledTimes(1);
            expect(mockSetDashboardSettings).toBeCalledWith(testTileSettings)
        })


        it("Middle click down :: moves down", () => {
            const label = within(screen.getByText("Second Tile").parentElement!);
            const button = label.getByRole("button", { name: "down" });
            fireEvent.click(button);
            let testTileSettings = structuredClone(dashboardSettings);
            testTileSettings.tileSettings = [
                { ...testTileSettings.tileSettings[0] },
                { ...testTileSettings.tileSettings[2] },
                { ...testTileSettings.tileSettings[1] },
            ]
            expect(mockSetDashboardSettings).toBeCalledTimes(1);
            expect(mockSetDashboardSettings).toBeCalledWith(testTileSettings)
        })


        it("Middle click up :: moves up", () => {
            const label = within(screen.getByText("Second Tile").parentElement!);
            const button = label.getByRole("button", { name: "up" });
            fireEvent.click(button);
            let testTileSettings = structuredClone(dashboardSettings);
            testTileSettings.tileSettings = [
                { ...testTileSettings.tileSettings[1] },
                { ...testTileSettings.tileSettings[0] },
                { ...testTileSettings.tileSettings[2] },
            ]
            expect(mockSetDashboardSettings).toBeCalledTimes(1);
            expect(mockSetDashboardSettings).toBeCalledWith(testTileSettings)
        })


        it("Bottom click up :: moves up", () => {
            const label = within(screen.getByText("Third Tile").parentElement!);
            const button = label.getByRole("button", { name: "up" });
            fireEvent.click(button);
            let testTileSettings = structuredClone(dashboardSettings);
            testTileSettings.tileSettings = [
                { ...testTileSettings.tileSettings[0] },
                { ...testTileSettings.tileSettings[2] },
                { ...testTileSettings.tileSettings[1] },
            ]
            expect(mockSetDashboardSettings).toBeCalledTimes(1);
            expect(mockSetDashboardSettings).toBeCalledWith(testTileSettings)
        })


        it.each(startingDisabledTiles)
            ("Can enable % tile", (key, tileLabel) => {
            const label = within(screen.getByText(tileLabel).parentElement!);
            const button = label.getByRole("button", { name: "Enable" });
            fireEvent.click(button);
            let dashSettings = structuredClone(dashboardSettings);
            dashSettings.tileSettings.push({ componentName: key })
            expect(mockSetDashboardSettings).toBeCalledTimes(1);
            expect(mockSetDashboardSettings).toBeCalledWith(dashSettings)
        })
    });
})