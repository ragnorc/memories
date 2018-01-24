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
  TouchableWithoutFeedback,
  Platform,
  AsyncStorage
} from "react-native";
import Spinner from "react-native-spinkit";
import Carousel from "react-native-snap-carousel";
import Button from "../../components/Button";
import Swiper from "react-native-swiper";
import * as Config from "../../config";
import { goBack } from "../../lib/navigation";
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
import Header from "../../components/Header";
const ImageProgressWithFastImage = createImageProgress(FastImage);
const cardWidth = width * 0.9;

import ImageProgress from "react-native-image-progress";
export default class ProfileComponent extends Component {
  constructor(props) {
    super(props);

    StatusBar.setBarStyle("light-content", "fade");
    this.state = { images: [] };
    this.itemWidth = width * 0.8;
  }
  state: {};

  renderItem = ({ item, index }) => {
    let imagesArray = [];
    item.images.map(image => {
      let uri =
        "https://memories.imgix.net/" +
        image.secret +
        "?w=" +
        PixelRatio.getPixelSizeForLayoutSize(width) +
        "&auto=compress";
      imagesArray.push({
        uri,
        url: uri,
        id: image.id
      });
    });
    let startDate = moment(item.startedAt);
    let endDate = moment(item.endedAt);
    let duration = moment.duration(endDate.diff(startDate));
    let date;
    if (duration.asDays() == 0) {
      date = startDate.format("D MMM, YYYY");
    } else {
      date =
        startDate.format("D MMM, YYYY") + " - " + endDate.format("D MMM, YYYY");
    }
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (this.props.editable) {
            navigate("EditMemory", false, {
              memory: {
                ...item,
                imageHeight: height / 2.5,
                images: imagesArray,
                date
              }
            });
          } else {
            navigate("ViewMemory", false, {
              memory: {
                ...item,
                imageHeight: height / 2.5,
                images: imagesArray,
                date
              }
            });
          }
        }}
      >
        <View
          style={{
            alignItems: "center",
            shadowColor: "black",
            shadowOffset: {
              width: 0,
              height: 10
            },
            shadowRadius: 15,
            shadowOpacity: 0.6,
            borderRadius: 11,
            backgroundColor: "transparent",
            paddingVertical: height / 23
          }}
        >
          <FastImage
            style={{
              height: height / 3,
              borderRadius: 11,
              width: this.itemWidth,
              justifyContent: "center",
              alignItems: "center"
            }}
            resizeMode="cover"
            defaultSource={require("../../assets/placeholder.png")}
            source={{
              uri:
                "https://memories.imgix.net/" +
                item.headerImage.secret +
                "?h=" +
                PixelRatio.getPixelSizeForLayoutSize(height / 3) +
                "?w=" +
                PixelRatio.getPixelSizeForLayoutSize(this.itemWidth) +
                "&auto=compress"
            }}
          >
            <View
              style={{
                backgroundColor: "black",
                opacity: 0.3,
                height: height / 3,
                borderRadius: 11,
                width: this.itemWidth
              }}
            />
            <Text
              style={{
                position: "absolute",
                color: "white",
                marginHorizontal: this.itemWidth / 20,
                backgroundColor: "transparent",
                fontSize: 20,
                fontWeight: "500"
              }}
            >
              {item.title}
            </Text>
          </FastImage>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  renderDate = ({ item, index }) => {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: width * 0.5,

          height: height / 13
        }}
      >
        <Text style={{ fontSize: 15, color: "grey", fontWeight: "500" }}>
          {item.date}
        </Text>
      </View>
    );
  };

  render() {
    let memories = [];
    if (this.props.memories) {
      memories = this.props.memories.slice();

      memories.map((memory, index) => {
        let endDate = moment(memory.endedAt);
        let dateID = "" + endDate.month() + endDate.year();
        memories[index] = {
          ...memory,
          dateID
        };
      });
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          backgroundColor: "white"
        }}
      >
        <Header />

        <View style={{ flex: 1, alignItems: "center", width }}>
          {this.props.profileImage && (
            <View
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
            >
              <FastImage
                style={{
                  height: height / 8,
                  borderRadius: height * 0.5 / 8,
                  width: height / 8
                }}
                resizeMode="cover"
                defaultSource={require("../../assets/placeholder.png")}
                source={{
                  uri:
                    "https://memories.imgix.net/" +
                    this.props.profileImage.secret +
                    "?h=" +
                    PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                    "?w=" +
                    PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                    "&auto=compress&fit=facearea&facepad=5"
                }}
              />
            </View>
          )}
          <View
            style={{
              position: "absolute",
              top: height / 11,
              alignItems: "center",
              left: 0,
              width: 0.5 * (width - height / 8),
              height: height / 8,
              justifyContent: "center"
            }}
          >
            {this.props._followingMeta && (
              <Text
                style={{
                  backgroundColor: "transparent",

                  color: "white",
                  fontFamily: Config.MAIN_FONT,
                  fontSize: 15,
                  fontWeight: "500"
                }}
              >
                {this.props._followingMeta.count}
              </Text>
            )}
            <Text
              style={{
                backgroundColor: "transparent",

                color: "grey",
                fontFamily: Config.MAIN_FONT,
                fontSize: 15,
                fontWeight: "500"
              }}
            >
              Following
            </Text>
          </View>
          <View
            style={{
              position: "absolute",
              top: height / 11,
              alignItems: "center",
              right: 0,
              width: 0.5 * (width - height / 8),
              height: height / 8,
              justifyContent: "center"
            }}
          >
            {this.props._followersMeta && (
              <Text
                style={{
                  backgroundColor: "transparent",

                  color: "white",
                  fontFamily: Config.MAIN_FONT,
                  fontSize: 15,
                  fontWeight: "500"
                }}
              >
                {this.props._followersMeta.count}
              </Text>
            )}
            <Text
              style={{
                backgroundColor: "transparent",

                color: "grey",
                fontFamily: Config.MAIN_FONT,
                fontSize: 15,
                fontWeight: "500"
              }}
            >
              Followers
            </Text>
          </View>
          <Text
            style={{
              textAlign: "center",
              position: "absolute",
              top: height / 4,
              backgroundColor: "transparent",
              width: width,
              color: "white",
              fontFamily: Config.MAIN_FONT,
              fontSize: 17,
              fontWeight: "400"
            }}
          >
            {this.props.fullName}
          </Text>
          <View
            style={{
              top: height / 5,
              shadowColor: "black",
              shadowOffset: {
                width: 0,
                height: 0
              },
              shadowRadius: 17,
              shadowOpacity: 0.5,
              backgroundColor: "transparent"
            }}
          >
            {!this.props.editable && (
              <Button
                backColor={Config.SECOND_COLOR}
                color="white"
                version="roundFilled"
                onPress={
                  this.props.following ? (
                    this.props.onUnFollow
                  ) : (
                    this.props.onFollow
                  )
                }
                text={this.props.following ? "Following" : "Follow"}
              />
            )}
          </View>
        </View>
        <AfterInteractions placeholder={<View />}>
          {memories.length > 0 ? (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                alignItems: "center"
              }}
            >
              <View
                style={{
                  height: height / 13,
                  width: width * 0.7,
                  shadowColor: "black",
                  shadowOffset: {
                    width: 0,
                    height: 0
                  },
                  shadowRadius: 15,
                  shadowOpacity: 0.3,
                  borderRadius: height / 13 * 0.5,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Carousel
                  data={this.props.dates}
                  ref={c => {
                    this.monthCarousel = c;
                  }}
                  renderItem={this.renderDate}
                  sliderWidth={width * 0.7}
                  itemWidth={width * 0.5}
                  onSnapToItem={index => {
                    if (
                      this.props.dates[index].dateID !==
                      memories[this.memoriesCarousel.currentIndex].dateID
                    ) {
                      this.memoriesCarousel.snapToItem(
                        this.props.dates[index].firstItemOfMonth
                      );
                    }
                  }}
                />
              </View>
              <Carousel
                ref={c => {
                  this.memoriesCarousel = c;
                }}
                data={[...memories]}
                renderItem={this.renderItem}
                sliderWidth={width - 10}
                itemWidth={this.itemWidth}
                onSnapToItem={index => {
                  // let endDate = moment(this.props.memories[index].endedAt);
                  //  Alert.alert("hi" + (endDate.month() + endDate.year()));

                  if (
                    memories[index].dateID !==
                    this.props.dates[this.monthCarousel.currentIndex].dateID
                  ) {
                    let snapToIndex = this.props.dates.findIndex(
                      obj => obj.dateID === "" + memories[index].dateID
                    );

                    this.monthCarousel.snapToItem(snapToIndex);
                  }
                }}
              />
            </View>
          ) : this.props.networkStatus === 7 && memories.length < 1 ? (
            <View
              style={{
                alignItems: "center",
                bottom: height / 7
              }}
            >
              <Icon
                size={height / 5}
                style={{
                  backgroundColor: "transparent"
                }}
                color="#e0dede"
                name="ios-albums"
              />
              <Text style={{ color: "grey" }}>Uuuh...it's empty in here.</Text>
              <Text style={{ color: "grey" }}>No memories added yet.</Text>
            </View>
          ) : (
            <View style={{ position: "absolute", bottom: height / 4 }}>
              <Spinner type="Bounce" size={50} color={Config.MAIN_COLOR} />
            </View>
          )}
        </AfterInteractions>
        {this.props.editable ? (
          <IconButton
            right
            icon="md-more"
            size={30}
            onPress={() => {
              var BUTTONSiOS = ["Edit", "Log out", "Cancel"];

              var BUTTONSandroid = ["Edit", "Log out", "Cancel"];

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
                    navigate("Settings");
                  } else if (buttonIndex === 1) {
                    AsyncStorage.setItem("auth0token", "").then(() =>
                      navigate("Onboarding", true)
                    );
                  }
                }
              );
            }}
          />
        ) : (
          <IconButton
            left
            icon="ios-arrow-back-outline"
            size={30}
            onPress={() => goBack()}
          />
        )}
      </View>
    );
  }
}
