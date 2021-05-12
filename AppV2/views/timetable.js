import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { styles } from "./styles/main.js";
import { View, Text } from "react-native";

import React from "react";

const Tab = createMaterialTopTabNavigator();

function getColor(name) {
  switch (name) {
    case "M":
      return "#1f39ad";
    case "REEV oder RERK":
      return "#A9A9A9";
    case "F":
      return "#4e0e6c";
    case "D":
      return "#942929";
    case "E":
      return "#aab422";
    case "PH":
      return "#c89d0e";
    case "CAS":
      return "#1f39ad";
    case "GG":
      return "#1d9a1d";
    case "ENT":
      return "#149474";
    case "SP":
      return "#714747";
    case "INF oder MB":
      return "#13a0a0";
    case "INF":
      return "#73a832";
    case "WL":
      return "#dc8109";
    case "Frei":
      return "#2C2F33";
    case "ET oder MT":
      return "#ff47bc";
    case "MB oder TINF":
      return "#52060b";
    case "Pause":
      return "#2C2F33";
    case "TINF":
      return "#073023";
    case "MB":
      return "#331b05";
    default:
      return "red";
  }
}

function isOddWeek() {
  let d = new Date();
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  if ([0, 6].includes(d.getDay())) weekNo++;
  if (weekNo % 2 === 0) return false;
  return true;
}

function lesson(day, index) {
  let bgColor = getColor(day.Subject);
  const times = ["7:30 - 09:00", "09:00 - 09:15", "09:15 - 10:45", "10:45 - 11:00", "11:00 - 12:30", "12:30 - 12:45", "12:45 - 14:15", "14:15 - 14:30"];
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={{ flex: 1, backgroundColor: "#23272A", color: "#7289DA", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "white" }}>{times[index]}</Text>
      </View>
      <View style={{ flex: 2, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "white" }}>{day.Subject}</Text>
      </View>
    </View>
  );
}

function day({ route }) {
  const { day } = route.params;
  const breakLesson = { Subject: "Pause", Room: "" };
  return (
    <View
      style={[
        styles.day,
        {
          flexDirection: "column",
        },
      ]}
    >
      {lesson(day[0], 0)}
      {lesson(breakLesson, 1)}
      {lesson(day[2], 2)}
      {lesson(breakLesson, 3)}
      {lesson(day[4], 4)}
      {lesson(breakLesson, 5)}
      {lesson(day[6], 6)}
      {lesson(breakLesson, 7)}
    </View>
  );
}

const timetableView = function (data) {
  let date = new Date();
  const week = isOddWeek() ? data.OddWeek : data.EvenWeek;
  const timetable = (
    <NavigationContainer theme={{ colors: { background: "#23272A" } }}>
      <Tab.Navigator
        initialRouteName={Object.getOwnPropertyNames(week)[date.getDay() - 1]}
        tabBarOptions={{
          scrollEnabled: true,
          activeTintColor: "#7289DA",
          inactiveTintColor: "#99AAB5",
          indicatorStyle: {
            backgroundColor: "#7289DA",
          },
          style: {
            backgroundColor: "#23272A",
          },
        }}
      >
        <Tab.Screen
          name="Montag"
          component={day}
          initialParams={{
            day: week.Monday,
          }}
        />
        <Tab.Screen
          name="Dienstag"
          component={day}
          initialParams={{
            day: week.Tuesday,
          }}
        />
        <Tab.Screen
          name="Mittwoch"
          component={day}
          initialParams={{
            day: week.Wednesday,
          }}
        />
        <Tab.Screen
          name="Donnerstag"
          component={day}
          initialParams={{
            day: week.Thursday,
          }}
        />
        <Tab.Screen
          name="Freitag"
          component={day}
          initialParams={{
            day: week.Friday,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
  return timetable;
};

export { timetableView };
