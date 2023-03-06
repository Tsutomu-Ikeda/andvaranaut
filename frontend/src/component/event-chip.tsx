import { FC } from "react";
import { Event } from "../lib/persistence";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  eventChip: {
    textAlign: "center",
    padding: "2px",
    fontSize: "10px",
    transformOrigin: "center",
    lineHeight: "10px",
    borderRadius: "2px",
  },
});

type EventChipProps = { event: Event; disabled?: boolean };

export const EventChip: FC<EventChipProps> = ({ event, disabled }) => {
  const classes = useStyles();

  const getEventChipTextColor = (): string => {
    const alpha = !disabled ? "0.87" : "0.3"

    return `rgba(255, 255, 255, ${alpha})`;
  };

  const getEventChipBackgroundColor = (): string => {
    if (disabled) return "rgba(56, 56, 56, 0.3)";

    switch (event.type) {
      case "commute":
        return "#347d3c";
      case "drinking":
        return "#bd7221";
      case "energy":
        return "#8121bd";
      case "geek-seek":
        return "#21adbd";
      case "nuka":
        return "#bdba21";
      case "remote":
        return "#bc3737";
      case "walking":
        return "#948917";
      default:
        const colorUndefinedEvent: never = event;
        throw new Error(colorUndefinedEvent);
    }
  };

  return (
    <div
      className={classes.eventChip}
      style={{ backgroundColor: getEventChipBackgroundColor(), color: getEventChipTextColor() }}
    >
      {event.name}
    </div>
  );
};
