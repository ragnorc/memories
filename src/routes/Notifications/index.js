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
  LayoutAnimation,
  Animated,
  FlatList,
  PixelRatio
} from "react-native";
import Header from "../../components/Header";
import RoundedIcon from "../../components/RoundedIcon";
import ExplodingHearts from "../../components/ExplodingHearts";
import * as Config from "../../config";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import * as Animatable from "react-native-animatable";
import { graphql, compose } from "react-apollo";

import { navigate } from "../../lib/navigation";
import {
  USER_QUERY,
  NOTIFICATIONS_SUBSCRIPTION_QUERY
} from "../../lib/queries";
const { width, height } = Dimensions.get("window");

export class Notifications extends Component {
  constructor(props) {
    super(props);
    StatusBar.setBarStyle("light-content", "fade");
    // this.profile = this.props.navigation.state.params.profile;
    this.state = {
      isRefreshing: false
    };
  }
  componentDidMount() {
    this.subscription = this.props.data.subscribeToMore({
      document: NOTIFICATIONS_SUBSCRIPTION_QUERY,
      variables: { userID: this.props.userID },
      updateQuery: (previousState, { subscriptionData }) => {
        const newNotification = subscriptionData.data.Notification.node;
        return {
          user: {
            ...previousState.user,
            notifications: [
              { ...newNotification },
              ...previousState.user.notifications
            ]
          }
        };
      },
      onError: err => console.error(err)
    });
  }

  onRefresh = () => {
    this.setState({ isRefreshing: true });
    this.props.data.refetch().then(() => {
      setTimeout(() => {
        this.setState({ isRefreshing: false });
      }, 1000);
    });
  };

  renderItem = ({ item }) => {
    //Alert.alert(item.type);
    return (
      <View
        style={{
          marginTop: height / 35,
          width: width * 0.8,
          height: height / 10,
          borderRadius: 11,
          backgroundColor: "white",
          shadowColor: "black",
          shadowOpacity: 0.5,
          shadowOffset: { height: 0, width: 0 },
          shadowRadius: 15
        }}
      >
        {item.followedBy.profileImage &&
        item.type === "FOLLOW" && (
          <TouchableWithoutFeedback
            onPress={() => {
              navigate("ViewProfile", false, {
                id: item.followedBy.id,
                editable: false
              });
            }}
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                width: width * 0.8,
                height: height / 10
              }}
            >
              <Image
                style={{
                  height: height / 21,
                  borderRadius: height * 0.5 / 21,
                  width: height / 21,
                  marginLeft: width / 15
                }}
                resizeMode="cover"
                defaultSource={require("../../assets/placeholder.png")}
                source={{
                  uri:
                    "https://memories.imgix.net/" +
                    item.followedBy.profileImage.secret +
                    "?h=" +
                    PixelRatio.getPixelSizeForLayoutSize(height / 21) +
                    "?w=" +
                    PixelRatio.getPixelSizeForLayoutSize(height / 21) +
                    "&auto=compress&fit=facearea&facepad=5"
                }}
              />

              <Text
                style={{ width: width * 0.5, marginLeft: width / 18 }}
                numberOfLines={2}
              >
                {item.followedBy.fullName} is now following you.
              </Text>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
        <Header />
        <Text
          style={{
            color: "white",
            fontSize: 16,
            backgroundColor: "transparent",
            marginTop: height / 20,
            fontWeight: "600"
          }}
        >
          Notifications
        </Text>
        {this.props.data.user &&
        this.props.data.user.notifications.length > 0 ? (
          <FlatList
            style={{ width, marginTop: height / 15 }}
            contentContainerStyle={{ alignItems: "center" }}
            renderItem={this.renderItem}
            data={this.props.data.user.notifications}
            refreshControl={
              <RefreshControl
                onRefresh={() => this.onRefresh()}
                refreshing={this.state.isRefreshing}
                tintColor="white"
              />
            }
          />
        ) : (
          this.props.data.networkStatus === 7 && (
            <View style={{ alignItems: "center" }}>
              <Icon
                size={height / 5}
                style={{
                  backgroundColor: "transparent",
                  marginTop: height / 2
                }}
                color="#e0dede"
                name="md-notifications"
              />
              <Text style={{ color: "grey" }}>
                You don't have any notifications yet.
              </Text>
            </View>
          )
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

export default connect(mapStateToProps)(graphql(USER_QUERY)(Notifications));
