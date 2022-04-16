import { DashboardTile } from "./DashboardTile"
import {
  screen,
  render
} from "@testing-library/react";

describe("DashboardTile", () => {
  // Header
  test("Header Displayed When Prop Passed", async () => {
    const headerText = "My Sample Header Text"
    render(<DashboardTile headerText={headerText}></DashboardTile>)
    const header = await screen.findByTestId("card-header");
    expect(header).toHaveTextContent(headerText)
  })
  test("Header Not Displayed When No Text Passed", async () => {
    render(<DashboardTile></DashboardTile>)
    expect(screen.queryByTestId("card-header")).toBeNull()
  })
  // Content
  test("Renders content into card content", async () => {
    const contentTestId = "ContentWrapper"
    const content = <div data-testid={contentTestId}>My Content</div>
    render(<DashboardTile>{content}</DashboardTile>)
    const renderedCardContent = await screen.findByTestId(contentTestId)
    expect(renderedCardContent).toBeTruthy()
    const cardContent = await screen.findByTestId("card-content")
    expect(cardContent).toContainElement(renderedCardContent)
  })
  // Status Footer
  // // Loading bar indicator
  // // Current status
})