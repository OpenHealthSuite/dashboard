import { render, screen } from "@testing-library/react";
import { CaloriesDailyTile } from "./CaloriesDailyTile";

describe("CaloriesDailyTile", () => {
  test("Renders itself as child of dashboard tile", () => {
    const dashboardtiletestid = "test-wrapper";
    const fakeDashboardTile = ({ children }: { children?: any }) => {
      return <div data-testid={dashboardtiletestid}>{children}</div>;
    };
    render(
      <CaloriesDailyTile
        FnDashboardTile={fakeDashboardTile}
      ></CaloriesDailyTile>
    );
    const wrapper = screen.getByTestId(dashboardtiletestid);
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toContainElement(screen.getByTestId("calories-daily-tile"));
  });
});
