import { StyleSheet, Dimensions } from 'react-native';
import * as Config from '../../config';
const { width, height } = Dimensions.get('window');
export default StyleSheet.create({
  // Button container

  iconView: {
      alignItems:'center', 
      justifyContent: 'center',
      backgroundColor:Config.MAIN_COLOR, 
    
      shadowColor: Config.MAIN_COLOR,
        shadowOffset: {
            width: 0,
            height: 0
        },
        elevation:6,
        shadowRadius:10,
        shadowOpacity: 0.5}
 
});
