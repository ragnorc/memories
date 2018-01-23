import React, { Component } from "react";
import { StatusBar, Dimensions, View, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as Config from "../../config";
import Button from "../../components/Button";
const { width, height } = Dimensions.get("window");
import { navigate } from "../../lib/navigation";
export default class Offline extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white"
        }}
      >
        <Icon name="ios-thunderstorm" size={200} color={Config.MAIN_COLOR} />
        <Text
          style={{
            textAlign: "center",
            fontSize: 16,
            marginTop: height / 10,
            marginHorizontal: width / 10
          }}
        >
          Whoops! Seems like you have no internet connection. Please check your
          network settings and retry again.
        </Text>
        <View
          style={{
            shadowColor: Config.SECOND_COLOR,
            shadowOffset: {
              width: 0,
              height: 10
            },
            shadowRadius: 15,
            shadowOpacity: 0.6,
            marginTop: height / 10,
            backgroundColor: "transparent"
          }}
        >
          <Button
            backColor={Config.SECOND_COLOR}
            color="white"
            version="roundFilled"
            text="Retry"
            onPress={() => navigate("Initialize", true)}
          />
        </View>
      </View>
    );
  }
}
