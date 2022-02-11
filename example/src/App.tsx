import * as React from 'react';
import { StyleSheet, Text, SafeAreaView } from 'react-native';
import {
  CalendarList,
  CalendarListRef,
} from 'react-native-calendar-list-picker';

const App = () => {
  const calendarListRef = React.useRef<CalendarListRef>(null);

  const selectDate = () => {
    calendarListRef.current?.chooseRangeDate(
      new Date('2022-02-10'),
      new Date('2022-02-12')
    );
  };

  const setAvailable = () => {
    calendarListRef.current?.chooseAvailableDate(
      new Date('2022-01-20'),
      new Date('2022-02-20')
    );
  };

  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();

  const onSelectionDate = (
    startDateParam: Date | undefined,
    endDateParam: Date | undefined
  ) => {
    console.log('startDate: ', startDateParam, 'endDate: ', endDateParam);
    setStartDate(startDateParam);
    setEndDate(endDateParam);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.button} onPress={selectDate}>
        Select from <Text style={styles.highlight}>2022-02-10</Text> to{' '}
        <Text style={styles.highlight}>2022-02-12</Text>
      </Text>
      <Text style={styles.button} onPress={setAvailable}>
        Set available from <Text style={styles.highlight}>2022-01-20</Text> to{' '}
        <Text style={styles.highlight}>2022-02-20</Text>
      </Text>
      <Text style={styles.button}>
        From{' '}
        <Text style={styles.highlight}>{startDate?.toLocaleDateString()}</Text>{' '}
        to <Text style={styles.highlight}>{endDate?.toLocaleDateString()}</Text>
      </Text>

      <CalendarList
        ref={calendarListRef}
        modePress="multiple"
        fullDateRange={[new Date('2022-01-01'), new Date('2022-03-31')]}
        availableDateRange={[new Date('2022-02-01'), new Date('2022-03-31')]}
        startDate={new Date('2022-02-16')}
        endDate={new Date('2022-02-20')}
        onSelectionDate={onSelectionDate}
      />
    </SafeAreaView>
  );
};

export default React.memo(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    margin: 4,
    paddingVertical: 8,
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'blue',
  },
  highlight: {
    color: 'orange',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});
