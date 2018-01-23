import React, { Component } from "react";
import styles from "./styles.js";

import Icon from "react-native-vector-icons/Ionicons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default class Button extends Component {
  render({ size, icon, iconSize } = this.props) {
    return (
      <View
        style={[
          styles.iconView,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
      >
        <Icon name={icon} color={"white"} size={iconSize} />
      </View>
    );
  }
}
