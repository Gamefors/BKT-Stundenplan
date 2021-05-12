import { Text, View, ActivityIndicator } from "react-native";
import { styles } from "./styles/main.js";
import React from "react";

const loadingView = function () {
  const loading = (
    <View
      style={[
        styles.view,
        {
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <ActivityIndicator hidesWhenStopped={true} size="large" color="#7289DA" />
      <Text style={styles.text}>{"aktualisiere Stundenplan Daten..."}</Text>
    </View>
  );
  return loading;
};

export { loadingView };
