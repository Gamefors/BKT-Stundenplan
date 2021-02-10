import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

const FETCH_SERVER_ADRESS = "http://5.189.129.153:3000/lessonData"

const Tab = createMaterialTopTabNavigator();

async function getRequest(url = '') {
  const response = await fetch(url, {
  });
  return response.json();
}

function getCalendarWeek(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}


function createLesson(day1, day2) {
  let color1 = "white"
  let color2 = "white"
  let color11 = "white"
  let color22 = "white"


  if (day1.Subject.includes("oder")) {





    return (<View style={{ margin: 15 }}>
      <Text style={{ fontSize: 25, color: color1 }}>
        {day1.Subject.split("oder")[0]}
        <Text style={{ color: "white" }}>{"oder"}</Text>
        <Text style={{ color: color11 }}>{day1.Subject.split("oder")[1]}</Text>
        <Text style={{ color: "#726a95" }}>{" | "}</Text>
        <Text style={{ color: "#59886b" }}>
          {day1.Room}
        </Text>

      </Text>

      <Text style={{ fontSize: 25, color: color1 }}>
        {day2.Subject.split("oder")[0]}
        <Text style={{ color: "white" }}>{"oder"}</Text>
        <Text style={{ color: color22 }}>{day2.Subject.split("oder")[1]}</Text>
        <Text style={{ color: "#726a95" }}>{" | "}</Text>
        <Text style={{ color: "#59886b" }}>
          {day2.Room}
        </Text>

      </Text>
    </View>)
  } else {
    

    return (<View style={{ margin: 15 }}>
      <Text style={{ fontSize: 25, color: color1 }}>
        {day1.Subject}
        <Text style={{ color: "#726a95" }}>{" | "}</Text>
        <Text style={{ color: "#59886b" }}>
          {day1.Room}
        </Text>

      </Text>

      <Text style={{ fontSize: 25, color: color2 }}>
        {day2.Subject}
        <Text style={{ color: "#726a95" }}>{" | "}</Text>
        <Text style={{ color: "#59886b" }}>

          {day2.Room}

        </Text>

      </Text>
    </View>)
  }

}

function lessons({ route }) {
  const { day } = route.params;
  return (<View style={{ flex: 1, alignItems: "center", backgroundColor: "#2C2F33", width: "100%", height: "100%" }}>
    {createLesson(day[0], day[1])}
    <View style={styles.pauseView}>
      <Text style={styles.pauseText}>{"Pause"}</Text>
    </View>
    {createLesson(day[2], day[3])}
    <View style={styles.pauseView}>
      <Text style={styles.pauseText}>{"Pause"}</Text>
    </View>
    {createLesson(day[4], day[5])}
    <View style={styles.pauseView}>
      <Text style={styles.pauseText}>{"Pause"}</Text>
    </View>
    {createLesson(day[6], day[7])}
    <View style={styles.pauseView}>
      <Text style={styles.pauseText}>{"Pause"}</Text>
    </View>
    {createLesson(day[8], day[9])}
  </View >)
}




function timetable(weeks) {
  var afternoon = 0
  let skip = 0
  let currDate = new Date();
  let calendarWeek = 1;
  let currDay = currDate.getDay()
  var currHours = currDate.getHours()
  if(currDay == 0 || currDay == 6){
    skip++
  }
  if(currHours > 16){
    afternoon++
  }
  if ((getCalendarWeek(currDate) + skip) % 2 === 0) calendarWeek = 0;
  let week = weeks[calendarWeek]
  const daysForIndex = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"]
  return (
    <NavigationContainer>
      <StatusBar hidden={true} />
      <Tab.Navigator initialRouteName={daysForIndex[(currDate.getDay() - 1) + afternoon]} tabBarOptions={{
        scrollEnabled: true,
        activeTintColor: "#7289DA",
        inactiveTintColor: "#99AAB5",
        indicatorStyle: {
          backgroundColor: "#7289DA"
        },
        style: {
          backgroundColor: "#23272A",
        }
      }
      }>
        <Tab.Screen
          name="Montag"
          component={lessons}
          initialParams={{
            day: week.Monday,
          }}
        />
        <Tab.Screen
          name="Dienstag"
          component={lessons}
          initialParams={{
            day: week.Tuesday,
          }}
        />
        <Tab.Screen
          name="Mittwoch"
          component={lessons}
          initialParams={{
            day: week.Wednesday,
          }}
        />
        <Tab.Screen
          name="Donnerstag"
          component={lessons}
          initialParams={{
            day: week.Thursday,
          }}
        />
        <Tab.Screen
          name="Freitag"
          component={lessons}
          initialParams={{
            day: week.Friday,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer >

  );
}

function loadingScreen() {
  const [currView, setCurrView] = useState(
    (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <ActivityIndicator hidesWhenStopped={true} size="large" color="#7289DA" />
        <Text style={styles.text}>{"aktualisiere Stundenplan Daten..."}</Text>
      </View>
    )
  )
  
  if(currView.props.children.length > 2){
    let fetching = setInterval(function(){
      getRequest(FETCH_SERVER_ADRESS).then(data => {
        setCurrView(timetable([data.EvenWeek, data.OddWeek]))
        clearInterval(fetching)
      }).catch(error =>{
        console.log(error)
        console.log("no connection to fetch server")
      });
    }, 3000);
    
  }

  return (currView);
  
}



export default function App() {
  return (
    <View style={styles.container}>
      {loadingScreen()}
    </View>
  );
}
























const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2F33',
    justifyContent: 'center',
  },
  text: {
    alignSelf: "center",
    color: "white",
    margin: 20
  },
  subjectText: {
    fontSize: 25,
    color: "white"
  },
  pauseText: {
    fontSize: 30,
    color: "#7289DA"
  },
  subjectView: {
    margin: 15,
  },
  pauseView: {
    marginLeft: 15,
    marginRight: 15,
  }
});
