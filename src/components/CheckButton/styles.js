import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
export default StyleSheet.create({

  iconView: {height:height/12, alignItems:'center',justifyContent:'center', position:'absolute', right: width/20}

});
