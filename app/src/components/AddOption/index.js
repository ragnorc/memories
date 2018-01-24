import React, { Component } from "react";
import styles from "./styles.js";
import RoundedIcon from "../RoundedIcon";
import * as Config from "../../config";
import { Platform } from "react-native";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
const { width, height } = Dimensions.get("window");
export default class Button extends Component {
  render({ text, onPress, icon, style } = this.props) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.input, style]}>
        <View style={styles.iconView}>
          <RoundedIcon icon={icon} size={height / 25} iconSize={height / 50} />
        </View>
        <View
          style={{
            marginLeft: width / 10,
            width: width * 8 / 10 * 0.7
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: Config.MAIN_COLOR,
              fontSize: 17,
              fontWeight: Platform.OS === "ios" ? "500" : "400",
              fontFamily: Config.MAIN_FONT
            }}
          >
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}
