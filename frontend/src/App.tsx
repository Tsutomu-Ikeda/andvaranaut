import { FC, useMemo } from "react";
import { useAsync } from "react-use";
import "./App.css";
import { Calendar } from "./component/calendar";
import { PersistenceClient, CommuteEvent } from "./lib/persistence";

const dup = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

type CommuteStats = {
  costs: { [key: string]: number };
  counts: { [key: string]: number };
  walkCounts: { [key: string]: number };
};

const App: FC = () => {
  const currentMonth = "2022-07";
  const client = useMemo(() => new PersistenceClient(), []);
  const { value: transitInformation } = useAsync(client.transitInformation, [
    currentMonth,
  ]);
  const { value: days } = useAsync(client.calendarEvents, [currentMonth]);
  const {
    costs: totalCommuteCosts,
    counts: commuteCounts,
    walkCounts,
  }: CommuteStats = useMemo<CommuteStats | undefined>(() => {
    if (!transitInformation) return { costs: {}, counts: {}, walkCounts: {} };
    const data = days?.reduce<CommuteStats>(
      (prev, current) => {
        const commuteEvent: CommuteEvent | undefined = current.events.find(
          (event) => event.type == "commute"
        ) as any;
        const walkEventCount: number = current.events.filter(
          (event) => event.type == "walking"
        ).length;
        if (!commuteEvent) return prev;
        if (!current.date) return prev;
        const key = current.date.toISOString().slice(0, 7);

        prev.counts[key] = (prev.counts[key] ?? 0) + 1;
        prev.walkCounts[key] = (prev.walkCounts[key] ?? 0) + walkEventCount;

        prev.costs[key] =
          (prev.costs[key] ?? 0) +
          (commuteEvent.fare ??
            transitInformation.unitPrice * (2 - walkEventCount));

        return prev;
      },
      { costs: {}, counts: {}, walkCounts: {} }
    );
    return data;
  }, [days, transitInformation]) ?? { costs: {}, counts: {}, walkCounts: {} };
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
    <div className="App" id="App">
      <h1>Andvaranaut</h1>
      <div className="meta">
        最終更新日:{" "}
        {transitInformation && transitInformation.lastModified.toISOString()}
      </div>
      <div className="meta">
        <a href="http://localhost:3333/daily-report-editor/">日報入力</a>
      </div>
      {days && <Calendar days={days} currentMonth={currentMonth}></Calendar>}
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
            totalCommuteCosts &&
            `${Object.entries(totalCommuteCosts)
              .filter(
                ([key, _value]) => new Date(key) >= new Date(currentMonth)
              )
              .reduce((prev, [_key, cost]) => {
                return prev + cost;
              }, 0)
              .toLocaleString()}円`}
        </div>
        <h2>GEEK SEEK</h2>
        {geekSeekCounts && (
          <div className="text">
            合計金額:{" "}
            {Object.values(geekSeekCounts)
              .reduce((prev, geekSeekCount) => prev + geekSeekCount.amounts, 0)
              .toLocaleString()}
            円
            <div className="details">
              {Object.entries(geekSeekCounts).map((geekSeekCount, index) => (
                <div key={index}>
                  {geekSeekCount[0]}: {geekSeekCount[1].times}回, 小計:{" "}
                  {geekSeekCount[1].amounts.toLocaleString()}円
                </div>
              ))}
            </div>
          </div>
        )}
        <h2>持株会</h2>
      </div>
    </div>
  );
};

export default App;
