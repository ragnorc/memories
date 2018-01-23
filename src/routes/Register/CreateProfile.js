import React, { Component } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  LayoutAnimation,
  AsyncStorage,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import * as Config from "../../config";
import { CREATE_USER_MUTATION, FEED_QUERY } from "../../lib/queries";
import { navigate } from "../../lib/navigation";
import { uploadImage } from "../../lib/fetch";
import { connect } from "react-redux";
import { withApollo } from "react-apollo";
import Button from "../../components/Button";
import * as Animatable from "react-native-animatable";
import TextField from "react-native-md-textinput";
import RNFetchBlob from "react-native-fetch-blob";
import { stringIsEmpty } from "../../lib/functions";

const { width, height } = Dimensions.get("window");

export class createProfile extends Component {
  constructor(props) {
    super(props);

    this.initialRegisterButtonText = "Finish";
    this.state = {
      fullName: props.navigation.state.params.fullName || "",
      userName: "",
      error: "",
      registerButtonText: this.initialRegisterButtonText,
      profileImage: Config.placeholderProfileImage
    };

    if (props.navigation.state.params.profileImage) {
      let profileURI = props.navigation.state.params.profileImage;

      RNFetchBlob.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true
      })
        .fetch("GET", profileURI, {})
        .then(res => {
          this.setState({
            profileImage: { uri: profileURI, path: res.path() }
          });
        });
    }
  }

  handleRegistration = () => {
    if (
      stringIsEmpty(this.state.userName) ||
      stringIsEmpty(this.state.fullName)
    ) {
      this.setState({ error: "Please fill in all fields" });
    } else {
      this.setState({ registerButtonText: "loading..." });

      if (this.state.profileImage.path) {
        uploadImage(this.state.profileImage.path).then(fileID => {
          this.props.client
            .mutate({
              mutation: CREATE_USER_MUTATION,
              variables: {
                userName: this.state.userName,
                fullName: this.state.fullName,
                profileImage: fileID,
                idToken: this.props.navigation.state.params.idToken
              }
            })
            .then(res => {
              Keyboard.dismiss();
              navigate("Initialize", true);
            })
            .catch(error => {
              this.setState({
                registerButtonText: this.initialRegisterButtonText,
                error: "This username is already taken."
              });
            });
        });
      } else {
        this.props.client
          .mutate({
            mutation: CREATE_USER_MUTATION,
            variables: {
              userName: this.state.userName,
              fullName: this.state.fullName,
              profileImage: this.state.profileImage.id,
              idToken: this.props.navigation.state.params.idToken
            }
          })
          .then(() => {
            Keyboard.dismiss();
            navigate("Initialize", true);
          })
          .catch(error => {
            this.setState({
              registerButtonText: this.initialRegisterButtonText,
              error: "This username is already taken."
            });
          });
      }
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
              <TouchableOpacity
                onPress={() => {
                  ImagePicker.openPicker({
                    mediaType: "photo",
                    includeBase64: true,
                    cropping: true,
                    width: 200,
                    height: 200
                  }).then(image => {
                    this.setState({
                      profileImage: { uri: image.path, path: image.path }
                    });
                  });
                }}
              >
                <Image
                  style={{
                    width: 80,
                    height: 80,
                    marginTop: height / 25,
                    borderRadius: 40,
                    borderColor: "grey",
                    borderWidth: 0.5
                  }}
                  source={this.state.profileImage}
                />
              </TouchableOpacity>
              <View style={styles.inputView}>
                <TextField
                  inputStyle={{
                    fontSize: 16,
                    height: 33,
                    lineHeight: 34,
                    paddingBottom: 3
                  }}
                  ref={TextField => {
                    this.userNameInput = TextField;
                  }}
                  onChangeText={userName =>
                    this.setState({ userName: userName.replace(/\s/g, "") })}
                  value={this.state.userName}
                  label={"User name"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={Config.MAX_CHARACTER_USERNAME}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    this.fullNameInput.focus();
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
                    this.fullNameInput = TextField;
                  }}
                  onChangeText={fullName => this.setState({ fullName })}
                  value={this.state.fullName}
                  label={"Full name"}
                  autoCapitalize="none"
                  maxLength={Config.MAX_CHARACTER_FULLNAME}
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                    this.handleRegistration();
                  }}
                  highlightColor={Config.MAIN_COLOR}
                />

                <Text style={{ textAlign: "center" }}>{this.state.error}</Text>
              </View>
              <View style={styles.divider} />
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

export default connect()(withApollo(createProfile));

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
    marginTop: height / 30,
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
