import { Alert } from "react-native";

// Actions
const ADD_FIRST = "ADD_FIRST";
const ADD_SECOND = "ADD_SECOND";
const ADD_SONGS = "ADD_SONGS";
const ADD_IMAGE = "ADD_IMAGE";
const ADD_SPECIFIC_FOLLOWERS = "ADD_SPECIFIC_FOLLOWERS";
const ADD_EXCLUDED_PEOPLE = "ADD_EXCLUDED_PEOPLE";
const ADD_PRIVACY_TYPE = "ADD_PRIVACY_TYPE";
const ADD_FEED_PRIVACY = "ADD_FEED_PRIVACY";
const ADD_CHILDMEMORY = "ADD_CHILDMEMORY";
const ADD_COLLABORATORS = "ADD_COLLABORATORS";

// Reducer

const initialState = {
  tempMemoryID: "",
  title: "",
  collaborators: [],
  headerimage: null,
  images: [],
  childMemories: [],
  privacy: {
    type: "everybody",
    specificGroup: {},
    specificFollowers: {},
    excludedPeople: {},
    visibilityText: "Visible by"
  },
  location: {},
  startedAt: "",
  endedAt: "",

  songs: []
};

export default function memory(state = initialState, action) {
  let cloneSongsArray = state.songs.slice();
  //  let cloneImagesArray= state.images.slice();
  switch (action.type) {
    case ADD_FIRST:
      return {
        ...initialState,
        title: action.title,
        tempMemoryID: action.tempMemoryID,
        headerImage: action.headerImage
      };
    case ADD_SECOND:
      return {
        ...state,
        location: action.location,
        startedAt: action.startedAt,
        endedAt: action.endedAt
      };
    case ADD_FEED_PRIVACY:
      return {
        ...state,
        privacy: {
          ...state.privacy,
          showInFeed: action.showInFeed
        },
        childMemories: []
      };
    case ADD_COLLABORATORS:
      return {
        ...state,
        collaborators: action.collaborators
      };

    case ADD_SPECIFIC_FOLLOWERS:
      return {
        ...state,
        privacy: {
          ...state.privacy,
          specificGroup: action.specificGroup,
          specificFollowers: action.specificFollowers
        }
      };
    case ADD_EXCLUDED_PEOPLE:
      return {
        ...state,
        privacy: {
          ...state.privacy,

          excludedPeople: action.excludedPeople
        }
      };

    case ADD_PRIVACY_TYPE:
      return {
        ...state,

        privacy: {
          ...state.privacy,
          type: action.privacyType,
          specificGroup: action.specificGroup,
          specificFollowers: action.specificFollowers,
          visibilityText: action.visibilityText
        }
      };

    case ADD_SONGS:
      return {
        ...state,
        songs: [...state.songs, ...action.songsArray]
      };
    case ADD_IMAGE:
      return {
        ...state,
        images: [...state.images, action.image]
      };
    case ADD_CHILDMEMORY:
      return {
        ...state,
        childMemories: [
          ...state.childMemories,
          {
            title: action.title,
            tempMemoryID: action.tempMemoryID,
            key: action.tempMemoryID,
            images: action.images,
            location: action.location,
            songs: action.songs,
            startedAt: action.startedAt || state.startedAt,
            description: action.description
          }
        ]
      };

    default:
      return state;
  }
}

// Action Creators with Middleware

export function addFirst(title, headerImage, tempMemoryID) {
  return { type: ADD_FIRST, title, headerImage, tempMemoryID };
}
export function addImage(image) {
  return { type: ADD_IMAGE, image };
}
export function addChildMemory(
  title,
  images,
  tempMemoryID,
  songs,
  location,
  startedAt,
  description
) {
  return {
    type: ADD_CHILDMEMORY,
    title,
    images,
    tempMemoryID,
    songs,
    location,
    startedAt,
    description
  };
}

export function addSecond(location, startedAt, endedAt) {
  return { type: ADD_SECOND, location, startedAt, endedAt };
}
export function addPrivacyType(selection, specificFollowersButtonText) {
  return (dispatch, getState) => {
    if (selection.specificFollowers) {
      var cloneSpecificFollowers = {
        ...getState().memory.privacy.specificFollowers
      };
      delete cloneSpecificFollowers.length;
      dispatch({
        type: ADD_PRIVACY_TYPE,
        privacyType: "specificFollowers",
        specificGroup: getState().memory.privacy.specificGroup,
        specificFollowers: cloneSpecificFollowers,
        visibilityText: specificFollowersButtonText
      });
    } else if (selection.onlyFollowers) {
      dispatch({
        type: ADD_PRIVACY_TYPE,
        privacyType: "onlyFollowers",
        specificGroup: {},
        specificFollowers: {},
        visibilityText: "Only followers"
      });
    } else if (selection.everybody) {
      dispatch({
        type: ADD_PRIVACY_TYPE,
        privacyType: "everybody",
        specificGroup: {},
        specificFollowers: {},
        visibilityText: "Everybody"
      });
    } else if (selection.onlyMe) {
      dispatch({
        type: ADD_PRIVACY_TYPE,
        privacyType: "onlyMe",
        specificGroup: {},
        specificFollowers: {},
        visibilityText: "Only me"
      });
    }
  };
}
export function addCollaborators(collaborators) {
  return { type: ADD_COLLABORATORS, collaborators };
}

export function setSpecificFollowers(
  selectedGroupID,
  selectedGroup,
  selectedFollowers
) {
  return dispatch => {
    dispatch({
      type: ADD_SPECIFIC_FOLLOWERS,
      specificFollowers: selectedFollowers,
      specificGroup: { id: selectedGroupID, name: selectedGroup.name }
    });
  };
}

export function setExcludedPeople(excludedPeople) {
  return dispatch => {
    dispatch({ type: ADD_EXCLUDED_PEOPLE, excludedPeople });
  };
}

export function addFeedPrivacy(showInFeed) {
  return { type: ADD_FEED_PRIVACY, showInFeed };
}

export function addSongs(songsArray) {
  return { type: ADD_SONGS, songsArray };
}
