import { FC } from "react";
import { createUseStyles } from "react-jss";

export type pendingBadgeProps = {
  synced: boolean;
};

const useStyles = createUseStyles({
  circle: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  pending: {
    background: "#e9ac27",
  },
  synced: {
    background: "#4ad85d",
  },
});

export const PendingBadge: FC<pendingBadgeProps> = ({ synced }) => {
  const classes = useStyles();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        columnGap: "5px",
      }}
    >
      <div
        className={[
          classes.circle,
          synced ? classes.synced : classes.pending,
        ].join(" ")}
      ></div>
      <div style={{ float: "left" }}>{synced ? "synced" : "pending..."}</div>
    </div>
  );
};
