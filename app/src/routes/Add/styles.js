import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import * as Config from "../../config";
export default StyleSheet.create({
  view: {
    paddingHorizontal: width / 10,
    backgroundColor: "white"
  },
  button: {
    marginTop: height / 25,
    height: height / 12,
    borderRadius: 7,
    backgroundColor: "white",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowRadius: 10,
    shadowOpacity: 0.8,
    shadowColor: "#3B55E6",
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    marginTop: height / 25,
    height: height / 12,
    borderRadius: 7,
    backgroundColor: "white",
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    shadowColor: "black",
    elevation: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: width * 8 / 10
  },
  buttonWrapper: {
    backgroundColor: "transparent",
    flexDirection: "column",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: height / 15,
    alignItems: "center",
    shadowColor: Config.SECOND_COLOR,
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowRadius: 15,
    shadowOpacity: 0.6
  }
});
