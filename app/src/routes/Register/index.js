import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  ScrollView,
  AsyncStorage,
  TouchableOpacity,
  Keyboard,
  TouchableHighlight
} from "react-native";
import Spinner from "react-native-spinkit";
import * as Config from "../../config";
import { signUpWithEmail, signInWithFacebook } from "../../lib/authentication";
import { navigate } from "../../lib/navigation";
import Button from "../../components/Button";
import Header from "../../components/Header";
import * as Animatable from "react-native-animatable";
import TextField from "react-native-md-textinput";
import { stringIsEmpty } from "../../lib/functions";
const { width, height } = Dimensions.get("window");

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.initialRegisterButtonText = "Create account";
    this.state = {
      password: "",
      email: "",
      error: "",
      registerButtonText: this.initialRegisterButtonText,
      loadingFacebook: false
    };
    AsyncStorage.setItem("tasks", "");
  }

  handleFBLogin = () => {
    this.setState({ loadingFacebook: true });
    Keyboard.dismiss();
    signInWithFacebook()
      .then(() => navigate("Initialize", true))
      .catch(() =>
        this.setState({
          loadingFacebook: false,
          error: "An unknown error occurred"
        })
      );
  };

  handleRegistration = () => {
    Keyboard.dismiss();
    if (stringIsEmpty(this.state.email) || stringIsEmpty(this.state.password)) {
      this.setState({ error: "Please fill in all fields" });
    } else {
      this.setState({ registerButtonText: "loading..." });

      signUpWithEmail(this.state.email, this.state.password).catch(error => {
        if (error == "user_exists") {
          this.setState({
            error: "The user already exists.",
            registerButtonText: this.initialRegisterButtonText
          });
        } else {
          this.setState({
            error: "Invalid email address",
            registerButtonText: this.initialRegisterButtonText
          });
        }
      });
    }
  };

  render() {
    return (
      <View style={styles.view}>
        <ScrollView
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <View>
            <Image
              resizeMode="cover"
              source={require("../../assets/header.jpg")}
              style={styles.header}
            />

            <View style={styles.rectangle}>
              <Image
                style={{
                  width: height / 12,
                  height: height / 12,
                  marginTop: height / 25
                }}
                source={require("../../assets/logo.png")}
              />
              <View style={styles.inputView}>
                <TextField
                  inputStyle={{
                    fontSize: 16,
                    height: 33,
                    lineHeight: 34,
                    paddingBottom: 3
                  }}
                  ref={TextField => {
                    this.emailInput = TextField;
                  }}
                  onChangeText={email =>
                    this.setState({ email: email.replace(/\s/g, "") })}
                  value={this.state.email}
                  label={"Email"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    this.passwordInput.focus();
                  }}
                  highlightColor={Config.MAIN_COLOR}
                />
                <TextField
                  inputStyle={{
                    fontSize: 16,
                    height: 33,
                    lineHeight: 34,
                    paddingBottom: 3
                  }}
                  ref={TextField => {
                    this.passwordInput = TextField;
                  }}
                  onChangeText={password =>
                    this.setState({ password: password.replace(/\s/g, "") })}
                  value={this.state.password}
                  label={"Password"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  highlightColor={Config.MAIN_COLOR}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    this.handleRegistration();
                  }}
                />
                <Text style={{ textAlign: "center" }}>{this.state.error}</Text>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                onPress={() => this.handleFBLogin()}
                style={{
                  width: width / 1.5,
                  height: height / 14,
                  borderRadius: 50,
                  backgroundColor: "#3B5998",
                  marginTop: height / 10,
                  marginBottom: height / 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <View
                  style={{
                    height: height / 14,
                    position: "absolute",
                    left: width / 35,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Image
                    style={{
                      width: height / 30,
                      height: height / 30
                    }}
                    source={require("../../assets/fb.png")}
                  />
                </View>
                {this.state.loadingFacebook ? (
                  <Spinner type="Bounce" size={30} color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Login with Facebook
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableHighlight
                onPress={() => navigate("Login")}
                underlayColor="transparent"
                style={{
                  marginBottom: height / 40
                }}
              >
                <Text>Already have an account?</Text>
              </TouchableHighlight>
            </View>

            <View style={styles.logoView} />
          </View>
        </ScrollView>
        <View
          style={[
            styles.buttonWrapper,
            {
              top: height / 1.9
            }
          ]}
        >
          <Button
            backColor={Config.SECOND_COLOR}
            color="white"
            version="roundFilled"
            text={this.state.registerButtonText}
            onPress={() => this.handleRegistration()}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "white"
  },

  // Header styles
  headerText: {
    color: "white",
    fontFamily: "Avenir",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 40,
    textAlign: "center"
  },
  // Text below header
  text: {
    color: "#FFFFFF",
    fontFamily: "Avenir",
    fontSize: 18,
    marginHorizontal: 40,
    marginTop: 20,
    textAlign: "center"
  },
  inputView: {
    marginTop: 0,
    marginHorizontal: 40,

    width: width - width * 2 / 9 - 80
  },

  buttonWrapper: {
    backgroundColor: "transparent",
    flexDirection: "column",
    position: "absolute",
    left: 0,
    right: 0,
    elevation: 5,
    alignItems: "center",
    shadowColor: Config.SECOND_COLOR,
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowRadius: 10,
    shadowOpacity: 0.5
  },

  header: {
    width: width,
    height: height / 1.4
  },

  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: width,
    borderTopWidth: width,
    borderRightColor: "transparent",
    borderTopColor: Config.MAIN_COLOR
  },
  logoView: {
    position: "absolute",
    right: 0,
    left: 0,
    top: height / 18,
    alignItems: "center"
  },

  rectangle: {
    position: "absolute",
    borderRadius: 9,
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 10,
    shadowOpacity: 0.3,
    elevation: 10,
    left: width / 9,
    right: width / 9,
    top: height / 13,
    //bottom: height / 8,

    flex: 1,
    backgroundColor: "white"
  },
  divider: {
    marginTop: height / 6,
    width: width / 2,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#F0F4F4"
    //marginHorizontal: 0.5*(width - width/2),
  }
});
