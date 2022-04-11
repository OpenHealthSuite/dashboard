import { render, screen } from '@testing-library/react';
import { ActivityDashboard } from './ActivityDashboard_v2';

describe('ActivityDashboard', () => {
  test('renders', () => {
    render(<ActivityDashboard />);
    const helloElement = screen.getByText(/Hello/i);
    expect(helloElement).toBeInTheDocument();
  });
})
