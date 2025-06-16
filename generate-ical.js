const fs = require('fs');

// Read events from JSON file
const events = JSON.parse(fs.readFileSync('events.json', 'utf8'));

// Function to format date for iCal
function formatICalDate(dateString, timeString) {
    const date = new Date(dateString);
    
    // Parse time (assuming format like "11:00 AM - 3:00 PM")
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        date.setHours(hours, minutes, 0, 0);
    }
    
    // Format as YYYYMMDDTHHMMSS
    return date.toISOString().replace(/[-:]/g, '').split('.')[0];
}

// Function to calculate end time (add 4 hours if not specified)
function getEndTime(dateString, timeString) {
    const endTimeMatch = timeString.match(/- (\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (endTimeMatch) {
        const date = new Date(dateString);
        let hours = parseInt(endTimeMatch[1]);
        const minutes = parseInt(endTimeMatch[2]);
        const ampm = endTimeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0];
    }
    
    // Default: add 4 hours to start time
    const startDate = new Date(dateString);
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        startDate.setHours(hours + 4, minutes, 0, 0);
    }
    
    return startDate.toISOString().replace(/[-:]/g, '').split('.')[0];
}

// Generate unique ID
function generateUID(event) {
    const dateStr = event.date.replace(/-/g, '');
    const locationStr = event.location.replace(/\s+/g, '').toLowerCase();
    return `${dateStr}-${locationStr}@sugarcityslices.com`;
}

// Generate iCal content
let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sugar City Slices Calendar//Sugar City Slices Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Sugar City Slices Schedule
X-WR-CALDESC:Follow us for delicious Antillean Fusion Pastries at various locations!
X-WR-TIMEZONE:America/New_York
`;

events.forEach(event => {
    const startTime = formatICalDate(event.date, event.time);
    const endTime = getEndTime(event.date, event.time);
    const uid = generateUID(event);
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    
    // Create description with menu
    const menuText = event.menu.join(', ');
    const description = `${event.description || 'Join us for great food!'}\\n\\nToday's Menu: ${menuText}\\n\\nLocation: ${event.address}`;
    
    icalContent += `
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:Sugar City Slices at ${event.location}
DESCRIPTION:${description}
LOCATION:${event.address}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`;
});

icalContent += `
END:VCALENDAR`;

// Write iCal file
fs.writeFileSync('calendar.ics', icalContent.trim());
console.log('Generated calendar.ics successfully!');
console.log(`Added ${events.length} events to calendar.`);
