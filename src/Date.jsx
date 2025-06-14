import { format } from 'date-fns-tz';
import React, { useState, useEffect } from 'react';

export default function DateTimeDisplay({ timeZone }) {
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatDateTime = (date) => {
        return format(date, 'EEE, MMM dd yyyy HH:mm:ss zzz', { timeZone });
    };

    // style here
    return (
        <div className="text-gray-600">
            <p>{timeZone}: {formatDateTime(dateTime)}</p>
        </div>
    );
}