export type GeekSeekEvent = {
  name: "GS";
  type: "geek-seek";
  amounts: number;
}

export type CommuteEvent = {
  name: "出勤";
  type: "commute";
  fare: number;
}

export type Event = GeekSeekEvent | CommuteEvent | {
  name: string;
  type: "remote" | "walking" | "drinking" | "energy";
  amounts: undefined;
};

export interface DateEvent {
  date?: Date;
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
    const remainDays: DateEvent[] = new Array((7 - days.length % 7) % 7)
      .fill(undefined)
      .map((_, i) => ({ date: undefined, events: [], workingDay: false }));

    return [...days, ...remainDays]
  }

  async transitInformation(token: string): Promise<TransitInformation> {
    if (!token) return { unitPrice: 1, lastModified: new Date() }

    const data: TransitInformation = parseWithDate(await fetch("/api/transit_information", { headers: { Authorization: `Bearer ${token}` } }).then((resp) => resp.text()));
    return data;
  }
}
