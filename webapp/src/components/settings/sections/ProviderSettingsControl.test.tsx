import { act, render, screen } from "@testing-library/react"
import { ProviderSettingsControl } from "./ProviderSettingsControl"
import { pacemeUserRouteGetRequest, pacemeGetRequest } from '../../../services/PaceMeApiService'
import { nextTick } from "process"

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
    expect(screen.getByLabelText("Some Other Function Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Final Function Name")).toBeInTheDocument()
  })
})