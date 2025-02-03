import { createContext, useContext, useState, ReactNode } from 'react';
import Snackbar from '../components/Snackbar';

interface SnackbarContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error'>('success');

    const showSuccess = (msg: string) => {
        setMessage(msg);
        setType('success');
        setIsOpen(true);
    };

    const showError = (msg: string) => {
        setMessage(msg);
        setType('error');
        setIsOpen(true);
    };

    return (
        <SnackbarContext.Provider value={{ showSuccess, showError }}>
            {children}
            <Snackbar
                message={message}
                type={type}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (context === undefined) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
}; 