//import liraries
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterForm from './RegisterForm';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, Image } from 'react-native';
import appLogo from '../../images/contact-tracing-rg.png';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// create a component
class Register extends React.Component {
    static navigationOptions = {
        title: "Register",
        headerShown: null,
        headerStyle: {
            backgroundColor: "#F35C24"
        }
    };

    render() {
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                    <ScrollView
                        contentInsetAdjustmentBehavior="automatic"
                        style={styles.scrollView}>
                        <View style={styles.logoBody}>
                            <View style={styles.centerItems}>
                                <Image style={styles.logoContainer}
                                    source={appLogo}
                                />
                            </View>
                        </View>

                        <View style={styles.formBody}>
                            <View style={styles.textContainer}>
                                <Text style={styles.welcomeText}>Welcome to UPSA Contact Tracing !</Text>
                                <Text style={styles.continueText}>Help us Identify who you are</Text>
                            </View>
                            <RegisterForm />

                        </View>
                    </ScrollView>
                </SafeAreaView>
            </>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    textContainer: {
        marginTop: 30,
        marginLeft: 30,
    },
    welcomeText: {
        color: '#380507',
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '500',
        fontStyle: 'normal',

    },
    continueText: {
        marginTop: 7,
        color: '#999797',
        fontSize: 18,
        lineHeight: 23,
        fontWeight: 'normal',
        fontStyle: 'normal',

    },
    logoContainer: {
        width: 500,
        height: 312,
    },
    formBody: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 26,
        borderBottomLeftRadius: 0,
        borderBottomEndRadius: 0
    },
    centerItems: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        backgroundColor: Colors.lighter,
    },
});

//make this component available to the app
export default Register;