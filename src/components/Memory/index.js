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
  TouchableWithoutFeedback,
  Platform,
  Alert
} from "react-native";
import Spinner from "react-native-spinkit";
import Button from "../../components/Button";
import Swiper from "react-native-swiper";
import * as Config from "../../config";
import { stringIsEmpty } from "../../lib/functions";
import RoundedIcon from "../../components/RoundedIcon";
import styles from "./styles";
import { navigate } from "../../lib/navigation";
import MapView from "react-native-maps";
import IconButton from "../../components/IconButton";
const moment = require("moment");
import ActionButton from "react-native-action-button";
const { width, height } = Dimensions.get("window");
import Icon from "react-native-vector-icons/Ionicons";
import ActionSheet from "@yfuks/react-native-action-sheet";
import { createImageProgress } from "react-native-image-progress";
import { AfterInteractions } from "react-native-interactions";
import FastImage from "react-native-fast-image";
import ImageViewer from "react-native-image-zoom-viewer";
import Progress from "react-native-progress/Circle";
const ImageProgressWithFastImage = createImageProgress(FastImage);
const cardWidth = width * 0.9;
import ImageProgress from "react-native-image-progress";

const CardItem = ({
  onPress,
  icon,
  text,
  secondText,
  plus
}: {
  onPress: Function,
  icon: string,
  text: string,
  secondText: string,
  plus: number
}) => (
  <View style={styles.descView}>
    <TouchableWithoutFeedback onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <RoundedIcon icon={icon} size={height / 19} iconSize={height / 32} />
        <View
          style={{
            width: cardWidth / 1.7,
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {text}
            </Text>
            {secondText && (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.description}
              >
                {secondText}
              </Text>
            )}
          </View>
          {plus > 0 && (
            <Text
              style={{
                fontFamily: Config.MAIN_FONT,
                fontSize: 15,
                fontWeight: "300",
                color: "grey",
                marginLeft: cardWidth / 40
              }}
            >
              +{plus}
            </Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  </View>
);

export default class Memory extends Component {
  constructor(props) {
    super(props);
    this.currentImageIndex = 0;
    StatusBar.setBarStyle("light-content", "fade");
    this.state = {
      title: "",
      region: {},
      scrollY: new Animated.Value(0),
      childMemories: [],
      showModal: false
    };
  }
  state: {
    title: string,
    childMemories: Array<Object>,
    region: Object
  };
  componentDidMount() {
    if (this.props.childMemories) {
      let cloneChildMemories = this.props.childMemories.slice();
      this.props.childMemories.map((childMemory, childIndex) => {
        let cloneImages = childMemory.images.slice();

        childMemory.images.map((image, imageIndex) => {
          let finished = 1;
          if (!image.imageHeight) {
            Image.getSize(
              "https://memories.imgix.net/" +
                image.secret +
                "?w=" +
                PixelRatio.getPixelSizeForLayoutSize(width),
              (width, height) => {
                var aspectRatio = width / height;
                var measuredHeight;

                if (aspectRatio > Config.MAX_ASPECTRATIO) {
                  measuredHeight = cardWidth / Config.MAX_ASPECTRATIO;
                } else if (aspectRatio < Config.MIN_ASPECTRATIO) {
                  measuredHeight = cardWidth / Config.MIN_ASPECTRATIO;
                } else {
                  measuredHeight = cardWidth / aspectRatio;
                }

                cloneImages[imageIndex] = {
                  ...cloneImages[imageIndex],
                  uri:
                    "https://memories.imgix.net/" +
                    image.secret +
                    "?w=" +
                    PixelRatio.getPixelSizeForLayoutSize(width),
                  imageHeight: measuredHeight
                };
                cloneChildMemories[childIndex] = {
                  ...cloneChildMemories[childIndex],
                  images: cloneImages
                };
                let sortedChildMemories = cloneChildMemories.slice();
                sortedChildMemories = sortedChildMemories.sort(function(a, b) {
                  return (
                    new Date(a.startedAt).getTime() -
                    new Date(b.startedAt).getTime()
                  );
                });

                this.setState({
                  childMemories: sortedChildMemories
                });
              }
            );
          }
        });
      });
    }
  }

  componentWillReceiveProps(np) {
    if (this.state.childMemories.length !== np.childMemories.length) {
      let sortedChildMemories = np.childMemories.slice();
      sortedChildMemories = sortedChildMemories.sort(function(a, b) {
        return (
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );
      });

      this.setState({
        childMemories: sortedChildMemories
      });
      let cloneChildMemories = np.childMemories.slice();
      np.childMemories.map((childMemory, childIndex) => {
        let cloneImages = childMemory.images.slice();

        childMemory.images.map((image, imageIndex) => {
          let sortedChildMemories = cloneChildMemories.slice();
          sortedChildMemories = sortedChildMemories.sort(function(a, b) {
            return (
              new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
            );
          });

          this.setState({
            childMemories: sortedChildMemories
          });
        });
      });
    }
  }

  regionContainingPoints = points => {
    let minX, maxX, minY, maxY;
    let inset = 9;
    // init first point
    (point => {
      minX = point.latitude;
      maxX = point.latitude;
      minY = point.longitude;
      maxY = point.longitude;
    })(points[0]);

    // calculate rect
    points.map(point => {
      minX = Math.min(minX, point.latitude);
      maxX = Math.max(maxX, point.latitude);
      minY = Math.min(minY, point.longitude);
      maxY = Math.max(maxY, point.longitude);
    });

    let midX = (minX + maxX) / 2;
    let midY = (minY + maxY) / 2;
    let midPoint = [midX, midY];

    let deltaX = maxX - minX;
    let deltaY = maxY - minY;

    return {
      latitude: midX,
      longitude: midY,
      latitudeDelta: deltaX + inset,
      longitudeDelta: deltaY + inset
    };
  };

  renderMap = () => {
    let region = this.regionContainingPoints(this.props.locations);
    let pinLocactions = this.props.locations.slice();
    if (
      pinLocactions[0].types.includes("country") ||
      pinLocactions[0].types.includes("continent")
    ) {
      pinLocactions.shift();
    }
    //Alert.alert(JSON.stringify(pinLocactions));
    return (
      <View
        style={{
          shadowColor: "black",
          shadowOffset: {
            width: 0,
            height: 0
          },
          shadowRadius: 15,
          shadowOpacity: 0.2,
          height: height / 3.5,

          width: cardWidth,
          borderRadius: 8
        }}
      >
        <MapView style={styles.map} region={region}>
          {pinLocactions.map(location => {
            return (
              <MapView.Marker
                key={location.placeID}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude
                }}
              />
            );
          })}
        </MapView>

        <View
          style={{
            //View to disable scrolling in map
            position: "absolute",
            backgroundColor: "transparent",

            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </View>
    );
  };

  renderMembers = () => {
    return (
      <View style={{ width: cardWidth, marginBottom: height / 17 }}>
        <Text
          style={{
            marginTop: height / 100,
            fontFamily: Config.MAIN_FONT,
            color: "grey"
          }}
        >
          Collaborators
        </Text>
        <View
          style={{
            marginTop: height / 100,
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          {this.props.collaborators &&
            this.props.initiator &&
            [
              this.props.initiator,
              ...this.props.collaborators
            ].map((collaborator, index) => {
              if (index === 5) {
                return (
                  <View
                    key={"More" + this.props.id}
                    style={[
                      styles.participantImage,
                      {
                        backgroundColor: Config.MAIN_COLOR,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center"
                      }
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: Config.MAIN_FONT,
                        fontSize: 16,
                        color: "white"
                      }}
                    >
                      {"+" + (this.props.collaborators.length - 4)}
                    </Text>
                  </View>
                );
              } else if (index > 4) {
                return null;
              } else {
                return (
                  <TouchableWithoutFeedback
                    onPress={() => {
                      if (this.props.editMode) {
                        this.props.onAddMember();
                      }
                    }}
                  >
                    <FastImage
                      key={collaborator.id}
                      style={[
                        styles.participantImage,
                        { borderWidth: 0.5, borderColor: "#CCCCCC" }
                      ]}
                      defaultSource={require("../../assets/placeholder.png")}
                      source={{
                        uri:
                          "https://memories.imgix.net/" +
                          collaborator.profileImage.secret +
                          "?h=" +
                          PixelRatio.getPixelSizeForLayoutSize(height / 16) +
                          "?w=" +
                          PixelRatio.getPixelSizeForLayoutSize(height / 16) +
                          "&auto=compress&fit=facearea&facepad=5"
                      }}
                    />
                  </TouchableWithoutFeedback>
                );
              }
            })}
          {this.props.editMode && (
            <TouchableOpacity onPress={this.props.onAddMember}>
              <Image
                style={[
                  styles.participantImage,
                  { borderWidth: 0.5, borderColor: "#CCCCCC" }
                ]}
                source={require("../../assets/plus.png")}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  renderMoment = ({ item, index }) => {
    let date = moment(item.startedAt).format("D MMM, YYYY");
    let smallestHeight = height / 2.5;
    let dateSeparator = null;
    if (item.images.length > 0) {
      item.images.map(image => {
        if (image.imageHeight < smallestHeight) {
          smallestHeight = image.imageHeight;
        }
      });
    }

    if (index === 0) {
      dateSeparator = (
        <View
          style={{
            backgroundColor: "transparent",
            marginBottom: height / 17,
            shadowColor: Config.SECOND_COLOR,
            shadowOffset: {
              width: 0,
              height: 10
            },
            shadowRadius: 15,
            shadowOpacity: 0.6
          }}
        >
          <View
            style={{
              borderRadius: 50,

              paddingHorizontal: width / 10,
              paddingVertical: height / 50,
              justifyContent: "center",

              backgroundColor: Config.SECOND_COLOR
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontFamily: Config.MAIN_FONT,
                textAlign: "center",
                color: "white"
              }}
            >
              {date}
            </Text>
          </View>
        </View>
      );
    } else {
      if (item.startedAt === this.state.childMemories[index - 1].startedAt) {
        dateSeparator = null;
      } else {
        dateSeparator = (
          <View
            style={{
              backgroundColor: "transparent",
              marginBottom: height / 17,
              shadowColor: Config.SECOND_COLOR,
              shadowOffset: {
                width: 0,
                height: 10
              },
              shadowRadius: 15,
              shadowOpacity: 0.6
            }}
          >
            <View
              style={{
                borderRadius: 50,

                paddingHorizontal: width / 10,
                paddingVertical: height / 50,
                justifyContent: "center",

                backgroundColor: Config.SECOND_COLOR
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontFamily: Config.MAIN_FONT,
                  textAlign: "center",
                  color: "white"
                }}
              >
                {date}
              </Text>
            </View>
          </View>
        );
      }
    }
    return (
      <View
        style={{
          paddingHorizontal: (width - cardWidth) * 0.5,
          paddingTop: height / 17,
          width: width,
          alignItems: "center"
        }}
      >
        {dateSeparator}
        <View
          style={{
            flex: 1,
            shadowColor: "black",
            shadowOffset: {
              width: 0,
              height: 0
            },
            shadowRadius: 15,
            shadowOpacity: 0.2,
            borderRadius: 11,
            width: cardWidth,
            elevation: 7
          }}
        >
          {item.images.length > 0 && (
            <Swiper
              height={height / 3}
              style={{
                borderTopLeftRadius: 11,
                borderTopRightRadius: 11
              }}
              width={cardWidth}
              loop={false}
            >
              {item.images.map((image, i) => (
                <ImageProgressWithFastImage
                  onLoadEnd={() => {}}
                  indicator={Progress}
                  key={image.id}
                  style={{
                    height: height / 3,
                    width: cardWidth
                  }}
                  source={{
                    uri: image.secret
                      ? "https://memories.imgix.net/" +
                        image.secret +
                        "?w=" +
                        PixelRatio.getPixelSizeForLayoutSize(cardWidth)
                      : image.uri
                  }}
                  resizeMode="cover"
                />
              ))}
            </Swiper>
          )}
          <View style={{ paddingVertical: height / 40 }}>
            {item.title && <Text style={styles.momentTitle}>{item.title}</Text>}
            {item.description !== null &&
            !stringIsEmpty(item.description) && (
              <Text style={styles.momentDescription}>{item.description}</Text>
            )}

            {item.songs.map(song => (
              <View style={{ paddingVertical: height / 70 }}>
                <CardItem icon="ios-musical-notes-outline" text={song.name} />
              </View>
            ))}

            {item.location.name && (
              <View style={{ paddingVertical: height / 70 }}>
                <CardItem icon="ios-pin-outline" text={item.location.name} />
              </View>
            )}
            {this.props.editMode && (
              <IconButton
                leftMargin={1}
                topMargin={10}
                icon="md-more"
                color="black"
                onPress={() => {
                  var BUTTONSiOS = ["Delete", "Cancel"];

                  var BUTTONSandroid = ["Delete", "Cancel"];

                  var DESTRUCTIVE_INDEX = 0;
                  var CANCEL_INDEX = 1;

                  ActionSheet.showActionSheetWithOptions(
                    {
                      options:
                        Platform.OS == "ios" ? BUTTONSiOS : BUTTONSandroid,
                      cancelButtonIndex: CANCEL_INDEX,
                      destructiveButtonIndex: DESTRUCTIVE_INDEX,
                      tintColor: "blue"
                    },
                    buttonIndex => {
                      if (buttonIndex === 0) {
                        this.props.deleteChildMemory(item, index);
                      }
                    }
                  );
                }}
                size={25}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  renderSong = item => {
    if (this.props.songs) {
      return (
        <TouchableOpacity
          style={{
            marginTop: height / 30,
            flexDirection: "row",
            alignItems: "center",
            width: cardWidth
          }}
        >
          <RoundedIcon
            icon="ios-musical-notes-outline"
            size={height / 19}
            iconSize={height / 32}
          />
          <View style={{ width: cardWidth, flex: 1 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {item.name}
            </Text>
            {item.artists[0] && (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.description}
              >
                {item.artists[0]}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  renderMomentButton = () => {
    return (
      <View
        style={{
          paddingHorizontal: (width - cardWidth) * 0.5,
          paddingTop: height / 17,
          width: width
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigate("AddChildMemory");
          }}
          style={{
            shadowColor: "black",
            shadowOffset: {
              width: 0,
              height: 0
            },
            shadowRadius: 15,
            shadowOpacity: 0.2,
            height: height / 4,

            elevation: 7,
            borderRadius: 8,
            marginBottom: 40,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: "grey",
              fontFamily: Config.MAIN_FONT
            }}
          >
            Add a moment
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderImagesGrid = () => {
    return (
      <View
        style={{
          width: cardWidth,

          flexDirection: "row",
          justifyContent:
            this.props.images.length === 2 ? "flex-start" : "space-between",
          marginTop: height / 17
        }}
      >
        {this.props.images.map((image, index) => {
          if (index < 2 || (index === 2 && this.props.images.length === 3)) {
            return (
              <TouchableOpacity
                onPress={() => {
                  this.currentImageIndex = 0;
                  this.setState({ showModal: true });
                }}
              >
                <ImageProgressWithFastImage
                  onLoadEnd={() => {}}
                  indicator={Progress}
                  key={image.filename}
                  style={{
                    width: cardWidth / 3.1,
                    height: cardWidth / 3.1,
                    marginRight:
                      index === 0 && this.props.images.length === 2
                        ? (cardWidth - 3 * (cardWidth / 3.1)) / 2
                        : 0
                  }}
                  source={{
                    ...image,
                    priority: FastImage.priority.normal
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          } else if (index === 2) {
            return (
              <View key={image.filename}>
                <FastImage
                  style={{
                    width: cardWidth / 3.1,
                    height: cardWidth / 3.1
                  }}
                  source={image}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    width: cardWidth / 3.1,
                    height: cardWidth / 3.1,
                    backgroundColor: "grey",
                    opacity: 0.8,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontFamily: Config.MAIN_FONT,
                      fontSize: 30,
                      fontWeight: "400"
                    }}
                  >
                    +{this.props.images.length - 3}
                  </Text>
                </View>
              </View>
            );
          } else {
            return null;
          }
        })}
      </View>
    );
  };

  render() {
    const HEADER_MAX_HEIGHT = this.props.headerImage.imageHeight;
    const HEADER_MIN_HEIGHT = height / 10;
    const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: "clamp"
    });

    const opacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 1, 0],
      extrapolate: "clamp"
    });

    return (
      <View>
        <AfterInteractions placeholder={<View />}>
          <View>
            <SectionList
              removeClippedSubviews={false}
              onScroll={Animated.event([
                { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
              ])}
              scrollEventThrottle={16}
              style={[
                styles.view,
                {
                  height: height - HEADER_MIN_HEIGHT,
                  marginTop: HEADER_MIN_HEIGHT
                }
              ]}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: height / 15,
                paddingTop: HEADER_SCROLL_DISTANCE,
                alignItems: "center"
              }}
              sections={[
                {
                  data: [{ key: "members" }],
                  renderItem: () => this.renderMembers()
                },
                { data: [{ key: "map" }], renderItem: () => this.renderMap() },
                {
                  data: this.props.songs,
                  renderItem: ({ item }) => this.renderSong(item)
                },
                {
                  data: [{ key: "imagesGrid" }],
                  renderItem: ({ item }) => this.renderImagesGrid()
                },
                {
                  data: [{ key: "divider" }],
                  renderItem: () => {
                    if (this.state.childMemories.length > 0) {
                      return (
                        <View
                          style={{
                            width: cardWidth,
                            height: 3,
                            backgroundColor: "#F0F4F4",
                            marginTop: height / 8
                          }}
                        />
                      );
                    } else {
                      return null;
                    }
                  }
                },
                /* {
              data: [{ key: "AddMomentButton" }],
              renderItem: ({ item }) => this.renderMomentButton()
            },*/
                {
                  data: this.state.childMemories,
                  renderItem: param => this.renderMoment(param)
                }
              ]}
            />
            {this.props.images.length > 0 &&
            this.state.showModal && (
              <View>
                <Modal visible={this.state.showModal} transparent={true}>
                  <ImageViewer
                    onChange={index => {
                      this.currentImageIndex = index;
                    }}
                    renderHeader={currentIndex => (
                      <View
                        style={{
                          width,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingTop: height / 25,
                          position: "absolute"
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 15 }}>
                          {currentIndex + 1} of {this.props.images.length}
                        </Text>
                      </View>
                    )}
                    renderIndicator={() => null}
                    saveToLocalByLongPress={false}
                    loadingRender={() => (
                      <Spinner type="Bounce" size={50} color="white" />
                    )}
                    imageUrls={this.props.images}
                  />
                  {this.props.editMode && (
                    <IconButton
                      right
                      onPress={() => {
                        var BUTTONSiOS = ["Delete", "Cancel"];

                        var BUTTONSandroid = ["Delete", "Cancel"];

                        var DESTRUCTIVE_INDEX = 0;
                        var CANCEL_INDEX = 1;

                        ActionSheet.showActionSheetWithOptions(
                          {
                            options:
                              Platform.OS == "ios"
                                ? BUTTONSiOS
                                : BUTTONSandroid,
                            cancelButtonIndex: CANCEL_INDEX,
                            destructiveButtonIndex: DESTRUCTIVE_INDEX,
                            tintColor: "blue"
                          },
                          buttonIndex => {
                            if (buttonIndex === 0) {
                              if (this.props.images.length === 1) {
                                this.setState({ showModal: false });
                              }
                              this.props.deleteImage(this.currentImageIndex);
                            }
                          }
                        );
                      }}
                      icon="md-more"
                      color="white"
                      size={30}
                    />
                  )}
                  <IconButton
                    left
                    icon="ios-arrow-back-outline"
                    size={30}
                    onPress={() => this.setState({ showModal: false })}
                  />
                </Modal>
              </View>
            )}
          </View>
        </AfterInteractions>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            overflow: "hidden",
            zIndex: 1
          }}
        >
          <FastImage
            style={{ width: width, height: this.props.headerImage.imageHeight }}
            resizeMode="cover"
            defaultSource={require("../../assets/placeholder.png")}
            source={{
              ...this.props.headerImage,
              priority: FastImage.priority.high
            }}
          />

          <View
            style={{
              width: width,
              height: this.props.headerImage.imageHeight,
              position: "absolute",
              backgroundColor: "black",
              opacity: 0.2
            }}
          />
          <Animated.View
            style={{
              top: Animated.divide(headerHeight, new Animated.Value(2)),
              opacity,
              right: width / 20,
              left: width / 20,

              position: "absolute"
            }}
          >
            <TextInput
              editable={this.props.editMode}
              style={[styles.title]}
              multiline={true}
              numberOfLines={2}
              onChangeText={title => this.props.onChangeTitle(title)}
              value={this.props.title}
              maxLength={Config.MAX_CHARACTER_TITLE}
            />
            <Text
              style={{
                color: "white",
                position: "absolute",
                textAlign: "center",
                bottom: 0,
                right: 0,
                left: 0,
                backgroundColor: "transparent",
                fontSize: 15
              }}
            >
              {this.props.date}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
}
