//import liraries
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Image, Text } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import appLogo from '../../images/vectors/splash-screen.png';

let oldRender = Text.render;
Text.render = function (...args) {
    let origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
        style: [{ fontFamily: 'circularstd-book' }, origin.props.style]
    });
};

// create a component
class StartPageView extends React.Component {
    static navigationOptions = {
        title: "Onboarding Start",
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
            return
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
                if (userType.toUpperCase() == "STAFF") {
                    // Go to Home Page
                    // Reset the navigation Stack for back button press

                    this.props.navigation.navigate("DashboardPage");

                }
                //check the usertype to know which view to show
                if (userType.toUpperCase() == "STUDENT") {
                    // Go to Home Page
                    // Reset the navigation Stack for back button press

                    this.props.navigation.navigate("DashboardPage");

                }
            })
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.splash}
                    source={appLogo}
                />
            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column"
    },
    splash: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center"
    },
});


//make this component available to the app
export default StartPageView;