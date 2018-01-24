/**
 * @flow
 */

import React, { Component } from "react";
import {
  Keyboard,
  Text,
  View,
  Dimensions,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView
} from "react-native";
import styles from "../styles";
import NavBar from "../../../components/NavBar";
import Header from "../../../components/Header";
import * as Config from "../../../config";
import IconButton from "../../../components/IconButton";
import CheckButton from "../../../components/CheckButton";
import { addPrivacyType } from "../../../redux/ducks/memory";
import Icon from "react-native-vector-icons/Ionicons";
import { navigate, goBack } from "../../../lib/navigation";
import { connect } from "react-redux";
import Button from "../../../components/Button";
import AddOption from "../../../components/AddOption";
const { width, height } = Dimensions.get("window");

export class EditPrivacy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: {
        everybody: true,
        onlyFollowers: false,
        specificFollowers: false,
        onlyMe: false
      },
      specificFollowersButtonText: "Specific followers"
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      typeof nextProps.specificGroup != "undefined" &&
      typeof nextProps.specificFollowers != "undefined"
    ) {
      if (
        this.props.specificGroup.name != nextProps.specificGroup.name ||
        this.props.specificFollowers != nextProps.specificFollowers
      ) {
        let followerNumber = 0;
        Object.values(nextProps.specificFollowers).map(item => {
          if (item) {
            followerNumber++;
          }
        });

        if (followerNumber > 0) {
          if (nextProps.specificGroup.id == 0) {
            var followerText = " follower";
            if (followerNumber > 1) {
              followerText = " followers";
            }
            this.setState({
              specificFollowersButtonText: followerNumber + followerText
            });
          } else {
            this.setState({
              specificFollowersButtonText:
                nextProps.specificGroup.name + " + " + followerNumber
            });
          }
        } else if (nextProps.specificGroup.id == 0) {
          this.setState({
            selection: { everybody: true },
            specificFollowersButtonText: "Specific followers"
          });
        } else {
          this.setState({
            specificFollowersButtonText: nextProps.specificGroup.name
          });
        }
      }
    }
  }

  onSubmit = () => {
    Keyboard.dismiss();
    this.props.dispatch(
      addPrivacyType(
        this.state.selection,
        this.state.specificFollowersButtonText
      )
    );
    goBack();
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
          <IconButton left icon="ios-close" onPress={() => goBack()} />
          <IconButton
            right
            icon="ios-checkmark"
            onPress={() => this.onSubmit()}
          />
          <View
            style={{
              position: "absolute",
              top: height / 5,
              width: width,
              right: 0,
              left: 0,
              alignItems: "center"
            }}
          >
            <ScrollView
              contentContainerStyle={{
                width: width,
                alignItems: "center",
                paddingBottom: 20
              }}
            >
              <TouchableWithoutFeedback
                onPress={() =>
                  this.setState({
                    selection: { everybody: true },
                    specificFollowersButtonText: "Specific followers"
                  })}
              >
                <View style={styles.input}>
                  <Text
                    style={{
                      color: Config.MAIN_COLOR,
                      fontSize: 17,
                      fontWeight: Config.MAIN_FONT_WEIGHT
                    }}
                  >
                    Everybody
                  </Text>
                  {this.state.selection.everybody && <CheckButton />}
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                onPress={() =>
                  this.setState({
                    selection: { onlyFollowers: true },
                    specificFollowersButtonText: "Specific followers"
                  })}
              >
                <View style={styles.input}>
                  <Text
                    style={{
                      color: Config.MAIN_COLOR,
                      fontSize: 17,
                      fontWeight: Config.MAIN_FONT_WEIGHT
                    }}
                  >
                    Only followers
                  </Text>
                  {this.state.selection.onlyFollowers && <CheckButton />}
                </View>
              </TouchableWithoutFeedback>

              <TouchableOpacity
                onPress={() => {
                  navigate("ChooseFollowers");
                  this.setState({ selection: { specificFollowers: true } });
                }}
                style={styles.input}
              >
                <Text
                  style={{
                    color: Config.MAIN_COLOR,
                    fontSize: 17,
                    fontWeight: Config.MAIN_FONT_WEIGHT
                  }}
                >
                  {this.state.specificFollowersButtonText}
                </Text>
                {this.state.selection.specificFollowers
                  ? <CheckButton />
                  : <View
                      style={{
                        height: height / 12,
                        position: "absolute",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        right: width / 20
                      }}
                    >
                      <Icon
                        name="ios-arrow-forward"
                        color={Config.MAIN_COLOR}
                        size={23}
                      />
                    </View>}
              </TouchableOpacity>
              <TouchableWithoutFeedback
                onPress={() =>
                  this.setState({
                    selection: { onlyMe: true },
                    specificFollowersButtonText: "Specific followers"
                  })}
              >
                <View style={styles.input}>
                  <Text
                    style={{
                      color: Config.MAIN_COLOR,
                      fontSize: 17,
                      fontWeight: Config.MAIN_FONT_WEIGHT
                    }}
                  >
                    Only me
                  </Text>
                  {this.state.selection.onlyMe && <CheckButton />}
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }
}

var mapStateToProps = function(state) {
  return {
    specificFollowers: state.memory.privacy.specificFollowers,
    specificGroup: state.memory.privacy.specificGroup
  };
};
export default connect(mapStateToProps)(EditPrivacy);
