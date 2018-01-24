import React, { Component } from "react";
import styles from "./styles.js";
import { StyleSheet, Text, Dimensions, View, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as Progress from "react-native-progress";
const { width, height } = Dimensions.get("window");
export default class Header extends Component {
  render() {
    const firstCircle = height * 1.05;
    const secondCircle = height * 1.4;
    const thirdCircle = height * 2.45;
    return (
      <View>
        <View
          style={[
            styles.header,
            {
              width: firstCircle,
              height: firstCircle,
              borderRadius: 0.5 * firstCircle,
              top: -firstCircle / 1.7,
              left: -firstCircle / 2
            }
          ]}
        />
        <View
          style={[
            styles.header,
            {
              width: secondCircle,
              height: secondCircle,
              borderRadius: 0.5 * secondCircle,
              top: -secondCircle / 1.47,
              left: -secondCircle / 2,
              opacity: 0.5
            }
          ]}
        />
        <View
          style={[
            styles.header,
            {
              width: thirdCircle,
              height: thirdCircle,
              borderRadius: 0.5 * thirdCircle,
              top: -thirdCircle / 1.23,
              left: -thirdCircle / 2,
              opacity: 0.15
            }
          ]}
        />

        {this.props.logo && (
          <View
            style={{
              alignItems: "center",

              position: "absolute",

              right: 0,
              left: 0,
              top: height / 20
            }}
          >
            {this.props.uploading ? (
              <Text
                style={{
                  backgroundColor: "transparent",
                  color: "white",
                  fontSize: 16,
                  marginTop: height / 30
                }}
              >
                Uploading your memory...
              </Text>
            ) : (
              <Image
                style={{
                  width: 60,
                  height: 60
                }}
                source={require("../../assets/logo-white.png")}
              />
            )}
          </View>
        )}

        <Text style={styles.navTitle}>{this.props.navTitle}</Text>
      </View>
    );
  }
}
