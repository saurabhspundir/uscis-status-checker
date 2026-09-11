import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBanner } from '../components/ErrorBanner';

describe('ErrorBanner', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<ErrorBanner message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the error message when provided', () => {
    render(<ErrorBanner message="Something went wrong" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('has aria-live polite for accessibility', () => {
    render(<ErrorBanner message="Error" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });
});
