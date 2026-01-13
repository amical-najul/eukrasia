import { createContext, useContext } from 'react';

export const GoogleConfigContext = createContext({
    enabled: false
});

export const useGoogleConfig = () => useContext(GoogleConfigContext);
