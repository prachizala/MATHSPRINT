import React, { createContext, useContext } from 'react';
import { theme, Theme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  colors: Theme['colors'];
  spacing: Theme['spacing'];
  typography: Theme['typography'];
  borderRadius: Theme['borderRadius'];
  shadows: Theme['shadows'];
}

const ThemeContext = createContext<ThemeContextType>({
  theme,
  colors: theme.colors,
  spacing: theme.spacing,
  typography: theme.typography,
  borderRadius: theme.borderRadius,
  shadows: theme.shadows,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme.colors,
        spacing: theme.spacing,
        typography: theme.typography,
        borderRadius: theme.borderRadius,
        shadows: theme.shadows,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
