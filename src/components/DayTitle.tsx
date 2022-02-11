import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type DayTitleProps = {
  type: 'dayOfWeek';
  dayTitle: string;
  dayTitleColor: string;
};

const DayTitle = (
  props: Pick<DayTitleProps, 'dayTitle'> & Pick<DayTitleProps, 'dayTitleColor'>
) => {
  const { dayTitle, dayTitleColor } = props;

  return (
    <View style={styles.container}>
      <Text style={[styles.contentDayOfWeek, { color: dayTitleColor }]}>
        {dayTitle}
      </Text>
    </View>
  );
};

export default React.memo(DayTitle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  contentDayOfWeek: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});
