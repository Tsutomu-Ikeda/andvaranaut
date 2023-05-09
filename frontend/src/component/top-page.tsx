import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "./calendar";
import { useLogin } from "../hooks/use-login";
import { Typography } from "@mui/material";
import {
  PersistenceClient,
  CommuteEvent,
  DateEvent,
  TransitInformation,
  WalkEvent,
} from "../lib/persistence";
import * as env from "../env";
import { PendingBadge } from "./pending-badge";
import { useDisplaySize } from "../hooks/use-display-size";

type CommuteStats = {
  costs: { [key: string]: number };
  counts: { [key: string]: number };
  walkCounts: { [key: string]: number };
};

export const TopPage: FC = () => {
  const currentMonth = "2023-04";
  const redirectWaitSeconds = 1;
  const { isAuthLoading, isAuthenticated, token, state } = useLogin();
  const [dateEvents, setDateEvents] = useState<DateEvent[]>();

  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        setDateEvents(
          await new PersistenceClient().calendarEvents(token, currentMonth)
        );

        setTimeout(() => {
          setIsEditing(false);
          isEditingRef.current = false;
        }, 10);
      } catch (e) {
        setAuthError("認証に失敗しました");
      }
    })();
  }, [token]);

  useEffect(() => {
    setIsEditing(true);
    isEditingRef.current = true;

    const timeout = setTimeout(async () => {
      if (!isEditingRef.current) return;

      setIsSaving(true);
      try {
        await new PersistenceClient().saveCalendarEvents(
          token,
          dateEvents,
          currentMonth
        );
        setTransitInformation((current) => {
          if (current === undefined) return current;
          return { ...current, lastModified: new Date() };
        });
      } finally {
        setIsSaving(false);
        setIsEditing(false);
        isEditingRef.current = false;
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [dateEvents]);

  const today = new Date();
  const [authError, setAuthError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [transitInformation, setTransitInformation] =
    useState<TransitInformation>();
  const { displaySize } = useDisplaySize();

  useEffect(() => {
    (async () => {
      if (isAuthLoading) return;

      if (!isAuthenticated) {
        setAuthError("ログインしていません");
        setIsLoading(false);
        return;
      }

      try {
        setTransitInformation(
          await new PersistenceClient().transitInformation(token)
        );
      } catch (e) {
        setAuthError("認証に失敗しました");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token, isAuthenticated, isAuthLoading]);

  const {
    costs: totalCommuteCosts,
    counts: commuteCounts,
    walkCounts,
  }: CommuteStats = useMemo<CommuteStats | undefined>(() => {
    if (!transitInformation) return { costs: {}, counts: {}, walkCounts: {} };
    const data = dateEvents
      ?.filter((dateEvent) => dateEvent.date <= today)
      .reduce<CommuteStats>(
        (prev, current) => {
          const commuteEvent = current.events.find(
            (event): event is CommuteEvent => event.type == "commute"
          );
          const walkEvents = current.events.filter(
            (event): event is WalkEvent => event.type == "walking"
          );
          const walkTotalFare: number = walkEvents.reduce(
            (total, event) =>
              total + (event.fare ?? -transitInformation.unitPrice),
            0
          );
          if (!commuteEvent) return prev;
          if (!current.date) return prev;
          const key = current.date.toISOString().slice(0, 7);

          prev.counts[key] = (prev.counts[key] ?? 0) + 1;
          prev.walkCounts[key] =
            (prev.walkCounts[key] ?? 0) + walkEvents.length;

          prev.costs[key] =
            (prev.costs[key] ?? 0) +
            (commuteEvent.fare !== undefined
              ? commuteEvent.fare + walkTotalFare
              : transitInformation.unitPrice * (2 - walkEvents.length));

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
  useEffect(() => {
    if (authError) {
      setTimeout(() => {
        window.location.href = env.loginPageUrl(state);
      }, redirectWaitSeconds * 1000);
    }
  }, [authError]);

  if (isLoading) return <div>読み込み中...</div>;

  if (authError) {
    return (
      <>
        {authError}
        <br />
        再度 <a href={env.loginPageUrl(state)}>ログインページ</a>{" "}
        からログインしてください。
        <br />
        自動的にリダイレクトします。
      </>
    );
  }

  return (
    <div className="App" id="App">
      <Typography variant="h1">Andvaranaut</Typography>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: displaySize === "pc" ? "5px 25px" : "5px 0px",
        }}
      >
        最終更新日時:{" "}
        {transitInformation && transitInformation.lastModified.toLocaleString()}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: displaySize === "pc" ? "5px 25px" : "5px 0px",
        }}
      >
        <PendingBadge synced={!isEditing && !isSaving} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: displaySize === "pc" ? "5px 25px" : "5px 0px",
        }}
      >
        <a href="http://localhost:3333/daily-report-editor/">日報入力</a>
      </div>
      {dateEvents && (
        <Calendar
          dateEvents={dateEvents}
          setDateEvents={setDateEvents}
          currentMonth={currentMonth}
        />
      )}
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
            {Object.entries(geekSeekCounts)
              .filter(
                ([key, _value]) => new Date(key) >= new Date(currentMonth)
              )
              .reduce(
                (prev, [_key, geekSeekCount]) => prev + geekSeekCount.amounts,
                0
              )
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
