export type GeekSeekEvent = {
  name: "GS";
  type: "geek-seek";
  amounts: number;
}

export type CommuteEvent = {
  name: "出社";
  type: "commute";
  fare?: number;
}

export type Event = GeekSeekEvent | CommuteEvent | {
  name: string;
  type: "remote" | "walking" | "drinking" | "energy";
  amounts?: undefined;
};

export interface DateEvent {
  date: Date;
  events: Event[];
  workingDay: boolean;
}

export interface TransitInformation {
  unitPrice: number;
  lastModified: Date;
}

const parseWithDate = (str: string) => {
  const reviver = (_key: string, val: string): Date | string => {
    if (typeof (val) == "string" &&
      val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/)) {
      return new Date(Date.parse(val));
    }
    return val;
  }
  return JSON.parse(str, reviver);
};

export class PersistenceClient {
  async calendarEvents(token: string): Promise<DateEvent[]> {
    if (!token) return []

    const days: DateEvent[] = parseWithDate(await fetch("/api/date_events", { headers: { Authorization: `Bearer ${token}` } }).then((resp) => resp.text()));
    const lastItem = days.slice(-1)[0]

    if (lastItem.date.getTime() - new Date().getTime() < 7 * 86400 * 1000) {
      return [...days, ...new Array(7).fill(undefined).map((_, i) => {
        const date = new Date(lastItem.date.getTime() + (i + 1) * 86400 * 1000)
        return { date, events: [], workingDay: [1, 2, 3, 4, 5].includes(date.getDay()), }
      })]
    }

    return [...days]
  }

  async saveCalendarEvents(token: string, data: DateEvent[] | undefined): Promise<void> {
    if (!token || !data) return

    await fetch("/api/date_events", { method: 'post', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) })
  }

  async transitInformation(token: string): Promise<TransitInformation> {
    if (!token) return { unitPrice: 1, lastModified: new Date() }

    const data: TransitInformation = parseWithDate(await fetch("/api/transit_information", { headers: { Authorization: `Bearer ${token}` } }).then((resp) => resp.text()));
    return data;
  }
}
