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
  FlatList
} from "react-native";
import TextField from "react-native-md-textinput";
import Spinner from "react-native-spinkit";
import * as Config from "../../config";
import { goBack } from "../../lib/navigation";
import Icon from "react-native-vector-icons/Ionicons";
import IconButton from "../../components/IconButton";
const { width, height } = Dimensions.get("window");
import LinearGradient from "react-native-linear-gradient";

import { addChildMemorySongs } from "../../redux/ducks/others";
import { connect } from "react-redux";
import { gql, graphql } from "react-apollo";
import { FOLLOWERS_QUERY } from "../../lib/queries";
import { navigate } from "../../lib/navigation";
import { stringIsEmpty } from "../../lib/functions";
import styles from "./styles";

export class ChooseSong extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSongs: {},
      songs: [],
      inputText: "",
      loading: false,
      noSongsFound: false,
      numberOfSelectedSongs: 0,
      access_token: ""
    };
  }
  state: {
    selectedSongs: Object,
    songs: Array<Object>,
    inputText: string,
    loading: boolean,
    noSongsFound: boolean,
    numberOfSelectedSongs: number,
    access_token: string
  };

  componentWillMount() {
    StatusBar.setBarStyle("light-content", "fade");
    var formBody = [];
    formBody.push(
      encodeURIComponent("grant_type") +
        "=" +
        encodeURIComponent("client_credentials")
    );
    formBody = formBody.join("&");
    fetch(Config.SPOTIFY.authEndpoint, {
      method: "POST",
      headers: {
        Authorization:
          "Basic ZGM0NjFjZDZkNWFhNDBmYTgzOWE2NTRhMDMyZDZlMjk6M2Q2MzRkNzM1MmE5NGZmZTlmNzYxN2ZjMzRiOGJkYTU=",
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: formBody
    })
      .then(res => res.json())
      .then(jsonRes => {
        this.setState({ access_token: jsonRes.access_token });
      });
  }

  searchSong = searchString => {
    if (!stringIsEmpty(searchString)) {
      this.setState({
        inputText: searchString,
        loading: true,
        noSongsFound: false
      });
      fetch(Config.SPOTIFY.searchTrackEndpoint + searchString, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + this.state.access_token
        }
      })
        .then(res => res.json())
        .then(jsonRes => {
          let noSongsFound = false;

          if (
            typeof jsonRes.tracks.items == "undefined" ||
            jsonRes.tracks.items.length == 0
          ) {
            noSongsFound = true;
          }
          this.setState({
            songs: jsonRes.tracks.items,
            loading: false,
            noSongsFound
          });
        });
    } else {
      this.setState({
        inputText: searchString,
        loading: false,
        noSongsFound: false,
        songs: []
      });
    }
  };

  renderSong = ({ item, index }) => {
    var checkButton = null;
    if (this.state.selectedSongs[item.id]) {
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
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          var cloneSelectedSongs = { ...this.state.selectedSongs };
          let numberOfSelectedSongs = this.state.numberOfSelectedSongs;
          if (cloneSelectedSongs[item.id]) {
            delete cloneSelectedSongs[item.id];
            numberOfSelectedSongs--;
          } else {
            let artistsArray = [];
            item.artists.map(artist => {
              artistsArray.push(artist.name);
            });
            cloneSelectedSongs[item.id] = {
              id: item.id,
              key: item.id,
              previewUrl: item.preview_url,
              name: item.name,
              artists: artistsArray
            };
            numberOfSelectedSongs++;
          }

          var cloneSongs = this.state.songs.slice();

          //Reset songs state to force rerender of List
          this.setState({
            selectedSongs: cloneSelectedSongs,
            songs: cloneSongs,
            numberOfSelectedSongs
          });
        }}
      >
        <View style={styles.row}>
          {item.album &&
            item.album.images[2] &&
            <Image
              style={styles.albumImage}
              resizeMode="cover"
              source={{ uri: item.album.images[2].url }}
            />}
          <View style={{ width: width * 0.5 }}>
            <Text ellipsizeMode="tail" numberOfLines={1}>
              {item.name}
            </Text>
            <Text
              style={{ color: "#a3a3a3" }}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item.artists.map(artist => artist.name + " ")}
            </Text>
          </View>
          {checkButton}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    let indicator;
    if (this.state.loading) {
      indicator = (
        <Spinner
          type="Bounce"
          size={50}
          color="#FFFFFF"
          style={{ marginTop: height / 13, marginBottom: height / 20 }}
        />
      );
    } else if (this.state.noSongsFound) {
      indicator = (
        <Text
          style={{
            backgroundColor: "transparent",
            fontSize: 18,
            color: "white"
          }}
        >
          No songs found
        </Text>
      );
    } else {
      indicator = null;
    }

    return (
      <ScrollView
        style={{ flex: 1 }}
        scrollEnabled={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          style={{
            width: width,
            height: height,
            paddingHorizontal: width / 15
          }}
          colors={Config.MAIN_GRADIENT}
        >
          <Text
            style={{
              backgroundColor: "transparent",
              fontSize: 15,
              color: "white",
              textAlign: "center",
              marginBottom: height / 25,
              marginTop: height / 20
            }}
          >
            {this.state.numberOfSelectedSongs} songs selected
          </Text>
          <IconButton left icon="ios-close" onPress={() => goBack()} />
          <IconButton
            right
            icon="ios-checkmark"
            onPress={() => {
              this.props.navigation.state.params.onSubmit(
                Object.values(this.state.selectedSongs)
              );
              goBack();
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
            onChangeText={searchString => {
              this.searchSong(searchString);
            }}
            textFocusColor={"white"}
            borderColor={"white"}
            textBlurColor={"white"}
          />

          <View
            style={{ flex: 1, alignItems: "center", marginTop: height / 30 }}
          >
            {indicator}
            <FlatList
              keyboardShouldPersistTaps="handled"
              keyExtractor={item => {
                return item.id;
              }}
              data={this.state.songs}
              renderItem={this.renderSong}
            />
          </View>
        </LinearGradient>
      </ScrollView>
    );
  }
}

export default connect()(ChooseSong);
