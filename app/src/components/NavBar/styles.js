import { StyleSheet, Dimensions } from 'react-native';
import * as Config from '../../config';

const { width, height } = Dimensions.get('window');
export default StyleSheet.create({
  navTitle: {
    color: '#FFFFFF',
    fontFamily: 'Avenir',
    fontSize: 18,
    marginTop: (height/9)*0.5,
    textAlign: 'center',
      fontWeight:'600',

  },

  navBar: {
  width:width,
  height:height/9,
  backgroundColor:Config.MAIN_COLOR,
position:'absolute',
top: 0,

  },

  titleView: {
    flexDirection:'column',
      alignItems:'center',
      width: width*(2/3),
      justifyContent:'center'

  },
  iconView: {
      flexDirection:'column',
      alignItems:'center',
      width: width*(1/6),
           marginTop: (height/9)*0.45,

  },

});
