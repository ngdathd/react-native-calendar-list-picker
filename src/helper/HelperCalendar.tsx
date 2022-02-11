import type { DayProps, DayStatus } from '../components/DayContent';
import type { DayTitleProps } from '../components/DayTitle';
import type { MonthProps } from '../components/MonthTitle';

export const DayOfWeek = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & {
  length: TLength;
};

function addDate(date: Date, day: number) {
  return new Date(date.getTime() + day * 24 * 60 * 60 * 1000);
}

export function getDate(date: Date) {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? `0${date.getMonth() + 1}`
      : `${date.getMonth() + 1}`;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;

  return new Date(`${year}-${month}-${day}`);
}

function getLastDateOfMonth(fullYear: number, month: number) {
  let titleMonth: string = `${month + 1}`;
  if (month + 1 < 10) {
    titleMonth = `0${titleMonth}`;
  }

  const lastDate = new Date(fullYear, month + 1, 0);
  let titleDate = `${lastDate.getDate()}`;
  if (lastDate.getDate() < 10) {
    titleDate = `0${lastDate.getDate()}`;
  }

  return new Date(`${fullYear}-${titleMonth}-${titleDate}`);
}

function getLastDateOfNextMonth(today: Date, maxMonths: number) {
  const nowYear = today.getFullYear();
  const nowMonth = today.getMonth();
  const nextMonth = nowMonth + maxMonths - 1;
  const quotient = (nextMonth - (nextMonth % 12)) / 12;
  const mod = nextMonth % 12;
  return getLastDateOfMonth(nowYear + quotient, mod);
}

function getDayTitleColor(dayOfWeek: number) {
  switch (dayOfWeek) {
    case DayOfWeek.Sat:
      return 'green';
    case DayOfWeek.Sun:
      return 'red';
    default:
      return 'black';
  }
}

export function getDateInRange(startDate?: Date, endDate?: Date) {
  if (startDate) {
    if (endDate) {
      const a = [];
      let d = startDate;
      for (; d <= endDate; d = addDate(d, 1)) {
        a.push(d.toLocaleDateString());
      }
      return a;
    }
    return [startDate.toLocaleDateString()];
  }
  if (endDate) {
    return [endDate.toLocaleDateString()];
  }
  return undefined;
}

/**
 * Full name array of month of the year. Starting in January
 * - An array containing 12 names of month of the year
 * @default
 */
const arrayFullNameMonthOfYearDefault: Tuple<string, 12> = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Short name array of days of the week. Starting on Sunday
 * - An array containing 7 names of days of the week
 * @default
 */
const arrayTitleDayOfWeekDefault: Tuple<string, 7> = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

export function genCalendarData(
  startDateChoose?: Date,
  endDateChoose?: Date,
  fullDateRange?: Tuple<Date, 2>,
  availableDateRange?: Tuple<Date, 2>,
  arrayFullNameMonthOfYear: Tuple<string, 12> = arrayFullNameMonthOfYearDefault,
  maxMonths: number = 3,
  arrayShortNameDayOfWeek: Tuple<string, 7> = arrayTitleDayOfWeekDefault,
  startDayOfWeek: keyof typeof DayOfWeek = 'Mon'
): (Partial<MonthProps> | Partial<DayTitleProps> | Partial<DayProps>)[] {
  let startDate;
  let endDate;
  let availableStartDate;
  let availableEndDate;

  const today = getDate(new Date());

  if (fullDateRange) {
    [startDate, endDate] = fullDateRange;
    if (availableDateRange) {
      [availableStartDate, availableEndDate] = availableDateRange;
    } else {
      availableStartDate = today;
      availableEndDate = getLastDateOfNextMonth(today, maxMonths);
    }
  } else {
    startDate = new Date(new Date(today).setDate(1));
    if (availableDateRange) {
      [availableStartDate, availableEndDate] = availableDateRange;
      endDate = getLastDateOfMonth(
        availableEndDate.getFullYear(),
        availableEndDate.getMonth()
      );
    } else {
      availableStartDate = today;
      availableEndDate = getLastDateOfNextMonth(today, maxMonths);
      endDate = availableEndDate;
    }
  }

  startDate = getDate(startDate);
  endDate = getDate(endDate);
  availableStartDate = getDate(availableStartDate);
  availableEndDate = getDate(availableEndDate);

  // startDate, endDate, availableStartDate, availableEndDate were valuable.

  const monthDay: Record<string, Partial<DayProps>[]> = {};

  let curDate = startDate;

  while (curDate.getTime() <= endDate.getTime()) {
    // use `year-month` as the unique identifier
    const identifier = `${curDate.getFullYear()}-${curDate.getMonth() + 1}`;

    // if it is the first day of a month, init it with an array
    // Note: there are maybe several empty days at the first of each month
    if (!monthDay[identifier]) {
      monthDay[identifier] = [
        ...new Array(
          (curDate.getDay() + ((7 - (DayOfWeek[startDayOfWeek] % 7)) % 7)) % 7
        ).fill({}),
      ];
    }

    let status: DayStatus = 'NONE';
    if (startDateChoose) {
      if (endDateChoose) {
        // startDateChoose: Date, endDateChoose: Date
        if (startDateChoose.getTime() === endDateChoose.getTime()) {
          if (curDate.getTime() === startDateChoose.getTime()) {
            status = 'SINGLE_CHOSEN';
          }
        } else {
          if (
            curDate.getTime() > startDateChoose.getTime() &&
            curDate.getTime() < endDateChoose.getTime()
          ) {
            status = 'RANGE_MIDDLE_CHOSEN';
          }
          if (curDate.getTime() === startDateChoose.getTime()) {
            status = 'RANGE_BEGIN_CHOSEN';
          }
          if (curDate.getTime() === endDateChoose.getTime()) {
            status = 'RANGE_END_CHOSEN';
          }
        }
      }
      // startDateChoose: Date, endDateChoose: undefined
      else if (curDate.getTime() === startDateChoose.getTime()) {
        status = 'SINGLE_CHOSEN';
      }
    } else if (endDateChoose) {
      // startDateChoose: undefined, endDateChoose: Date
      if (curDate.getTime() === endDateChoose.getTime()) {
        status = 'SINGLE_CHOSEN';
      }
    } else {
      // startDateChoose: undefined, endDateChoose: undefined
      status = 'NONE';
    }

    // save each day's data into result
    const day: DayProps = {
      date: curDate,
      available: curDate >= availableStartDate && curDate <= availableEndDate,
      dayTitleColor: getDayTitleColor(curDate.getDay()),
      isToday: curDate.getTime() === today.getTime(),
      status,
    };
    monthDay[identifier].push(day);

    // curDate adds
    curDate = addDate(curDate, 1);
  }

  // there are several empty days in each month
  Object.keys(monthDay).forEach((key) => {
    const len = monthDay[key].length;
    monthDay[key].push(...new Array((7 - (len % 7)) % 7).fill({}));
  });

  const arrDate: (
    | Partial<MonthProps>
    | Partial<DayTitleProps>
    | Partial<DayProps>
  )[] = [];

  Object.keys(monthDay).forEach((key) => {
    const [year, month] = key.split('-');

    const monthTitle: `${string}-${string}` = `${
      arrayFullNameMonthOfYear[parseInt(month, 10) - 1]
    }-${year}`;

    arrDate.push({ type: 'month', monthOfYear: key, monthTitle });
    arrDate.push({ type: 'month' });
    arrDate.push({ type: 'month' });
    arrDate.push({ type: 'month' });
    arrDate.push({ type: 'month' });
    arrDate.push({ type: 'month' });
    arrDate.push({ type: 'month' });

    arrDate.push({
      type: 'dayOfWeek',
      dayTitleColor: getDayTitleColor(
        (DayOfWeek[startDayOfWeek] + DayOfWeek.Sun) % 7
      ),
      dayTitle:
        arrayShortNameDayOfWeek[
          (DayOfWeek[startDayOfWeek] + DayOfWeek.Sun) % 7
        ],
    });
    arrDate.push({
      type: 'dayOfWeek',
      dayTitleColor: getDayTitleColor(
        (DayOfWeek[startDayOfWeek] + DayOfWeek.Mon) % 7
      ),
      dayTitle:
        arrayShortNameDayOfWeek[
          (DayOfWeek[startDayOfWeek] + DayOfWeek.Mon) % 7
        ],
    });
    arrDate.push({
      type: 'dayOfWeek',
      dayTitleColor: getDayTitleColor(
        (DayOfWeek[startDayOfWeek] + DayOfWeek.Tue) % 7
      ),
      dayTitle:
        arrayShortNameDayOfWeek[
          (DayOfWeek[startDayOfWeek] + DayOfWeek.Tue) % 7
        ],
    });
    arrDate.push({
      type: 'dayOfWeek',
      dayTitleColor: getDayTitleColor(
        (DayOfWeek[startDayOfWeek] + DayOfWeek.Wed) % 7
      ),
      dayTitle:
        arrayShortNameDayOfWeek[
          (DayOfWeek[startDayOfWeek] + DayOfWeek.Wed) % 7
        ],
    });
    arrDate.push({
      type: 'dayOfWeek',
      dayTitleColor: getDayTitleColor(
        (DayOfWeek[startDayOfWeek] + DayOfWeek.Thu) % 7
      ),
      dayTitle:
        arrayShortNameDayOfWeek[
          (DayOfWeek[startDayOfWeek] + DayOfWeek.Thu) % 7
        ],
    });
    arrDate.push({
      type: 'dayOfWeek',
      dayTitleColor: getDayTitleColor(
        (DayOfWeek[startDayOfWeek] + DayOfWeek.Fri) % 7
      ),
      dayTitle:
        arrayShortNameDayOfWeek[
          (DayOfWeek[startDayOfWeek] + DayOfWeek.Fri) % 7
        ],
    });
    arrDate.push({
      type: 'dayOfWeek',
      dayTitleColor: getDayTitleColor(
        (DayOfWeek[startDayOfWeek] + DayOfWeek.Sat) % 7
      ),
      dayTitle:
        arrayShortNameDayOfWeek[
          (DayOfWeek[startDayOfWeek] + DayOfWeek.Sat) % 7
        ],
    });

    arrDate.push(...monthDay[key]);
  });

  return arrDate;
}
