import React, { Component } from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
const { width, height } = Dimensions.get("window");
export default class IconButton extends Component {
  render(
    {
      icon,
      onPress,
      right,
      left,
      size,
      color,
      rightMargin,
      leftMargin,
      topMargin,
      bottomMargin
    } = this.props
  ) {
    if (right) {
      return (
        <TouchableOpacity
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            width: width / 8,
            right: width / 14,
            top: height / 25,

            zIndex: 2
          }}
          onPress={onPress}
        >
          <Icon
            style={{ color: color || "white", backgroundColor: "transparent" }}
            name={icon}
            size={size || 41}
          />
        </TouchableOpacity>
      );
    } else if (left) {
      return (
        <TouchableOpacity
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            width: width / 10,
            left: width / 14,
            top: height / 25,
            zIndex: 2
          }}
          onPress={onPress}
        >
          <Icon
            style={{ color: color || "white", backgroundColor: "transparent" }}
            name={icon}
            size={size || 41}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            width: width / 10,
            left: leftMargin,
            top: topMargin,
            right: rightMargin,
            bottom: bottomMargin,
            zIndex: 2
          }}
          onPress={onPress}
        >
          <Icon
            style={{ color: color || "white", backgroundColor: "transparent" }}
            name={icon}
            size={size || 41}
          />
        </TouchableOpacity>
      );
    }
  }
}
