/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  Alert,
  TouchableHighlight,
  Keyboard,
  AsyncStorage,
  InteractionManager
} from "react-native";
import { goBack } from "../../lib/navigation";
import { addImage } from "../../redux/ducks/memory";
import { memoryUploadTask } from "../../redux/ducks/others";
import Memory from "../../components/Memory";
import { graphql, compose, withApollo } from "react-apollo";
import * as Config from "../../config";
import { addChildMemorySongs } from "../../redux/ducks/others";

import {
  MEMORY_SUBMIT_MUTATION,
  ADD_IMAGE_MUTATION,
  USER_QUERY,
  PUBLISH_MEMORY_MUTATION,
  FEED_QUERY,
  PROFILE_MEMORIES_QUERY
} from "../../lib/queries";
import { addCollaborators } from "../../redux/ducks/memory";
import ActionButton from "react-native-action-button";
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from "react-redux";
import RNFetchBlob from "react-native-fetch-blob";
import styles from "./styles";
import IconButton from "../../components/IconButton";
import { navigate } from "../../lib/navigation";
import { addSongs, addChildMemory } from "../../redux/ducks/memory";

import { b } from "../../lib/functions";
import ImagePicker from "react-native-image-crop-picker";

const { width, height } = Dimensions.get("window");

export class FinishMemory extends Component {
  static navigationOptions = {
    gesturesEnabled: false
  };
  constructor(props) {
    super(props);
    StatusBar.setBarStyle("light-content", "fade");
    this.state = {
      imageHeight: height / 2.5,
      title: "",
      buttonButtomMargin: height / 15,
      originalImageHeight: height / 2.5
    };
    this.publishing = false;
  }

  componentWillReceiveProps(np) {}

  onSubmit = () => {
    Keyboard.dismiss();

    navigate("Main", true);
    InteractionManager.runAfterInteractions(() => {
      let songsArray = [];
      if (this.props.songs) {
        this.props.songs.map(song => {
          songsArray.push(song);
        });
      }
      let collaboratorsArray = [];
      if (this.props.collaborators) {
        this.props.collaborators.map(collaborator => {
          collaboratorsArray.push(collaborator.id);
        });
      }

      if (this.props.privacy.specificFollowers) {
        var specificFollowersArray = Object.keys(
          this.props.privacy.specificFollowers
        ).map(function(k) {
          return k;
        });
      }
      if (this.props.privacy.excludedPeople) {
        var excludedPeopleArray = Object.keys(
          this.props.privacy.excludedPeople
        ).map(function(k) {
          return k;
        });
      }

      let memoryObj = {
        title: this.props.title,
        location: this.props.location,
        startedAt: this.props.startedAt,
        endedAt: this.props.endedAt,
        headerImage: this.props.headerImage,
        collaborators: collaboratorsArray,
        userID: this.props.UserQuery.user.id,
        songs: songsArray,
        privacyType: this.props.privacy.type,
        specificFollowers: specificFollowersArray,
        excludedPeople: excludedPeopleArray,
        showInFeed: this.props.privacy.showInFeed,
        childMemories: this.props.childMemories,
        images: this.props.images,
        tempMemoryID: this.props.tempMemoryID
      };

      AsyncStorage.getItem("tasks").then(tasks => {
        let tasksObj = {};
        //let cloneImagesArray= this.props.images.slice();
        if (tasks !== null) {
          tasksObj = { ...JSON.parse(tasks) };
        }
        tasksObj[this.props.tempMemoryID] = memoryObj;

        AsyncStorage.setItem("tasks", JSON.stringify(tasksObj)).then(() => {
          this.props.dispatch(memoryUploadTask(this.props.tempMemoryID));
        });
      });
    });
  };

  onAddImages = () => {
    ImagePicker.openPicker({
      mediaType: "photo",
      includeBase64: true,
      multiple: true,
      maxFiles: 25
    }).then(images => {
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
        const path = "/" + this.props.tempMemoryID + "/" + filename;
        //Self invocating function to preserve scope of variables in asynchronous call below.

        ((image, filename, imageHeight, path) => {
          RNFetchBlob.fs
            .writeFile(
              RNFetchBlob.fs.dirs.DocumentDir + path,
              image.data,
              "base64"
            )
            .then(() => {
              this.props.dispatch(
                addImage({
                  uri: image.path,
                  url: image.path,
                  filename,
                  imageHeight,
                  mime: image.mime
                })
              );
            })
            .catch(error => {
              Alert.alert(
                "An error ocurred. Please try adding the images again."
              );
            });
        })(image, filename, imageHeight, path);
      });
    });
  };

  render() {
    //<View style={[styles.imageOverlay,{height: this.state.imageHeight}]}  />
    let locationsArray = [this.props.location];

    this.props.childMemories.map(child => {
      if (child.location && Object.keys(child.location).length) {
        locationsArray.push(child.location);
      }
    });
    let swiperHeight = 1000;

    this.props.images.map(image => {
      if (image.imageHeight < swiperHeight) {
        swiperHeight = image.imageHeight;
      }
    });

    return (
      <View style={{ flex: 1 }}>
        <Memory
          {...this.props}
          finishMode
          initiator={this.props.UserQuery.user}
          onAddMember={() => {
            navigate("ChooseCollaborators", false, {
              selectedPeople: this.props.collaborators.reduce((obj, item) => {
                obj[item.id] = item;
                return obj;
              }, {}),
              onSubmit: selectedPeople => {
                this.props.dispatch(
                  addCollaborators(Object.values(selectedPeople))
                );
              }
            });
          }}
          locations={locationsArray}
        />

        <IconButton
          left
          icon="ios-arrow-back-outline"
          size={30}
          onPress={() => goBack()}
        />
        <TouchableHighlight
          onPress={() => {
            if (!this.publishing) {
              this.publishing = true;
              this.onSubmit();
            }
          }}
          style={{
            position: "absolute",
            right: width / 14,
            top: height / 20,

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
            Upload
          </Text>
        </TouchableHighlight>
        <ActionButton position="right" buttonColor="rgb(240, 80, 88)">
          <ActionButton.Item
            title="Images"
            buttonColor="#9b59b6"
            onPress={() => {
              this.onAddImages();
            }}
          >
            <Icon name="ios-image" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item
            title="Songs"
            buttonColor="#3498db"
            onPress={() => {
              navigate("ChooseSong", false, {
                onSubmit: selectedSongs => {
                  this.props.dispatch(addSongs(selectedSongs));
                }
              });
            }}
          >
            <Icon name="ios-musical-notes" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#1abc9c"
            title="Moment"
            onPress={() => {
              navigate("AddChildMemory", false, {
                onSubmit: (...args) =>
                  this.props.dispatch(addChildMemory(...args)),
                onSongsSubmit: selectedSongs =>
                  this.props.dispatch(addChildMemorySongs(selectedSongs))
              });
            }}
          >
            <Icon name="ios-create" style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </View>
    );
  }
}
var mapStateToProps = function(state) {
  const {
    images,
    title,
    headerImage,
    collaborators,
    location,
    startedAt,
    endedAt,
    tempMemoryID,
    songs,
    privacy,
    childMemories
  } = state.memory;
  return {
    userID: state.profile.id,
    images,
    title,
    headerImage,
    collaborators,
    location,
    startedAt,
    endedAt,
    tempMemoryID,
    songs,
    privacy,
    childMemories
  };
};

export default compose(
  connect(mapStateToProps),
  graphql(USER_QUERY, { name: "UserQuery" }),
  graphql(MEMORY_SUBMIT_MUTATION, { name: "submitMemory" }),
  graphql(ADD_IMAGE_MUTATION, { name: "addImage" }),
  withApollo
)(FinishMemory);
