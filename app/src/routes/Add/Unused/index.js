/**
 * @flow
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View, Dimensions, TouchableOpacity, StatusBar} from 'react-native';
import styles from '../styles';
import NavBar from '../../../components/NavBar';
import Header from '../../../components/Header';
import * as Config from '../../../config';
import IconButton from '../../../components/IconButton';
import Button from '../../../components/Button';
import AddOption from '../../../components/AddOption';
const {width, height} = Dimensions.get('window');

export default class ThirdStep extends Component {
      constructor(props) {
        super(props);
        this.state = {
          participantsText:'Add participants',
          songText:'Add music',
        
        }

    }
  render() {
    return (
      <View>
  
        <View style={{width:width,height:height,alignItems: 'center',  position:'absolute',backgroundColor:'white'}}>
          <Header navTitle={this.props.title} />
          <IconButton left icon="ios-arrow-back" onPress={()=>Actions.pop()} />
          <View style={{position:'absolute', top:height/3.7, right:0,left:0,alignItems:'center'}}>
            <AddOption icon="ios-person" text={this.state.participantsText} />
            
            <AddOption icon="ios-musical-notes" text={this.state.songText} />
            <AddOption icon="ios-book" text="Add a description" />
          </View>
          <View
            style={
            styles.buttonWrapper}>
            <Button
              backColor={Config.SECOND_COLOR}
              color="white"
              version="roundFilled"
              text="Continue"
              onPress={()=> Actions.addFourthStep()} />
          </View>
        </View>
        
      </View>
    );
  }
}

