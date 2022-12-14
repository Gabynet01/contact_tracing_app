//import liraries
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import Helpers from '../Utilities/Helpers';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, Image, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import appLogo from '../../images/contact-tracing.png';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';

const win = Dimensions.get('window');
var allConfig = require('../Utilities/Config');
const baseUrl = allConfig["apiData"]["baseUrl"];
const apiRoute = allConfig["apiData"]["apiRoute"];
var allHelpers = require('../Utilities/Helpers');
const objectClass = allHelpers["Helpers"];

// create a component
class ConfirmOtpView extends React.Component {
    constructor(props) {
        super(props);
        // Declare variables here
        this.state = {
            userOtp: '',
            userNumber: "",
            isLoading: false,
        }
    }

    static navigationOptions = {
        title: "Confirm OTP",
        headerShown: null,
        headerStyle: {
            backgroundColor: "#F35C24"
        }
    };

    // SHOW LOADER
    showLoader() {
        this.setState({ isLoading: true });
    };

    // HIDE LOADER
    hideLoader() {
        this.setState({ isLoading: false });
    };

    // This will load immediately hits this screen
    componentDidMount() {
        AsyncStorage.getItem("otpUserNumber")
            .then((result) => {
                this.checkLogIn(result);
            })

    }

    // Use this to check if the user has an OTP
    checkLogIn(dataStored) {
        if (dataStored === null || dataStored === undefined) {
            objectClass.displayToast("NO OTP detected");
            this.props
                .navigation
                .dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({
                            routeName: 'LoginPage'
                        }),
                    ],
                }))
        }
        else {
            //set the number to the state for display
            this.setState({ userNumber: dataStored });
        }
    }

    // get all data from storage
    getStorageData() {
        AsyncStorage.getItem("otpUserNumber")
            .then((result) => {

                this.onButtonPress(result);
            })
    }

    resendOTP() {
        // initiate loader here 
        this.showLoader();

        // Make the API call here
        fetch(baseUrl + apiRoute + 'otp/resend', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: this.state.userNumber,
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                //console.log("my response for resend otp")
                //console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();

                    objectClass.displayToast(responseJson.message); //DISPLAY TOAST

                }

                else {
                    this.hideLoader();
                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //display Error message
                }
            })
            .catch((error) => {
                console.log(error);
                this.hideLoader();
                objectClass.displayToast("Could not connect to server");
            });
    }

    // make the API call
    onButtonPress(result) {
        // Validate input fields
        if ((this.state.userOtp.trim() == "" || this.state.userOtp.trim() == undefined)) {
            // display toast activity
            objectClass.displayToast("OTP cannot be empty");
            return false;
        }
        else if (this.state.userOtp.trim().length < 6) {
            // display toast activity
            objectClass.displayToast("Please enter the 6 digits code");
            return false;
        }

        else {
            // initiate loader here 
            this.showLoader();

            // Make the API call here
            fetch(baseUrl + apiRoute + 'otp/validate', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mobile: result,
                    otp: this.state.userOtp
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {

                    console.log("my response for confirm otp")
                    console.log(responseJson)

                    if (responseJson.code == "200") {

                        this.hideLoader();
                        // Get the details of the user
                        var allUserData = responseJson.data;
                        var userType = responseJson.data[0]["personality"];
                        var upsa_id = responseJson.data[0]["upsa_id"];

                        // Store Data in ASYNC STORAGE

                        AsyncStorage.setItem('allUserData', JSON.stringify(allUserData));
                        AsyncStorage.setItem('usermobile', this.state.userNumber);
                        AsyncStorage.setItem('userType', userType.toUpperCase());
                        AsyncStorage.setItem('userId', upsa_id.toUpperCase());

                        objectClass.displayToast(responseJson.message); //DISPLAY TOAST
                        // save otp

                        // Go to Dashboard page
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

                    else {
                        this.hideLoader();
                        objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //display Error message
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.hideLoader();
                    objectClass.displayToast("Could not connect to server");
                });

        }
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
                                <Text style={styles.welcomeText}>One Time Password!</Text>
                                <Text style={styles.continueText}>Successfully sent to {this.state.userNumber}</Text>
                            </View>

                            <View style={styles.container}>
                                <View style={styles.formInputBody}>

                                    <Text style={styles.inputLabelText}>Please enter the 6-digits code</Text>

                                    <TextInput style={styles.input}
                                        autoCapitalize="none"
                                        returnKeyType="go"
                                        onSubmitEditing={() => this.getStorageData()}
                                        autoCorrect={false}
                                        keyboardType='number-pad'
                                        maxLength={6}
                                        placeholder='XXXXXX'
                                        placeholderTextColor='#999797'
                                        onChangeText={(text) => this.setState({ userOtp: text })}
                                    />

                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.solidButtonContainer}
                                        onPress={() => this.getStorageData()}>
                                        <Text style={styles.solidButtonText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Show loader */}
                                {this.state.isLoading ? (
                                    <ProgressBar color="#0051e0" style={{ marginTop: 20, marginBottom: 20 }} />
                                ) : null}
                                <View style={styles.plainContainer}>
                                    <View style={styles.plainButtonContainer}>
                                        <Text style={styles.plainButtonText}>Didn't get an OTP ?</Text>
                                    </View>
                                </View>
                                <View style={styles.outlineContainer}>
                                    <TouchableOpacity style={styles.outlineButtonContainer}
                                        onPress={() => this.resendOTP()}>
                                        <Text style={styles.outlineButtonText}>Resend OTP</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>

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
export default withNavigation(ConfirmOtpView);