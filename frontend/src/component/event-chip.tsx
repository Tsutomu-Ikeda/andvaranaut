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
    color: "rgba(255, 255, 255, 0.87)",
  },
  commute: {
    backgroundColor: "#347d3c",
  },
  remote: {
    backgroundColor: "#bc3737",
  },
  walking: {
    backgroundColor: "#948917",
  },
  drinking: {
    backgroundColor: "#bd7221",
  },
  energy: {
    backgroundColor: "#8121bd",
  },
  nuka: {
    backgroundColor: "#bdba21",
  },
  "geek-seek": {
    backgroundColor: "#21adbd",
  },
  disabled: {
    color: "#ffffff4C",
    backgroundColor: "rgba(56, 56, 56, 0.3)",
  },
});

type EventChipProps = { event: Event; disabled?: boolean };

export const EventChip: FC<EventChipProps> = ({ event, disabled }) => {
  const classes = useStyles();

  return (
    <div
      className={[
        classes.eventChip,
        classes[event.type],
        disabled ? classes.disabled : undefined,
      ].join(" ")}
    >
      {event.name}
    </div>
  );
};
