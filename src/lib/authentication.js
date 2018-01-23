import { AsyncStorage, Alert } from "react-native";
import * as Config from "../config";
import { navigate } from "./navigation";
import { USER_QUERY } from "../lib/queries";

import { LoginManager, AccessToken } from "react-native-fbsdk";
import { client } from "../";
export function signInWithEmail(email, password) {
  return new Promise(function(resolve, reject) {
    fetch(Config.AUTH0.dbEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: Config.AUTH0.clientID,
        username: email,
        password: password,
        connection: "Username-Password-Authentication",
        scope: "openid"
      })
    })
      .then(response => response.json())
      .catch(() => reject(Error("error_fetch")))
      .then(responseJson => {
        if (responseJson.id_token) {
          AsyncStorage.setItem("auth0token", responseJson.id_token)
            .then(() => {
              //Prefetch because Apollo query in 'Home' will not fire as 'Home' was already mounted before redirecting to 'Login' due to invalid JWT
              client
                .query({
                  query: USER_QUERY,
                  fetchPolicy: "network-only"
                })
                .then(res => {
                  if (res.data.user) {
                    resolve();
                  } else {
                    navigate("CreateProfile", false, {
                      idToken: responseJson.id_token
                    });
                  }
                });
            })
            .catch(error => reject(error));
        } else {
          reject(responseJson.error);
        }
      });
  });
}

export function signInWithFacebook() {
  return new Promise(function(resolve, reject) {
    LoginManager.logInWithReadPermissions(["public_profile"])
      .then(loginResult => {
        if (loginResult.isCancelled) {
          return;
        }
        AccessToken.getCurrentAccessToken().then(accessTokenData => {
          fetch(Config.AUTH0.socialEndpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              client_id: Config.AUTH0.clientID,

              access_token: accessTokenData.accessToken,
              connection: "facebook",
              scope: "openid"
            })
          })
            .then(response => response.json())
            .catch(error => reject("error_fetch"))
            .then(responseJson => {
              if (responseJson.id_token) {
                AsyncStorage.setItem("auth0token", responseJson.id_token)
                  .then(() => {
                    client
                      .query({
                        query: USER_QUERY,
                        fetchPolicy: "network-only"
                      })
                      .then(res => {
                        if (res.data.user) {
                          resolve();
                        } else {
                          getFacebookInfo(responseJson.id_token);
                        }
                      })
                      .catch(error => reject(error));
                  })
                  .catch(error => reject(error));
              } else {
              }
            });
        });
      })
      .catch(() => reject("Facebook Login failed"));
  });
}

function getFacebookInfo(idToken) {
  fetch(Config.AUTH0.tokenInfoEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id_token: idToken
    })
  })
    .then(response => response.json())
    .then(responseJson => {
      if (responseJson.name) {
        navigate("CreateProfile", false, {
          idToken,
          profileImage:
            "https://graph.facebook.com/" +
            responseJson.user_id.split("|")[1] +
            "/picture?width=200&height=200",
          fullName: responseJson.name
        });
      }
    })
    .catch();
}

export function signUpWithEmail(email, password) {
  return new Promise(function(resolve, reject) {
    let idToken = "";
    fetch(Config.AUTH0.signUpEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: Config.AUTH0.clientID,
        email: email,
        password: password,
        connection: "Username-Password-Authentication"
      })
    })
      .then(response => response.json())
      .catch(() => reject(Error("error_fetch")))
      .then(responseJson => {
        if (responseJson.email) {
          fetch(Config.AUTH0.dbEndpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              client_id: Config.AUTH0.clientID,
              username: email,
              password: password,
              connection: "Username-Password-Authentication",
              scope: "openid"
            })
          })
            .then(response => response.json())
            .catch(() => reject(Error("error_fetch")))
            .then(responseJson => {
              if (responseJson.id_token) {
                AsyncStorage.setItem(
                  "auth0token",
                  responseJson.id_token
                ).then(() => {
                  navigate("CreateProfile", false, {
                    idToken: responseJson.id_token
                  });
                });
              } else {
                reject(responseJson.error);
              }
            });
        } else {
          reject(responseJson.code);
        }
      })
      .catch(() => reject(Error("error_fetch")));
  });
}

export function resetPassword() {
  AsyncStorage.getItem("auth0token").then(idToken => {
    if (idToken) {
      fetch(Config.AUTH0.tokenInfoEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id_token: idToken
        })
      })
        .then(response => response.json())
        .then(responseJson => {
          if (responseJson.email) {
            fetch(Config.AUTH0.passwordResetEndpoint, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                connection: "Username-Password-Authentication",
                email: responseJson.email,
                client_id: Config.AUTH0.clientID
              })
            });
          }
        });
    }
  });
}
