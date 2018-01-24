import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import * as Config from "../../config";
export default StyleSheet.create({
  view: {
    paddingHorizontal: width / 10,
    backgroundColor: "white"
  },
  imageOverlay: {
    position: "absolute",

    backgroundColor: "black",
    opacity: 0.3,
    width: width
  },
  row: {
    borderRadius: 5,
    width: width / 1.2,
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowRadius: 10,
    shadowOpacity: 0.3,
    marginVertical: height / 120,
    paddingHorizontal: width / 20,
    flex: 1
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",

    backgroundColor: "transparent",
    fontFamily: "Futura",
    fontSize: 25,
    color: "white"
  },
  participantImage: {
    height: height / 16,
    borderRadius: height * 0.5 / 16,
    width: height / 16,
    marginRight: width / 80
  },

  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderRadius: 8,
    height: height / 4,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowRadius: 15,
    shadowOpacity: 0.3
  },
  divider: {
    width: width - 2 * (width / 10),
    height: 1,
    backgroundColor: "#F0F4F4",
    marginVertical: height / 17
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: "white"
  },
  albumImage: {
    height: height / 18,
    borderRadius: height * 0.5 / 18,
    width: height / 18,
    marginRight: width / 20,
    marginVertical: height / 70
  },
  description: {
    fontFamily: Config.MAIN_FONT,
    fontSize: 14,
    fontWeight: "400",
    color: "grey",
    marginRight: width / 28,
    marginLeft: width / 35
  }
});
