import React, { Component } from "react";
import { StatusBar, Dimensions, View, StyleSheet, Text } from "react-native";

import * as Config from "../../config";
import Button from "../../components/Button";
import { navigate } from "../../lib/navigation";
import Video from "react-native-video";
const { width, height } = Dimensions.get("window");

export default class Onboarding extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.backgroundVideo}>

        <Video
          source={require("../../assets/background.mp4")} // Can be a URL or a local file.
          ref={ref => {
            this.player = ref;
          }} // Store reference
          resizeMode="cover"
          repeat
          style={styles.backgroundVideo}
        />

        <View
          style={[
            styles.backgroundVideo,
            { backgroundColor: "#4b6084", opacity: 0.1 }
          ]}
        />
        <Text
          style={{
            fontSize: 30,
            fontWeight: "500",
            position: "absolute",
            textAlign: "center",
            top: height / 9,
            left: 0,
            right: 0,
            paddingHorizontal: width / 12,
            backgroundColor: "transparent",
            color: "white",
            fontFamily: "Avenir"
          }}
        >
          Never forget the story of your life
        </Text>
        <View
          style={[
            styles.buttonWrapper,
            {
              bottom: height / 17
            }
          ]}
        >
          <Button
            backColor={Config.SECOND_COLOR}
            color="white"
            version="roundFilled"
            text="Sign Up"
            onPress={() => navigate("Register")}
          />
        </View>

      </View>
    );
  }
}

var styles = StyleSheet.create({
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  buttonWrapper: {
    backgroundColor: "transparent",
    flexDirection: "column",
    position: "absolute",
    left: 0,
    right: 0,
    elevation: 5,
    alignItems: "center",
    shadowColor: Config.SECOND_COLOR,
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowRadius: 10,
    shadowOpacity: 0.5
  }
});
