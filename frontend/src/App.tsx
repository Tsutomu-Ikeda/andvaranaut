import { FunctionComponent, useMemo, useState } from "react";
import { useAsync } from "react-use";
import "./App.css";
import { PersistenceClient, DateEvent } from "./lib/persistence";

const dup = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const App: FunctionComponent = () => {
  const currentMonth = "2022-07";
  const client = new PersistenceClient();
  const { value: transitInformation } = useAsync(client.transitInformation);
  const getText = (dateEvent: DateEvent) => {
    if (dateEvent.date?.getDate?.() == 1) {
      return `${dateEvent.date.getMonth() + 1}/${dateEvent.date.getDate()}`;
    }

    return dateEvent.date?.getDate?.();
  };
  const { value: days } = useAsync(client.calendarEvents, []);
  const commuteCounts = useMemo(() => {
    return days?.reduce((prev: { [key: string]: number }, current) => {
      if (!current.events.some((event) => event.type == "commute")) return prev;
      if (!current.date) return prev;
      const key = current.date.toISOString().slice(0, 7);
      if (!prev[key]) prev[key] = 1;
      else prev[key] += 1;

      return prev;
    }, {});
  }, [days]);
  const walkCounts = useMemo(() => {
    return days?.reduce((prev: { [key: string]: number }, current) => {
      if (!current.events.some((event) => event.type == "walking")) return prev;
      if (!current.date) return prev;
      const key = current.date.toISOString().slice(0, 7);
      if (!prev[key]) prev[key] = 1;
      else prev[key] += 1;

      return prev;
    }, {});
  }, [days]);
  const geekSeekCounts = useMemo(() => {
    return days?.reduce(
      (
        prev: { [key: string]: { times: number; amounts: number } },
        current
      ) => {
        const counts = current.events.reduce(
          (prev, event) => prev + (event.type == "geek-seek" ? 1 : 0),
          0
        );
        if (counts == 0) return prev;
        if (!current.date) return prev;
        const amounts = current.events.reduce((prev, event) => {
          if (event.type != "geek-seek") return prev;
          return prev + event.amounts;
        }, 0);
        const key = current.date.toISOString().slice(0, 7);
        if (!prev[key]) prev[key] = { times: counts, amounts };
        else
          prev[key] = {
            times: prev[key].times + counts,
            amounts: prev[key].amounts + amounts,
          };

        return prev;
      },
      {}
    );
  }, [days]);

  return (
    <div className="App">
      <h1>Andvaranaut</h1>
      <div className="calendar">
        <div className="day-name">月</div>
        <div className="day-name">火</div>
        <div className="day-name">水</div>
        <div className="day-name">木</div>
        <div className="day-name">金</div>
        <div className="day-name blue">土</div>
        <div className="day-name red">日</div>
        {days &&
          days.map((day, index) => (
            <div
              className={`day ${
                day.date && day.date < new Date(currentMonth) && "disabled"
              }`}
              key={index}
            >
              {getText(day)}
              <div className="events">
                {day.events
                  // .filter((event) => event.type == "drinking")
                  .map((event, index) => (
                    <div className={`event-chip ${event.type}`} key={index}>
                      {event.name}
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
      <div className="card">
        <h2>交通費管理</h2>
        <div className="text">
          出勤回数: {commuteCounts && commuteCounts[currentMonth]}
        </div>
        <div className="text">
          徒歩帰宅回数: {walkCounts && walkCounts[currentMonth]}
        </div>
        <div className="text">
          合計金額:{" "}
          {walkCounts &&
            commuteCounts &&
            transitInformation.unitPrice *
              (Object.entries(commuteCounts).filter(([key, _value]) => (new Date(key) >= new Date(currentMonth))).reduce(
                (prev, [_key, count]) => prev + count,
                0
              ) *
                2 -
                Object.entries(walkCounts).filter(([key, _value]) => (new Date(key) >= new Date(currentMonth))).reduce(
                  (prev, [_key, count]) => prev + count,
                  0
                ))}
        </div>
        <div className="text">
          最終更新日: {transitInformation && transitInformation.lastModified.toISOString().slice(0, 10)}
        </div>
        <h2>GEEK SEEK</h2>
        {geekSeekCounts &&
          Object.entries(geekSeekCounts).map((geekSeekCount, index) => (
            <div key={index}>
              {geekSeekCount[0]}: {geekSeekCount[1].times}回, 合計金額:{" "}
              {geekSeekCount[1].amounts}
            </div>
          ))}
        <h2>持株会</h2>
      </div>
    </div>
  );
};

export default App;
