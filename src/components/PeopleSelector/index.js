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
  PixelRatio,
  FlatList
} from "react-native";
import TextField from "react-native-md-textinput";
import * as Config from "../../config";
import Icon from "react-native-vector-icons/Ionicons";
import IconButton from "../../components/IconButton";
const { width, height } = Dimensions.get("window");
import LinearGradient from "react-native-linear-gradient";
import styles from "./styles";

export default class PeopleSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      people: props.people,
      selectedPeople: props.selectedPeople
    };
  }

  componentWillMount() {
    StatusBar.setBarStyle("light-content", "fade");
  }

  componentWillReceiveProps(np) {
    if (this.props.people !== np.people) {
      this.setState({
        people: np.people
      });
    }
    if (this.props.selectedPeople !== np.selectedPeople) {
      let clonePeople = this.state.people.slice();
      this.setState({
        selectedPeople: np.selectedPeople,
        people: clonePeople
      });
    }
  }

  renderItem = ({ item, index }) => {
    var checkButton = null;
    if (this.state.selectedPeople[item.key]) {
      checkButton = (
        <View
          style={{
            height: height / 18 + height * 2 / 100,
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

    if (item.visible != false) {
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            let cloneSelectedPeople = { ...this.state.selectedPeople };
            if (cloneSelectedPeople[item.key]) {
              delete cloneSelectedPeople[item.key];
            } else {
              cloneSelectedPeople[item.key] = {
                id: item.key,
                fullName: item.fullName,
                profileImage: item.profileImage
              };
            }

            let clonePeople = this.state.people.slice();

            //Reset people state to force rerender of ListView
            this.setState({
              selectedPeople: cloneSelectedPeople,
              people: clonePeople
            });
          }}
        >
          <View style={styles.row}>
            {item.profileImage &&
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
              />}
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
            icon="ios-close"
            onPress={() => this.props.onBack()}
          />
          <IconButton
            right
            icon="ios-checkmark"
            onPress={() => this.props.onSubmit(this.state.selectedPeople)}
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
            onChangeText={searchString => {
              this.setState({
                inputText: searchString
              });
              this.props.onFilter(searchString);
            }}
            textFocusColor={"white"}
            borderColor={"white"}
            textBlurColor={"white"}
          />

          <View style={{ height: height, marginTop: height / 30 }}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={this.state.people}
              renderItem={this.renderItem}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}
