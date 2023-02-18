import { FC, useState, CSSProperties } from "react";
import { DateEvent } from "../lib/persistence";
import Modal from "react-modal";
import { EventChip } from "./event-chip";
import { createUseStyles } from "react-jss";
import { useDarkMode } from "../hooks/use-dark-mode";
import { daysOfWeeks } from "../lib/calendar";
import { DateEditor } from "./date-editor";
import { Badge, Checkbox, FormControlLabel } from "@mui/material/";
import { JssStyle } from "jss";

const style: (s: JssStyle) => JssStyle = (s) => s;

const dateWidth = 102,
  dateHeight = 66,
  dateGapSize = 1,
  dayNameHeight = 30;

const DateText: React.FC<{ dateEvent: DateEvent; today: Date }> = ({
  dateEvent,
  today,
}) => {
  const currentDateChipSize = 20;
  const getText = (dateEvent: DateEvent) => {
    if (dateEvent.date?.getDate?.() == 1) {
      return `${dateEvent.date.getMonth() + 1}/${dateEvent.date.getDate()}`;
    }

    return dateEvent.date?.getDate?.();
  };

  const isToday =
    new Date(dateEvent.date).setHours(0, 0, 0, 0) ==
    new Date(today).setHours(0, 0, 0, 0);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "right",
        alignItems: "end",
      }}
    >
      <div
        style={{
          minWidth: `${currentDateChipSize}px`,
          height: `${currentDateChipSize}px`,
          borderRadius: `${currentDateChipSize / 2}px`,
          backgroundColor: isToday ? "#bf0a0a" : undefined,
          color: isToday ? "#fff" : undefined,
          padding: "0px 6px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {getText(dateEvent)}
      </div>
    </div>
  );
};

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
const dayBaseStyle: JssStyle = {
  width: `${dateWidth}px`,
  height: `${dateHeight}px`,
  position: "absolute",
  textAlign: "right",
  padding: "5px 3px",
  letterSpacing: `${dateGapSize}px`,
  fontSize: "12px",
  userSelect: "none",
};

type StyleProps = {
  dark?: boolean;
};

const theme = {
  calendar: style({
    width: (dateWidth + dateGapSize) * 7 + dateGapSize,
    backgroundColor: "rgb(187, 187, 187)",
    position: "relative",
  }),
  events: style({
    display: "grid",
    width: "calc(100% - 12px)",
    height: "10px",
    gridGap: "3px",
    gridTemplateColumns: "repeat(auto-fill, 28px)",
    justifyContent: "left",
  }),
  formGroup: style({
    margin: "20px 0",
  }),
  topLeft: style({
    position: "absolute",
    left: "6px",
    top: "8px",
  }),
  topLeftBadge: style({
    position: "absolute",
    left: "12px",
    top: "12px",
    transform: "translateY(-50%) scale(0.7)",
  }),
  modalInnerContainer: style({
    width: "100%",
    padding: "20px",
  }),
  dayName: (props: StyleProps): JssStyle => ({
    position: "absolute",
    width: `${dateWidth}px`,
    height: `${dayNameHeight}px`,
    top: "0px",
    fontSize: "12px",
    textAlign: "center",
    lineHeight: `${dayNameHeight}px`,
    fontWeight: 500,
    backgroundColor: props.dark ? "rgb(56, 56, 56)" : "rgb(250, 250, 250)",
    userSelect: "none",
  }),
  blue: (props: StyleProps): JssStyle => ({
    color: props.dark ? "rgb(126, 145, 242)" : "rgb(38, 101, 236)",
  }),
  red: (props: StyleProps): JssStyle => ({
    color: props.dark ? "rgb(248, 106, 106)" : "rgb(229, 44, 44)",
  }),
  day: (props: StyleProps): JssStyle => ({
    ...dayBaseStyle,
    backgroundColor: props.dark ? "#333" : "#fff",
    "&:hover": {
      backgroundColor: props.dark ? "#666" : "#ddd",
    },
  }),
  disabledDay: (props: StyleProps): JssStyle => ({
    ...dayBaseStyle,
    color: props.dark ? "#ffffff4C" : "#21354788",
    backgroundColor: props.dark ? "rgba(56, 56, 56, 0.87)" : "#ccc",
  }),
  futureDay: style({
    ...dayBaseStyle,
    opacity: 0.8,
  }),
  holiday: (props: StyleProps): JssStyle => ({
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
  const [displayEventTags, setDisplayEventTags] = useState<{
    [key: string]: { enabled: boolean; label: string };
  }>({
    commute: { enabled: true, label: "出社" },
    remote: { enabled: true, label: "在宅" },
    drinking: { enabled: true, label: "飲酒量" },
    other: { enabled: true, label: "その他" },
  });
  const { dark } = useDarkMode();
  const today = new Date();
  const classes = useStyles({ dark });

  return (
    <>
      <div
        className={classes.calendar}
        style={{
          height:
            ((dateEvents?.length ?? 0) / 7) * (dateHeight + dateGapSize) +
            dayNameHeight +
            dateGapSize * 2,
        }}
      >
        {daysOfWeeks.map((dayOfWeek, index) => (
          <div
            className={[
              classes.dayName,
              ...(dayOfWeek.color !== undefined
                ? [classes[dayOfWeek.color]]
                : []),
            ].join(" ")}
            style={{
              top: dateGapSize,
              left: index * (dateWidth + dateGapSize) + dateGapSize,
            }}
            key={index}
          >
            {dayOfWeek.name}
          </div>
        ))}
        <div
          style={{
            color: dark ? "rgba(255, 255, 255, 0.87)" : "#213547",
            backgroundColor: "transparent",
            position: "absolute",
            width: `${dateWidth}px`,
            top: dateGapSize,
            left: 7 * (dateWidth + dateGapSize) + dateGapSize,
            fontSize: "12px",
            textAlign: "center",
            lineHeight: `${dayNameHeight}px`,
            fontWeight: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          週の飲酒量
        </div>
        {dateEvents &&
          new Array(dateEvents.length / 7)
            .fill(undefined)
            .map((_undefined, weekIndex) => {
              const weekEvents = dateEvents.slice(
                weekIndex * 7,
                (weekIndex + 1) * 7
              );

              const alcoholAmount =
                weekEvents[0].date.getFullYear() >= 2023
                  ? weekEvents.reduce(
                      (sum, date) =>
                        sum +
                        date.events
                          .map((event) =>
                            event.type === "drinking" ? event.amounts ?? 0 : 0
                          )
                          .reduce((dateSum, val) => dateSum + val, 0),
                      0
                    )
                  : undefined;

              const elements = [
                ...weekEvents.map((day, index) => {
                  const disabled =
                    day.date && day.date < new Date(currentMonth);
                  return (
                    <div
                      className={[
                        disabled
                          ? classes.disabledDay
                          : day.workingDay
                          ? classes.day
                          : classes.holiday,
                        ...(new Date(day.date).setHours(0, 0, 0, 0) >
                        new Date(today).setHours(0, 0, 0, 0)
                          ? [classes.futureDay]
                          : []),
                      ].join(" ")}
                      style={{
                        left: index * (dateWidth + dateGapSize) + dateGapSize,
                        top:
                          weekIndex * (dateHeight + dateGapSize) +
                          dayNameHeight +
                          dateGapSize * 2,
                      }}
                      key={index}
                      onClick={
                        !disabled
                          ? (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCurrentDateEventIndex(index + weekIndex * 7);
                            }
                          : undefined
                      }
                    >
                      <DateText dateEvent={day} today={today} />
                      <div
                        className={[classes.events, classes.topLeft].join(" ")}
                      >
                        {day.events
                          .filter(
                            (event) =>
                              displayEventTags[event.type as string]?.enabled ??
                              displayEventTags.other.enabled
                          )
                          .slice(0, 8)
                          .map((event, index) => (
                            <EventChip
                              event={event}
                              key={index}
                              disabled={disabled}
                            />
                          ))}
                      </div>
                      {day.events.filter(
                        (event) =>
                          displayEventTags[event.type as string]?.enabled ??
                          displayEventTags.other.enabled
                      ).length > 8 && (
                        <Badge
                          badgeContent={day.events.length}
                          color="primary"
                          className={classes.topLeftBadge}
                        />
                      )}
                    </div>
                  );
                }),
                <div
                  key={7}
                  style={{
                    width: `${dateWidth}px`,
                    height: `${dateHeight}px`,
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    top:
                      weekIndex * (dateHeight + dateGapSize) +
                      dayNameHeight +
                      dateGapSize * 2,
                    left: (dateWidth + dateGapSize) * 7 + dateGapSize,
                    fontSize: "12px",
                    textAlign: "center",
                    lineHeight: `${dayNameHeight}px`,
                    fontWeight: 500,
                  }}
                >
                  {alcoholAmount !== undefined
                    ? `${alcoholAmount} mg`
                    : undefined}
                </div>,
              ];
              return elements;
            })}
      </div>
      <div>
        {Object.entries(displayEventTags).map(([key, value]) => {
          return (
            <FormControlLabel
              sx={{ my: 1 }}
              key={key}
              control={
                <Checkbox
                  checked={value.enabled}
                  onChange={(e) => {
                    setDisplayEventTags((current) => {
                      current[key] = {
                        enabled: e.target.checked,
                        label: value.label,
                      };
                      return {
                        ...current,
                      };
                    });
                  }}
                />
              }
              label={value.label}
            />
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
