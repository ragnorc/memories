/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  Keyboard
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconButton from "../../../components/IconButton";
import PeopleSelector from "../../../components/PeopleSelector";
const { width, height } = Dimensions.get("window");
import LinearGradient from "react-native-linear-gradient";
import { setExcludedPeople } from "../../../redux/ducks/memory";
import { connect } from "react-redux";
import { gql, graphql } from "react-apollo";
import { ALL_USERS_QUERY } from "../../../lib/queries";
import { navigate, goBack } from "../../../lib/navigation";
import styles from "./styles";

export class ExcludePeople extends Component {
  constructor(props) {
    super(props);

    this.state = {
      people: []
    };
  }

  componentWillMount() {
    StatusBar.setBarStyle("light-content", "fade");
  }
  componentWillReceiveProps(np) {
    this.setState({
      people: np.data.allUsers
    });
  }

  onSubmit = selectedPeople => {
    Keyboard.dismiss();
    this.props.dispatch(setExcludedPeople(selectedPeople));
    goBack();
  };

  filterPeople = searchString => {
    this.props.data.refetch({ searchString: searchString });
  };

  render() {
    return (
      <PeopleSelector
        onFilter={searchString => {
          this.filterPeople(searchString);
        }}
        onBack={() => goBack()}
        onSubmit={selectedPeople => this.onSubmit(selectedPeople)}
        people={this.state.people}
        selectedPeople={this.props.excludedPeople}
      />
    );
  }
}
var mapStateToProps = function(state) {
  return {
    excludedPeople: state.memory.privacy.excludedPeople,
    userID: state.profile.id
  };
};
export default connect(mapStateToProps)(
  graphql(ALL_USERS_QUERY, {
    options: props => ({
      variables: {
        userID: props.userID,
        searchString: ""
      }
    })
  })(ExcludePeople)
);
