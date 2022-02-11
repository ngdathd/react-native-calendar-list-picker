import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import DayContent, { DayContentRef } from './components/DayContent';
import DayTitle from './components/DayTitle';
import MonthTitle from './components/MonthTitle';
import {
  DayOfWeek,
  genCalendarData,
  getDate,
  getDateInRange,
  Tuple,
} from './helper/HelperCalendar';

interface IProps {
  /**
   * - 'single': choose a date
   * - 'multiple': choose a date range
   */
  modePress: 'single' | 'multiple';
  /**
   * Date selected as start date
   */
  startDate?: Date;
  /**
   * Date selected as end date
   */
  endDate?: Date;
  /**
   * Date range is displayed
   * - An array containing 2 date
   */
  fullDateRange?: Tuple<Date, 2>;
  /**
   * Selectable date range
   * - An array containing 2 date
   */
  availableDateRange?: Tuple<Date, 2>;
  /**
   * Full name array of month of the year. Starting in January
   * - An array containing 12 names of month of the year
   */
  arrayFullNameMonthOfYear?: Tuple<string, 12>;
  /**
   * Maximum number of months displayed
   * @default 3
   */
  maxMonths?: number;
  /**
   * Short name array of days of the week. Starting on Sunday
   * - An array containing 7 names of days of the week
   */
  arrayShortNameDayOfWeek?: Tuple<string, 7>;
  /**
   * First day of the week
   * @default "Mon"
   */
  startDayOfWeek?: keyof typeof DayOfWeek;

  /**
   * Callback when selected date.
   * @param startDate date selected as start date
   * @param endDate date selected as end date
   */
  onSelectionDate?: (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;
}

export interface CalendarListRef {
  /**
   * Action choose a date range
   * @param startDate date selected as start date
   * @param endDate date selected as end date
   */
  chooseRangeDate: (
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => void;

  /**
   * Action choose available date
   * @param availableStartDate date selected as available start date
   * @param availableEndDate date selected as available end date
   */
  chooseAvailableDate: (
    availableStartDate: Date | undefined,
    availableEndDate: Date | undefined
  ) => void;
}

const CalendarList = forwardRef<CalendarListRef, IProps>((props, ref) => {
  const {
    startDate,
    endDate,
    fullDateRange,
    availableDateRange,
    arrayFullNameMonthOfYear,
    maxMonths,
    arrayShortNameDayOfWeek,
    startDayOfWeek,
  } = props;

  /**
   * Initialize @constant calendarData data of the calendar
   */
  const calendarData = useMemo(
    () =>
      genCalendarData(
        startDate,
        endDate,
        fullDateRange,
        availableDateRange,
        arrayFullNameMonthOfYear,
        maxMonths,
        arrayShortNameDayOfWeek,
        startDayOfWeek
      ),
    []
  );

  const startDateChoose = useRef(startDate ? getDate(startDate) : undefined);
  const endDateChoose = useRef(endDate ? getDate(endDate) : undefined);

  if (!startDateChoose.current && endDateChoose.current) {
    startDateChoose.current = endDateChoose.current;
    endDateChoose.current = undefined;
  }

  // startDateChoose.current, endDateChoose.current were valuable.

  const { onSelectionDate } = props;

  useEffect(() => {
    if (onSelectionDate) {
      onSelectionDate(startDateChoose.current, endDateChoose.current);
    }
  }, []);

  /**
   * @constant arrDateInRange selected date range
   */
  const arrDateInRange = useRef(
    getDateInRange(startDateChoose.current, endDateChoose.current)
  );

  /**
   * @constant objRefDate object containing ref of day
   */
  const objRefDate = useRef<{ [key: string]: DayContentRef }>({});

  /**
   * Change the status of dates between @constant startDateChoose and @constant endDateChoose
   */
  const drawArrDayInRange = () => {
    if (arrDateInRange.current) {
      // Change the status of dates in arrDateInRange to NONE
      for (let index = 0; index < arrDateInRange.current.length; index += 1) {
        const keyRefDate = arrDateInRange.current[index];
        objRefDate.current[keyRefDate]?.changeStatus('NONE');
      }
    }

    // Calculate arrDateInRange
    arrDateInRange.current = getDateInRange(
      startDateChoose.current,
      endDateChoose.current
    );

    // Change the status of dates in arrDateInRange
    if (arrDateInRange.current) {
      if (arrDateInRange.current.length === 1) {
        objRefDate.current[arrDateInRange.current[0]]?.changeStatus(
          'SINGLE_CHOSEN'
        );
      } else {
        for (let index = 0; index < arrDateInRange.current.length; index += 1) {
          const keyRefDate = arrDateInRange.current[index];
          if (index === 0) {
            objRefDate.current[keyRefDate]?.changeStatus('RANGE_BEGIN_CHOSEN');
          } else if (index === arrDateInRange.current.length - 1) {
            objRefDate.current[keyRefDate]?.changeStatus('RANGE_END_CHOSEN');
          } else {
            objRefDate.current[keyRefDate]?.changeStatus('RANGE_MIDDLE_CHOSEN');
          }
        }
      }
    }

    if (onSelectionDate) {
      onSelectionDate(startDateChoose.current, endDateChoose.current);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      chooseRangeDate: (
        startDateParam: Date | undefined,
        endDateParam: Date | undefined
      ) => {
        startDateChoose.current = startDateParam
          ? getDate(startDateParam)
          : undefined;
        endDateChoose.current = endDateParam
          ? getDate(endDateParam)
          : undefined;

        drawArrDayInRange();
      },

      chooseAvailableDate: (
        availableStartDate: Date | undefined,
        availableEndDate: Date | undefined
      ) => {
        const arrDateAvailable = getDateInRange(
          availableStartDate,
          availableEndDate
        );
        if (arrDateAvailable) {
          Object.keys(objRefDate.current).forEach((key) => {
            if (arrDateAvailable.includes(key)) {
              objRefDate.current[key]?.changeAvailable(true);
            } else {
              objRefDate.current[key]?.changeAvailable(false);
            }
          });
        }
      },
    }),
    []
  );

  /**
   * Recalculate start and end dates.
   * @param date date selected
   */
  const recalculateStartEndDates = (date: Date) => {
    if (startDateChoose.current) {
      if (endDateChoose.current) {
        // startDate: Date, endDate: Date
        startDateChoose.current = date;
        endDateChoose.current = undefined;
      }
      // startDate: Date, endDate: undefined
      else if (date.getTime() < startDateChoose.current.getTime()) {
        endDateChoose.current = startDateChoose.current;
        startDateChoose.current = date;
      } else if (date.getTime() === startDateChoose.current.getTime()) {
        endDateChoose.current = date;
        startDateChoose.current = date;
      } else {
        endDateChoose.current = date;
      }
    } else if (endDateChoose.current) {
      // startDate: undefined, endDate: Date
      startDateChoose.current = date;
    } else {
      // startDate: undefined, endDate: undefined
      startDateChoose.current = date;
    }
  };

  const { modePress } = props;

  const onPressDay = (date: Date) => {
    if (modePress === 'multiple') {
      recalculateStartEndDates(date);
    } else {
      startDateChoose.current = date;
      endDateChoose.current = date;
    }

    drawArrDayInRange();
  };

  const initArrRefDate = (dayContentRef: DayContentRef) => {
    if (dayContentRef) {
      objRefDate.current[dayContentRef.getDateString()] = dayContentRef;
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const {
      type,
      monthTitle,
      dayTitle,
      dayTitleColor,
      date,
      available,
      isToday,
      status,
    } = item;
    if (type === 'month') {
      if (monthTitle) {
        return <MonthTitle monthTitle={monthTitle} />;
      }
      return null;
    }

    if (type === 'dayOfWeek') {
      return <DayTitle dayTitle={dayTitle} dayTitleColor={dayTitleColor} />;
    }

    if (date) {
      return (
        <DayContent
          ref={initArrRefDate}
          date={date}
          available={available}
          dayTitleColor={dayTitleColor}
          isToday={isToday}
          status={status}
          onPressDay={onPressDay}
        />
      );
    }

    return <View style={styles.content} />;
  }, []);

  const getItemLayout = useCallback(
    (_date: any, index: number) => ({
      length: 40,
      offset: 40 * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback(
    (_item: any, index: number) => index.toString(),
    []
  );

  const renderItemSeparatorComponent = useCallback(
    () => <View style={styles.itemSeparator} />,
    []
  );

  return (
    <FlatList
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      numColumns={7}
      data={calendarData}
      extraData={calendarData}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      maxToRenderPerBatch={16}
      initialNumToRender={8}
      windowSize={7}
    />
  );
});

export default React.memo(CalendarList);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  itemSeparator: {
    height: 4,
  },
});
