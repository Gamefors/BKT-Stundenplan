import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { FlatList } from "react-native-gesture-handler";
import React from "react";
import "react-native-gesture-handler";

import specDataSrc from "./assets/specData.json";
import { useState } from "react";

let specData = addPauseAndTimes(specDataSrc)
const daysForIndex = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]
const Tab = createMaterialTopTabNavigator();

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

function addPauseAndTimes(specDataSrc) {
  let startTime = "07:30";
  let endTime = "08:15";
  for (let spec = 0; spec < 2; spec++) {
    for (let week = 0; week < 2; week++) {
      let specName = "inf";
      let weekName = "EvenWeek";
      if (spec == 1) specName = "mb";
      if (week == 1) weekName = "OddWeek";
      specDataSrc[specName][weekName].forEach((day) => {
        day.splice(2, 0, {
          Name: "Pause",
          Teacher: "",
          Room: "",
        });
        day.splice(5, 0, {
          Name: "Pause",
          Teacher: "",
          Room: "",
        });
        day.splice(8, 0, {
          Name: "Pause",
          Teacher: "",
          Room: "",
        });
        day.splice(11, 0, {
          Name: "Pause",
          Teacher: "",
          Room: "",
        });
        day.forEach((lesson, index) => {
          lesson.id = index.toString();
          lesson.startTime = startTime;
          lesson.endTime = endTime;
          startTime = endTime;
          if (index == 1 || index == 4 || index == 7 || index == 10) {
            endTime =
              startTime.split(":")[0] +
              ":" +
              (parseInt(startTime.split(":")[1]) + 15).toString();
          } else {
            endTime =
              startTime.split(":")[0] +
              ":" +
              (parseInt(startTime.split(":")[1]) + 45).toString();
          }

          if (endTime.split(":")[1] >= 60) {
            endTime =
              (parseInt(startTime.split(":")[0]) + 1).toString() +
              ":" +
              (0 + parseInt(endTime.split(":")[1] - 60));
          }
          if (parseInt(endTime.split(":")[1]) == 0)
            endTime = endTime.split(":")[0] + ":0" + endTime.split(":")[1];
          if (
            parseInt(endTime.split(":")[0]) < 10 &&
            endTime.split(":")[0].length < 2
          )
            endTime = "0" + endTime.split(":")[0] + ":" + endTime.split(":")[1];
        });
        startTime = "07:30";
        endTime = "08:15";
      });

    }
  }
  return specDataSrc;
}

function getCalendarWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

const Lesson = ({ lesson, navigation }) => {
  let fonzSizeCustom = 15
  let bgColor = "#6b778d"
  let fgColor = "black"

  if (lesson.Name == "M" || lesson.Name == "CAS") {
    bgColor = "lightblue"
  }
  if (lesson.Name == "INF" || lesson.Name == "TINF") {
    bgColor = "#e3e2c3"
  }
  if (lesson.Name == "SP") {
    bgColor = "#3fffc8"
  }
  if (lesson.Name == "RERK") {
    bgColor = "#c89276"
  }
  if (lesson.Name == "ENT") {
    bgColor = "#a9eca2"
  }
  if (lesson.Name == "GG") {
    bgColor = "#37765d"
  }
  if (lesson.Name == "F") {
    bgColor = "#e05297"
  }
  if (lesson.Name == "E") {
    bgColor = "#ffff4d"
  }
  if (lesson.Name == "D") {
    bgColor = "#db4f4f"
  }
  if (lesson.Name == "PH") {
    bgColor = "orange"
  }
  if (lesson.Name == "PH") {
    bgColor = "orange"
  }
  if (lesson.Name == "WL") {
    bgColor = "#9370DB"
  }
  if (lesson.Name.includes("oder")) {
    bgColor = "white"
  }
  if (lesson.Name.includes("Selbstorganisiertes")) {
    bgColor = "red"
    fgColor = "white"
    fonzSizeCustom = 12
  }
  if (lesson.Name != "Pause") {
    return (
      <View
        style={{
          backgroundColor: bgColor,
          padding: 15,
          flexDirection: "row",
        }}
      >
        <View>
          <Text style={{ fontSize: 15, color: fgColor }}>{lesson.startTime + " - " + lesson.endTime}</Text>
        </View>
        <View style={{ marginLeft: 15 }}>
          <Text style={{ color: fgColor, fontSize: fonzSizeCustom, }}>
            {lesson.Name + " - " + lesson.Room}
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View
        style={{
          backgroundColor: "#2C2F33",
          padding: 15,
          flexDirection: "row",
        }}
      >
        <View>
          <Text style={{ color: "white", fontSize: 15 }}>{lesson.Name}</Text>
        </View>
      </View>
    );
  }
}

const dayScreen = ({ route, navigation }) => {
  const renderItem = ({ item }) => {
    return <Lesson lesson={item} navigation={navigation} />;
  };
  const { day } = route.params;
  return (
    <FlatList
      style={{ backgroundColor: "#2C2F33" }}
      data={day}
      renderItem={renderItem}
      keyExtractor={renderItem.id}
    />
  );
}

const App = () => {
  let currDate = new Date();
  let weeks = "OddWeek";
  if (getCalendarWeek(currDate) % 2 === 0) weeks = "EvenWeek";
  const [weeksData, setWeeksData] = useState(specData.inf[weeks]);


  let week = weeksData
  return (
    <NavigationContainer >
      <StatusBar hidden={true} />
      <Tab.Navigator initialRouteName={daysForIndex[currDate.getDay() - 1]} tabBarOptions={{
        scrollEnabled: true,
        activeTintColor: "white",
        inactiveTintColor: "white",
        style: {
          backgroundColor: "#23272A",
        }
      }
      }>
        <Tab.Screen
          name="Montag"
          component={dayScreen}
          initialParams={{
            day: week[0],
          }}
        />
        <Tab.Screen
          name="Dienstag"
          component={dayScreen}
          initialParams={{
            day: week[1],
          }}
        />
        <Tab.Screen
          name="Mittwoch"
          component={dayScreen}
          initialParams={{
            day: week[2],
          }}
        />
        <Tab.Screen
          name="Donnerstag"
          component={dayScreen}
          initialParams={{
            day: week[3],
          }}
        />
        <Tab.Screen
          name="Freitag"
          component={dayScreen}
          initialParams={{
            day: week[4],
          }}
        />
      </Tab.Navigator>
    </NavigationContainer >
  );
};






export default App;
