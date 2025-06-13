export interface TideData {
  d: string;
  t: number;
  l: number;
}

export interface Area {
  id: string;
  name: string;
  port?: string;
}

export interface TideResponse {
  area: Area;
  data: TideData[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: {
    area: string;
    level: number;
  };
}
