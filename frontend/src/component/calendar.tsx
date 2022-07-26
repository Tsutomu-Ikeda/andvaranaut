import { FC } from "react";
import { DateEvent } from "../lib/persistence";

interface CalendarProps {
  days: DateEvent[];
  currentMonth: string;
}

export const Calendar: FC<CalendarProps> = ({ days, currentMonth }) => {
  const getText = (dateEvent: DateEvent) => {
    if (dateEvent.date?.getDate?.() == 1) {
      return `${dateEvent.date.getMonth() + 1}/${dateEvent.date.getDate()}`;
    }

    return dateEvent.date?.getDate?.();
  };

  return (
    <>
      <div className="calendar">
        <div className="day-name">月</div>
        <div className="day-name">火</div>
        <div className="day-name">水</div>
        <div className="day-name">木</div>
        <div className="day-name">金</div>
        <div className="day-name blue">土</div>
        <div className="day-name red">日</div>
        {days &&
          days.map((day, index) => (
            <div
              className={`day ${
                day.date && day.date < new Date(currentMonth) && "disabled"
              }`}
              key={index}
            >
              {getText(day)}
              <div className="events">
                {day.events
                  // .filter((event) => event.type == "drinking")
                  .map((event, index) => (
                    <div className={`event-chip ${event.type}`} key={index}>
                      {event.name}
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
