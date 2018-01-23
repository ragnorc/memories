import React, {Component} from 'react';
import styles from './styles.js';

import {
    StyleSheet, Text, TouchableOpacity, // Pressable container
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class Header extends Component {

    render({
        navTitle,
        showRightIcon,
        showLeftIcon,
       
        rightIcon,
        leftIcon,
        rightPress,
        leftPress
    } = this.props) {
        if (showRightIcon || showLeftIcon) {
            return (

              <View
                style={[
                    styles.navBar, {
                        flexDirection: 'row'
                    }
                ]}>
                <View style={styles.iconView}>
                  {showLeftIcon && <TouchableOpacity onPress={leftPress}>
                    <Icon size={41} name={leftIcon} {...iconStyles} />
                    </TouchableOpacity>
}
                </View>
                <View style={styles.titleView}>
                  <Text style={styles.navTitle}>{navTitle}</Text>
                </View>

                <View style={styles.iconView}>
                  {showRightIcon && <TouchableOpacity onPress={rightPress}>
                    <Icon size={41} name={rightIcon} {...iconStyles} />
                    </TouchableOpacity>
}
                </View>

              </View>

            );
        } else {
            return (

              <View style={styles.navBar}>
               
                <Text style={styles.navTitle}>{navTitle}</Text>

              </View>

            );
        }
    }

}

const iconStyles = {

    color: 'white'
};
