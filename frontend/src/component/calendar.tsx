import { FC, useState, CSSProperties } from "react";
import { DateEvent } from "../lib/persistence";
import Modal from "react-modal";
import { EventChip } from "./event-chip";
import { createUseStyles } from "react-jss";
import { useDarkMode } from "../hooks/use-dark-mode";
import { daysOfWeeks } from "../lib/calendar";
import { DateEditor } from "./date-editor";
import { Badge } from "@mui/material/";

const modalContentStyle: (props: StyleProps) => CSSProperties = ({ dark }) => ({
  backgroundColor: dark ? "#242424" : "#fff",
  width: "80vw",
  maxWidth: "840px",
  userSelect: "none",
  overflow: "scroll",
  margin: "auto",
  border: "none",
  height: "min-content",
  minHeight: "70vh",
  maxHeight: "90vh",
  borderRadius: "5px",
});
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

const theme = {
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
  formGroup: {
    margin: "20px 0",
  },
  topLeft: {
    position: "absolute",
    left: "6px",
    top: "8px",
  },
  topLeftBadge: {
    position: "absolute",
    left: "12px",
    top: "12px",
    transform: "translateY(-50%) scale(0.7)",
  },
  modalInnerContainer: {
    width: "100%",
    padding: "20px",
  },
  blue: (props: StyleProps) => ({
    color: props.dark ? "rgb(126, 145, 242)" : "rgb(38, 101, 236)",
  }),
  red: (props: StyleProps) => ({
    color: props.dark ? "rgb(248, 106, 106)" : "rgb(229, 44, 44)",
  }),
  day: (props: StyleProps) => ({
    ...dayBaseStyle,
    backgroundColor: props.dark ? "#333" : "#fff",
    "&:hover": {
      backgroundColor: props.dark ? "#666" : "#ddd",
    },
  }),
  disabledDay: (props: StyleProps) => ({
    ...dayBaseStyle,
    color: props.dark ? "#ffffff4C" : "#21354788",
    backgroundColor: props.dark ? "rgba(56, 56, 56, 0.87)" : "#ccc",
  }),
  holiday: (props: StyleProps) => ({
    ...dayBaseStyle,
    backgroundColor: props.dark ? "#555" : "#eee",
    "&:hover": {
      backgroundColor: props.dark ? "#666" : "#ddd",
    },
  }),
};

type StyleKeys = keyof typeof theme;
const useStyles = createUseStyles<StyleKeys, StyleProps>(theme);

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
          <div
            className={[
              "day-name",
              ...(dayOfWeek.color !== undefined
                ? [classes[dayOfWeek.color]]
                : []),
            ].join(" ")}
            key={index}
          >
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
                  {day.events.slice(0, 8).map((event, index) => (
                    <EventChip event={event} key={index} disabled={disabled} />
                  ))}
                </div>
                {day.events.length > 8 && (
                  <Badge
                    badgeContent={day.events.length}
                    color="primary"
                    className={classes.topLeftBadge}
                  />
                )}
              </div>
            );
          })}
      </div>
      <Modal
        isOpen={currentDateEventIndex !== undefined}
        style={{
          content: modalContentStyle({ dark }),
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
            <DateEditor
              classes={classes}
              dateEvents={dateEvents}
              currentDateEventIndex={currentDateEventIndex}
              setDateEvents={setDateEvents}
            />
          </div>
        )}
      </Modal>
    </>
  );
};
