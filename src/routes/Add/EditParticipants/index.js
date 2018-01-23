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
import LinearGradient from "react-native-linear-gradient";
import IconButton from "../../../components/IconButton";
const { width, height } = Dimensions.get("window");
import { connect } from "react-redux";
import styles from "./styles";
const followerDS = new ListView.DataSource({
  rowHasChanged: (r1, r2) =>
    r1.participants.selected !== r2.participants.selected ||
    r1.visible !== r2.visible
});
export class SearchUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
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

    cloneFollowerArray.push(nextProps.newFollower);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({
      //followerArray: nextProps.followerArray,
      followerArray: cloneFollowerArray,
      followerSource: followerDS.cloneWithRows(cloneFollowerArray)
    });
  }

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

      if (this.state.followerArray[rowID].participants.selected) {
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
              participants: {
                selected: !this.state.followerArray[rowID].participants.selected
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
            onPress={() => Actions.pop()}
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
