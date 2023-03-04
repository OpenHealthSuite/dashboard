import { baseDataGetterFunction, DashboardTile } from "./DashboardTile";
import { screen, render, waitFor } from "@testing-library/react";
import { Simulate } from "react-dom/test-utils";

describe("DashboardTile", () => {
  // Header
  test("Header Displayed When Prop Passed", async () => {
    const headerText = "My Sample Header Text";
    render(
      <DashboardTile
        headerText={headerText}
        dataGetterFunction={vi.fn() as any}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        setData={vi.fn()}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    const header = await screen.findByTestId("card-header");
    expect(header).toHaveTextContent(headerText);
  });
  test("Header Not Displayed When No Text Passed", async () => {
    render(
      <DashboardTile
        dataGetterFunction={vi.fn() as any}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        setData={vi.fn()}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(screen.queryByTestId("card-header")).not.toBeInTheDocument();
  });
  test("Header Not Displayed When Empty Text Passed", async () => {
    render(
      <DashboardTile
        headerText=""
        dataGetterFunction={vi.fn() as any}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        setData={vi.fn()}
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
        dataGetterFunction={vi.fn() as any}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        setData={vi.fn()}
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
    const dataSetter = vi.fn();
    const testData = { whoami: "Test Data" }
    render(
      <DashboardTile
        setData={dataSetter}
        refreshIntervalms={5000}
        dataRetreivalFunction={vi.fn().mockResolvedValue(testData)}
      >
        <></>
      </DashboardTile>
    );
    await waitFor(() => expect(dataSetter).toHaveBeenCalledTimes(1));
    expect(dataSetter).toBeCalledWith(testData);
  });

  test("On Click :: Reloads data", async () => {
    const dataSetter = vi.fn();
    const testData = { whoami: "Test Data" }
    const testDataTwo = { whoami: "Test Data Two" }
    render(
      <DashboardTile
        setData={dataSetter}
        refreshIntervalms={5000}
        dataRetreivalFunction={vi.fn().mockResolvedValueOnce(testData).mockResolvedValueOnce(testDataTwo)}
      >
        <></>
      </DashboardTile>
    );
    await waitFor(() => expect(dataSetter).toHaveBeenCalledTimes(1));
    expect(dataSetter).toBeCalledWith(testData);
    Simulate.click(screen.getByTestId("card"))
    await waitFor(() => expect(dataSetter).toHaveBeenCalledTimes(2));
    expect(dataSetter).toBeCalledWith(testDataTwo);
  });

  // Loading Icon
  test("Loading Visible", async () => {
    const loadingTestId = "card-loading";
    const loadingGetter = vi
      .fn()
      .mockImplementation((_, setIsLoading) => setIsLoading(true));
    render(
      <DashboardTile
        setData={vi.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(await screen.findByTestId(loadingTestId)).toBeInTheDocument();
  });
  test("Loading Not Visible When False", async () => {
    const loadingTestId = "card-loading";
    const loadingGetter = vi
      .fn()
      .mockImplementation((_, setIsLoading) => setIsLoading(false));
    render(
      <DashboardTile
        setData={vi.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument();
  });

  // Error Icon
  test("Error Visible", async () => {
    const loadingTestId = "card-error";
    const loadingGetter = vi
      .fn()
      .mockImplementation((setIsError, _) => setIsError(true));
    render(
      <DashboardTile
        setData={vi.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(await screen.findByTestId(loadingTestId)).toBeInTheDocument();
  });
  test("Error Not Visible When False", async () => {
    const loadingTestId = "card-error";
    const loadingGetter = vi
      .fn()
      .mockImplementation((setIsError, _) => setIsError(false));
    render(
      <DashboardTile
        setData={vi.fn()}
        dataGetterFunction={loadingGetter}
        dataRetreivalFunction={vi.fn().mockResolvedValue({})}
        refreshIntervalms={5000}
      ></DashboardTile>
    );
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument();
  });
});

describe("baseDataGetterFunction", () => {
  const setErrored = vi.fn();
  const setLoading = vi.fn();
  const setData = vi.fn();
  const dataRetreival = vi.fn();

  beforeEach(() => {
    setErrored.mockReset()
    setLoading.mockReset()
    setData.mockReset()
    dataRetreival.mockReset()
  })

  test("Gets Data :: Sets Values appropriately", async () => {
    const fakeData = { whoami: "FakeData" }
    dataRetreival.mockResolvedValue(fakeData)
    await baseDataGetterFunction(setErrored, setLoading, setData, dataRetreival)
    expect(setLoading.mock.calls[0][0]).toBe(true)
    expect(dataRetreival).toBeCalledTimes(1)
    expect(setLoading.mock.invocationCallOrder[0]).toBeLessThan(dataRetreival.mock.invocationCallOrder[0])
    expect(setData).toBeCalledWith(fakeData)
    expect(setErrored).toBeCalledWith(false)
    expect(setLoading.mock.calls[1][0]).toBe(false)
    expect(setData.mock.invocationCallOrder[0]).toBeLessThan(setLoading.mock.invocationCallOrder[1])
  })

  test("Gets Error :: Sets Values appropriately", async () => {
    const fakeData = { whoami: "FakeError" }
    dataRetreival.mockRejectedValue(fakeData)
    await baseDataGetterFunction(setErrored, setLoading, setData, dataRetreival)
    expect(setLoading.mock.calls[0][0]).toBe(true)
    expect(dataRetreival).toBeCalledTimes(1)
    expect(setLoading.mock.invocationCallOrder[0]).toBeLessThan(dataRetreival.mock.invocationCallOrder[0])
    expect(setData).not.toBeCalled()
    expect(setErrored).toBeCalledWith(true)
    expect(setLoading.mock.calls[1][0]).toBe(false)
    expect(setErrored.mock.invocationCallOrder[0]).toBeLessThan(setLoading.mock.invocationCallOrder[1])
  })
})