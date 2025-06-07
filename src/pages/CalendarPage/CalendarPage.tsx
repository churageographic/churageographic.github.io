import { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import AreaSelector from '@/components/AreaSelector/AreaSelector';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja';
import { fetchCalendarEvents } from '@/services/calendarService';
import { CalendarEvent } from '@/types/tide';

const CalendarPage = () => {
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedArea) {
      const fetchEvents = async () => {
        setLoading(true);
        try {
          const today = new Date();
          const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          
          const events = await fetchCalendarEvents(
            selectedArea,
            startDate.toISOString(),
            endDate.toISOString()
          );
          setEvents(events);
        } catch (error) {
          console.error('イベントデータの取得に失敗しました:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    }
  }, [selectedArea]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          月別タイドカレンダー
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <AreaSelector
          value={selectedArea}
          onChange={setSelectedArea}
        />
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            タイドカレンダー
          </Typography>
          <Calendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale={jaLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            events={events}
            eventContent={(arg) => (
              <div>
                <span>{arg.event.title}</span>
                <br />
                <span style={{ fontSize: '0.8em' }}>
                  潮位: {arg.event.extendedProps.level}cm
                </span>
              </div>
            )}
          />
        </Box>
      )}
    </Container>
  );
};

export default CalendarPage;
