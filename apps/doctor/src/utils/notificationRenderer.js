import { format } from 'date-fns';

const formatDateTimeRange = (date, startTime, endTime) => {
    if (!date || !startTime) return '';
    try {
        const d = new Date(date);
        const dateStr = format(d, 'MMMM d, yyyy');
        
        const formatTime = (t) => {
            const [h, m] = t.split(':');
            const hour = parseInt(h, 10);
            const ampm = hour >= 12 ? 'pm' : 'am';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${m}${ampm}`;
        };

        const start = formatTime(startTime);
        const end = endTime ? ` - ${formatTime(endTime)}` : '';
        
        return `${dateStr} at ${start}${end}`;
    } catch (e) {
        return `${date} ${startTime}`;
    }
};

export const renderNotification = (notification, options = {}) => {
    const { isRich = false } = options;

    let data = null;
    try {
        if (typeof notification.message === 'string' && notification.message.startsWith('{')) {
            data = JSON.parse(notification.message);
        }
    } catch (e) { }

    if (!data || !data._isJSON) {
        return {
            title: notification.title,
            message: notification.message
        };
    }

    const { type } = notification;
    const { service, date, start_time, end_time, patient_name, reason } = data;
    
    const highlight = (text) => {
        if (!isRich || !text) return text;
        return `<span class="font-bold text-gray-950 dark:text-white">${text}</span>`;
    };

    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const richService = highlight(service);
    const richPatient = highlight(patient_name || 'Patient');
    const richRange = highlight(formattedRange);

    let title = data._title || notification.title;
    let message = data._fallback || notification.message;

    switch (type) {
        case 'APPOINTMENT_REQUEST':
            title = 'New Appointment Request';
            message = `A new request for ${richService} has been received for ${richPatient} on ${richRange}.`;
            break;
            
        case 'CANCELLATION':
            title = 'Appointment Cancelled';
            message = `The ${richService} appointment for ${richPatient} on ${richRange} has been cancelled by the patient. ${reason ? 'Reason: ' + highlight(reason) : ''}`;
            break;

        case 'CONFIRMATION':
            title = 'Appointment Confirmed';
            message = `Your ${richService} appointment with ${richPatient} on ${richRange} is confirmed.`;
            break;

        case 'DELAY':
            title = 'Schedule Delay Alert';
            message = `Your schedule is running approximately ${highlight(data.estimated_delay_minutes)} minutes behind. Patients have been notified.`;
            break;

        default:
            title = data._title || title;
            message = data._fallback || message;
    }

    return { title, message };
};
