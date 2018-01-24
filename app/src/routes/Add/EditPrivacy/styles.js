import { StyleSheet, Dimensions } from 'react-native';
const {width, height} = Dimensions.get('window');
export default StyleSheet.create({

    view: {
        flex: 1,
    },
    userImage: {
        height: height/18,
    borderRadius: height*0.5/18,
    width: height/18,
    marginHorizontal: width/20,
    marginVertical: height/100
   
},
row: {
    borderRadius:5,
    marginHorizontal:width/15,
    flexDirection: 'row',
    backgroundColor:'white', 
    alignItems: 'center', 
    shadowColor: 'black',
        shadowOffset: {
            width: 5,
            height: 5
        },
        shadowRadius: 10,
        shadowOpacity: 0.3,
    marginVertical:height/120,
    height:height/18+height*2/100,
}
    
});
