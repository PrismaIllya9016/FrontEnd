import { useEffect } from 'react';

interface SnackbarProps {
    message: string;
    type: 'success' | 'error';
    isOpen: boolean;
    onClose: () => void;
}

const Snackbar = ({ message, type, isOpen, onClose }: SnackbarProps) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-slide-up">
            <div
                className={`flex items-center p-4 rounded-lg shadow-lg ${type === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
            >
                <div className="flex-shrink-0 mr-3">
                    {type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
};

export default Snackbar; 