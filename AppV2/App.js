import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import React from "react";

import { getTimetableData } from "./utils/generalHelper.js";
import { errorView } from "./views/error.js";
import { loadingView } from "./views/loading.js";
import { timetableView } from "./views/timetable.js";
import { styles } from "./views/styles/main.js";

let isLoading = true;
let isError = false;

function loading(setCurrView) {
  if (!isLoading) return;
  getTimetableData()
    .then((data) => {
      isLoading = false;
      isError = false;
      setCurrView(timetableView(data));
    })
    .catch((error) => {
      if (isError) return;
      if (error.toString().includes("Failed to fetch")) {
        setCurrView(errorView("Server ist nicht erreichbar bitte versuche es später erneut."));
      } else {
        console.log(error);
        setCurrView(errorView("Ein Problem mit dem Server ist aufgetreten bitte versuche es später erneut."));
      }
      isError = true;
    });
}

function view() {
  const [currView, setCurrView] = useState(loadingView());
  if (!isLoading) currView;
  loading(setCurrView);
  setInterval(function () {
    loading(setCurrView);
  }, 10 * 1000);
  return currView;
}

export default function App() {
  return (
    <View style={styles.view}>
      <StatusBar hidden={true} style={"light"} />
      {view()}
    </View>
  );
}
