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
import ProfileComponent from "../../components/Profile";
import { graphql, compose } from "react-apollo";
import OneSignal from "react-native-onesignal";
import * as Config from "../../config";

import {
  MEMORY_SUBMIT_MUTATION,
  PROFILE_MEMORIES_QUERY,
  PROFILE_QUERY,
  USER_QUERY,
  FEED_QUERY,
  FOLLOW_MUTATION,
  UNFOLLOW_MUTATION,
  FOLLOW_NOTIFICATION_MUTATION
} from "../../lib/queries";

import ActionButton from "react-native-action-button";
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from "react-redux";
const moment = require("moment");
import styles from "./styles";
import IconButton from "../../components/IconButton";

const { width, height } = Dimensions.get("window");

export class Profile extends Component {
  static navigationOptions = {
    gesturesEnabled: true
  };
  constructor(props) {
    super(props);
    StatusBar.setBarStyle("light-content", "fade");
    // this.profile = this.props.navigation.state.params.profile;
    this.state = {
      following: false
    };
  }

  render() {
    let datesArray = [];
    if (
      this.props.ProfileMemoriesQuery.memories &&
      this.props.ProfileMemoriesQuery.memories.length > 0
    ) {
      this.props.ProfileMemoriesQuery.memories.map((memory, index) => {
        let endDate = moment(memory.endedAt);

        if (index > 0) {
          let currentEndDate = moment(
            this.props.ProfileMemoriesQuery.memories[index - 1].endedAt
          );
          if (
            endDate.month() === currentEndDate.month() &&
            endDate.year() === currentEndDate.year()
          ) {
          } else {
            datesArray.push({
              date: endDate.format("MMMM YYYY"),
              firstItemOfMonth: index,
              dateID: "" + endDate.month() + endDate.year()
            });
          }
        } else {
          datesArray.push({
            date: endDate.format("MMMM YYYY"),
            firstItemOfMonth: 0,
            dateID: "" + endDate.month() + endDate.year()
          });
        }
      });
    }

    let following = false;
    if (
      this.props.ProfileQuery.User &&
      this.props.ProfileQuery.User.followers.filter(
        obj => obj.id === this.props.userID
      ).length > 0
    ) {
      following = true;
    }

    return (
      <View style={{ flex: 1 }}>
        <ProfileComponent
          {...this.props.ProfileQuery.User}
          onChangeMonth={this.onChangeMonth}
          following={following}
          networkStatus={this.props.ProfileMemoriesQuery.networkStatus}
          memories={this.props.ProfileMemoriesQuery.memories}
          onFollow={() => {
            this.props
              .follow({
                variables: {
                  profileUserID: this.props.navigation.state.params.id,
                  userID: this.props.userID
                }
              })
              .then(() => {
                this.props.ProfileQuery.refetch();
                this.props.followNotification().then(() => {
                  if (
                    this.props.ProfileQuery.User &&
                    this.props.ProfileQuery.User.oneSignalID
                  ) {
                    let data = {}; // some array as payload
                    let contents = {
                      en: this.props.fullName + " is now following you."
                    };
                    OneSignal.postNotification(
                      contents,
                      data,
                      this.props.ProfileQuery.User.oneSignalID,
                      { ios_badgeType: "Increase", ios_badgeCount: 1 }
                    );
                  }
                });
              });
          }}
          onUnFollow={() => {
            this.props
              .unfollow({
                variables: {
                  profileUserID: this.props.navigation.state.params.id,
                  userID: this.props.userID
                }
              })
              .then(() => {
                this.props.ProfileQuery.refetch();
              });
          }}
          dates={datesArray}
          editable={
            (this.props.navigation.state.params &&
              this.props.navigation.state.params.editable) ||
            !this.props.navigation.state.params ? (
              true
            ) : (
              false
            )
          }
        />
      </View>
    );
  }
}
var mapStateToProps = function(state) {
  return {
    userID: state.profile.id,
    fullName: state.profile.fullName
  };
};

export default compose(
  connect(mapStateToProps),
  graphql(PROFILE_QUERY, {
    name: "ProfileQuery",
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        profileUserID: props.navigation.state.params
          ? props.navigation.state.params.id
          : props.userID
      }
    })
  }),
  graphql(PROFILE_MEMORIES_QUERY, {
    name: "ProfileMemoriesQuery",
    options: props => ({
      fetchPolicy: "network-only",
      variables: {
        profileUserID: props.navigation.state.params
          ? props.navigation.state.params.id
          : props.userID,
        userID: props.userID
      }
    })
  }),
  graphql(FOLLOW_MUTATION, {
    name: "follow",
    options: props => ({
      variables: {
        profileUserID: props.navigation.state.params
          ? props.navigation.state.params.id
          : props.userID,
        userID: props.userID
      }
    })
  }),
  graphql(UNFOLLOW_MUTATION, {
    name: "unfollow",
    options: props => ({
      variables: {
        profileUserID: props.navigation.state.params
          ? props.navigation.state.params.id
          : props.userID,
        userID: props.userID
      }
    })
  }),
  graphql(FOLLOW_NOTIFICATION_MUTATION, {
    name: "followNotification",
    options: props => ({
      variables: {
        profileUserID: props.navigation.state.params
          ? props.navigation.state.params.id
          : props.userID,
        userID: props.userID
      }
    })
  })
)(Profile);
