/**
 * @flow
 */

import React, { Component } from "react";
import {
  AppRegistry,
  Image,
  View,
  Alert,
  AsyncStorage,
  NetInfo,
  Modal,
  Dimensions,
  Text
} from "react-native";
import OneSignal from "react-native-onesignal";
import { TabNavigator, StackNavigator, TabBarBottom } from "react-navigation";
import codePush from "react-native-code-push";
import { BlurView, VibrancyView } from "react-native-blur";
import ActionButton from "react-native-circular-action-menu";
import Login from "./routes/Login";
import Onboarding from "./routes/Onboarding";
import Home from "./routes/Home";
import Add from "./routes/Add";
import Discover from "./routes/Discover";
import Profile from "./routes/Profile";
import Settings from "./routes/Settings";
import Register from "./routes/Register";
import CreateProfile from "./routes/Register/CreateProfile";
import Notifications from "./routes/Notifications";
import SecondStep from "./routes/Add/SecondStep";
import ThirdStep from "./routes/Add/ThirdStep";
import FinishMemory from "./routes/FinishMemory";
import ViewMemory from "./routes/Memory/ViewMemory";
import EditMemory from "./routes/Memory/EditMemory";
import EditPrivacy from "./routes/Add/EditPrivacy";
import Offline from "./routes/Offline";
import Icon from "react-native-vector-icons/Ionicons";

import ChooseSong from "./routes/FinishMemory/ChooseSong";
import AddChildMemory from "./routes/FinishMemory/AddChildMemory";
import ChooseFollowers from "./routes/Add/EditPrivacy/ChooseFollowers";
import ChooseCollaborators from "./routes/FinishMemory/ChooseCollaborators";
import ExcludePeople from "./routes/Add/EditPrivacy/ExcludePeople";
import Initialize from "./routes/Initialize";
import * as Config from "./config";
import { Provider } from "react-redux";
import configureStore from "./redux/configureStore";
import { memoryUploadTask } from "./redux/ducks/others";
import { FEED_QUERY, USER_QUERY, NOTIFICATIONS_QUERY } from "./lib/queries";
import { navigate } from "./lib/navigation";

import ApolloClient, { createNetworkInterface } from "apollo-client";

import {
  SubscriptionClient,
  addGraphQLSubscriptions
} from "subscriptions-transport-ws";
import { ApolloProvider } from "react-apollo";
const { width, height } = Dimensions.get("window");
const store = configureStore();

const wsClient = new SubscriptionClient(Config.GRAPHCOOL.subEndpoint, {
  reconnect: true,
  connectionParams: {
    // Pass any arguments you want for initialization
  }
});

const networkInterface = createNetworkInterface({
  uri: Config.GRAPHCOOL.simpleEndpoint
});

networkInterface.use([
  {
    applyMiddleware(req, next) {
      if (!req.options.headers) {
        req.options.headers = {};
      }
      AsyncStorage.getItem("auth0token")
        .then(res => {
          req.options.headers.authorization = `Bearer ${res}`;

          next();
        })
        .catch(() => Alert.alert("Error"));
    }
  }
]);
networkInterface.useAfter([
  {
    applyAfterware({ response }, next) {
      if (response.status === 401) {
        Alert.alert("Error");
        navigate("Login", true);
      }
      next();
    }
  }
]);

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

export const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions
});

class Placeholder extends React.Component {
  render() {
    return <View />;
  }
}
const TabScreenNavigator = TabNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        tabBarIcon: ({ tintColor, focused }) => (
          <View>
            {focused ? (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/home_active.png")}
              />
            ) : (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/home.png")}
              />
            )}
          </View>
        )
      }
    },
    Discover: {
      screen: Discover,
      navigationOptions: {
        tabBarIcon: ({ tintColor, focused }) => (
          <View>
            {focused ? (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/discover_active.png")}
              />
            ) : (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/discover.png")}
              />
            )}
          </View>
        )
      }
    },
    Placeholder: {
      screen: Placeholder,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <ActionButton
            backdrop={
              <BlurView
                style={{
                  position: "absolute",
                  top: -height,
                  left: -width / 2,
                  bottom: -100,
                  height: height,
                  width: width * 2
                }}
                blurType="light"
                blurAmount={10}
              />
            }
            startDegree={270} // 240 for 2 items
            endDegree={300}
            size={60}
            radius={150}
            buttonColor={Config.SECOND_COLOR}
          >
            <ActionButton.Item
              size={50}
              buttonColor={Config.MAIN_COLOR}
              onPress={() => navigate("Add")}
              title="Memory"
            >
              <Icon size={35} color="white" name="ios-archive-outline" />
            </ActionButton.Item>
          </ActionButton>
        ),
        tabBarVisible: false
      }
    },
    Notifications: {
      screen: Notifications,
      navigationOptions: {
        tabBarIcon: ({ tintColor, focused }) => (
          <View>
            {focused ? (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/notifications_active.png")}
              />
            ) : (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/notifications.png")}
              />
            )}
          </View>
        )
      }
    },
    Profile: {
      screen: Profile,
      navigationOptions: {
        tabBarIcon: ({ tintColor, focused }) => (
          <View>
            {focused ? (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/profile_active.png")}
              />
            ) : (
              <Image
                style={{ width: 27, height: 27 }}
                source={require("./assets/profile.png")}
              />
            )}
          </View>
        )
      }
    }
  },
  {
    tabBarComponent: ({ jumpToIndex, ...props }) => (
      <TabBarBottom
        {...props}
        jumpToIndex={index => {
          if (index === 2) {
            navigate("Add");
          } else if (index === 0) {
            jumpToIndex(index);
            client
              .query({
                query: USER_QUERY
              })
              .then(res => {
                client.query({
                  query: FEED_QUERY,
                  variables: { userID: res.data.user.id },
                  fetchPolicy: "network-only"
                });
              });
          } else if (index === 3) {
            jumpToIndex(index);
            client.query({
              query: USER_QUERY
            });
          } else {
            jumpToIndex(index);
          }
        }}
      />
    ),

    tabBarPosition: "bottom",
    tabBarOptions: {
      inactiveTintColor: Config.GREY_COLOR,
      activeTintColor: Config.SECOND_COLOR,
      showLabel: false,
      style: {
        backgroundColor: "white"
      }
    }
  }
);

const CardNavigator = StackNavigator(
  {
    MainAdd: { screen: Add },
    AddSecondStep: { screen: SecondStep },
    AddThirdStep: { screen: ThirdStep },

    FinishMemory: { screen: FinishMemory }
  },
  {
    headerMode: "none"
  }
);
const EditPrivacyNavigator = StackNavigator(
  {
    MainEditPrivacy: { screen: EditPrivacy },
    ChooseFollowers: { screen: ChooseFollowers }
  },
  {
    headerMode: "none"
  }
);

const ModalNavigator = StackNavigator(
  {
    Initialize: { screen: Initialize },
    Login: { screen: Login },
    Register: { screen: Register },
    Onboarding: { screen: Onboarding },
    CreateProfile: { screen: CreateProfile },
    Add: { screen: CardNavigator },
    EditPrivacy: { screen: EditPrivacyNavigator },
    ExcludePeople: { screen: ExcludePeople },
    ChooseSong: { screen: ChooseSong },
    ChooseCollaborators: { screen: ChooseCollaborators },
    AddChildMemory: { screen: AddChildMemory },
    ViewMemory: { screen: ViewMemory },
    EditMemory: { screen: EditMemory },
    ViewProfile: { screen: Profile },
    Settings: { screen: Settings },
    Offline: { screen: Offline },
    Main: { screen: TabScreenNavigator }
  },
  {
    headerMode: "none"
  }
);

class App extends Component {
  componentWillMount() {
    NetInfo.isConnected.addEventListener(
      "change",
      this.handleConnectivityChange
    );
  }
  componentDidMount() {
    OneSignal.inFocusDisplaying(2);
    store.dispatch(memoryUploadTask());
  }
  handleConnectivityChange = isConnected => {
    if (isConnected) {
      //NetInfo.removeEventListener("change", this.handleConnectivityChange);
      navigate("Initialize", true);
    } else {
      navigate("Offline", true);
    }
  };
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <ModalNavigator />
        </Provider>
      </ApolloProvider>
    );
  }
}

export default codePush({
  updateDialog: true, //remove in production env
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME
})(App);
