//import liraries
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginForm from './LoginForm';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, Image } from 'react-native';
import appLogo from '../../images/contact-tracing.png';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// create a component
class Login extends React.Component {
    static navigationOptions = {
        title: "Login",
        headerShown: null,
        headerStyle: {
            backgroundColor: "#F35C24"
        }
    };

    // This will load immediately hits this screen
    componentDidMount() {
        AsyncStorage.getItem("usermobile")
            .then((result) => {
                // //console.log("this is the value of result", result)
                this.checkLogIn(result);
            })

    }

    // Use this to check the user logged in 
    checkLogIn(dataStored) {
        if (dataStored === null || dataStored === undefined) {
            this.props.navigation.navigate("LoginPage");
        }
        else {
            this.checkUserType();
        }
    }


    //check user type
    checkUserType() {
        // lets get data in the storage
        AsyncStorage.getItem("userType")
            .then((userType) => {

                if (userType === null || userType === undefined) {
                    this.props.navigation.navigate("LoginPage");
                    return;
                }

                //check the usertype to know which view to show
                if (userType.toUpperCase() == "DRIVER") {
                    // Go to Home Page
                    // Reset the navigation Stack for back button press
                    this.props
                        .navigation
                        .dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({
                                    routeName: 'DashboardPage'
                                }),
                            ],
                        }))
                }

                //check the usertype to know which view to show
                if (userType.toUpperCase() == "FLEETMANAGER") {
                    // Go to Home Page
                    // Reset the navigation Stack for back button press
                    this.props
                        .navigation
                        .dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({
                                    routeName: 'FleetManagerDashboardPage'
                                }),
                            ],
                        }))
                }
            })
    }



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
                                <Text style={styles.welcomeText}>Welcome back!</Text>
                                <Text style={styles.continueText}>Login to continue</Text>
                            </View>
                            <LoginForm />

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
export default Login;