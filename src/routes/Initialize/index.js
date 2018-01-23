import React, { Component } from "react";
import {
  StatusBar,
  Dimensions,
  View,
  StyleSheet,
  Image,
  Alert,
  AsyncStorage,
  NetInfo
} from "react-native";
import { setNavigator } from "../../lib/navigation";
import * as Config from "../../config";
import { connect } from "react-redux";
import { setUploading } from "../../redux/ducks/others";

import { gql, graphql, withApollo } from "react-apollo";
const { width, height } = Dimensions.get("window");
import { navigate } from "../../lib/navigation";
import {
  USER_QUERY,
  ADD_ONE_SIGNAL_ID_MUTATION,
  FEED_QUERY,
  PROFILE_MEMORIES_QUERY
} from "../../lib/queries";
import { Crashlytics } from "react-native-fabric";
import SplashScreen from "react-native-splash-screen";
import { addUser } from "../../redux/ducks/profile";
import OneSignal from "react-native-onesignal";
import { client } from "../../";
export class Initialize extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    OneSignal.removeEventListener("ids", this.onIds);
  }

  onIds(device) {
    client
      .query({
        query: USER_QUERY,
        fetchPolicy: "network-only"
      })
      .then(res => {
        client.mutate({
          mutation: ADD_ONE_SIGNAL_ID_MUTATION,
          variables: {
            userID: res.data.user.id,
            oneSignalID: device.userId
          }
        });
      });
  }

  componentDidMount() {
    setNavigator(this.props.navigation);
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        AsyncStorage.getItem("auth0token")
          .then(res => {
            if (res) {
              //   AsyncStorage.setItem("auth0token", "");
              client
                .query({
                  query: USER_QUERY,
                  fetchPolicy: "network-only"
                })
                .then(res => {
                  if (res.data.user) {
                    this.props.dispatch(addUser({ ...res.data.user }));
                    Crashlytics.setUserName(res.data.fullName);
                    OneSignal.sendTag("userID", res.data.user.id);
                    OneSignal.addEventListener("ids", this.onIds);
                    navigate("Main", true);
                    SplashScreen.hide();
                  } else {
                    navigate("Login", true);
                    SplashScreen.hide();
                  }
                })
                .catch(error => {
                  // Alert.alert("error" + error);
                  // this.props.navigation.navigate("Offline", true);
                  SplashScreen.hide();
                });

              // navigate('Main',true);
            } else {
              navigate("Onboarding", true);
              SplashScreen.hide();
            }
          })
          .catch(() => {
            navigate("Onboarding", true);
            SplashScreen.hide();
          });
      } else {
        navigate("Offline", true);
      }
    });
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white"
        }}
      >
        <Image
          style={{
            width: 130,
            height: 130
          }}
          source={require("../../assets/logo.png")}
        />
      </View>
    );
  }
}

export default connect()(withApollo(Initialize));
