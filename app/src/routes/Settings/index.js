/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  currentImageIndex,
  TextInput,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  SectionList,
  PixelRatio,
  Animated,
  Modal,
  FlatList,
  TouchableHighlight,
  Platform,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import Spinner from "react-native-spinkit";
import ImagePicker from "react-native-image-crop-picker";
import Button from "../../components/Button";
import { uploadImage } from "../../lib/fetch";
import { resetPassword } from "../../lib/authentication";
import * as Config from "../../config";
import { stringIsEmpty } from "../../lib/functions";
import { goBack } from "../../lib/navigation";
import AddOption from "../../components/AddOption";
import { connect } from "react-redux";
import { graphql, compose } from "react-apollo";
import { navigate } from "../../lib/navigation";

import IconButton from "../../components/IconButton";
const moment = require("moment");

const { width, height } = Dimensions.get("window");
import Icon from "react-native-vector-icons/Ionicons";
import ActionSheet from "@yfuks/react-native-action-sheet";
import { createImageProgress } from "react-native-image-progress";
import { AfterInteractions } from "react-native-interactions";
import FastImage from "react-native-fast-image";
import ImageViewer from "react-native-image-zoom-viewer";
import * as Progress from "react-native-progress";
import Header from "../../components/Header";
import { PROFILE_QUERY, UPDATE_PROFILE_MUTATION } from "../../lib/queries";
const ImageProgressWithFastImage = createImageProgress(FastImage);
const cardWidth = width * 0.9;

import ImageProgress from "react-native-image-progress";

const Option = ({ label, value, onChangeText, textInputProps, onPress }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View
      style={{
        backgroundColor: "white",
        width: width * 0.8,
        height: height / 12,
        marginBottom: height / 25,
        borderRadius: 7,
        shadowOffset: {
          width: 0,
          height: 0
        },
        shadowRadius: 16,
        shadowOpacity: 0.3
      }}
    >
      <Text
        style={{
          position: "absolute",
          color: "grey",
          top: 5,
          left: 10
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{ left: 10, top: height / 22, width: width * 0.7 }}
        value={value}
        onChangeText={onChangeText}
        {...textInputProps}
      />
    </View>
  </TouchableWithoutFeedback>
);

export class Settings extends Component {
  constructor(props) {
    super(props);

    StatusBar.setBarStyle("light-content", "fade");
    this.state = {
      fullName: "",
      userName: "",
      updating: false
    };
    this.itemWidth = width * 0.8;
  }
  state: {};

  componentWillReceiveProps(nextProps) {
    this.setState({
      fullName: nextProps.ProfileQuery.User.fullName,
      userName: nextProps.ProfileQuery.User.userName
    });
  }

  onResetPassword = () => {
    Alert.alert(
      "Change password",
      "We will send you an email to change your password.",
      [
        {
          text: "Okay",
          onPress: () => {
            resetPassword();
          }
        },
        {
          text: "Cancel",

          style: "cancel"
        }
      ],
      { cancelable: false }
    );
  };

  onSubmit = () => {
    Keyboard.dismiss();
    this.props
      .updateProfile({
        variables: {
          userID: this.props.userID,
          userName: this.state.userName,
          fullName: this.state.fullName
        }
      })
      .then(() => {
        this.setState({ updating: true });
        if (this.state.profileImage) {
          uploadImage(this.state.profileImage.path).then(fileID => {
            this.props
              .updateProfile({
                variables: {
                  userID: this.props.userID,
                  profileImageId: fileID
                }
              })
              .then(() => {
                setTimeout(() => {
                  navigate("Main", true);
                  this.setState({ updating: false });
                }, 1000);
              })
              .catch(() => {
                Alert.alert(
                  "There was an error updating your profile. Please try again later."
                );
              });
          });
        } else {
          setTimeout(() => {
            navigate("Main", true);
            this.setState({ updating: false });
          }, 1000);
        }
      })
      .catch(error => {
        if (error.graphQLErrors[0].code === 3010) {
          Alert.alert(
            "The username is already taken. Please choose another one."
          );
        } else {
          Alert.alert(
            "There was an error updating your profile. Please try again later."
          );
        }
      });
  };

  render() {
    let profile = this.props.ProfileQuery.User;

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          backgroundColor: "white"
        }}
      >
        <Header />

        <ScrollView
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ height, alignItems: "center", width }}
        >
          {(profile.profileImage || this.state.profileImage) && (
            <TouchableOpacity
              style={{
                shadowColor: "black",
                shadowOffset: {
                  width: 0,
                  height: 0
                },
                shadowRadius: 17,
                shadowOpacity: 0.5,
                top: height / 11,
                backgroundColor: "transparent"
              }}
              onPress={() => {
                ImagePicker.openPicker({
                  mediaType: "photo",
                  includeBase64: true,
                  cropping: true,
                  width: 200,
                  height: 200
                }).then(image => {
                  this.setState({
                    profileImage: { uri: image.path, path: image.path }
                  });
                });
              }}
            >
              <FastImage
                style={{
                  height: height / 8,
                  borderRadius: height * 0.5 / 8,
                  width: height / 8
                }}
                resizeMode="cover"
                defaultSource={require("../../assets/placeholder.png")}
                source={
                  this.state.profileImage || {
                    uri:
                      "https://memories.imgix.net/" +
                      profile.profileImage.secret +
                      "?h=" +
                      PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                      "?w=" +
                      PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                      "&auto=compress&fit=facearea&facepad=5"
                  }
                }
              />
            </TouchableOpacity>
          )}
          <View style={{ position: "absolute", top: height / 3 }}>
            <Option
              label="Full name"
              onChangeText={fullName => this.setState({ fullName })}
              value={this.state.fullName}
              onPress={() => {
                this.fullNameInput.focus();
              }}
              textInputProps={{
                autoCapitalize: "none",
                maxLength: Config.MAX_CHARACTER_FULLNAME,
                returnKeyType: "next",
                ref: input => {
                  this.fullNameInput = input;
                },
                onSubmitEditing: event => {
                  this.userNameInput.focus();
                }
              }}
            />
            <Option
              onPress={() => {
                this.userNameInput.focus();
              }}
              label="User name"
              onChangeText={userName =>
                this.setState({ userName: userName.replace(/\s/g, "") })}
              value={this.state.userName}
              textInputProps={{
                autoCapitalize: "none",
                maxLength: Config.MAX_CHARACTER_USERNAME,
                ref: input => {
                  this.userNameInput = input;
                },
                returnKeyType: "next"
              }}
            />
            {this.props.ProfileQuery.User.auth0UserId.includes("auth0") && (
              <AddOption
                icon="ios-key"
                onPress={() => this.onResetPassword()}
                text="Change password"
              />
            )}
          </View>
        </ScrollView>

        <IconButton
          left
          icon="ios-arrow-back-outline"
          size={30}
          onPress={() => goBack()}
        />
        <TouchableHighlight
          onPress={() => {
            this.onSubmit();
          }}
          style={{
            position: "absolute",
            right: width / 14,
            top: height / 20,
            backgroundColor: "transparent",
            zIndex: 2
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 17,
              fontFamily: Config.MAIN_FONT,
              fontWeight: Config.MAIN_FONT_WEIGHT,
              backgroundColor: "transparent"
            }}
          >
            Save
          </Text>
        </TouchableHighlight>
        {this.state.updating && (
          <View
            style={{
              position: "absolute",
              width,
              height,

              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Progress.CircleSnail
              size={70}
              tickness={6}
              color={["red", "green", "blue"]}
            />
            <Text
              style={{
                position: "absolute",
                top: height / 5,
                fontSize: 19,
                fontFamily: Config.MAIN_FONT,
                fontWeight: "400"
              }}
            >
              Updating your profile
            </Text>
          </View>
        )}
      </View>
    );
  }
}
var mapStateToProps = function(state) {
  return {
    userID: state.profile.id
  };
};

export default compose(
  connect(mapStateToProps),
  graphql(PROFILE_QUERY, {
    name: "ProfileQuery",
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        profileUserID: props.userID
      }
    })
  }),
  graphql(UPDATE_PROFILE_MUTATION, { name: "updateProfile" })
)(Settings);
