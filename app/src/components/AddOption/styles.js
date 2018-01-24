import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export default StyleSheet.create({
  // Button container

  iconView: {
    position: "absolute",
    left: width * 8 / 10 / 20,
    alignItems: "center",
    justifyContent: "center",
    height: height / 12
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
    elevation: 7,
    shadowColor: "black",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: width * 8 / 10
  }
});
