// File: /src/pages/dbStatus.tsx

import { useEffect, useState } from 'react';

const DbStatus = () => {
    const [status, setStatus] = useState<string>('Loading...');

    useEffect(() => {
        fetch('/api/testConnection')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setStatus('Database connected successfully!');
                } else {
                    setStatus('Failed to connect to database.');
                }
            })
            .catch((error) => {
                console.error('Error fetching DB status:', error);
                setStatus('Failed to connect to database.');
            });
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Database Connection Status:</h1>
                <p className="text-lg mt-4" style={{ color: status.includes('successfully') ? 'green' : 'red' }}>
                    {status}
                </p>
            </div>
        </div>
    );
};

export default DbStatus;