import { Platform } from "react-native";

export const MAIN_COLOR = "#4C5FF8"; //F05058
export const SECOND_COLOR = "#F05058";
export const GREY_COLOR = "#bfbfbf";
export const MAIN_FONT = Platform.OS === "ios" ? "System" : "Roboto";
export const MAIN_FONT_WEIGHT = Platform.OS === "ios" ? "500" : "400";
export const MAIN_GRADIENT = ["#005C97", "#363795"];
export const MAX_ASPECTRATIO = 1.8;
export const MIN_ASPECTRATIO = 0.9;
export const MAX_CHARACTER_FULLNAME = 30;
export const MAX_CHARACTER_USERNAME = 30;
export const MAX_CHARACTER_TITLE = 30;
export const MAX_CHARACTER_MOMENT_TITLE = 30;

export const TABBAR_HEIGHT = 49;

export const AUTH0 = {
  domain: "https://memories.eu.auth0.com/",
  clientID: "HWDtK2gJTrTwS0kRI5tO7qGBwLGC4iVU",
  dbEndpoint: "https://memories.eu.auth0.com/oauth/ro",
  socialEndpoint: "https://memories.eu.auth0.com/oauth/access_token",
  tokenInfoEndpoint: "https://memories.eu.auth0.com/tokeninfo",
  signUpEndpoint: "https://memories.eu.auth0.com/dbconnections/signup",
  passwordResetEndpoint:
    "https://memories.eu.auth0.com/dbconnections/change_password"
};

export const SPOTIFY = {
  searchTrackEndpoint: "https://api.spotify.com/v1/search?type=track&q=",
  authEndpoint: "https://accounts.spotify.com/api/token"
};

export const GRAPHCOOL = {
  simpleEndpoint: "https://api.graph.cool/simple/v1/cj0z2oaolh21q01157bp5kh4a",
  subEndpoint: "wss://subscriptions.graph.cool/v1/cj0z2oaolh21q01157bp5kh4a",
  fileEndpoint: "https://api.graph.cool/file/v1/cj0z2oaolh21q01157bp5kh4a"
};

export const placeholderProfileImage = {
  uri:
    "https://files.graph.cool/cj0z2oaolh21q01157bp5kh4a/cj490xsr502jo0168en9yfdjv",
  id: "cj490xssn02jp0168y4d5y40p"
};
