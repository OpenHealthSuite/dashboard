import { render, screen } from "@testing-library/react";
import { getCaloriesForDay, CaloriesDailyTile } from "./CaloriesDailyTile";

describe("CaloriesDailyTile", () => {
  test("Renders itself as child of dashboard tile", () => {
    const dashboardtiletestid = "test-wrapper";
    const fakeDashboardTile = ({ children }: { children?: any }) => {
        return <div data-testid={dashboardtiletestid}>{children}</div>
      };
    render(<CaloriesDailyTile FnDashboardTile={fakeDashboardTile} data={undefined}></CaloriesDailyTile>);
    const wrapper = screen.getByTestId(dashboardtiletestid)
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toContainElement(screen.getByTestId("calories-daily-tile"))
  });
});

describe("CaloriesDailyTileFunctions", () => {
  test("Happy path :: gets and returns settings", async () => {
    const authDetails = { userId: "fakeUserId" };
    const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
    const response = { whoami: "ReturnedSettings" };
    const fakeFetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue(response),
    });
    const fakeApiRoot = "/fakeApiRoot";
    const date = new Date();

    const result = await getCaloriesForDay(
      date,
      fakeAuthDetails,
      fakeFetch,
      fakeApiRoot
    );

    expect(result).toBe(response);
    expect(fakeFetch).toBeCalledWith(
      fakeApiRoot + "/users/" + authDetails.userId + "/activities/" + date.toISOString().split('T')[0] + '/calories'
    );
  });
  test("Non 200 status :: throws error", async () => {
    const authDetails = { userId: "fakeUserId" };
    const fakeAuthDetails = jest.fn().mockResolvedValue(authDetails);
    const response = { whoami: "ReturnedSettings" };
    const fakeFetch = jest.fn().mockResolvedValue({
      status: 403,
      json: jest.fn().mockResolvedValue(response),
    });
    const fakeApiRoot = "/fakeApiRoot";
    const date = new Date();

    await expect(getCaloriesForDay(
      date,
      fakeAuthDetails,
      fakeFetch,
      fakeApiRoot
    )).rejects.not.toBeUndefined()
    expect(fakeFetch).toBeCalledTimes(1);
    expect(fakeFetch).toBeCalledWith(
      fakeApiRoot + "/users/" + authDetails.userId + "/activities/" + date.toISOString().split('T')[0] + '/calories'
    );
  });
})