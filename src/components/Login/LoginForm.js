//import liraries
import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Helpers from '../Utilities/Helpers';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import Icon from 'react-native-ionicons';

const win = Dimensions.get('window');
var allConfig = require('../Utilities/Config');
const baseUrl = allConfig["apiData"]["baseUrl"];
const apiRoute = allConfig["apiData"]["apiRoute"];
var allHelpers = require('../Utilities/Helpers');
const objectClass = allHelpers["Helpers"];

// create a component
class LoginForm extends React.Component {

    // Constructor for this component
    constructor(props) {
        super(props);

        // Declare variables here
        this.state = {
            hidden: true,
            usermobile: '',
            viewSection: false,
            isLoading: false,

            hideEyeIcon: true,
            viewEyeIcon: false
        }
    }

    // SHOW LOADER
    showLoader() {
        this.setState({ isLoading: true });
    };

    // HIDE LOADER
    hideLoader() {
        this.setState({ isLoading: false });
    };

    // Open the reset pin alert box
    openResetCheckNumber() {
        this.setState({ viewSection: true });
    }

    gotoRegisterPage() {
        this.props
            .navigation
            .dispatch(StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({
                        routeName: 'RegisterPage'
                    }),
                ],
            }));
    }


    // This function will be called when the login button is clicked
    onButtonPress() {
        // Validate input fields
        if ((this.state.usermobile.trim() == "" || this.state.usermobile.trim() == undefined)) {
            // display toast activity
            objectClass.displayToast("Your phone number cannot be empty");
            return false;
        }
        else if (this.state.usermobile.trim().length < 10) {
            // display toast activity
            objectClass.displayToast("Your phone number must be 10 digits long");
            return false;
        }

        else {
            // initiate loader here 
            this.showLoader();

            // Make the API call here
            fetch(baseUrl + apiRoute + 'login', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobile: this.state.usermobile,
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    //console.log("my response for login")
                    //console.log(responseJson)

                    if (responseJson.code == "200") {

                        this.hideLoader();

                        objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST

                        // objectClass.displayToast("OTP sent successfully to " + this.state.usermobile + " via SMS"); //DISPLAY TOAST
                        // save user number
                        AsyncStorage.setItem('otpUserNumber', this.state.usermobile);

                        // Reset the navigation Stack for back button press
                        this.props
                            .navigation
                            .dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                    NavigationActions.navigate({
                                        routeName: 'ConfirmOtpPage'
                                    }),
                                ],
                            }));
                    }

                    else {
                        this.hideLoader();
                        objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //display Error message
                    }
                })
                .catch((error) => {
                    console.log(error)
                    this.hideLoader();
                    objectClass.displayToast("Could not connect to server");
                });

        }
    }


    // RENDER THE VIEW
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.formInputBody}>

                    <Text style={styles.inputLabelText}>Please enter your phone number</Text>

                    <TextInput style={styles.input}
                        autoCapitalize="none"
                        onSubmitEditing={() => this.onButtonPress()}
                        autoCorrect={false}
                        keyboardType='number-pad'
                        returnKeyType="next"
                        maxLength={10}
                        placeholder='Eg. 0XX XXX XXXX'
                        placeholderTextColor='#999797'
                        onChangeText={(text) => this.setState({ usermobile: text })}
                    />

                </View>
                {/* Show loader */}
                {this.state.isLoading ? (
                    <ProgressBar color="#0051e0" style={{ marginTop: 20, marginBottom: 20 }} />
                ) : null}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.solidButtonContainer}
                        onPress={() => this.onButtonPress()}>
                        <Text style={styles.solidButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.plainContainer}>
                    <View style={styles.plainButtonContainer}>
                        <Text style={styles.plainButtonText}>Don't have an account ?</Text>
                    </View>
                </View>
                <View style={styles.outlineContainer}>
                    <TouchableOpacity style={styles.outlineButtonContainer}
                        onPress={() => this.gotoRegisterPage()}>
                        <Text style={styles.outlineButtonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }

}

// define your styles
const styles = StyleSheet.create({
    container: {
        paddingBottom: 88
    },
    formInputBody: {
        paddingLeft: 32,
        paddingRight: 32,
    },
    inputLabelText: {
        marginTop: 39,
        marginBottom: 12,
        color: '#380507',
        fontSize: 18,
        lineHeight: 23,
        fontWeight: '500',
        fontStyle: 'normal',

    },
    inputLabelText2: {
        marginTop: 23,
        marginBottom: 12,
        color: '#380507',
        fontSize: 18,
        lineHeight: 23,
        fontWeight: '500',
        fontStyle: 'normal',

    },
    eyeSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeIcon: {
        marginLeft: -40,
        marginRight: 20
    },
    inputPin: {
        flex: 1,
        height: 56,
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        paddingLeft: 30,
        color: '#380507',
        fontSize: 14,
        lineHeight: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',

    },
    input: {
        height: 56,
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        paddingLeft: 30,
        color: '#380507',
        fontSize: 14,
        lineHeight: 18,
        fontWeight: 'normal',
        fontStyle: 'normal',

    },
    buttonContainer: {
        marginTop: 30,
        paddingLeft: 44,
        paddingRight: 44,
    },
    solidButtonContainer: {
        backgroundColor: '#0051e0',
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 7,
        shadowColor: "#455A64",
        shadowOpacity: 0.1,
        elevation: 0.1,
    },
    solidButtonText: {
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#FBFBFB',
        textAlign: 'center',
        fontSize: 18,

    },
    outlineContainer: {
        paddingLeft: 44,
        paddingRight: 44,
        paddingTop: 5
    },
    outlineButtonContainer: {
        backgroundColor: '#F9F9F9',
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#0051e0',
        shadowColor: "#455A64",
        shadowOpacity: 0.1,
        elevation: 0.1,
    },
    outlineButtonText: {
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#0051e0',
        textAlign: 'center',
        fontSize: 18,

    },
    plainContainer: {
        paddingLeft: 44,
        paddingRight: 44,
        paddingTop: 5
    },
    plainButtonContainer: {
        backgroundColor: '#FFF',
        marginTop: 20,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 7,
        borderWidth: 0,
        borderColor: '#FFF',
        shadowColor: "#455A64",
        shadowOpacity: 0.1,
        elevation: 0.1,
    },
    plainButtonText: {
        fontWeight: '600',
        fontStyle: 'normal',
        color: '#0051e0',
        textAlign: 'center',
        fontSize: 16,

    },

    borderContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginBottom: 36.5,
        paddingRight: 32
    },
    border: {
        flex: 0.24,
        borderBottomWidth: 1,
        borderBottomColor: '#0051e0',
    },
});

//make this component available to the app
export default withNavigation(LoginForm);
