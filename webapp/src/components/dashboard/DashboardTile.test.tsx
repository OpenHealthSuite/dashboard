import { DashboardTile } from "./DashboardTile";
import { screen, render, waitFor } from "@testing-library/react";

describe("DashboardTile", () => {
  // Header
  test("Header Displayed When Prop Passed", async () => {
    const headerText = "My Sample Header Text";
    render(
      <DashboardTile
        headerText={headerText}
        dataGetterFunction={jest.fn()}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        setData={jest.fn()}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    const header = await screen.findByTestId("card-header");
    expect(header).toHaveTextContent(headerText);
  });
  test("Header Not Displayed When No Text Passed", async () => {
    render(
      <DashboardTile
        dataGetterFunction={jest.fn()}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        setData={jest.fn()}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(screen.queryByTestId("card-header")).not.toBeInTheDocument();
  });
  test("Header Not Displayed When Empty Text Passed", async () => {
    render(
      <DashboardTile
        headerText=""
        dataGetterFunction={jest.fn()}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        setData={jest.fn()}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(screen.queryByTestId("card-header")).not.toBeInTheDocument();
  });

  // Content
  test("Renders content into card content", async () => {
    const contentTestId = "ContentWrapper";
    const content = <div data-testid={contentTestId}>My Content</div>;
    render(
      <DashboardTile
        dataGetterFunction={jest.fn()}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        setData={jest.fn()}
        refreshIntervalms={5000}
      >
        {content}
      </DashboardTile>
    );
    const renderedCardContent = await screen.findByTestId(contentTestId);
    expect(renderedCardContent).toBeTruthy();
    const cardContent = await screen.findByTestId("card-content");
    expect(cardContent).toContainElement(renderedCardContent);
  });

  test("Uses provided data setter", async () => {
    const dataSetter = jest.fn();
    const loadingGetter = jest.fn();

    render(
      <DashboardTile
        setData={dataSetter}
        refreshIntervalms={5000}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
      >
        <></>
      </DashboardTile>
    );
    expect(loadingGetter.mock.calls[0][2]).toBe(dataSetter);
  });

  // Loading Icon
  test("Loading Visible", async () => {
    const loadingTestId = "card-loading";
    const loadingGetter = jest
      .fn()
      .mockImplementation((_, setIsLoading) => setIsLoading(true));
    render(
      <DashboardTile
        setData={jest.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(await screen.findByTestId(loadingTestId)).toBeInTheDocument();
  });
  test("Loading Not Visible When False", async () => {
    const loadingTestId = "card-loading";
    const loadingGetter = jest
      .fn()
      .mockImplementation((_, setIsLoading) => setIsLoading(false));
    render(
      <DashboardTile
        setData={jest.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument();
  });

  // Error Icon
  test("Error Visible", async () => {
    const loadingTestId = "card-error";
    const loadingGetter = jest
      .fn()
      .mockImplementation((setIsError, _) => setIsError(true));
    render(
      <DashboardTile
        setData={jest.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(await screen.findByTestId(loadingTestId)).toBeInTheDocument();
  });
  test("Error Not Visible When False", async () => {
    const loadingTestId = "card-error";
    const loadingGetter = jest
      .fn()
      .mockImplementation((setIsError, _) => setIsError(false));
    render(
      <DashboardTile
        setData={jest.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={jest.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument();
  });
});
