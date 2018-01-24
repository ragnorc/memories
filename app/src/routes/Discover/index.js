/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  ListView,
  Alert,
  TouchableWithoutFeedback,
  PixelRatio,
  Animated,
  FlatList
} from "react-native";
import Header from "../../components/Header";
import RoundedIcon from "../../components/RoundedIcon";
import ExplodingHearts from "../../components/ExplodingHearts";
import * as Config from "../../config";
import { stringIsEmpty } from "../../lib/functions";
import Icon from "react-native-vector-icons/Ionicons";
import TextField from "react-native-md-textinput";
import * as Animatable from "react-native-animatable";
import { connect } from "react-redux";
import { gql, graphql, compose } from "react-apollo";
import { ALL_USERS_QUERY } from "../../lib/queries";
import Carousel from "react-native-snap-carousel";
import { navigate } from "../../lib/navigation";
const { width, height } = Dimensions.get("window");

export class Discover extends Component {
  constructor(props) {
    super(props);
    this.itemWidth = width * 0.6;
    StatusBar.setBarStyle("light-content", "fade");
    this.state = {
      searchString: ""
    };
  }

  renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigate("ViewProfile", false, {
            id: item.key
          });
        }}
      >
        <View
          style={{
            borderRadius: 5,
            marginHorizontal: width / 15,
            flexDirection: "row",
            backgroundColor: "white",
            alignItems: "center",
            shadowColor: "black",
            shadowOffset: {
              width: 5,
              height: 5
            },
            shadowRadius: 10,
            shadowOpacity: 0.3,
            marginVertical: height / 120,
            height: height / 18 + height * 2 / 100
          }}
        >
          {item.profileImage && (
            <Image
              style={{
                height: height / 18,
                borderRadius: height * 0.5 / 18,
                width: height / 18,
                marginHorizontal: width / 20,
                marginVertical: height / 100
              }}
              resizeMode="cover"
              source={{
                uri:
                  "https://memories.imgix.net/" +
                  item.profileImage.secret +
                  "?h=" +
                  PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                  "?w=" +
                  PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                  "&auto=compress&fit=facearea&facepad=5"
              }}
            />
          )}
          <Text>{item.fullName}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  renderCarouselItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigate("ViewProfile", false, {
            id: item.key
          });
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
            shadowOpacity: 0.3,
            borderRadius: 11,
            backgroundColor: "white",
            paddingTop: height / 30,
            width: this.itemWidth,
            height: height / 4,
            marginTop: height / 20
          }}
        >
          <Image
            style={{
              height: height / 10,
              borderRadius: 0.5 * (height / 10),
              width: height / 10,
              justifyContent: "center",
              alignItems: "center"
            }}
            resizeMode="cover"
            defaultSource={require("../../assets/placeholder.png")}
            source={{
              uri:
                "https://memories.imgix.net/" +
                item.profileImage.secret +
                "?h=" +
                PixelRatio.getPixelSizeForLayoutSize(height / 3) +
                "?w=" +
                PixelRatio.getPixelSizeForLayoutSize(this.itemWidth) +
                "&auto=compress&fit=facearea&facepad=5"
            }}
          />
          <Text
            style={{
              marginTop: height / 40,
              fontFamily: Config.MAIN_FONT,
              fontSize: 18
            }}
          >
            {item.fullName}
          </Text>
          <Text
            style={{
              marginTop: height / 70,
              fontFamily: Config.MAIN_FONT,
              fontSize: 16,
              color: Config.GREY_COLOR
            }}
          >
            @{item.userName}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    return (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        <ScrollView
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            alignItems: "center"
          }}
        >
          <Header />
          <View
            style={{
              position: "absolute",
              height,
              width,
              paddingHorizontal: width / 15,
              paddingTop: height / 30
            }}
          >
            <TextField
              inputStyle={{
                fontSize: 16,
                height: 33,
                lineHeight: 34,
                paddingBottom: 3
              }}
              label={"Search"}
              value={this.state.searchString}
              autoCapitalize={"none"}
              autoCorrect={false}
              highlightColor={"white"}
              textColor={"white"}
              labelColor={"white"}
              onChangeText={searchString => {
                this.setState({
                  searchString
                });

                this.props.searchQuery.refetch({ searchString });
              }}
              textFocusColor={"white"}
              borderColor={"white"}
              textBlurColor={"white"}
            />
            <View style={{ height: height / 2.45, paddingTop: height / 30 }}>
              {!stringIsEmpty(this.state.searchString) && (
                <FlatList
                  keyboardShouldPersistTaps="handled"
                  data={this.props.searchQuery.allUsers}
                  renderItem={this.renderItem}
                />
              )}
            </View>
            <Text
              style={{
                marginTop: height / 30,
                backgroundColor: "transparent",
                fontFamily: Config.MAIN_FONT,
                fontWeight: "600"
              }}
            >
              People you might know
            </Text>
            {this.props.allUsersQuery.allUsers && (
              <Carousel
                ref={c => {
                  this.memoriesCarousel = c;
                }}
                data={this.props.allUsersQuery.allUsers}
                renderItem={this.renderCarouselItem}
                sliderWidth={width - 10}
                itemWidth={this.itemWidth}
              />
            )}
          </View>
        </ScrollView>
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
  graphql(ALL_USERS_QUERY, {
    name: "searchQuery",
    options: props => ({
      variables: {
        userID: props.userID,
        searchString: ""
      }
    })
  }),
  graphql(ALL_USERS_QUERY, {
    name: "allUsersQuery",
    options: props => ({
      variables: {
        userID: props.userID
      }
    })
  })
)(Discover);
