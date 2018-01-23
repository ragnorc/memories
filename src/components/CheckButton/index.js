
import React, {Component} from 'react';
import {View} from 'react-native';
import styles from'./styles';
import Icon from 'react-native-vector-icons/Ionicons';

 export default class CheckButton extends Component {
     render () {
     
         return (
            
           <View style={styles.iconView}><Icon name="ios-checkmark-circle" color={'#26DFB6'} size={23} /></View>
           
         )
        }
 }