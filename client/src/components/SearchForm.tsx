import { useState } from 'react';

interface Props {
  onSearch: (caseNumber: string) => void;
  isLoading: boolean;
}

const RECEIPT_REGEX = /^[A-Za-z]{3}[0-9]{10}$/;

export function SearchForm({ onSearch, isLoading }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!RECEIPT_REGEX.test(trimmed)) {
      setValidationError('Enter a valid receipt number: 3 letters followed by 10 digits (e.g. EAC9999103403)');
      return;
    }
    setValidationError(null);
    onSearch(trimmed.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <label htmlFor="caseInput" className="search-label">
        Receipt Number
      </label>
      <div className="search-input-row">
        <input
          id="caseInput"
          type="text"
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setValidationError(null); }}
          placeholder="e.g. EAC9999103403"
          disabled={isLoading}
          className="search-input"
          maxLength={13}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()} className="search-button">
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {validationError && (
        <p role="alert" className="validation-error">{validationError}</p>
      )}
    </form>
  );
}
