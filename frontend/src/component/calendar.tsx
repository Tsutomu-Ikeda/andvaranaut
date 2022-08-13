import { FC, useState, CSSProperties, useMemo } from "react";
import { DateEvent, Event } from "../lib/persistence";
import Modal from "react-modal";
import { EventChip } from "./event-chip";
import { createUseStyles } from "react-jss";
import { useDarkMode } from "../hooks/use-dark-mode";

const allEvents: Event[] = [
  {
    name: "出社",
    type: "commute",
  },
  {
    name: "在宅",
    type: "remote",
  },
  {
    name: "徒歩",
    type: "walking",
  },
  {
    name: "GS",
    type: "geek-seek",
    amounts: 1000,
  },
  {
    name: "GS",
    type: "geek-seek",
    amounts: 1000,
  },
  {
    name: "*",
    type: "drinking",
  },
  {
    name: "ENG",
    type: "energy",
  },
];

const modalContentStyle: CSSProperties = {
  backgroundColor: "#242424",
  width: "80vw",
  maxWidth: "840px",
  padding: "1em",
  userSelect: "none",
  overflow: "scroll",
  margin: "auto",
  border: "none",
  flexDirection: "column",
  height: "min-content",
  minHeight: "60vh",
  maxHeight: "90vh",
  borderRadius: "5px",
};
const dayBaseStyle: CSSProperties = {
  textAlign: "right",
  padding: "45px 10px 3px",
  letterSpacing: "1px",
  fontSize: "12px",
  boxSizing: "border-box",
  position: "relative",
  userSelect: "none",
};

type StyleProps = {
  dark?: boolean;
};

const useStyles = createUseStyles<string, StyleProps>({
  calendar: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "repeat(7, 102px)",
    gridGap: "1px",
    border: "1px solid rgb(187, 187, 187)",
    backgroundColor: "rgb(187, 187, 187)",
    boxSizing: "border-box",
    overflow: "auto",
    position: "relative",
  },
  events: {
    display: "grid",
    width: "calc(100% - 12px)",
    height: "10px",
    gridGap: "3px",
    gridTemplateColumns: "repeat(auto-fill, 28px)",
    justifyContent: "left",
  },
  topLeft: {
    position: "absolute",
    left: "6px",
    top: "8px",
  },
  modalInnerContainer: {
    width: "100%",
    padding: "20px 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 80%)",
    justifyContent: "center",
    alignContent: "center",
  },
  blue: (props) => ({
    color: props.dark ? "rgb(126, 145, 242)" : "rgb(38, 101, 236)",
  }),
  red: (props) => ({
    color: props.dark ? "rgb(248, 106, 106)" : "rgb(229, 44, 44)",
  }),
  day: (props) => ({
    ...dayBaseStyle,
    backgroundColor: props.dark ? "#333" : "#fff",
    "&:hover": {
      backgroundColor: props.dark ? "#666" : "#ddd",
    },
  }),
  disabledDay: (props) => ({
    ...dayBaseStyle,
    color: props.dark ? "#ffffff4C" : "#21354788",
    backgroundColor: props.dark ? "rgba(56, 56, 56, 0.87)" : "#ccc",
  }),
  holiday: (props) => ({
    ...dayBaseStyle,
    backgroundColor: props.dark ? "#555" : "#eee",
    "&:hover": {
      backgroundColor: props.dark ? "#666" : "#ddd",
    },
  }),
});

interface CalendarProps {
  dateEvents: DateEvent[];
  setDateEvents: React.Dispatch<React.SetStateAction<DateEvent[] | undefined>>;
  currentMonth: string;
}
export const Calendar: FC<CalendarProps> = ({
  dateEvents,
  setDateEvents,
  currentMonth,
}) => {
  const [currentDateEventIndex, setCurrentDateEventIndex] = useState<
    number | undefined
  >();
  const { dark } = useDarkMode();
  const classes = useStyles({ dark });
  const daysOfWeeks = [
    { name: "月" },
    { name: "火" },
    { name: "水" },
    { name: "木" },
    { name: "金" },
    { name: "土", color: classes.blue },
    { name: "日", color: classes.red },
  ];
  const getText = (dateEvent: DateEvent) => {
    if (dateEvent.date?.getDate?.() == 1) {
      return `${dateEvent.date.getMonth() + 1}/${dateEvent.date.getDate()}`;
    }

    return dateEvent.date?.getDate?.();
  };
  const currentFormValues = useMemo(() => {
    if (currentDateEventIndex === undefined) return;
    const events = dateEvents[currentDateEventIndex].events;

    return {
      workTypeValue: events.find((event) =>
        ["commute", "remote"].includes(event.type)
      )?.type as "commute" | "remote" | undefined,
      walkingValue: !!events.find((event) => ["walking"].includes(event.type)),
      geekSeekCount: events.filter((event) =>
        ["geek-seek"].includes(event.type)
      ).length,
      drinkingValue: !!events.find((event) =>
        ["drinking"].includes(event.type)
      ),
      drinkingName: events.find((event) => ["drinking"].includes(event.type))
        ?.name,
      energyDrinkValue: !!events.find((event) =>
        ["energy"].includes(event.type)
      ),
    };
  }, [currentDateEventIndex, dateEvents]);
  const updateEvent = (
    current: DateEvent[],
    index: number,
    newEvents: Event[]
  ) => {
    const getNewEvents = () => {
      let geekSeekCount = 0;
      const allGeekSeekCount = newEvents.filter(
        (event) => event.type === "geek-seek"
      ).length;
      const newEventTypes = newEvents.map((event) => event.type);

      return allEvents
        .filter((event) => {
          if (event.type === "geek-seek") geekSeekCount += 1;

          if (!newEventTypes.includes(event.type)) return false;
          if (event.type === "geek-seek" && geekSeekCount > allGeekSeekCount)
            return false;

          return true;
        })
        .map((event) => {
          if (event.type === "drinking")
            return {
              type: "drinking",
              name: newEvents.find((event) => event.type === "drinking")?.name,
            } as Event;

          return event;
        });
    };

    return [
      ...current.slice(0, index),
      {
        ...current[index],
        events: getNewEvents(),
      },
      ...current.slice(index + 1),
    ];
  };

  return (
    <>
      <div className={classes.calendar}>
        {daysOfWeeks.map((dayOfWeek, index) => (
          <div className={["day-name", dayOfWeek.color].join(" ")} key={index}>
            {dayOfWeek.name}
          </div>
        ))}
        {dateEvents &&
          dateEvents.map((day, index) => {
            const disabled = day.date && day.date < new Date(currentMonth);
            return (
              <div
                className={
                  disabled
                    ? classes.disabledDay
                    : day.workingDay
                    ? classes.day
                    : classes.holiday
                }
                key={index}
                onClick={
                  !disabled
                    ? (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentDateEventIndex(index);
                      }
                    : undefined
                }
              >
                {getText(day)}
                <div className={[classes.events, classes.topLeft].join(" ")}>
                  {day.events.map((event, index) => (
                    <EventChip event={event} key={index} disabled={disabled} />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
      <Modal
        isOpen={currentDateEventIndex !== undefined}
        style={{
          content: modalContentStyle,
          overlay: {
            backgroundColor: "rgba(56, 56, 56, 0.7)",
          },
        }}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={() => {
          setCurrentDateEventIndex(undefined);
        }}
      >
        {currentDateEventIndex !== undefined && (
          <div className={classes.modalInnerContainer}>
            <h2>
              {dateEvents[currentDateEventIndex].date
                .toISOString()
                .slice(0, 10)
                .replaceAll("-", "/")}{" "}
              (
              {
                daysOfWeeks[
                  (dateEvents[currentDateEventIndex].date.getDay() + 6) % 7
                ].name
              }
              )
            </h2>
            <div className={classes.events} style={{ margin: "12px 0" }}>
              {dateEvents[currentDateEventIndex].events.map((event, index) => (
                <EventChip event={event} key={index} />
              ))}
            </div>
            <div>
              {dateEvents[currentDateEventIndex].workingDay && (
                <>
                  <label htmlFor="work-type">出社 or 在宅？:</label>
                  <select
                    value={currentFormValues?.workTypeValue}
                    onChange={(e) => {
                      setDateEvents((current) => {
                        if (current === undefined) return current;
                        return updateEvent(current, currentDateEventIndex, [
                          { type: e.target.value } as any,
                          ...current[currentDateEventIndex].events.filter(
                            (event) =>
                              ![
                                "commute",
                                "remote",
                                ...(e.target.value == "remote"
                                  ? ["walking"]
                                  : []),
                              ].includes(event.type)
                          ),
                        ]);
                      });
                    }}
                    id="work-type"
                  >
                    <option value="commute">出社</option>
                    <option value="remote">在宅</option>
                  </select>
                  <br />
                  {currentFormValues?.workTypeValue === "commute" && (
                    <>
                      <label htmlFor="walking">徒歩で帰った？:</label>
                      <input
                        id="walking"
                        type="checkbox"
                        checked={currentFormValues?.walkingValue}
                        onChange={(e) => {
                          setDateEvents((current) => {
                            if (current === undefined) return current;
                            return updateEvent(current, currentDateEventIndex, [
                              ...(e.target.checked
                                ? [{ type: "walking" } as any]
                                : []),
                              ...current[currentDateEventIndex].events.filter(
                                (event) => !["walking"].includes(event.type)
                              ),
                            ]);
                          });
                        }}
                      ></input>
                      <br />
                    </>
                  )}
                  <label htmlFor="geek-seek">GEEK SEEK回数:</label>
                  <input
                    id="geek-seek"
                    type="number"
                    min={0}
                    max={2}
                    value={currentFormValues?.geekSeekCount}
                    onChange={(e) => {
                      const newGeekSeekEvents = new Array<Event>(
                        Number(e.target.value)
                      ).fill({
                        type: "geek-seek",
                        name: "GS",
                        amounts: 1000,
                      } as any);
                      setDateEvents((current) => {
                        if (current === undefined) return current;
                        return updateEvent(current, currentDateEventIndex, [
                          ...newGeekSeekEvents,
                          ...current[currentDateEventIndex].events.filter(
                            (event) => !["geek-seek"].includes(event.type)
                          ),
                        ]);
                      });
                    }}
                  ></input>{" "}
                  <br />
                </>
              )}
              <label htmlFor="drinking">飲酒した？:</label>
              <input
                id="drinking"
                type="checkbox"
                checked={currentFormValues?.drinkingValue}
                onChange={(e) => {
                  setDateEvents((current) => {
                    if (current === undefined) return current;
                    return updateEvent(current, currentDateEventIndex, [
                      ...(e.target.checked
                        ? [{ type: "drinking", name: "飲酒" } as any]
                        : []),
                      ...current[currentDateEventIndex].events.filter(
                        (event) => !["drinking"].includes(event.type)
                      ),
                    ]);
                  });
                }}
              ></input>{" "}
              {currentFormValues?.drinkingValue && (
                <input
                  type="text"
                  value={currentFormValues.drinkingName}
                  onChange={(e) => {
                    setDateEvents((current) => {
                      if (current === undefined) return current;
                      return updateEvent(current, currentDateEventIndex, [
                        { type: "drinking", name: e.target.value } as any,
                        ...current[currentDateEventIndex].events.filter(
                          (event) => !["drinking"].includes(event.type)
                        ),
                      ]);
                    });
                  }}
                />
              )}
              <br />
              <label htmlFor="energy-drink">エナドリ飲んだ？:</label>
              <input
                id="energy-drink"
                type="checkbox"
                checked={currentFormValues?.energyDrinkValue}
                onChange={(e) => {
                  setDateEvents((current) => {
                    if (current === undefined) return current;
                    return updateEvent(current, currentDateEventIndex, [
                      ...(e.target.checked ? [{ type: "energy" } as any] : []),
                      ...current[currentDateEventIndex].events.filter(
                        (event) => !["energy"].includes(event.type)
                      ),
                    ]);
                  });
                }}
              ></input>{" "}
              <br />
              <button
                onClick={(e) => {
                  setDateEvents((current) => {
                    if (current === undefined) return current;
                    return updateEvent(current, currentDateEventIndex, []);
                  });
                }}
              >
                クリア
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
