/* @flow */
import React, { Component } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  Dimensions,
  RefreshControl,
  ScrollView,
  ListView,
  Image,
  Alert,
  TouchableWithoutFeedback,
  LayoutAnimation,
  Animated,
  TouchableHighlight,
  TouchableOpacity,
  FlatList,
  PixelRatio,
  Platform,
  VirtualizedList,
  NetInfo
} from "react-native";
import Header from "../../components/Header";
import { BlurView, VibrancyView } from "react-native-blur";
import Spinner from "react-native-spinkit";
import RoundedIcon from "../../components/RoundedIcon";
import ExplodingHearts from "../../components/ExplodingHearts";
import PropTypes from "prop-types";
//import { Crashlytics } from "react-native-fabric";
import * as Config from "../../config";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import AddOption from "../../components/AddOption";
import * as Animatable from "react-native-animatable";
import Swiper from "react-native-swiper";
//import ImageProgress from "react-native-image-progress";
import Progress from "react-native-progress/Circle";
import { navigate } from "../../lib/navigation";
import { createImageProgress } from "react-native-image-progress";
import FastImage from "react-native-fast-image";
var Sound = require("react-native-sound");
import {
  FEED_QUERY,
  SUBSCRIPTION_QUERY,
  LIKE_MEMORY_MUTATION,
  UNLIKE_MEMORY_MUTATION,
  USER_QUERY
} from "../../lib/queries";
import { gql, graphql } from "react-apollo";

const { width, height } = Dimensions.get("window");
const moment = require("moment");
const cardWidth = width - 20;
const ImageProgressWithFastImage = createImageProgress(FastImage);

const CardItem = ({
  onPress,
  icon,
  text,
  secondText,
  plus
}: {
  onPress: Function,
  icon: string,
  text: string,
  secondText: string,
  plus: number
}) => (
  <View style={styles.descView}>
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
      }}
      onPress={onPress}
    >
      <RoundedIcon icon={icon} size={height / 19} iconSize={height / 32} />
      <View
        style={{
          width: cardWidth / 1.7,
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.description}
          >
            {text}
          </Text>
          {secondText && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {secondText}
            </Text>
          )}
        </View>
        {plus > 0 && (
          <Text
            style={{
              fontFamily: Config.MAIN_FONT,
              fontSize: 15,
              fontWeight: "300",
              color: "grey",
              marginLeft: cardWidth / 40
            }}
          >
            +{plus}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  </View>
);

export class FeedRow extends React.PureComponent {
  constructor(props) {
    console.disableYellowBox = true;
    super(props);
    this.state = {
      imageHeight: height / 3,
      date: "",
      timeSincePost: "",
      images: []
    };

    this.song = null;
    if (props.songs && props.songs[0] && props.songs[0].previewUrl !== null) {
      this.song = new Sound(props.songs[0].previewUrl, null, error => {
        if (error) {
          // Alert.alert("failed to load the sound", error);
          return;
        }
      });
    } else {
      // Alert.alert("hi");
    }
  }

  state: {
    imageHeight: number,
    date: string,
    timeSincePost: string
  };

  componentDidMount() {
    let imagesArray = [];
    this.props.images.map(image => {
      let uri =
        "https://memories.imgix.net/" +
        image.secret +
        "?w=" +
        PixelRatio.getPixelSizeForLayoutSize(width) +
        "&auto=compress";
      imagesArray.push({
        uri,
        url: uri,
        id: image.id
      });
    });
    this.setState({ images: imagesArray });
  }

  render() {
    let collaborators = this.props.collaborators.slice();
    let startDate = moment(this.props.startedAt);
    let endDate = moment(this.props.endedAt);
    let duration = moment.duration(endDate.diff(startDate));
    var createDate = moment(this.props.updatedAt);
    let date;
    let timeSincePost;
    if (duration.asDays() == 0) {
      date = startDate.format("D MMM, YYYY");
      timeSincePost = createDate.fromNow();
    } else {
      date =
        startDate.format("D MMM, YYYY") + " - " + endDate.format("D MMM, YYYY");
      timeSincePost = createDate.fromNow();
    }

    let editRight = false;

    if (
      this.props.collaborators.some(el => {
        return el.id === this.props.userID;
      }) ||
      this.props.initiator.id === this.props.userID
    ) {
      editRight = true;
    }

    if (this.props.imageHeight) {
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            if (editRight) {
              navigate("EditMemory", false, {
                memory: { ...this.props, images: this.state.images, date }
              });
            } else {
              navigate("ViewMemory", false, {
                memory: { ...this.props, images: this.state.images, date }
              });
            }
          }}
        >
          <View style={styles.rectangle}>
            <TouchableWithoutFeedback
              onPress={() => {
                if (this.props.initiator.id === this.props.userID) {
                  navigate("Profile", false, {
                    id: this.props.initiator.id,
                    editable: true
                  });
                } else {
                  navigate("ViewProfile", false, {
                    id: this.props.initiator.id,
                    editable: false
                  });
                }
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: height / 14
                }}
              >
                {this.props.initiator.profileImage && (
                  <Image
                    style={styles.profileImage}
                    resizeMode="cover"
                    defaultSource={require("../../assets/placeholder.png")}
                    source={{
                      uri:
                        "https://memories.imgix.net/" +
                        this.props.initiator.profileImage.secret +
                        "?h=" +
                        PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                        "?w=" +
                        PixelRatio.getPixelSizeForLayoutSize(height / 18) +
                        "&auto=compress&fit=facearea&facepad=5"
                    }}
                  />
                )}
                <Text style={styles.cardName}>
                  {this.props.initiator.fullName}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: height / 14,
                    position: "absolute",
                    right: cardWidth / 32
                  }}
                >
                  <Text style={{ color: Config.GREY_COLOR }}>
                    {timeSincePost}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
            {this.props.headerImage && (
              <ImageProgressWithFastImage
                style={{
                  flex: 1,
                  height: this.props.imageHeight,
                  width: cardWidth
                }}
                onLoadEnd={() => {}}
                indicator={Progress}
                source={{
                  uri:
                    "https://memories.imgix.net/" +
                    this.props.headerImage.secret +
                    "?w=" +
                    PixelRatio.getPixelSizeForLayoutSize(width)
                }}
                resizeMode="cover"
              />
            )}
            <Text style={styles.cardTitle}>{this.props.title}</Text>

            <View style={{ alignItems: "center" }}>
              <View style={styles.descCard}>
                <View style={{ alignItems: "flex-start" }}>
                  <CardItem icon="ios-calendar-outline" text={date} />
                  {this.props.songs &&
                  this.props.songs[0] && (
                    <CardItem
                      plus={this.props.songs.length - 1}
                      icon="ios-musical-notes-outline"
                      onPress={() => {
                        if (
                          this.props.songs[0].previewUrl &&
                          this.song !== null
                        ) {
                          this.song.play();
                        } else {
                          Alert.alert("No preview available.");
                        }
                      }}
                      text={this.props.songs[0].name}
                      secondText={this.props.songs[0].artists[0]}
                    />
                  )}

                  <CardItem
                    icon="ios-pin-outline"
                    text={this.props.location.name}
                  />
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.footer}>
              {collaborators.map((collaborator, index) => {
                if (collaborator.profileImage) {
                  if (index === 3) {
                    return (
                      <View
                        key={"More" + this.props.id}
                        style={[
                          styles.collaboratorImage,
                          {
                            backgroundColor: Config.MAIN_COLOR,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center"
                          }
                        ]}
                      >
                        <Text
                          style={{
                            fontFamily: Config.MAIN_FONT,
                            fontSize: 14,
                            color: "white"
                          }}
                        >
                          +{collaborators.length - 3}
                        </Text>
                      </View>
                    );
                  } else if (index > 3) {
                    return null;
                  } else {
                    return (
                      <Image
                        key={
                          this.props.id + collaborator.profileImage.id + index
                        }
                        style={styles.collaboratorImage}
                        resizeMode="cover"
                        defaultSource={require("../../assets/placeholder.png")}
                        source={{
                          uri:
                            "https://memories.imgix.net/" +
                            collaborator.profileImage.secret +
                            "?h=" +
                            PixelRatio.getPixelSizeForLayoutSize(height / 21) +
                            "?w=" +
                            PixelRatio.getPixelSizeForLayoutSize(height / 21) +
                            "&auto=compress&fit=facearea&facepad=5"
                        }}
                      />
                    );
                  }
                }
              })}

              {1 == 2 && (
                <View
                  style={{
                    position: "absolute",
                    right: cardWidth / 15,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: height / 12
                  }}
                >
                  <Icon
                    name="ios-chatbubbles-outline"
                    color={Config.GREY_COLOR}
                    size={height / 22}
                  />
                  <Text
                    style={{
                      fontFamily: Config.MAIN_FONT,
                      fontSize: 14,
                      color: Config.GREY_COLOR,
                      marginLeft: cardWidth / 45
                    }}
                  >
                    10
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return null;
    }
  }
}

export class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      fetchingMore: false,
      imageHeights: {},
      showFeed: false,
      updateAvailable: false,
      fetchMoreAvailable: true
    };

    //this.userID = props.navigation.state.params.userID;
    //props.dispatch(fetchInitialFeed());
    //props.dispatch(fetchFollowers());
    StatusBar.setBarStyle("light-content", "fade");
  }

  state: {
    isRefreshing: boolean,
    fetchingMore: boolean,
    imageHeights: Object,
    showFeed: boolean,
    updateAvailable: boolean
  };

  componentWillReceiveProps(np: Object) {
    if (!np.data.loading) {
      /*  
      if (this.subscription) {
        if (np.data.feed !== this.props.feed) {
          // if the feed has changed, we need to unsubscribe before resubscribing
          this.subscription();
        } else {
          // we already have an active subscription with the right params
          return;
        }
      }
*/

      if (1 == 1) {
        this.setState({ updateAvailable: true, fetchMoreAvailable: true });

        let cloneImageHeights = { ...this.state.imageHeights };
        let feedFinished = 1;
        np.data.feed.map((item, index) => {
          cloneImageHeights[item.id] = 800;
          if (item.headerImage && item.headerImage.size > 0) {
            cloneImageHeights[item.id] = 800;
            Image.getSize(
              "https://memories.imgix.net/" +
                item.headerImage.secret +
                "?w=" +
                PixelRatio.getPixelSizeForLayoutSize(width),
              (width, height) => {
                var aspectRatio = width / height;
                var measuredHeight;

                if (aspectRatio > Config.MAX_ASPECTRATIO) {
                  measuredHeight = cardWidth / Config.MAX_ASPECTRATIO;
                } else if (aspectRatio < Config.MIN_ASPECTRATIO) {
                  measuredHeight = cardWidth / Config.MIN_ASPECTRATIO;
                } else {
                  measuredHeight = cardWidth / aspectRatio;
                }

                if (measuredHeight < cloneImageHeights[item.id]) {
                  cloneImageHeights[item.id] = measuredHeight;
                }

                if (feedFinished === np.data.feed.length) {
                  this.setState({
                    imageHeights: cloneImageHeights,
                    showFeed: true,
                    isRefreshing: false,
                    updateAvailable: false
                  });
                }
                feedFinished++;
              }
            );
          } else {
            if (feedFinished === np.data.feed.length) {
              this.setState({
                imageHeights: cloneImageHeights,
                showFeed: true,
                isRefreshing: false,
                updateAvailable: false
              });
            }
            feedFinished++;
          }

          /*
            let imagesFinished = 1;
          if (item.images.length > 0) {


            item.images.map((image, imageIndex) => {
              if (image.size > 0) {
                cloneImageHeights[item.id] = 800;
                Image.getSize(
                  "https://memories.imgix.net/" +
                    image.secret +
                    "?w=" +
                    PixelRatio.getPixelSizeForLayoutSize(width),
                  (width, height) => {
                    var aspectRatio = width / height;
                    var measuredHeight;

                    if (aspectRatio > Config.MAX_ASPECTRATIO) {
                      measuredHeight = cardWidth / Config.MAX_ASPECTRATIO;
                    } else if (aspectRatio < Config.MIN_ASPECTRATIO) {
                      measuredHeight = cardWidth / Config.MIN_ASPECTRATIO;
                    } else {
                      measuredHeight = cardWidth / aspectRatio;
                    }

                    if (measuredHeight < cloneImageHeights[item.id]) {
                      cloneImageHeights[item.id] = measuredHeight;
                    }

                    if (feedFinished === np.data.feed.length) {
                      this.setState({
                        imageHeights: cloneImageHeights,
                        showFeed: true,
                        isRefreshing: false,
                        updateAvailable: false
                      });
                    }

                    if (imagesFinished === item.images.length) {
                      feedFinished++;
                    }

                    imagesFinished++;
                  }
                );
              } else {
                if (feedFinished === np.data.feed.length) {
                  this.setState({
                    imageHeights: cloneImageHeights,
                    showFeed: true,
                    isRefreshing: false,
                    updateAvailable: false
                  });
                }
                feedFinished++;
              }
            });

            
          } else {
            if (feedFinished === np.data.feed.length) {
              this.setState({
                imageHeights: cloneImageHeights,
                showFeed: true,
                isRefreshing: false,
                updateAvailable: false
              });
            }
            feedFinished++;
          }*/
        });
      }
      /*
      this.subscription = np.data.subscribeToMore({
        document: SUBSCRIPTION_QUERY,
        variables: { userID: this.props.userID },

        updateQuery: (previousState, { subscriptionData }) => {
          const newEntry = subscriptionData.data.Memory.node;
          //Alert.alert(JSON.stringify(newEntry))
          const cloneFeedArray = previousState.feed.slice();
          cloneFeedArray.unshift(newEntry);
          //cloneFeedArray.push.apply([newEntry],cloneFeedArray);
          let cloneImageHeights = { ...this.state.imageHeights };
          let finished = 1;
          cloneImageHeights[newEntry.id] = 800;

          newEntry.images.map((image, index) => {
            if (image.size > 0) {
              Image.getSize(
                "https://memories.imgix.net/" +
                  image.secret +
                  "?w=" +
                  PixelRatio.getPixelSizeForLayoutSize(width),
                (width, height) => {
                  var aspectRatio = width / height;
                  var measuredHeight;

                  if (aspectRatio > Config.MAX_ASPECTRATIO) {
                    measuredHeight = cardWidth / Config.MAX_ASPECTRATIO;
                  } else if (aspectRatio < Config.MIN_ASPECTRATIO) {
                    measuredHeight = cardWidth / Config.MIN_ASPECTRATIO;
                  } else {
                    measuredHeight = cardWidth / aspectRatio;
                  }
                  if (cloneImageHeights[newEntry.id] > measuredHeight) {
                    cloneImageHeights[newEntry.id] = measuredHeight;
                  }

                  if (finished === newEntry.images.length) {
                    this.setState({
                      imageHeights: cloneImageHeights
                    });
                  }
                  finished++;
                }
              );
            } else {
              if (finished === newEntry.images.length) {
                this.setState({
                  imageHeights: cloneImageHeights
                });
              }
              finished++;
            }
          });

          return {
            ...previousState,

            feed: cloneFeedArray
          };
        },
        onError: err => Alert.alert("Error" + err)
      });
      */
    }
  }

  onRefresh = () => {
    this.setState({ isRefreshing: true });
    this.props.data.refetch().then(() => {
      setTimeout(() => {
        if (!this.state.updateAvailable) {
          this.setState({ isRefreshing: false });
        }
      }, 1000);
    });
  };

  loadMoreMemories = () => {
    var fetchingMore = this.state.fetchingMore;
    if (!fetchingMore) {
      this.setState({ fetchingMore: true });
      this.props.data.fetchMore({
        query: FEED_QUERY,
        variables: {
          cursor: this.props.data.feed[this.props.data.feed.length - 1].id,
          userID: this.props.userID
        },

        updateQuery: (previousResult, { fetchMoreResult }) => {
          const cloneFeedArray = previousResult.feed.slice();

          cloneFeedArray.push.apply(cloneFeedArray, fetchMoreResult.feed);

          if (fetchMoreResult.feed.length > 0) {
            let cloneImageHeights = { ...this.state.imageHeights };

            let feedFinished = 1;

            fetchMoreResult.feed.map((item, index) => {
              cloneImageHeights[item.id] = 800;
              if (item.headerImage && item.headerImage.size > 0) {
                cloneImageHeights[item.id] = 800;
                Image.getSize(
                  "https://memories.imgix.net/" +
                    item.headerImage.secret +
                    "?w=" +
                    PixelRatio.getPixelSizeForLayoutSize(width),
                  (width, height) => {
                    var aspectRatio = width / height;
                    var measuredHeight;

                    if (aspectRatio > Config.MAX_ASPECTRATIO) {
                      measuredHeight = cardWidth / Config.MAX_ASPECTRATIO;
                    } else if (aspectRatio < Config.MIN_ASPECTRATIO) {
                      measuredHeight = cardWidth / Config.MIN_ASPECTRATIO;
                    } else {
                      measuredHeight = cardWidth / aspectRatio;
                    }

                    if (measuredHeight < cloneImageHeights[item.id]) {
                      cloneImageHeights[item.id] = measuredHeight;
                    }

                    if (feedFinished === fetchMoreResult.feed.length) {
                      this.setState({
                        imageHeights: cloneImageHeights,
                        showFeed: true,
                        fetchingMore: false
                      });
                    }
                    feedFinished++;
                  }
                );
              } else {
                if (feedFinished === fetchMoreResult.feed.length) {
                  this.setState({
                    imageHeights: cloneImageHeights,
                    showFeed: true,
                    fetchingMore: false
                  });
                }
                feedFinished++;
              }
            });

            return {
              ...previousResult,

              feed: cloneFeedArray
            };
          } else {
            this.setState({ fetchingMore: false, fetchMoreAvailable: false });
          }
        }
      });
    }
  };

  renderFooter = () => {
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {this.state.fetchingMore &&
        this.state.fetchMoreAvailable && (
          <Spinner type="Bounce" size={50} color={Config.MAIN_COLOR} />
        )}
      </View>
    );
  };
  render() {
    const { data: { loading, error, feed, networkStatus } } = this.props;
    if (networkStatus === 7 && !this.props.data.feed.length) {
      return (
        <View style={styles.view}>
          <Header logo navTitle="Memories" />
          <Text
            style={{
              backgroundColor: "transparent",
              fontSize: 25,
              marginTop: height / 1.9
            }}
          >
            Welcome to Memories!
          </Text>
          <AddOption
            style={{ marginTop: height / 10 }}
            icon="ios-people"
            onPress={() => navigate("Discover")}
            text="Find friends to follow"
          />
        </View>
      );
    } else if (!this.props.data.feed || !this.state.showFeed) {
      return (
        <View style={styles.view}>
          <Header logo navTitle="Memories" />
          <Spinner
            type="Bounce"
            size={50}
            color={Config.MAIN_COLOR}
            style={{ marginTop: height / 1.5 }}
          />
        </View>
      );
    } else if (error) {
      return (
        <View style={styles.view}>
          <Header logo uploading={this.props.uploading} navTitle="Memories" />
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
              position: "absolute",
              height: height - Config.TABBAR_HEIGHT
            }}
          >
            <View
              style={{
                marginTop: height / 4 - 80
              }}
            >
              <Text>{error}</Text>
            </View>
          </ScrollView>
        </View>
      );
    } else if (feed) {
      return (
        <View style={styles.view}>
          <Header logo uploading={this.props.uploading} navTitle="Memories" />

          <View
            style={{
              //marginTop: height / 4 - 80,
              position: "absolute",
              height: height - Config.TABBAR_HEIGHT
            }}
          >
            {this.state.showFeed && (
              <FlatList
                shouldItemUpdate={false}
                contentContainerStyle={{ paddingTop: height / 4 - 80 }}
                /*   refreshing={this.state.isRefreshing}
            onRefresh={()=>this.onRefresh()}*/
                maxToRenderPerBatch={2}
                windowSize={7}
                refreshControl={
                  <RefreshControl
                    onRefresh={() => this.onRefresh()}
                    refreshing={this.state.isRefreshing}
                    tintColor="white"
                  />
                }
                initialNumToRender={2}
                // debug
                keyExtractor={item => {
                  return item.id;
                }}
                ListFooterComponent={this.renderFooter}
                onEndReached={() => this.loadMoreMemories()}
                onEndReachedThreshold={20}
                showsVerticalScrollIndicator={false}
                data={feed}
                renderItem={rowData => {
                  return (
                    <FeedRow
                      userID={this.props.userID}
                      imageHeight={this.state.imageHeights[rowData.item.id]}
                      {...rowData.item}
                    />
                  );
                }}
              />
            )}
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}
var mapStateToProps = function(state) {
  return {
    userID: state.profile.id,
    uploading: state.others.uploading
  };
};
const HomeWithData = connect(mapStateToProps)(
  graphql(USER_QUERY)(
    graphql(FEED_QUERY, {
      options: props => ({
        fetchPolicy: "cache-and-network",
        variables: {
          userID: props.userID
        }
      })
    })(Home)
  )
);
export default HomeWithData;

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white"
  },
  rectangle: {
    flex: 1,
    borderRadius: 11,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 15,
    shadowOpacity: 0.2,
    width: cardWidth,
    elevation: 10,
    marginVertical: 30,
    marginHorizontal: (width - cardWidth) / 2,
    //height:cardHeight,
    backgroundColor: "white"
  },
  description: {
    fontFamily: Config.MAIN_FONT,
    fontSize: 14,
    fontWeight: "300",
    color: "grey",
    marginRight: cardWidth / 28,
    marginLeft: cardWidth / 35
  },
  descView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: height / 100,
    paddingHorizontal: height / 17
  },
  descCard: {
    width: width,
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
    marginTop: height / 40,
    marginBottom: height / 35
  },
  cardName: {
    color: "black",
    fontFamily: Config.MAIN_FONT,
    fontSize: 15,
    fontWeight: "400"
  },
  cardTitle: {
    color: "black",
    fontFamily: Config.MAIN_FONT,
    fontSize: 21,
    fontWeight: "600",
    textAlign: "center",
    marginTop: height / 30,
    marginHorizontal: cardWidth / 20
  },
  date: {
    color: "grey",
    fontFamily: Config.MAIN_FONT,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "left",
    marginTop: height / 40,
    marginLeft: cardWidth / 10
  },
  cardParticipants: {
    color: "black",
    fontFamily: Config.MAIN_FONT,
    fontSize: 15,
    textAlign: "center",
    marginRight: cardWidth / 32
  },

  profileImage: {
    height: height / 18,
    borderRadius: height * 0.5 / 18,
    width: height / 18,
    marginHorizontal: cardWidth / 18
  },
  collaboratorImage: {
    height: height / 21,
    borderRadius: height * 0.5 / 21,
    width: height / 21,
    marginRight: -height * 0.3 / 21
  },

  divider: {
    width: cardWidth / 1.15,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#F0F4F4",
    marginHorizontal: 0.5 * (cardWidth - cardWidth / 1.15)
  },
  footer: {
    borderBottomRightRadius: 7,
    borderBottomLeftRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: cardWidth / 30,
    height: height / 12,
    paddingVertical: height / 40
  }
});
