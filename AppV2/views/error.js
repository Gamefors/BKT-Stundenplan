import { Text, View } from "react-native";
import { styles } from "./styles/main.js";
import React from "react";

const errorView = function (message) {
  const error = (
    <View style={styles.view}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
  return error;
};

export { errorView };
