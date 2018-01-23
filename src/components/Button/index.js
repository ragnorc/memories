import React, { Component } from "react";
import styles from "./styles.js";

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default class Button extends Component {
  render({ onPress, backColor, color } = this.props) {
    return (
      <TouchableOpacity onPress={onPress}>
        {this.props.version === "roundFilled"
          ? <View
              style={[
                styles.roundFilled,
                { borderColor: backColor, backgroundColor: backColor }
              ]}
            >
              <Text style={[styles.text, { color: color }]}>
                {this.props.text.toUpperCase()}
              </Text>
            </View>
          : <View style={styles.roundFilled}>
              <Text style={styles.textWhite}>
                {this.props.text.toUpperCase()}
              </Text>
            </View>}
      </TouchableOpacity>
    );
  }
}
