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
  LayoutAnimation,
  FlatList,
  PixelRatio
} from "react-native";
import TextField from "react-native-md-textinput";
import * as Config from "../../../config";
import { goBack } from "../../../lib/navigation";
import Icon from "react-native-vector-icons/Ionicons";
import IconButton from "../../../components/IconButton";
const { width, height } = Dimensions.get("window");
import LinearGradient from "react-native-linear-gradient";
import { setSpecificFollowers } from "../../../redux/ducks/memory";
import { connect } from "react-redux";
import { navigate } from "../../../lib/navigation";
import { FOLLOWERS_QUERY } from "../../../lib/queries";
import { gql, graphql } from "react-apollo";
import styles from "./styles";
const initialGroup = { name: "No group selected", key: "0", members: {} };
export class ChooseFollowers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedGroupIndex: 0,
      followers: [],
      groups: [initialGroup],
      selectedFollowers: {},
      selectedGroupID: "0"
    };
  }

  componentWillMount() {
    StatusBar.setBarStyle("light-content", "fade");
    //this.fetchGroups();
  }
  componentDidMount() {}

  componentWillReceiveProps(np) {
    if (np.data.user) {
      if (np.data.user.followers) {
        //  Alert.alert(JSON.stringify(np.data.user.followers))
        this.setState({
          followers: np.data.user.followers
        });
      } else {
        navigate("Login", true);
      }
      if (np.data.user.groups) {
        var cloneGroups = np.data.user.groups.slice();
        for (var i = 0; i < cloneGroups.length; ++i) {
          var members = {};
          for (var s = 0; s < cloneGroups[i].members.length; ++s) {
            members[cloneGroups[i].members[s].id] = true;
          }

          cloneGroups[i] = {
            ...cloneGroups[i],
            members: members
          };
        }

        cloneGroups.unshift(initialGroup);
        this.setState({
          groups: cloneGroups
        });
      } else {
        navigate("Login", true);
      }

      var cloneFollowers = np.data.user.followers.slice();

      //Reset followers state to force rerender of ListView
      this.setState({
        selectedFollowers: np.selectedFollowers,
        followers: cloneFollowers
      });
    } else {
      navigate("Login", true);
    }
  }

  onSubmit = () => {
    this.props.dispatch(
      setSpecificFollowers(
        this.state.selectedGroupID,
        this.state.groups[this.state.selectedGroupIndex],
        this.state.selectedFollowers
      )
    );
    goBack();
  };

  filterFollowers = searchString => {
    this.setState({
      inputText: searchString
    });
    this.props.data.refetch({ searchString: searchString });

    /*

var cloneFollowers= this.state.followers.slice();
              for (var i = 0; i < cloneFollowers.length; ++i) {

if(!cloneFollowers[i].fullName.toUpperCase().startsWith(searchString.toUpperCase()) && cloneFollowers[i].fullName.toUpperCase().indexOf(' '+searchString.toUpperCase())<0 && !cloneFollowers[i].userName.toUpperCase().startsWith(searchString.toUpperCase()) )

{
    
             cloneFollowers[i] = {
  ...this.state.followers[i],
  visible: false
};
}

else {
    
             cloneFollowers[i] = {
  ...this.state.followers[i],
  visible: true
};
}

    }
    
                this.setState({
   followers: cloneFollowers,
      inputText: searchString
     
  });
*/
  };

  renderFollower = ({ item, index }) => {
    var checkButton = null;
    if (
      this.state.selectedFollowers[item.key] ||
      this.state.groups[this.state.selectedGroupIndex].members.hasOwnProperty(
        item.key
      )
    ) {
      checkButton = (
        <View
          style={{
            height: height / 18 + height * 2 / 100,
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            right: width / 20
          }}
        >
          <Icon name="ios-checkmark-circle" color={"#26DFB6"} size={23} />
        </View>
      );
    }

    if (item.visible != false) {
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            var cloneSelectedFollowers = { ...this.state.selectedFollowers };
            cloneSelectedFollowers[item.key] = !(
              cloneSelectedFollowers[item.key] || false
            );
            var cloneFollowers = this.state.followers.slice();

            //Reset followers state to force rerender of ListView
            this.setState({
              selectedFollowers: cloneSelectedFollowers,
              followers: cloneFollowers
            });
          }}
        >
          <View style={styles.row}>
            <Image
              style={styles.userImage}
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
            <Text>
              {item.fullName}
            </Text>
            {checkButton}
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return null;
    }
  };

  renderGroup = ({ item, index }) => {
    var checkButton = null;

    if (this.state.selectedGroupID == item.key) {
      checkButton = (
        <View
          style={{
            height: height / 18 + height * 2 / 100,
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
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
          var cloneGroups = this.state.groups.slice();
          var cloneFollowers = this.state.followers.slice();
          //Reset followers and group state to force rerender of ListView
          this.setState({
            followers: cloneFollowers,
            groups: cloneGroups,
            selectedGroupID: cloneGroups[index].key,
            selectedGroupIndex: index
          });
        }}
      >
        <View style={styles.row}>
          <Text style={{ marginHorizontal: width / 20 }}>
            {item.name}
          </Text>
          {checkButton}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    return (
      <ScrollView
        style={styles.view}
        scrollEnabled={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            width: width,
            height: height,
            paddingHorizontal: width / 15,
            paddingTop: height / 10,
            backgroundColor: Config.MAIN_COLOR
          }}
        >
          <IconButton
            left
            icon="ios-arrow-back-outline"
            size={30}
            onPress={() => {
              /** |-------------------------------------------------- | TODO: submit
          when android physical back button is clicked
          |-------------------------------------------------- */ this.onSubmit();
            }}
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
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={this.state.followers}
              renderItem={this.renderFollower}
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
            Groups
          </Text>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={this.state.groups}
            renderItem={this.renderGroup}
          />
        </View>
      </ScrollView>
    );
  }
}
var mapStateToProps = function(state) {
  return {
    selectedFollowers: state.memory.privacy.specificFollowers
  };
};
export default connect(mapStateToProps)(
  graphql(FOLLOWERS_QUERY, { options: { variables: { searchString: "" } } })(
    ChooseFollowers
  )
);
