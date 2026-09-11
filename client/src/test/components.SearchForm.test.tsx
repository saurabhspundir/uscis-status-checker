import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchForm } from '../components/SearchForm';

describe('SearchForm', () => {
  it('renders input and submit button', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);
    expect(screen.getByLabelText('Receipt Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  });

  it('shows validation error for invalid receipt number', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);
    await user.type(screen.getByLabelText('Receipt Number'), 'INVALID');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('alert')).toHaveTextContent('valid receipt number');
  });

  it('calls onSearch with uppercased trimmed value for valid input', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchForm onSearch={onSearch} isLoading={false} />);
    await user.type(screen.getByLabelText('Receipt Number'), 'eac9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith('EAC9999103403');
  });

  it('does not show validation error for valid receipt number', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);
    await user.type(screen.getByLabelText('Receipt Number'), 'EAC9999103403');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears validation error when user types again', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);
    await user.type(screen.getByLabelText('Receipt Number'), 'BAD');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Receipt Number'), 'X');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('disables input and shows "Searching..." when loading', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={true} />);
    expect(screen.getByLabelText('Receipt Number')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Searching...' })).toBeDisabled();
  });

  it('enforces maxLength of 13 on the input', () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);
    expect(screen.getByLabelText('Receipt Number')).toHaveAttribute('maxLength', '13');
  });
});
