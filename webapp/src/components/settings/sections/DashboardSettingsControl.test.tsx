import { render, screen, within } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { DashboardSettingsContext, DashboardSettingsContextType } from "../../../App";
import { DEFAULT_DASHBOARD_SETTINGS } from "../types";
import { DashboardSettingsControl } from "./DashboardSettingsControl";

const TestDashboardSettingsContextProvider = (props: PropsWithChildren<{ context: DashboardSettingsContextType }>) => {
    return <DashboardSettingsContext.Provider value={props.context}>
        {props.children}
    </DashboardSettingsContext.Provider>
}

describe("DashboardSettingsControl", () => {
    describe("HappyPath", () => {
        describe("Flat Renders", () => {
            vi.mock('../../dashboard/tiles', () => ({
                AvailableTiles: {
                    FirstTile: {
                        displayName: "First Tile",
                        component: () => <>First Tile Comp</>
                    },
                    SecondTile: {
                        displayName: "Second Tile",
                        component: () => <>Second Tile Comp</>
                    },
                    ThirdTile: {
                        displayName: "Third Tile",
                        component: () => <>Third Tile Comp</>
                    },
                    FourthTile: {
                        displayName: "Fourth Tile",
                        component: () => <>Fourth Tile Comp</>
                    }
                }
            }));

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
                expect(label.parentElement).not.toHaveTextContent("Fourth Tile");
            })

            it("Lists Tiles not in context as disabled", () => {
                const label = screen.getByText("Other Available Tiles");
                expect(label).toBeInTheDocument();
                expect(label.parentElement).not.toHaveTextContent("First Tile");
                expect(label.parentElement).not.toHaveTextContent("Second Tile");
                expect(label.parentElement).not.toHaveTextContent("Third Tile");
                expect(label.parentElement).toHaveTextContent("Fourth Tile");
            })

            it.each(["First Tile", "Second Tile", "Third Tile"])
                ("Enabled entries have disable buttons", (tile) => {
                const label = within(screen.getByText(tile).parentElement!);
                expect(label.getByRole("button", { name: "Disable" })).toBeInTheDocument();
            })

            it("Expect buttons for reordering", () => {
                const labelOne = within(screen.getByText("First Tile").parentElement!);
                expect(labelOne.queryByRole("button", { name: "↑" })).not.toBeInTheDocument();
                expect(labelOne.queryByRole("button", { name: "↓" })).toBeInTheDocument();
                const labelTwo = within(screen.getByText("Second Tile").parentElement!);
                expect(labelTwo.queryByRole("button", { name: "↑" })).toBeInTheDocument();
                expect(labelTwo.queryByRole("button", { name: "↓" })).toBeInTheDocument();
                const labelThree = within(screen.getByText("Third Tile").parentElement!);
                expect(labelThree.queryByRole("button", { name: "↑" })).toBeInTheDocument();
                expect(labelThree.queryByRole("button", { name: "↓" })).not.toBeInTheDocument();
            })
            
            it.each(["Fourth Tile"])("Disabled entries have enable buttons", (tile) => {
                const label = within(screen.getByText(tile).parentElement!);
                expect(label.getByRole("button", { name: "Enable" })).toBeInTheDocument();
            })
        });
    });
})