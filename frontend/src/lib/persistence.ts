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

export type WalkEvent = {
  name: "徒歩";
  type: "walking";
  fare?: number;
}

export type DrinkEvent = {
  name: string;
  type: "drinking";
  amounts: number;
}

export type Event = GeekSeekEvent | CommuteEvent | DrinkEvent | WalkEvent |  {
  name: string;
  type: "remote" | "energy" | "nuka";
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
      val.match(/^((?:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(?:\.\d+)?))(Z|[\+-]\d{2}:\d{2})?)$/)) {
      return new Date(Date.parse(val));
    }
    return val;
  }
  return JSON.parse(str, reviver);
};

export class PersistenceClient {
  async calendarEvents(token: string | null, currentMonth: string): Promise<DateEvent[] | undefined> {
    if (!token) return undefined

    const days: DateEvent[] = parseWithDate(await fetch(`/api/date_events?${new URLSearchParams({ currentMonth })}`, { headers: { Authorization: `Bearer ${token}` } }).then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText)
      return resp.text()
    }
    ));
    const lastItem = days.slice(-1)[0]

    if (lastItem.date.getTime() - new Date().getTime() < (2 + 14) * 86400 * 1000) {
      return [...days, ...new Array(7).fill(undefined).map((_, i) => {
        const date = new Date(lastItem.date.getTime() + (i + 1) * 86400 * 1000)
        return { date, events: [], workingDay: [1, 2, 3, 4, 5].includes(date.getDay()), }
      })]
    }

    return [...days]
  }

  async saveCalendarEvents(token: string | null, data: DateEvent[] | undefined, currentMonth: string): Promise<void> {
    if (!token || !data) return

    await fetch(`/api/date_events?${new URLSearchParams({ currentMonth })}`, { method: 'post', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText)
    })
  }

  async transitInformation(token: string | null): Promise<TransitInformation> {
    if (!token) return { unitPrice: 1, lastModified: new Date() }

    const data: TransitInformation = parseWithDate(await fetch("/api/transit_information", { headers: { Authorization: `Bearer ${token}` } }).then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText)
      return resp.text()
    }));
    return data;
  }
}
