import { createContext, useContext, useState, type ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarContextType {
  showToast: (message: string, severity?: Severity) => void;
}

const SnackbarContext = createContext<SnackbarContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('success');

  const showToast = (msg: string, sev: Severity = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={severity} onClose={() => setOpen(false)} sx={{ width: '100%' }} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
