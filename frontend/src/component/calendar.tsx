import { FC, useState, CSSProperties } from "react";
import { DateEvent } from "../lib/persistence";
import Modal from "react-modal";
import { EventChip } from "./event-chip";
import { createUseStyles } from "react-jss";
import { useDarkMode } from "../hooks/use-dark-mode";

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
  days: DateEvent[];
  currentMonth: string;
}
export const Calendar: FC<CalendarProps> = ({ days, currentMonth }) => {
  const [currentDateEvent, setCurrentDateEvent] = useState<
    DateEvent | undefined
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

  return (
    <>
      <div className={classes.calendar}>
        {daysOfWeeks.map((dayOfWeek, index) => (
          <div className={["day-name", dayOfWeek.color].join(" ")} key={index}>
            {dayOfWeek.name}
          </div>
        ))}
        {days &&
          days.map((day, index) => {
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
                        setCurrentDateEvent(day);
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
        isOpen={!!currentDateEvent}
        style={{
          content: modalContentStyle,
          overlay: {
            backgroundColor: "rgba(56, 56, 56, 0.7)",
          },
        }}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onRequestClose={() => {
          setCurrentDateEvent(undefined);
        }}
      >
        {currentDateEvent && (
          <div className={classes.modalInnerContainer}>
            {currentDateEvent.date && (
              <h2>
                {currentDateEvent.date
                  .toISOString()
                  .slice(0, 10)
                  .replaceAll("-", "/")}{" "}
                ({daysOfWeeks[(currentDateEvent.date.getDay() + 6) % 7].name})
              </h2>
            )}
            <div className={classes.events} style={{ margin: "12px 0" }}>
              {currentDateEvent.events.map((event, index) => (
                <EventChip event={event} key={index} />
              ))}
            </div>
            <div>
              {currentDateEvent.workingDay && (
                <>
                  <label htmlFor="work-type">出社 or 在宅？:</label>
                  <select id="work-type">
                    <option>出社</option>
                    <option>在宅</option>
                  </select>
                  <br />
                  <label htmlFor="walking">徒歩で帰った？:</label>
                  <input id="walking" type="checkbox"></input> <br />
                  <label htmlFor="geek-seek">GEEK SEEK回数:</label>
                  <input
                    id="geek-seek"
                    type="number"
                    min={0}
                    max={2}
                  ></input>{" "}
                  <br />
                </>
              )}
              <label htmlFor="drinking">飲酒した？:</label>
              <input id="drinking" type="checkbox"></input> <br />
              <label htmlFor="energy-drink">エナドリ飲んだ？:</label>
              <input id="energy-drink" type="checkbox"></input> <br />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
