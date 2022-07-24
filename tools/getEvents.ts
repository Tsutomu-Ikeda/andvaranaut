const numDatesFromBeginningOfYear = (date: Date): number => {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const beginning = new Date(date);
  beginning.setMonth(0);
  beginning.setDate(1);
  beginning.setHours(0, 0, 0, 0);

  return (current.getTime() - beginning.getTime()) / 86400000 + 1
}

const getEvents = (date: Date) => {
  const events: any = [];
  if ([2, 3, 4].includes(date.getDay()))
    events.push({ name: "出勤", type: "commute" });
  if ([1, 5].includes(date.getDay()))
    events.push({ name: "在宅", type: "remote" });

  if ([2, 3, 4].includes(date.getDay()) && numDatesFromBeginningOfYear(date) % 3 == 2)
    events.push({ name: "徒歩", type: "walking" });
  // console.log(numDatesFromBeginningOfYear(date));
  if (numDatesFromBeginningOfYear(date) % 3 == 0) events.push({ name: "飲酒", type: "drinking" });
  if (numDatesFromBeginningOfYear(date) % 4 == 0) events.push({ name: "ENG", type: "energy" });

  return events;
};
let dateCounter = new Date(`2022-08-01T00:00:00Z`);

const days = new Array(31).fill(undefined).map(() => {
  const date = new Date(dateCounter);
  dateCounter.setDate(dateCounter.getDate() + 1)
  return {
    date,
    // events: getEvents(date),
    events: [],
  }
});

console.log(JSON.stringify(days))
