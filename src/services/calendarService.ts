import { CalendarEvent } from '@/types/tide';

export const fetchCalendarEvents = async (areaId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> => {
  // TODO: 実際のAPIエンドポイントに置き換える
  const mockEvents: CalendarEvent[] = [];
  
  // 仮のデータ生成
  const date = new Date(startDate);
  while (date <= new Date(endDate)) {
    // 仮の干潮時刻を設定
    const lowTideTime = new Date(date);
    lowTideTime.setHours(6);
    
    mockEvents.push({
      id: `${areaId}-${date.toISOString()}`,
      title: '干潮',
      start: lowTideTime.toISOString(),
      end: lowTideTime.toISOString(),
      allDay: false,
      extendedProps: {
        area: areaId,
        level: 50
      }
    });

    date.setDate(date.getDate() + 1);
  }

  return mockEvents;
};
