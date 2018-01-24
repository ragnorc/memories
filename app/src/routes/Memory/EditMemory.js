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
  Platform,
  PixelRatio,
  Animated
} from "react-native";
import { goBack } from "../../lib/navigation";
import { uploadImage, uploadChildmemories } from "../../lib/fetch";
import Animation from "lottie-react-native";
import Memory from "../../components/Memory";
import { graphql, compose } from "react-apollo";
import * as Config from "../../config";
import * as Progress from "react-native-progress";

import {
  UPDATE_MEMORY_MUTATION,
  ADD_IMAGE_MUTATION,
  USER_QUERY,
  PUBLISH_MEMORY_MUTATION,
  DELETE_MEMORY_MUTATION,
  FEED_QUERY,
  SET_INITIATOR_MUTATION,
  REMOVE_COLLABORATOR_MUTATION
} from "../../lib/queries";

import ActionButton from "react-native-action-button";
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from "react-redux";
import RNFetchBlob from "react-native-fetch-blob";
import styles from "./styles";
import IconButton from "../../components/IconButton";
import { navigate } from "../../lib/navigation";
import { uploadMemory } from "../../lib/fetch";
import ActionSheet from "@yfuks/react-native-action-sheet";
import { b } from "../../lib/functions";
import ImagePicker from "react-native-image-crop-picker";

const { width, height } = Dimensions.get("window");

export class EditMemory extends Component {
  static navigationOptions = {
    gesturesEnabled: true
  };

  constructor(props) {
    super(props);

    StatusBar.setBarStyle("light-content", "fade");
    this.initialTaskState = {
      add: {
        images: [],

        childMemories: []
      },
      delete: {
        childMemories: []
      }
    };
    this.state = {
      imageHeight: height / 2.5,
      title: "",
      updating: false,
      editMode: false,
      ...props.navigation.state.params.memory,

      tasks: {
        add: {
          images: [],
          childMemories: []
        },
        delete: {
          images: [],
          childMemories: []
        }
      }
    };
  }

  state: {
    imageHeight: number,
    title: string,
    editMode: boolean,
    tasks: Object,
    updating: boolean
  };

  onDeleteMemory = () => {
    let collaboratorsArray = [];
    if (this.state.collaborators) {
      this.state.collaborators.map(collaborator => {
        collaboratorsArray.push(collaborator.id);
      });
    }
    if (
      this.state.initiator.id === this.props.userID &&
      collaboratorsArray.length > 0
    ) {
      Alert.alert(
        "Leave memory",
        "Are you sure you want to leave this memory? ",
        [
          {
            text: "Yes",
            onPress: () =>
              this.props
                .setInitiator({
                  variables: {
                    memoryID: this.state.id,
                    initiator: collaboratorsArray[0]
                  }
                })
                .then(() => navigate("Main", true))
          },
          {
            text: "Cancel",

            style: "cancel"
          }
        ],
        { cancelable: false }
      );
    } else if (
      this.state.initiator.id === this.props.userID &&
      collaboratorsArray.length < 1
    ) {
      Alert.alert(
        "Delete memory",
        "Are you sure you want to delete this memory? ",
        [
          {
            text: "Yes",
            onPress: () =>
              this.props
                .deleteMemory({ variables: { memoryID: this.state.id } })
                .then(() => navigate("Main", true))
          },
          {
            text: "Cancel",

            style: "cancel"
          }
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        "Leave memory",
        "Are you sure you want to leave this memory? ",
        [
          {
            text: "Yes",
            onPress: () =>
              this.props
                .removeCollaborator({
                  variables: {
                    memoryID: this.state.id,
                    collaborator: this.props.userID
                  }
                })
                .then(() => navigate("Main", true))
          },
          {
            text: "Cancel",

            style: "cancel"
          }
        ],
        { cancelable: false }
      );
    }
  };
  onSubmit = () => {
    this.setState({ updating: true });

    let collaboratorsArray = [];
    if (this.state.collaborators) {
      this.state.collaborators.map(collaborator => {
        collaboratorsArray.push(collaborator.id);
      });
    }

    let imagesArray = [];
    if (this.state.images) {
      this.state.images.map(image => {
        if (!image.addedImage) {
          imagesArray.push(image.id);
        }
      });
    }
    let childMemoriesArray = [];
    if (this.state.childMemories) {
      this.state.childMemories.map(childMemory => {
        if (!childMemory.addedChildMemory) {
          childMemoriesArray.push(childMemory.id);
        }
      });
    }
    this.props
      .updateMemory({
        variables: {
          memoryID: this.state.id,
          songs: this.state.songs,
          collaborators: collaboratorsArray,
          title: this.state.title,
          images: imagesArray,
          childMemories: childMemoriesArray
        }
      })
      .then(() => {
        if (
          this.state.tasks.add.images.length > 0 ||
          this.state.tasks.add.childMemories.length > 0
        ) {
          this.uploadImagesAndChildMemories()
            .then(() => {
              this.setState({
                tasks: {
                  ...this.state.tasks,
                  add: this.initialTaskState.add
                }
              });

              setTimeout(() => {
                navigate("Main", true);
                this.setState({ updating: false });
              }, 1000);
            })
            .catch(error => {
              Alert.alert(
                "There was an error updating your memory. Please try again later."
              );
              navigate("Main", true);
              this.setState({ updating: false });
            });
        } else {
          setTimeout(() => {
            navigate("Main", true);
            this.setState({ updating: false });
          }, 1000);
        }
      })
      .catch(error => {
        Alert.alert(
          "There was an error updating your memory. Please try again later."
        );
        navigate("Main", true);
        this.setState({ updating: false });
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
        let imageHeight = image.height;
        if (measuredHeight != image.height) {
          imageHeight = measuredHeight;
        }

        const filename = b();
        const path = "/" + this.state.id + "/" + filename;
        //Self invocating function to preserve scope of variables in asynchronous call below.

        ((image, filename, imageHeight, path) => {
          RNFetchBlob.fs
            .writeFile(
              RNFetchBlob.fs.dirs.DocumentDir + path,
              image.data,
              "base64"
            )
            .then(() => {
              let id = b();
              this.setState({
                images: [
                  ...this.state.images,
                  {
                    url: image.path,
                    uri: image.path,
                    filename,
                    imageHeight,
                    mime: image.mime,
                    addedImage: true,
                    id
                  }
                ],
                tasks: {
                  ...this.state.tasks,
                  add: {
                    ...this.state.tasks.add,
                    images: [
                      ...this.state.tasks.add.images,
                      {
                        url: image.path,
                        uri: image.path,
                        filename,
                        imageHeight,
                        mime: image.mime,
                        addedImage: true,
                        id
                      }
                    ]
                  }
                }
              });
            })
            .catch(error => {
              Alert.alert(
                "An error ocurred. Please try adding the images again." + error
              );
            });
        })(image, filename, imageHeight, path);
      });
    });
  };

  uploadImagesAndChildMemories = () => {
    return new Promise((resolve, reject) => {
      let imagesFinished = 1;
      let childFinished = false;
      if (this.state.tasks.add.childMemories.length > 0) {
        uploadChildmemories(
          this.state.tasks.add.childMemories,
          this.state.startedAt,
          this.state.userID,
          this.state.id
        )
          .then(() => {
            childFinished = true;

            if (
              imagesFinished === this.state.tasks.add.images.length ||
              this.state.tasks.add.images.length < 1
            ) {
              resolve();
            }
          })
          .catch(error => {
            reject(error);
          });
      } else {
        childFinished = true;
        if (this.state.tasks.add.images.length < 1) {
          resolve();
        }
      }
      this.state.tasks.add.images.map((image, index) => {
        if (image.filename) {
          uploadImage(
            RNFetchBlob.fs.dirs.DocumentDir +
              "/" +
              this.state.id +
              "/" +
              image.filename
          )
            .then(fileID => {
              this.props
                .addImage({ variables: { fileID, memoryID: this.state.id } })
                .then(() => {
                  if (imagesFinished === this.state.tasks.add.images.length) {
                    if (childFinished) {
                      resolve();
                    }
                  } else {
                    imagesFinished++;
                  }
                })
                .catch(error => {
                  reject(error);
                });
            })
            .catch(error => {
              reject(error);
            });
        } else {
          imagesFinished++;
        }
      });
    });
  };

  deleteChildMemories = () => {
    return new Promise((resolve, reject) => {
      let childFinished = 1;
      if (this.state.tasks.delete.childMemories.length > 0) {
        this.state.tasks.delete.childMemories.map((memoryID, index) => {
          this.props.deleteMemory({ variables: { memoryID } }).then(() => {
            if (
              childFinished === this.state.tasks.delete.childMemories.length
            ) {
              resolve();
            } else {
              childFinished++;
            }
          });
        });
      } else {
        resolve();
      }
    });
  };

  deleteImage = index => {
    if (this.state.images[index].addedImage) {
      let cloneImagesTasks = this.state.tasks.add.images.slice();
      cloneImagesTasks = cloneImagesTasks.filter(obj => {
        return obj.id !== this.state.images[index].id;
      });
      this.setState({
        tasks: {
          ...this.state.tasks,
          add: {
            ...this.state.tasks.add,
            images: cloneImagesTasks
          }
        }
      });
    }

    let cloneImagesArray = this.state.images.slice();
    cloneImagesArray.splice(index, 1);
    this.setState({ images: cloneImagesArray });
  };

  deleteChildMemory = (item, index) => {
    if (item.tempMemoryID) {
      let cloneChildMemoriesTasks = this.state.tasks.add.childMemories.slice();
      cloneChildMemoriesTasks = cloneChildMemoriesTasks.filter(function(obj) {
        return obj.tempMemoryID !== item.tempMemoryID;
      });

      this.setState({
        tasks: {
          ...this.state.tasks,
          add: {
            ...this.state.tasks.add,
            childMemories: cloneChildMemoriesTasks
          }
        }
      });
    }
    let cloneChildMemories = this.state.childMemories.slice();
    cloneChildMemories.splice(index, 1);
    this.setState({
      childMemories: cloneChildMemories
    });
  };

  render() {
    let locationsArray = [this.state.location];
    if (this.state.childMemories) {
      this.state.childMemories.map(child => {
        if (child.location && Object.keys(child.location).length) {
          locationsArray.push(child.location);
        }
      });
    }

    return (
      <View style={{ flex: 1 }}>
        <Memory
          onChangeTitle={title => this.setState({ title })}
          editMode={this.state.editMode}
          onAddMember={() => {
            navigate("ChooseCollaborators", false, {
              initiator: this.state.initiator.id || this.state.userID,
              selectedPeople: this.state.collaborators.reduce((obj, item) => {
                obj[item.id] = item;
                return obj;
              }, {}),
              onSubmit: selectedPeople => {
                this.setState({
                  collaborators: Object.values(selectedPeople)
                });
              }
            });
          }}
          deleteImage={this.deleteImage}
          deleteChildMemory={this.deleteChildMemory}
          {...this.state}
          collaborators={this.state.collaborators}
          headerImage={{
            ...this.state.headerImage,
            uri:
              "https://memories.imgix.net/" +
              this.state.headerImage.secret +
              "?w=" +
              PixelRatio.getPixelSizeForLayoutSize(width),
            imageHeight: this.state.imageHeight
          }}
          locations={locationsArray}
        />
        <IconButton
          left
          icon="ios-arrow-back-outline"
          size={30}
          onPress={() => goBack()}
        />
        {this.state.editMode ? (
          <View
            pointerEvents="box-none"
            style={{
              height: height,
              width: width,
              position: "absolute",
              backgroundColor: "transparent"
            }}
          >
            <TouchableHighlight
              onPress={() => {
                this.setState({ editMode: false });
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
                      this.setState({
                        songs: [...this.state.songs, ...selectedSongs],
                        tasks: {
                          ...this.state.tasks,
                          add: {
                            ...this.state.tasks.add
                          }
                        }
                      });
                    }
                  });
                }}
              >
                <Icon
                  name="ios-musical-notes"
                  style={styles.actionButtonIcon}
                />
              </ActionButton.Item>
              <ActionButton.Item
                buttonColor="#1abc9c"
                title="Moment"
                onPress={() => {
                  navigate("AddChildMemory", false, {
                    onSubmit: (
                      title,
                      images,
                      tempMemoryID,
                      songs,
                      location,
                      startedAt,
                      description
                    ) => {
                      this.setState({
                        childMemories: [
                          ...this.state.childMemories,
                          {
                            title,
                            images,
                            tempMemoryID,
                            songs,
                            location,
                            startedAt: startedAt || this.state.startedAt,
                            description,
                            addedChildMemory: true
                          }
                        ],
                        tasks: {
                          ...this.state.tasks,
                          add: {
                            ...this.state.tasks.add,
                            childMemories: [
                              ...this.state.tasks.add.childMemories,
                              {
                                title,
                                images,
                                tempMemoryID,
                                songs,
                                location,
                                startedAt: startedAt || this.state.startedAt,
                                description,
                                addedChildMemory: true
                              }
                            ]
                          }
                        }
                      });
                    }
                  });
                }}
              >
                <Icon name="ios-create" style={styles.actionButtonIcon} />
              </ActionButton.Item>
            </ActionButton>
          </View>
        ) : (
          <IconButton
            icon="md-more"
            right
            size={30}
            onPress={() => {
              var BUTTONSiOS = ["Edit", "Delete", "Cancel"];

              var BUTTONSandroid = ["Edit", "Delete", "Cancel"];

              var DESTRUCTIVE_INDEX = 1;
              var CANCEL_INDEX = 2;

              ActionSheet.showActionSheetWithOptions(
                {
                  options: Platform.OS == "ios" ? BUTTONSiOS : BUTTONSandroid,
                  cancelButtonIndex: CANCEL_INDEX,
                  destructiveButtonIndex: DESTRUCTIVE_INDEX,
                  tintColor: "blue"
                },
                buttonIndex => {
                  if (buttonIndex === 0) {
                    this.setState({ editMode: true });
                  } else if (buttonIndex === 1) {
                    this.onDeleteMemory();
                  }
                }
              );
            }}
          />
        )}

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
              Updating your memory
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
  graphql(DELETE_MEMORY_MUTATION, { name: "deleteMemory" }),
  graphql(PUBLISH_MEMORY_MUTATION, { name: "publishMemory" }),
  graphql(UPDATE_MEMORY_MUTATION, { name: "updateMemory" }),
  graphql(ADD_IMAGE_MUTATION, { name: "addImage" }),
  graphql(SET_INITIATOR_MUTATION, { name: "setInitiator" }),
  graphql(REMOVE_COLLABORATOR_MUTATION, { name: "removeCollaborator" })
)(EditMemory);
