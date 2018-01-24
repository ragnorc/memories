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
  AsyncStorage,
  Keyboard,
  PixelRatio
} from "react-native";
import { goBack } from "../../lib/navigation";
import { addImage } from "../../redux/ducks/memory";
import Memory from "../../components/Memory";
import { graphql } from "react-apollo";
import * as Config from "../../config";

import {
  MEMORY_SUBMIT_MUTATION,
  ADD_IMAGE_MUTATION,
  USER_QUERY,
  PUBLISH_MEMORY_MUTATION
} from "../../lib/queries";

import ActionButton from "react-native-action-button";
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from "react-redux";
import RNFetchBlob from "react-native-fetch-blob";
import styles from "./styles";
import IconButton from "../../components/IconButton";
import { navigate } from "../../lib/navigation";
import { uploadMemory } from "../../lib/fetch";

import { b } from "../../lib/functions";
import ImagePicker from "react-native-image-crop-picker";

const { width, height } = Dimensions.get("window");

export class ViewMemory extends Component {
  static navigationOptions = {
    gesturesEnabled: true
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
  }

  render() {
    let memory = this.props.navigation.state.params.memory;

    let locationsArray = [memory.location];
    if (memory.childMemories) {
      memory.childMemories.map(child => {
        if (child.location && Object.keys(child.location).length) {
          locationsArray.push(child.location);
        }
      });
    }

    return (
      <View style={{ flex: 1 }}>
        <Memory
          {...memory}
          headerImage={{
            ...memory.headerImage,
            uri:
              "https://memories.imgix.net/" +
              memory.headerImage.secret +
              "?w=" +
              PixelRatio.getPixelSizeForLayoutSize(width),
            imageHeight: memory.imageHeight
          }}
          editMode={false}
          locations={locationsArray}
        />
        <IconButton
          left
          icon="ios-arrow-back-outline"
          size={30}
          onPress={() => goBack()}
        />
      </View>
    );
  }
}

export default connect()(
  graphql(USER_QUERY)(
    graphql(PUBLISH_MEMORY_MUTATION, { name: "publishMemory" })(
      graphql(MEMORY_SUBMIT_MUTATION, { name: "submitMemory" })(
        graphql(ADD_IMAGE_MUTATION, { name: "addImage" })(ViewMemory)
      )
    )
  )
);
