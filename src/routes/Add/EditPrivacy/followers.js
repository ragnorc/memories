/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  Image,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
  ListView,
  TouchableOpacity,
  LayoutAnimation
} from "react-native";

import TextField from "react-native-md-textinput";
import * as Config from "../../../config";
import Icon from "react-native-vector-icons/Ionicons";
import IconButton from "../../../components/IconButton";
const { width, height } = Dimensions.get("window");
import LinearGradient from "react-native-linear-gradient";

import { connect } from "react-redux";
import styles from "./styles";
const followerDS = new ListView.DataSource({
  rowHasChanged: (r1, r2) =>
    r1.privacy.selected !== r2.privacy.selected || r1.visible !== r2.visible
});
const groupDS = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1.selected !== r2.privacy
});
export class SearchUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      groupArray: [
        { name: "Alle Follower", selected: true },
        { name: "Nur ich", selected: false }
      ],
      groupSource: groupDS.cloneWithRows([
        { name: "Alle Follower", selected: true },
        { name: "Nur ich", selected: false }
      ]),
      followerArray: props.followerArray || [],
      followerSource:
        followerDS.cloneWithRows(props.followerArray) ||
          followerDS.cloneWithRows([])
    };
  }

  componentWillMount() {
    StatusBar.setBarStyle("light-content", "fade");
  }

  componentWillReceiveProps(nextProps) {
    var cloneFollowerArray = this.state.followerArray.slice();
    var nextFollower = nextProps.newFollower;
    if (!this.state.groupArray[0]) {
      nextFollower.privacy.selected = false;
    }
    cloneFollowerArray.push(nextFollower);
    this.setState({
      //followerArray: nextProps.followerArray,
      followerArray: cloneFollowerArray,
      followerSource: followerDS.cloneWithRows(cloneFollowerArray)
    });
  }

  submit = () => {
    var excludedFollowerArray = [];
    var includedFollowerArray = [];
    if (this.state.groupArray[0].selected) {
      for (var i = 0; i < this.state.followerArray.length; ++i) {
        if (!this.state.followerArray[i].privacy.selected) {
          excludedFollowerArray.push(this.state.followerArray[i].userID);
          console.log(this.state.followerArray[i].fullName);
        }
      }
      this.props.dispatch(
        editPrivacy("public", undefined, excludedFollowerArray)
      );
    } else if (this.state.groupArray[1].selected) {
      for (var i = 0; i < this.state.followerArray.length; ++i) {
        if (this.state.followerArray[i].privacy.selected) {
          includedFollowerArray.push(this.state.followerArray[i].userID);
          console.log(this.state.followerArray[i].fullName);
        }
      }
      this.props.dispatch(editPrivacy("private", includedFollowerArray));
    }
  };

  filterFollowers = searchString => {
    var cloneFollowerArray = this.state.followerArray.slice();
    for (var i = 0; i < cloneFollowerArray.length; ++i) {
      if (
        !cloneFollowerArray[i].fullName
          .toUpperCase()
          .startsWith(searchString.toUpperCase()) &&
        !cloneFollowerArray[i].userName
          .toUpperCase()
          .startsWith(searchString.toUpperCase())
      ) {
        cloneFollowerArray[i] = {
          ...this.state.followerArray[i],
          visible: false
        };
      } else {
        cloneFollowerArray[i] = {
          ...this.state.followerArray[i],
          visible: true
        };
      }
    }

    this.setState({
      followerArray: cloneFollowerArray,
      followerSource: this.state.followerSource.cloneWithRows(
        cloneFollowerArray
      ),
      inputText: searchString
    });
  };

  renderFollowers = (rowData, sectionID, rowID) => {
    if (this.state.followerArray[rowID].visible) {
      var checkButton = null;

      if (this.state.followerArray[rowID].privacy.selected) {
        checkButton = (
          <View
            style={{
              height: height / 18 + height * 2 / 100,
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              right: width / 20
            }}
          >
            <Icon name="ios-checkmark-circle" color={"#26DFB6"} size={23} />
          </View>
        );
      }
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            var cloneFollowerArray = this.state.followerArray.slice();

            cloneFollowerArray[rowID] = {
              ...this.state.followerArray[rowID],
              privacy: {
                selected: !this.state.followerArray[rowID].privacy.selected
              }
            };

            this.setState({
              followerArray: cloneFollowerArray,
              followerSource: this.state.followerSource.cloneWithRows(
                cloneFollowerArray
              )
            });
          }}
        >
          <View style={styles.row}>
            <Image
              style={styles.userImage}
              source={require("../../../assets/ragnor.png")}
            />
            <Text>{rowData.fullName}</Text>{checkButton}
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return null;
    }
  };

  renderGroups = (rowData, sectionID, rowID) => {
    var checkButton = null;
    if (this.state.groupArray[rowID].selected) {
      checkButton = (
        <View
          style={{
            height: height / 18 + height * 2 / 100,
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            right: width / 20
          }}
        >
          <Icon name="ios-checkmark-circle" color={"#26DFB6"} size={23} />
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          var cloneGroupArray = this.state.groupArray.slice();
          var cloneFollowerArray;
          cloneGroupArray[rowID] = {
            ...this.state.groupArray[rowID],
            selected: true
          };

          if (rowID != 1) {
            cloneGroupArray[1] = {
              ...this.state.groupArray[1],
              selected: false
            };
          } else if (rowID != 0) {
            cloneGroupArray[0] = {
              ...this.state.groupArray[0],
              selected: false
            };
          }
          if (rowID == 1) {
            cloneFollowerArray = this.state.followerArray.slice();
            for (var i = 0; i < cloneFollowerArray.length; ++i) {
              cloneFollowerArray[i] = {
                ...this.state.followerArray[i],
                privacy: { selected: false }
              };
            }
            this.setState({
              followerArray: cloneFollowerArray,
              followerSource: this.state.followerSource.cloneWithRows(
                cloneFollowerArray
              )
            });
          }
          if (rowID == 0) {
            cloneFollowerArray = this.state.followerArray.slice();
            for (var i = 0; i < cloneFollowerArray.length; ++i) {
              cloneFollowerArray[i] = {
                ...this.state.followerArray[i],
                privacy: { selected: true }
              };
            }
            this.setState({
              followerArray: cloneFollowerArray,
              followerSource: this.state.followerSource.cloneWithRows(
                cloneFollowerArray
              )
            });
          }

          this.setState({
            groupArray: cloneGroupArray,
            groupSource: this.state.groupSource.cloneWithRows(cloneGroupArray)
          });
        }}
      >
        <View style={styles.row}>
          <Text style={{ marginHorizontal: width / 20 }}>{rowData.name}</Text>
          {checkButton}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    return (
      <View style={styles.view}>

        <LinearGradient
          style={{
            width: width,
            height: height,
            paddingHorizontal: width / 15,
            paddingTop: height / 10
          }}
          colors={Config.MAIN_GRADIENT}
        >
          <IconButton left icon="ios-close" onPress={() => Actions.pop()} />
          <IconButton
            right
            icon="ios-checkmark"
            onPress={() => this.submit()}
          />
          <TextField
            inputStyle={{
              fontSize: 16,
              height: 33,
              lineHeight: 34,
              paddingBottom: 3
            }}
            label={"Search"}
            value={this.state.inputText}
            autoCapitalize={"none"}
            autoCorrect={false}
            highlightColor={"white"}
            textColor={"white"}
            labelColor={"white"}
            onChangeText={searchString => this.filterFollowers(searchString)}
            textFocusColor={"white"}
            borderColor={"white"}
            textBlurColor={"white"}
          />

          <View style={{ height: height / 2.7, marginTop: height / 30 }}>
            <ListView
              enableEmptySections
              keyboardShouldPersistTaps="always"
              dataSource={this.state.followerSource}
              renderRow={this.renderFollowers}
            />
          </View>

          <Text
            style={{
              fontFamily: Config.MAIN_FONT,
              fontWeight: "700",
              color: "white",
              marginLeft: width / 15,
              marginVertical: 30,
              backgroundColor: "transparent"
            }}
          >
            Gruppen
          </Text>

          <ListView
            enableEmptySections
            keyboardShouldPersistTaps="always"
            dataSource={this.state.groupSource}
            renderRow={this.renderGroups}
          />

        </LinearGradient>
      </View>
    );
  }
}

var mapStateToProps = function(state) {
  return {
    followerArray: state.fetch.followers,
    newFollower: state.fetch.newFollower,
    userID: state.user.userID
  };
};
export default connect(mapStateToProps)(SearchUser);
