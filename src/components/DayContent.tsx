import React, { useImperativeHandle, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { convertSolar2Lunar } from '../helper/HelperLunar';

export type DayStatus =
  | 'NONE'
  | 'SINGLE_CHOSEN'
  | 'RANGE_BEGIN_CHOSEN'
  | 'RANGE_MIDDLE_CHOSEN'
  | 'RANGE_END_CHOSEN';

export type DayProps = {
  date: Date;
  available: boolean;
  dayTitleColor: string;
  isToday: boolean;
  status: DayStatus;
};

export interface DayContentRef {
  getDateString: () => string;

  changeStatus: (dayStatus: DayStatus) => void;

  changeAvailable: (available: boolean) => void;
}

const DayContent = React.forwardRef<
  DayContentRef,
  DayProps & {
    onPressDay?: (date: Date) => void;
  }
>((props, ref) => {
  const { date } = props;

  const titleSolar = useMemo(() => date.getDate(), [date]);

  const titleLunar = useMemo(() => {
    const dateLunar = convertSolar2Lunar(
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
      date.getTimezoneOffset() / 60
    );

    if (titleSolar === 1 || dateLunar[0] === 1) {
      return `${dateLunar[0]}/${dateLunar[1]}`;
    }
    return `${dateLunar[0]}`;
  }, [date, titleSolar]);

  const { isToday } = props;

  const styleToday = useMemo(() => {
    if (isToday) {
      return {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 20,
      };
    }
    return {};
  }, [isToday]);

  const { status } = props;

  const [dayStatus, setDayStatus] = useState<DayStatus>(status);

  const styleWithStatus = useMemo(() => {
    switch (dayStatus) {
      case 'NONE':
        return {
          styleContainerBgLeft: {},
          styleContainerBgRight: {},
          styleContent: {},
          styleText: {},
        };

      case 'SINGLE_CHOSEN':
        return {
          styleContainerBgLeft: {},
          styleContainerBgRight: {},
          styleContent: {
            backgroundColor: 'red',
            borderRadius: 20,
          },
          styleText: { color: 'white' },
        };

      case 'RANGE_BEGIN_CHOSEN':
        return {
          styleContainerBgLeft: {},
          styleContainerBgRight: {
            backgroundColor: 'red',
          },
          styleContent: {
            backgroundColor: 'red',
            borderRadius: 20,
          },
          styleText: { color: 'white' },
        };

      case 'RANGE_MIDDLE_CHOSEN':
        return {
          styleContainerBgLeft: { backgroundColor: 'red' },
          styleContainerBgRight: { backgroundColor: 'red' },
          styleContent: { backgroundColor: 'red' },
          styleText: { color: 'white' },
        };

      case 'RANGE_END_CHOSEN':
        return {
          styleContainerBgLeft: {
            backgroundColor: 'red',
          },
          styleContainerBgRight: {},
          styleContent: {
            backgroundColor: 'red',
            borderRadius: 20,
          },
          styleText: { color: 'white' },
        };

      default:
        return {
          styleContainerBgLeft: {},
          styleContainerBgRight: {},
          styleContent: {},
          styleText: {},
        };
    }
  }, [dayStatus]);

  const { available, onPressDay } = props;

  const [dayAvailable, setDayAvailable] = useState(available);

  const onPress = () => {
    if (dayAvailable && onPressDay) {
      onPressDay(date);
    }
  };

  const styleWithAvailable = useMemo(() => {
    if (dayAvailable) {
      return {};
    }
    return { color: 'gray' };
  }, [dayAvailable]);

  useImperativeHandle(
    ref,
    () => ({
      getDateString: () => date.toLocaleDateString(),

      changeStatus: (dayStatusParam: DayStatus) => {
        setDayStatus(dayStatusParam);
      },

      changeAvailable: (dayAvailableParam: boolean) => {
        setDayAvailable(dayAvailableParam);
      },
    }),
    [date]
  );

  const { dayTitleColor } = props;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={onPress}
    >
      <View style={styles.containerBg}>
        <View
          style={[
            styles.containerBgContent,
            styleWithStatus.styleContainerBgLeft,
          ]}
        />
        <View
          style={[
            styles.containerBgContent,
            styleWithStatus.styleContainerBgRight,
          ]}
        />
      </View>
      <View style={[styles.content, styleToday, styleWithStatus.styleContent]}>
        <Text
          style={[
            styles.textSolarDate,
            { color: dayTitleColor },
            styleWithAvailable,
            styleWithStatus.styleText,
          ]}
        >
          {titleSolar}
        </Text>
        <Text
          style={[
            styles.textLunarDate,
            { color: dayTitleColor },
            styleWithAvailable,
            styleWithStatus.styleText,
          ]}
        >
          {titleLunar}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default React.memo(DayContent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  containerBg: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
  },
  containerBgContent: {
    width: '50%',
    height: 40,
    flexDirection: 'row',
  },
  content: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  textSolarDate: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
  },
  textLunarDate: {
    fontSize: 8,
    fontWeight: 'normal',
    color: 'black',
  },
});
