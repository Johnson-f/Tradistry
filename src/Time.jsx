import React from 'react';
import DateTimeDisplay from './Date';

export default function Time() {
    const timeZones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney',
    ];
    return (
        <footer className="fixed bottom-0 w-full bg-gray-800 text-white text-center py-2">
            {timeZones.map((zone) => (
                <DateTimeDisplay key={zone} timeZone={zone} />
            ))}
        </footer>
    );
}
