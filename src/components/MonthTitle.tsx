import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type MonthProps = {
  type: 'month';
  monthOfYear: string;
  monthTitle: `${string}-${string}`;
};

const MonthTitle = (props: Pick<MonthProps, 'monthTitle'>) => {
  const { monthTitle } = props;
  const [month, year] = monthTitle.split('-');

  return (
    <View style={styles.container}>
      <Text style={styles.monthHeaderText}>{`${month} ${year}`}</Text>
      <View style={styles.line} />
    </View>
  );
};

export default React.memo(MonthTitle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 40,
    justifyContent: 'space-evenly',
    paddingTop: 4,
  },
  monthHeaderText: {
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
    textAlignVertical: 'center',
    paddingHorizontal: 16,
  },
  line: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: 'black',
  },
});
