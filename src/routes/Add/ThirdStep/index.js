/**
 * @flow
 */

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback
} from "react-native";
import styles from "../styles";
import NavBar from "../../../components/NavBar";
import Header from "../../../components/Header";
import * as Config from "../../../config";
import IconButton from "../../../components/IconButton";
import Icon from "react-native-vector-icons/Ionicons";
import CheckButton from "../../../components/CheckButton";
import { navigate, goBack } from "../../../lib/navigation";
import { addFeedPrivacy } from "../../../redux/ducks/memory";
import Button from "../../../components/Button";
import AddOption from "../../../components/AddOption";
const { width, height } = Dimensions.get("window");
import { connect } from "react-redux";
export class ThirdStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      excludedText: "Exclude...",
      showInFeed: true
    };
  }
  componentWillReceiveProps(nextProps) {
    let excludedText = "";
    let excludedPeopleNumber = Object.values(nextProps.excludedPeople).length;
    if (excludedPeopleNumber == 1) {
      excludedText = "1 person";
    } else if (excludedPeopleNumber == 0) {
      excludedText = "Exclude...";
    } else if (excludedPeopleNumber > 1) {
      excludedText = excludedPeopleNumber + " people";
    }

    this.setState({ excludedText });
  }

  onSubmit = () => {
    this.props.dispatch(addFeedPrivacy(this.state.showInFeed));
    navigate("FinishMemory");
  };
  render() {
    return (
      <View>

        <View
          style={{
            width: width,
            height: height,
            alignItems: "center",
            position: "absolute",
            backgroundColor: "white"
          }}
        >
          <Header navTitle={this.props.title} />
          <IconButton
            left
            icon="ios-arrow-back-outline"
            size={30}
            onPress={() => goBack()}
          />
          <View
            style={{
              position: "absolute",
              top: height / 3.7,
              right: 0,
              left: 0,
              alignItems: "center"
            }}
          >
            <AddOption
              icon="ios-person"
              text={this.props.visibilityText}
              onPress={() => {
                navigate("EditPrivacy");
              }}
            />
            <AddOption
              icon="ios-person"
              text={this.state.excludedText}
              onPress={() => {
                navigate("ExcludePeople");
              }}
            />

            <TouchableWithoutFeedback
              onPress={() =>
                this.setState({ showInFeed: !this.state.showInFeed })}
            >
              <View style={styles.input}>
                <View style={styles.iconView} />
                <Text
                  style={{
                    color: Config.MAIN_COLOR,
                    fontSize: 17,
                    fontWeight: Config.MAIN_FONT_WEIGHT
                  }}
                >
                  Show in feed
                </Text>
                {this.state.showInFeed && <CheckButton />}
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              backColor={Config.SECOND_COLOR}
              onPress={this.onSubmit}
              color="white"
              version="roundFilled"
              text="Continue"
            />
          </View>
        </View>

      </View>
    );
  }
}

var mapStateToProps = function(state) {
  return {
    visibilityText: state.memory.privacy.visibilityText,
    excludedPeople: state.memory.privacy.excludedPeople
  };
};
export default connect(mapStateToProps)(ThirdStep);
