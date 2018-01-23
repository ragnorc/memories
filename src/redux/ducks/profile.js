const ADD_USER = "ADD_USER_ID";

const initialState = {
  userID: ""
};

export default function profile(state = initialState, action) {
  switch (action.type) {
    case ADD_USER:
      return {
        ...state,
        ...action.userObj
      };

    default:
      return state;
  }
}

export function addUser(userObj) {
  return { type: ADD_USER, userObj };
}
