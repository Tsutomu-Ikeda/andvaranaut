import * as fs from 'fs';

const initialData = JSON.parse(fs.readFileSync(0, 'utf-8'));

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
let dateCounter = new Date(`2022-06-27T00:00:00Z`);

const days = Object.entries(new Array(4 + 31 + 7).fill(undefined).reduce((prev) => {
  const date = new Date(dateCounter);
  dateCounter.setDate(dateCounter.getDate() + 1)
  prev[date.toISOString()] = {
    date,
    events: getEvents(date),
    ...prev[date.toISOString()],
    workingDay: [1, 2, 3, 4, 5].includes(date.getDay())
  }
  return prev
}, Object.fromEntries(initialData.map((day) => [day.date, day])))).map((row) => row[1]);

console.log(JSON.stringify(days))
