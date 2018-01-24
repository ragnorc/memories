import { Alert, AsyncStorage } from "react-native";
import { uploadMemory } from "../../lib/fetch";
import { stringIsEmpty } from "../../lib/functions";
import { client } from "../../";
import { FEED_QUERY, PROFILE_MEMORIES_QUERY } from "../../lib/queries";
const ADD_CHILDMEMORY_SONGS = "ADD_CHILDMEMORY_SONGS";
const SET_UPLOADING = "SET_UPLOADING";
const initialState = {
  childMemorySongs: [],
  uploading: false
};

export default function others(state = initialState, action) {
  switch (action.type) {
    case ADD_CHILDMEMORY_SONGS: {
      return {
        ...state,
        childMemorySongs: action.songs
      };
    }

    case SET_UPLOADING: {
      return {
        ...state,
        uploading: action.uploading
      };
    }
    default:
      return state;
  }
}

export function addChildMemorySongs(songs) {
  return { type: ADD_CHILDMEMORY_SONGS, songs };
}

export function memoryUploadTask(id) {
  return (dispatch, getState) => {
    AsyncStorage.getItem("tasks").then(tasksString => {
      if (tasksString != null) {
        let tasksObj = JSON.parse(tasksString);

        if (
          !(
            Object.keys(tasksObj).length === 0 &&
            tasksObj.constructor === Object
          )
        ) {
          let memoryID = Object.keys(tasksObj)[0];
          if (id && !stringIsEmpty(id)) {
            memoryID = id;
          }
          dispatch({ type: SET_UPLOADING, uploading: true });
          let memoryObj = tasksObj[memoryID];

          uploadMemory(memoryObj)
            .then(() => {
              delete tasksObj[memoryID];
              AsyncStorage.setItem("tasks", JSON.stringify(tasksObj));
              client
                .query({
                  query: FEED_QUERY,
                  variables: { userID: getState().profile.id },
                  fetchPolicy: "network-only"
                })
                .then(res => {
                  dispatch({ type: SET_UPLOADING, uploading: false });
                  Alert.alert("Yuhuu! Your memory has finished uploading.");
                });
              client.query({
                query: PROFILE_MEMORIES_QUERY,
                variables: {
                  userID: getState().profile.id,
                  profileUserID: getState().profile.id
                },
                fetchPolicy: "network-only"
              });
            })
            .catch(err => {
              dispatch(onUploadError(memoryID));
            });
        }
      }
    });
  };
}

function onUploadError(id) {
  return (dispatch, getState) => {
    dispatch({ type: SET_UPLOADING, uploading: false });
    Alert.alert(
      "Uplading error",
      "An error ocurred while uploading your memory.",
      [
        {
          text: "Retry",
          onPress: () => {
            dispatch(memoryUploadTask(id));
          }
        },
        {
          text: "Cancel",

          style: "cancel"
        }
      ],
      { cancelable: false }
    );
  };
}
