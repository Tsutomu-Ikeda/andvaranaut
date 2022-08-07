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
  constructor() {
  }

  async calendarEvents(): Promise<DateEvent[]> {
    const days: DateEvent[] = parseWithDate(await fetch("http://localhost:8000/api/dateEvents/").then((resp) => resp.text()));
    const remainDays: DateEvent[] = new Array((7 - days.length % 7) % 7)
      .fill(undefined)
      .map((_, i) => ({ date: undefined, events: [] }));

    return [...days, ...remainDays]
  }

  async transitInformation(): Promise<TransitInformation> {
    const data: TransitInformation = parseWithDate(await fetch("http://localhost:8000/api/transitInformation/").then((resp) => resp.text()));
    return data;
  }
}
