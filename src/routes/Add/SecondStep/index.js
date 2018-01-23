/**
 * @flow
 */

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
  Keyboard
} from "react-native";
import styles from "../styles";
import RNGooglePlaces from "react-native-google-places";
import LinearGradient from "react-native-linear-gradient";
import NavBar from "../../../components/NavBar";
import Header from "../../../components/Header";
import DatePicker from "react-native-datepicker";
import { navigate, goBack } from "../../../lib/navigation";
import { stringIsEmpty } from "../../../lib/functions";
import * as Config from "../../../config";
import { connect } from "react-redux";
import { addSecond } from "../../../redux/ducks/memory";
import IconButton from "../../../components/IconButton";
import AddOption from "../../../components/AddOption";
import Button from "../../../components/Button";
const moment = require("moment");

const { width, height } = Dimensions.get("window");

export class SecondStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDateText: "Begin of your memory",
      endDateText: "End of your memory",
      placeText: "Place",
      startDate: "",
      endDate: "",
      location: {}
    };
  }

  onSubmit = () => {
    Keyboard.dismiss();
    let { startDate, endDate, location } = this.state;
    if (stringIsEmpty(startDate) && stringIsEmpty(endDate)) {
      Alert.alert("Please set the date of your memory.");
    } else if (stringIsEmpty(location.name)) {
      Alert.alert("Please set the location of your memory.");
    } else {
      if (stringIsEmpty(startDate)) {
        startDate = endDate;
      } else if (stringIsEmpty(endDate)) {
        endDate = startDate;
      }
      this.props.dispatch(addSecond(location, startDate, endDate));
      navigate("AddThirdStep");
    }
  };
  render() {
    return (
      <View>
        <DatePicker
          ref={picker => {
            this.startDatePicker = picker;
          }}
          style={{
            width: 0,
            height: 0
          }}
          date={new Date()}
          mode="date"
          placeholder="Choose date"
          maxDate={this.state.endDate}
          format="YYYY-MM-DD"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: "absolute",
              left: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              marginLeft: 36
            }
          }}
          onDateChange={date => {
            this.setState({
              startDateText: moment(date).format("D MMM, YYYY"),
              startDate: date
            });
          }}
        />
        <DatePicker
          ref={picker => {
            this.endDatePicker = picker;
          }}
          style={{
            width: 0,
            height: 0
          }}
          date={new Date()}
          mode="date"
          placeholder="Choose date"
          format="YYYY-MM-DD"
          minDate={this.state.startDate}
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: "absolute",
              left: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              marginLeft: 36
            }
          }}
          onDateChange={date => {
            this.setState({
              endDateText: moment(date).format("D MMM, YYYY"),
              endDate: date
            });
          }}
        />

        <View
          style={{
            width: width,
            height: height,
            alignItems: "center",
            position: "absolute",
            backgroundColor: "white"
          }}
        >
          <Header navTitle={this.props.title} />
          <IconButton
            left
            icon="ios-arrow-back-outline"
            size={30}
            onPress={() => goBack()}
          />
          <View
            style={{
              position: "absolute",
              top: height / 3.7,
              right: 0,
              left: 0,
              alignItems: "center"
            }}
          >
            <AddOption
              icon="ios-calendar-outline"
              onPress={() => this.startDatePicker.onPressDate()}
              text={this.state.startDateText}
            />
            <AddOption
              icon="ios-calendar-outline"
              onPress={() => this.endDatePicker.onPressDate()}
              text={this.state.endDateText}
            />
            <AddOption
              icon="ios-pin"
              onPress={() => {
                StatusBar.setBarStyle("dark-content", "fade");
                RNGooglePlaces.openAutocompleteModal()
                  .then(place => {
                    StatusBar.setBarStyle("light-content", "fade");
                    this.setState({
                      placeText: place.name,
                      location: { ...place }
                    });
                  })
                  .catch(error => {
                    StatusBar.setBarStyle("light-content", "fade");
                    console.log(error.message);
                  }); // error is a Javascript Error object
              }}
              text={this.state.placeText}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              backColor={Config.SECOND_COLOR}
              color="white"
              version="roundFilled"
              text="Continue"
              onPress={() => this.onSubmit()}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default connect()(SecondStep);
