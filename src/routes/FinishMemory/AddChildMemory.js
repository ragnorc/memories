/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  Text
} from "react-native";
import { goBack } from "../../lib/navigation";
import { stringIsEmpty, b } from "../../lib/functions";
import TextField from "react-native-md-textinput";
import RNGooglePlaces from "react-native-google-places";
import * as Config from "../../config";
import Spinner from "react-native-spinkit";
import { addChildMemory } from "../../redux/ducks/memory";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { connect } from "react-redux";
import ImagePicker from "react-native-image-crop-picker";
import RNFetchBlob from "react-native-fetch-blob";

import IconButton from "../../components/IconButton";
import DatePicker from "react-native-datepicker";

import { navigate } from "../../lib/navigation";

const { width, height } = Dimensions.get("window");

export class AddChildMemory extends Component {
  constructor(props, { client }) {
    super(props);
    this.initialImageHeight = height / 2.5;
    this.state = {
      tempChildMemoryID: b(),
      location: {},
      placeColor: Config.GREY_COLOR,
      images: [],
      songs: [],
      startedAt: "",
      description: "",
      loadingImages: false
    };
  }

  onSubmit = () => {
    Keyboard.dismiss();
    if (stringIsEmpty(this.state.title)) {
      Alert.alert("Please enter a title");
    } else if (
      this.state.images.length < 1 &&
      stringIsEmpty(this.state.description)
    ) {
      Alert.alert("Please add an image or a description");
    } else if (this.state.loadingImages) {
      Alert.alert("Please wait for the images to load.");
    } else {
      this.props.navigation.state.params.onSubmit(
        this.state.title,
        this.state.images,
        this.state.tempChildMemoryID,
        this.state.songs,
        this.state.location,
        this.state.startedAt,
        this.state.description
      );

      goBack();
    }
  };

  onClose = () => {
    goBack();
  };

  render() {
    return (
      <View>
        <DatePicker
          ref={picker => {
            this.startDatePicker = picker;
          }}
          style={{
            width: 0,
            height: 0
          }}
          date={new Date()}
          mode="date"
          placeholder="Choose date"
          format="YYYY-MM-DD"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: "absolute",
              left: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              marginLeft: 36
            }
          }}
          onDateChange={date => {
            this.setState({
              startedAt: date
            });
          }}
        />

        <ScrollView keyboardShouldPersistTaps="handled">
          <View
            style={{
              width: width,
              height: height,
              paddingHorizontal: width / 10,
              paddingTop: height / 10,
              backgroundColor: Config.MAIN_COLOR
            }}
          >
            <TextField
              inputStyle={{
                fontSize: 16,
                height: 33,
                lineHeight: 34,
                paddingBottom: 3
              }}
              maxLength={Config.MAX_CHARACTER_MOMENT_TITLE}
              labelColor="white"
              returnKeyType="next"
              textColor="white"
              underlineColorAndroid="transparent"
              label={"Your moment"}
              value={this.state.title}
              onChangeText={title => this.setState({ title: title })}
              highlightColor="white"
            />

            <TextInput
              value={this.state.description}
              placeholderTextColor="grey"
              placeholder="Description"
              onChangeText={description =>
                this.setState({ description: description })}
              style={{
                backgroundColor: "white",
                color: "grey",
                fontSize: 17,
                borderRadius: 11,
                height: height / 4,
                marginVertical: height / 20,
                paddingVertical: height / 30,
                paddingHorizontal: width / 17,
                shadowColor: "black",
                shadowOffset: {
                  width: 0,
                  height: 0
                },
                shadowRadius: 20,
                shadowOpacity: 0.6
              }}
              multiline
              numberOfLines={10}
              underlineColorAndroid="transparent"
            />
            <View
              style={{
                position: "absolute",
                right: width / 10,
                left: width / 10,
                bottom: height / 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    images: [],
                    loadingImages: true
                  });

                  ImagePicker.openPicker({
                    mediaType: "photo",
                    includeBase64: true,
                    multiple: true
                  })
                    .then(images => {
                      let imagesFinished = 1;
                      images.map(image => {
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
                        const path =
                          "/" + this.state.tempChildMemoryID + "/" + filename;

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
                                imageColor: Config.MAIN_COLOR,
                                images: [
                                  ...this.state.images,
                                  {
                                    uri: image.path,
                                    filename,
                                    imageHeight,
                                    mime: image.mime
                                  }
                                ]
                              });

                              if (imagesFinished === images.length) {
                                this.setState({ loadingImages: false });
                              }
                              imagesFinished++;
                            })
                            .catch(error => {
                              console.log(error);
                            });
                        })(image, filename, imageHeight, path);
                      });
                    })
                    .catch(error => {
                      this.setState({
                        loadingImages: false
                      });
                    });
                }}
                style={styles.option}
              >
                {this.state.loadingImages ? (
                  <Spinner type="Bounce" size={30} color={Config.MAIN_COLOR} />
                ) : (
                  <Icon
                    style={{
                      color:
                        this.state.images.length > 0
                          ? Config.MAIN_COLOR
                          : Config.GREY_COLOR,
                      backgroundColor: "transparent"
                    }}
                    name="ios-image"
                    size={40}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigate("ChooseSong", false, {
                    onSubmit: selectedSongs =>
                      this.setState({ songs: selectedSongs })
                  });
                }}
                style={styles.option}
              >
                <Icon
                  style={{
                    color:
                      this.state.songs.length > 0
                        ? Config.MAIN_COLOR
                        : Config.GREY_COLOR,
                    backgroundColor: "transparent"
                  }}
                  name="ios-musical-notes"
                  size={40}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.startDatePicker.onPressDate();
                }}
                style={styles.option}
              >
                <Icon
                  style={{
                    color: stringIsEmpty(this.state.startedAt)
                      ? Config.GREY_COLOR
                      : Config.MAIN_COLOR,
                    backgroundColor: "transparent"
                  }}
                  name="ios-calendar"
                  size={40}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  StatusBar.setBarStyle("dark-content", "fade");
                  RNGooglePlaces.openAutocompleteModal()
                    .then(place => {
                      StatusBar.setBarStyle("light-content", "fade");
                      this.setState({
                        location: { ...place }
                      });
                    })
                    .catch(error => {
                      StatusBar.setBarStyle("light-content", "fade");
                      console.log(error.message);
                    }); // error is a Javascript Error object
                }}
                style={styles.option}
              >
                <Icon
                  style={{
                    color:
                      Object.keys(this.state.location).length > 0
                        ? Config.MAIN_COLOR
                        : Config.GREY_COLOR,
                    backgroundColor: "transparent"
                  }}
                  name="ios-pin"
                  size={40}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <IconButton left icon="ios-close" onPress={() => this.onClose()} />
        <IconButton
          right
          icon="ios-checkmark"
          onPress={() => this.onSubmit()}
        />
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  view: {
    paddingHorizontal: width / 10,
    backgroundColor: "white"
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: width / 6,
    height: width / 6,
    borderRadius: 11,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 20,
    shadowOpacity: 0.6
  }
});

var mapStateToProps = function(state) {
  return {
    songs: state.others.childMemorySongs
  };
};
export default connect(mapStateToProps)(AddChildMemory);
