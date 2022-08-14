import { FC, useEffect, useMemo, useState } from "react";
import { Calendar } from "./calendar";
import { useLogin } from "../hooks/use-login";
import { Button, Typography } from "@mui/material";
import {
  PersistenceClient,
  CommuteEvent,
  DateEvent,
  TransitInformation,
} from "../lib/persistence";

type CommuteStats = {
  costs: { [key: string]: number };
  counts: { [key: string]: number };
  walkCounts: { [key: string]: number };
};

export const TopPage: FC = () => {
  const currentMonth = "2022-07";
  const { token } = useLogin();
  const [dateEvents, setDateEvents] = useState<DateEvent[]>();
  const [authError, setAuthError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [transitInformation, setTransitInformation] =
    useState<TransitInformation>();

  useEffect(() => {
    (async () => {
      try {
        setDateEvents(await new PersistenceClient().calendarEvents(token));
        setTransitInformation(
          await new PersistenceClient().transitInformation(token)
        );
      } catch {
        setAuthError("認証に失敗しました");
      }
    })();
  }, [token]);

  const {
    costs: totalCommuteCosts,
    counts: commuteCounts,
    walkCounts,
  }: CommuteStats = useMemo<CommuteStats | undefined>(() => {
    if (!transitInformation) return { costs: {}, counts: {}, walkCounts: {} };
    const data = dateEvents?.reduce<CommuteStats>(
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
  }, [dateEvents, transitInformation]) ?? {
    costs: {},
    counts: {},
    walkCounts: {},
  };
  const geekSeekCounts = useMemo(() => {
    return dateEvents?.reduce(
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
  }, [dateEvents]);

  if (authError) {
    return (
      <>
        {authError}
        <br /> 再度{" "}
        <a href="https://andv.auth.ap-northeast-1.amazoncognito.com/login?response_type=token&client_id=2ugimh4tmganbnn94kk1u6r4p3&redirect_uri=https://andv.tomtsutom.com/login">
          ログインページ
        </a>{" "}
        からログインしてください
      </>
    );
  }

  return (
    <div className="App" id="App">
      <Typography variant="h1">Andvaranaut</Typography>
      <div className="meta">
        最終更新日時:{" "}
        {transitInformation && transitInformation.lastModified.toLocaleString()}
      </div>
      <div className="meta">
        <a href="http://localhost:3333/daily-report-editor/">日報入力</a>
      </div>
      {dateEvents && (
        <Calendar
          dateEvents={dateEvents}
          setDateEvents={setDateEvents}
          currentMonth={currentMonth}
        ></Calendar>
      )}
      <div className="actions">
        <Button
          variant="contained"
          disabled={isSaving}
          onClick={async () => {
            setIsSaving(true);
            try {
              await new PersistenceClient().saveCalendarEvents(
                token,
                dateEvents
              );
            } finally {
              setIsSaving(false);
            }
          }}
        >
          保存
        </Button>
      </div>
      <div className="card">
        <Typography variant="h2">交通費管理</Typography>

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
        <div className="details">
          {Object.keys(commuteCounts)
            .filter((key) => new Date(key) >= new Date(currentMonth))
            .map((month) => (
              <div key={month}>
                <Typography variant="h3">{month}</Typography>
                <div className="text">
                  出社回数: {commuteCounts && commuteCounts[month]}
                </div>
                <div className="text">
                  徒歩帰宅回数: {walkCounts && walkCounts[month]}
                </div>
                <div className="text">
                  {walkCounts &&
                    totalCommuteCosts &&
                    `${Object.entries(totalCommuteCosts)
                      .filter(([key, _value]) => key == month)
                      .reduce((prev, [_key, cost]) => {
                        return prev + cost;
                      }, 0)
                      .toLocaleString()}円`}
                </div>
              </div>
            ))}
        </div>
        <Typography variant="h2">GEEK SEEK</Typography>
        {geekSeekCounts && (
          <div className="text">
            合計金額:{" "}
            {Object.values(geekSeekCounts)
              .reduce((prev, geekSeekCount) => prev + geekSeekCount.amounts, 0)
              .toLocaleString()}
            円
            <div className="details">
              {Object.entries(geekSeekCounts)
                .filter(([key]) => new Date(key) >= new Date(currentMonth))
                .map((geekSeekCount, index) => (
                  <div key={index}>
                    <Typography variant="h3">{geekSeekCount[0]}</Typography>
                    {geekSeekCount[1].times}回, 小計:{" "}
                    {geekSeekCount[1].amounts.toLocaleString()}円
                  </div>
                ))}
            </div>
          </div>
        )}
        <Typography variant="h2">持株会</Typography>
      </div>
    </div>
  );
};