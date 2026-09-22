import type { Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../src/auth/AuthContext';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { mswHandlers } from './msw-handlers';
import '../src/index.css';
import '../src/App.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <GoogleOAuthProvider clientId="test-client-id">
          <MemoryRouter>
            <AuthProvider>
              <Story />
            </AuthProvider>
          </MemoryRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    ),
  ],
  loaders: [mswLoader()],
  async beforeEach({ msw }) {
    msw.use(...mswHandlers);
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
};

export default preview;