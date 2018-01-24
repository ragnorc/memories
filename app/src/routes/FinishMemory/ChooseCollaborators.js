/* @flow */
import React, { Component } from "react";
import { View, StatusBar, Dimensions, Alert } from "react-native";

import PeopleSelector from "../../components/PeopleSelector";

import { addCollaborators } from "../../redux/ducks/memory";
import { connect } from "react-redux";
import { gql, graphql } from "react-apollo";
import { ALL_USERS_QUERY } from "../../lib/queries";
import { navigate, goBack } from "../../lib/navigation";

export class ChooseAuthors extends Component {
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
        onSubmit={selectedPeople => {
          this.props.navigation.state.params.onSubmit(selectedPeople);
          goBack();
        }}
        selectedPeople={this.props.navigation.state.params.selectedPeople}
        people={this.state.people}
      />
    );
  }
}
var mapStateToProps = function(state) {
  return {
    collaborators: state.memory.collaborators,
    userID: state.profile.id
  };
};
export default connect(mapStateToProps)(
  graphql(ALL_USERS_QUERY, {
    options: props => ({
      variables: {
        userID: props.userID,
        searchString: "",
        initiator: props.navigation.state.params.initiator
      }
    })
  })(ChooseAuthors)
);
