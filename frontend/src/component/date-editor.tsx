import { FC, useMemo } from "react";
import { EventChip } from "./event-chip";
import { DateEvent, Event } from "../lib/persistence";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import { daysOfWeeks } from "../lib/calendar";
import { Classes } from "jss";
import IconButton from "@mui/material/IconButton";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

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

export type DateEditorClasses = Classes<"events" | "formGroup">;

export type DateEditorProps = {
  classes: DateEditorClasses;
  dateEvents: DateEvent[];
  currentDateEventIndex: number;
  setDateEvents: React.Dispatch<React.SetStateAction<DateEvent[] | undefined>>;
};

export const DateEditor: FC<DateEditorProps> = ({
  classes,
  dateEvents,
  currentDateEventIndex,
  setDateEvents,
}) => {
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

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Typography variant="h2">
        {dateEvents[currentDateEventIndex].date
          .toISOString()
          .slice(0, 10)
          .replaceAll("-", "/")}
        (
        {
          daysOfWeeks[(dateEvents[currentDateEventIndex].date.getDay() + 6) % 7]
            .name
        }
        )
      </Typography>
      <div className={classes.events} style={{ margin: "12px 0" }}>
        {dateEvents[currentDateEventIndex].events.map((event, index) => (
          <EventChip event={event} key={index} />
        ))}
      </div>
      <FormGroup className={classes.formGroup} sx={{ mx: 2 }}>
        {dateEvents[currentDateEventIndex].workingDay && (
          <>
            <FormControl sx={{ my: 1 }}>
              <InputLabel id="work-type-select-label">勤務種別</InputLabel>
              <Select
                id="work-type-select"
                labelId="work-type-select-label"
                value={currentFormValues?.workTypeValue}
                label="勤務種別"
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
                            ...(e.target.value == "remote" ? ["walking"] : []),
                          ].includes(event.type)
                      ),
                    ]);
                  });
                }}
              >
                <MenuItem value="commute">出社</MenuItem>
                <MenuItem value="remote">在宅</MenuItem>
              </Select>
            </FormControl>
            {currentFormValues?.workTypeValue === "commute" && (
              <FormControlLabel
                sx={{ my: 1 }}
                control={
                  <Checkbox
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
                  />
                }
                label="徒歩で帰宅した"
              />
            )}
            <TextField
              sx={{ my: 1 }}
              label="GEEK SEEK回数"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                inputProps: {
                  min: 0,
                  max: 2,
                },
              }}
              variant="standard"
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
            />
          </>
        )}
        <FormControlLabel
          sx={{ my: 1 }}
          control={
            <Checkbox
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
            />
          }
          label="飲酒した"
        />
        {currentFormValues?.drinkingValue && (
          <TextField
            sx={{ my: 1, mx: 2 }}
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

        <FormControlLabel
          sx={{ my: 1 }}
          control={
            <Checkbox
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
            />
          }
          label="エナドリを飲んだ"
        />
      </FormGroup>
      <div style={{ position: "absolute", top: "-5px", right: "-5px" }}>
        <IconButton
          sx={{ my: 1 }}
          onClick={(e) => {
            setDateEvents((current) => {
              if (current === undefined) return current;
              return updateEvent(current, currentDateEventIndex, []);
            });
          }}
        >
          <DeleteForeverIcon color="error" titleAccess="クリア" />
        </IconButton>
      </div>
    </div>
  );
};
