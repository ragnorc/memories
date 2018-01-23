import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import * as Config from "../../config";
export default StyleSheet.create({
  header: {
    position: "absolute",
    backgroundColor: Config.MAIN_COLOR
  },

  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: width,
    borderTopWidth: width / 4,
    borderRightColor: "transparent",
    borderTopColor: Config.MAIN_COLOR
  },
  navTitle: {
    position: "absolute",
    color: "#FFFFFF",
    fontFamily: Config.MAIN_FONT,
    fontSize: 18,
    top: height / 9 * 0.5,
    right: 0,
    left: 0,
    textAlign: "center",
    fontWeight: "700",
    backgroundColor: "transparent"
  }
});
