import { act, fireEvent, render, screen } from "@testing-library/react"
import { ProviderSettingsControl } from "./ProviderSettingsControl"
import { pacemeUserRouteGetRequest, pacemeUserRoutePutRequest, pacemeGetRequest } from '../../../services/PaceMeApiService'

vi.mock('../../../services/PaceMeApiService')

describe("ProviderSettingsControl", () => {
  test("Once loaded :: shows dropdowns with options", async () => {

    const fakeSetup = {
      "someFunctionName": ["providerOne"],
      "someOtherFunctionName": ["providerOne", "providerTwo"],
      "finalFunctionName": ["providerThree", "providerOne"]
    };
    vi.mocked(pacemeGetRequest).mockResolvedValue(fakeSetup)
    vi.mocked(pacemeUserRouteGetRequest).mockRejectedValue({ err: "not found"})
    await act(() => {render(<ProviderSettingsControl />)})
    expect(screen.getByLabelText("Some Function Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Some Function Name")).not.toHaveValue()
    expect(screen.getByLabelText("Some Other Function Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Some Other Function Name")).not.toHaveValue()
    expect(screen.getByLabelText("Final Function Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Final Function Name")).not.toHaveValue()
  })
  test("Once loaded :: shows dropdowns with users options", async () => {

    const fakeSetup = {
      "someFunctionName": ["providerOne"],
      "someOtherFunctionName": ["providerOne", "providerTwo"],
      "finalFunctionName": ["providerThree", "providerOne"]
    };
    vi.mocked(pacemeGetRequest).mockResolvedValue(fakeSetup)
    vi.mocked(pacemeUserRouteGetRequest).mockResolvedValue({
      someFunctionName: undefined,
      someOtherFunctionName: "providerOne",
      finalFunctionName: "providerThree"
    })
    await act(() => {render(<ProviderSettingsControl />)})
    expect(screen.getByLabelText("Some Function Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Some Function Name")).not.toHaveValue()
    expect(screen.getByLabelText("Some Other Function Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Some Other Function Name")).toHaveValue("providerOne")
    expect(screen.getByLabelText("Final Function Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Final Function Name")).toHaveValue("providerThree")
  })

  test("Change option :: send change", async () => {

    const fakeSetup = {
      "someFunctionName": ["providerOne"],
      "someOtherFunctionName": ["providerOne", "providerTwo"],
      "finalFunctionName": ["providerThree", "providerOne"]
    };
    vi.mocked(pacemeGetRequest).mockResolvedValue(fakeSetup)
    vi.mocked(pacemeUserRouteGetRequest).mockResolvedValue({
      someFunctionName: undefined,
      someOtherFunctionName: "providerOne",
      finalFunctionName: "providerThree"
    })
    await act(() => {render(<ProviderSettingsControl />)})
    
    const input = screen.getByLabelText("Some Other Function Name");

    await act(() => {
      fireEvent.change(input, { target: { value: "providerTwo" } })
    })

    expect(vi.mocked(pacemeUserRoutePutRequest)).toBeCalledTimes(1);
    expect(vi.mocked(pacemeUserRoutePutRequest)).toBeCalledWith('/userSettings/provider_settings',{
      someFunctionName: undefined,
      someOtherFunctionName: "providerTwo",
      finalFunctionName: "providerThree"
    })
  })
})