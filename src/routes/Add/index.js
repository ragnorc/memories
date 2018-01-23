/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  LayoutAnimation,
  Keyboard,
  AsyncStorage,
  Platform
} from "react-native";
import { goBack } from "../../lib/navigation";
import { stringIsEmpty, b } from "../../lib/functions";
import Spinner from "react-native-spinkit";
import TextField from "react-native-md-textinput";
import * as Config from "../../config";
import Swiper from "react-native-swiper";
import { addFirst } from "../../redux/ducks/memory";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { connect } from "react-redux";
import ImagePicker from "react-native-image-crop-picker";
import RNFetchBlob from "react-native-fetch-blob";
import styles from "./styles";
import Button from "../../components/Button";
import IconButton from "../../components/IconButton";
import { navigate } from "../../lib/navigation";
import {
  FOLLOWERS_QUERY,
  ALL_USERS_QUERY,
  USER_QUERY
} from "../../lib/queries";
import { gql, graphql, withApollo } from "react-apollo";
const { width, height } = Dimensions.get("window");

export class Add extends Component {
  constructor(props, { client }) {
    super(props);
    this.initialPlaceholderHeight = height / 2.5;
    StatusBar.setBarStyle("light-content", "fade");
    this.state = {
      headerImage: null,
      title: "",
      buttonButtomMargin: height / 15,
      tempMemoryID: "",
      initialImageHeight: 1000,
      imageHeight: 1000,
      placeholderHeight: this.initialPlaceholderHeight,
      loadingImages: false
    };
    //Prefetch followers and users
    props.client.query({
      query: FOLLOWERS_QUERY,
      variables: { searchString: "" }
    });
    props.client.query({
      query: ALL_USERS_QUERY,
      variables: { userID: props.userID, searchString: "" }
    });
  }

  componentDidMount() {
    if (Platform.OS === "ios") {
      Keyboard.addListener("keyboardWillHide", this.keyboardWillHide);
      Keyboard.addListener("keyboardWillShow", this.keyboardWillShow);
    } else {
      Keyboard.addListener("keyboardDidHide", this.keyboardDidHide);
      Keyboard.addListener("keyboardDidShow", this.keyboardDidShow);
    }
    /*
    AsyncStorage.getItem("tasks")
      .then(res => Alert.alert("hiragno" + res))
      .catch(() => Alert.alert("err"));
      */
  }

  onSubmit = () => {
    Keyboard.dismiss();
    if (stringIsEmpty(this.state.title)) {
      Alert.alert("Please enter a title");
    } else if (
      this.state.headerImage === null ||
      stringIsEmpty(this.state.tempMemoryID)
    ) {
      Alert.alert("Please add an image");
    } else {
      this.props.dispatch(
        addFirst(
          this.state.title,
          this.state.headerImage,
          this.state.tempMemoryID
        )
      );
      navigate("AddSecondStep");
    }
  };

  onClose = () => {
    goBack();
  };

  keyboardWillShow = e => {
    const keyBoardHeight = e.endCoordinates.height;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    if (this.state.headerImage !== null) {
      if (this.state.imageHeight > height / 2.6) {
        this.setState({
          buttonButtomMargin: keyBoardHeight + height / 32,
          imageHeight: height / 2.6
        });
      } else {
        this.setState({ buttonButtomMargin: keyBoardHeight + height / 32 });
      }
    } else {
      this.setState({ buttonButtomMargin: keyBoardHeight + height / 32 });
    }
  };

  keyboardWillHide = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    if (this.state.headerImage !== null) {
      this.setState({
        buttonButtomMargin: height / 15,
        imageHeight: this.state.initialImageHeight
      });
    } else {
      this.setState({
        buttonButtomMargin: height / 15,
        placeholderHeight: this.initialPlaceholderHeight
      });
    }
  };

  keyboardDidShow = e => {
    const keyBoardHeight = e.endCoordinates.height;

    if (this.state.headerImage !== null) {
      if (this.state.imageHeight > keyBoardHeight / 1.5) {
        this.setState({
          buttonButtomMargin: keyBoardHeight + height / 20,
          imageHeight: keyBoardHeight / 1.5
        });
      } else {
        this.setState({ buttonButtomMargin: keyBoardHeight + height / 20 });
      }
    } else {
      this.setState({
        buttonButtomMargin: keyBoardHeight + height / 20,
        placeholderHeight: this.state.placeholderHeight - height / 10
      });
    }
  };

  keyboardDidHide = () => {
    if (this.state.headerImage !== null) {
      this.setState({
        buttonButtomMargin: height / 15,
        swiperHeight: this.state.initialImageHeight
      });
    } else {
      this.setState({
        buttonButtomMargin: height / 15,
        placeholderHeight: this.initialPlaceholderHeight
      });
    }
  };

  render() {
    return (
      <View>
        {this.state.headerImage !== null ? (
          <View style={{ backgroundColor: "white" }}>
            <Image
              style={{
                width: width,
                height: this.state.imageHeight
              }}
              resizeMode="cover"
              source={this.state.headerImage}
            />

            <IconButton left icon="ios-close" onPress={() => this.onClose()} />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              const tempMemoryID = b();
              this.setState({ tempMemoryID, loadingImages: true });
              ImagePicker.openPicker({
                mediaType: "photo",
                includeBase64: true
              })
                .then(image => {
                  let aspectRatio = image.width / image.height;
                  let measuredHeight;

                  if (aspectRatio > Config.MAX_ASPECTRATIO) {
                    measuredHeight = width / Config.MAX_ASPECTRATIO;
                  } else if (aspectRatio < Config.MIN_ASPECTRATIO) {
                    measuredHeight = width / Config.MIN_ASPECTRATIO;
                  } else {
                    measuredHeight = width / aspectRatio;
                  }
                  let imageHeight;
                  if (measuredHeight != image.height) {
                    imageHeight = measuredHeight;
                  } else {
                    imageHeight = this.initialImageHeight;
                  }

                  const filename = b();
                  const path = "/" + tempMemoryID + "/" + filename;

                  //Self invocating function to preserve scope of variables in asynchronous call below.

                  ((image, filename, imageHeight, path) => {
                    RNFetchBlob.fs
                      .writeFile(
                        RNFetchBlob.fs.dirs.DocumentDir + path,
                        image.data,
                        "base64"
                      )
                      .then(() => {
                        this.setState({
                          loadingImages: false,
                          headerImage: {
                            uri: image.path,
                            url: image.path,
                            filename,
                            imageHeight,
                            mime: image.mime
                          },

                          initialImageHeight: imageHeight,
                          imageHeight
                        });
                      })
                      .catch(error => {
                        this.setState({
                          loadingImages: false
                        });
                        console.log(error);
                      });
                  })(image, filename, imageHeight, path);
                })
                .catch(error => {
                  this.setState({
                    loadingImages: false
                  });
                });
            }}
          >
            <View
              style={{
                width: width,
                height: this.state.placeholderHeight,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Config.MAIN_COLOR
              }}
            >
              <IconButton
                left
                icon="ios-close"
                onPress={() => this.onClose()}
              />
              {!this.state.loadingImages ? (
                <View
                  style={{
                    width: width,
                    height: this.state.placeholderHeight,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: Config.MAIN_COLOR
                  }}
                >
                  <View>
                    <Icon
                      style={{ color: "white", backgroundColor: "transparent" }}
                      name="ios-image-outline"
                      size={55}
                    />
                    <View
                      style={{
                        height: 25,
                        width: 25,
                        backgroundColor: Config.SECOND_COLOR,
                        borderRadius: 12.5,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        right: -5,
                        top: -5
                      }}
                    >
                      <Icon
                        style={{
                          color: "white",
                          backgroundColor: "transparent",
                          fontWeight: "900"
                        }}
                        name="md-add"
                        size={22}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      color: "white",
                      position: "absolute",
                      fontSize: 16,
                      fontWeight: "500",
                      bottom: height / 20
                    }}
                  >
                    Choose a cover photo
                  </Text>
                </View>
              ) : (
                <Spinner type="Bounce" size={50} color="white" />
              )}
            </View>
          </TouchableOpacity>
        )}
        {this.state.headerImage !== null ? (
          <ScrollView
            style={[styles.view, { height: height - this.state.imageHeight }]}
            keyboardShouldPersistTaps="handled"
          >
            <TextField
              inputStyle={{
                fontSize: 16,
                height: 33,
                lineHeight: 34,
                paddingBottom: 3
              }}
              maxLength={Config.MAX_CHARACTER_TITLE}
              returnKeyType="next"
              onSubmitEditing={() => {
                this.onSubmit();
              }}
              label={"Your memory"}
              value={this.state.title}
              onChangeText={title => this.setState({ title: title })}
              highlightColor={Config.MAIN_COLOR}
            />
          </ScrollView>
        ) : (
          <ScrollView
            style={[
              styles.view,
              { height: height - this.state.placeholderHeight }
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <TextField
              inputStyle={{
                fontSize: 16,
                height: 33,
                lineHeight: 34,
                paddingBottom: 3
              }}
              label={"Your memory"}
              value={this.state.title}
              onChangeText={title => this.setState({ title: title })}
              highlightColor={Config.MAIN_COLOR}
            />
          </ScrollView>
        )}
        <View
          pointerEvents="box-none"
          style={{
            backgroundColor: "transparent",
            flexDirection: "column",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: this.state.buttonButtomMargin,
            alignItems: "center",
            shadowColor: Config.SECOND_COLOR,
            shadowOffset: {
              width: 0,
              height: 10
            },
            shadowRadius: 15,
            shadowOpacity: 0.6
          }}
        >
          <Button
            backColor={Config.SECOND_COLOR}
            color="white"
            version="roundFilled"
            text="Continue"
            onPress={() => this.onSubmit()}
          />
        </View>
      </View>
    );
  }
}
var mapStateToProps = function(state) {
  return {
    userID: state.profile.id
  };
};
export default connect(mapStateToProps)(graphql(USER_QUERY)(withApollo(Add)));
