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
  // Loading Icon
  test("Loading Visible", async () => {
    const loadingTestId = "card-loading"
    render(<DashboardTile loading={true} ></DashboardTile>)
    expect(await screen.findByTestId(loadingTestId)).toBeInTheDocument()
  })
  test("Loading Not Visible When False", async () => {
    const loadingTestId = "card-loading"
    render(<DashboardTile loading={false} ></DashboardTile>)
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument()
  })
  test("Loading Not Visible When Null", async () => {
    const loadingTestId = "card-loading"
    render(<DashboardTile></DashboardTile>)
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument()
  })
  // Error Icon
  test("Error Visible", async () => {
    const loadingTestId = "card-error"
    render(<DashboardTile error={true} ></DashboardTile>)
    expect(await screen.findByTestId(loadingTestId)).toBeInTheDocument()
  })
  test("Error Not Visible When False", async () => {
    const loadingTestId = "card-error"
    render(<DashboardTile error={false} ></DashboardTile>)
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument()
  })
  test("Error Not Visible When Null", async () => {
    const loadingTestId = "card-error"
    render(<DashboardTile></DashboardTile>)
    expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument()
  })
})