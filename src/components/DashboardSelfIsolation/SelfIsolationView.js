//import liraries
import React, { Component } from 'react';
import { SafeAreaView, FlatList, StyleSheet, ScrollView, View, Text, StatusBar, Image, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, Icon } from 'react-native-elements'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import appLogo from '../../images/contact-tracing-rg.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from '@react-native-community/progress-bar-android';

const win = Dimensions.get('window');
var allConfig = require('../Utilities/Config');
const baseUrl = allConfig["apiData"]["baseUrl"];
const apiRoute = allConfig["apiData"]["apiRoute"];
var allHelpers = require('../Utilities/Helpers');
const objectClass = allHelpers["Helpers"];

// create a component
class SelfIsolationView extends React.Component {
    // Constructor for this component
    constructor(props) {
        super(props);
        // Declare variables here
        this.state = {
            loggedInUserName: '',
            userId: '',
            showLoading: false,
            state: false,
            isLoading: false,
            isolationDaysCount: "",
            severityText: "",
            showDescription: null,
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    static navigationOptions = {
        headerShown: false,
    };


    // This will load immediately hits this screen
    componentDidMount() {
        AsyncStorage.getItem("userId")
            .then((result) => {
                this.checkLogIn(result);
            })

    }

    // SHOW LOADER
    showLoader() {
        this.setState({ isLoading: true });
    };

    // HIDE LOADER
    hideLoader() {
        this.setState({ isLoading: false });
    };

    // Use this to check if the user has an OTP
    checkLogIn(dataStored) {
        if (dataStored === null || dataStored === undefined) {
            objectClass.displayToast("NO USER ID detected");
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
            this.setState({ userId: dataStored });

            //first make the call to get isolation days
            this.fetchItemList();
        }
    }

    //fetch isolation days list
    fetchItemList() {
        this.showLoader();
        // Make the API call here
        fetch(baseUrl + apiRoute + 'isolation/days', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.state.userId,
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                // console.log("my response for isolation days count")
                // console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();

                    //set the data derived into the view
                    var isolationData = responseJson.data;
                    if (isolationData.length == 0) {
                        this.setState({ showDescription: false, isolationDaysCount: "0", severityText: "Kindly keep safe" });
                    } else {
                        var isolationDays = isolationData[0]["isolation_days_counter"];
                        var severity = isolationData[0]["severity_condition"];
                        if (severity.toUpperCase() == "LOW") {
                            this.setState({ showDescription: true, isolationDaysCount: isolationDays, severityText: "You may have coronavirus" });
                        }
                        if (severity.toUpperCase() == "HIGH") {
                            this.setState({ showDescription: true, isolationDaysCount: isolationDays, severityText: "You have coronavirus" });
                        }
                    }

                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST


                }

                else {
                    this.hideLoader();
                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //display Error message
                    this.handleBackButtonClick();
                }
            })
            .catch((error) => {
                console.log(error)
                this.hideLoader();
                objectClass.displayToast("Could not connect to server");
                this.handleBackButtonClick();
            });
    }

    UNSAFE_componentWillMount() {
        BackHandler.addEventListener('hardwareDepositBackPress', this.handleBackButtonClick);
    }

    UNSAFE_componentWillUnmount() {
        BackHandler.removeEventListener('hardwareDepositBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.goBack(null);
        return true;
    }

    onButtonPress() {
        this.props.navigation.navigate('CovidTestPage');
    }

    render() {
        return (
            <>
                <View style={styles.headerBar}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        marginLeft: 31,
                    }}>
                        <View style={{ marginTop: 19 }}>
                            <Icon name="keyboard-backspace" size={32} color="#FFFFFF" style={{ paddingLeft: 31.6 }} onPress={() => this.handleBackButtonClick()} />
                        </View>
                        <View>
                            <Text style={styles.headerText}>Self Isolation Period</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.logoBody}>
                    <View style={styles.centerItems}>
                        <Image style={styles.logoContainer}
                            source={appLogo}
                        />
                    </View>
                </View>
                <View style={styles.isolateBody}>
                    <View style={styles.centerItems}>
                        <Text style={styles.mainText}>Please isolate for</Text>
                        <Text style={styles.isolateDaysTxt}>{this.state.isolationDaysCount} days</Text>
                        <Text style={styles.smallText}>and book a test</Text>
                    </View>

                    {this.state.showDescription == true ? (
                        <View style={{ marginTop: 10, marginLeft: 30, marginRight: 31 }}>
                            <Text style={styles.promptText}>  {this.state.severityText}</Text>
                            <Text style={styles.descriptionText}>Your symptoms suggest you may have coronavirus.{'\n'}Please isolate yourself and anyone else in your household. That means staying at home with no visitors.{'\n'}You should also book a test immediately by clicking on the button below. </Text>
                        </View>
                    ) : null}

                    {this.state.showDescription == false ? (
                        <View style={{ marginTop: 10, marginLeft: 30, marginRight: 31 }}>
                            <Text style={styles.promptText}>  {this.state.severityText}</Text>
                            <Text style={styles.descriptionText}> Please ensure that you continue keeping safe and using the app at all times. You can always book a covid test anytime you want by clicking the button below</Text>
                        </View>
                    ) : null}

                    {/* Show loader */}
                    {this.state.isLoading ? (
                        <ProgressBar color="#0051e0" style={{ marginTop: 20, marginBottom: 20 }} />
                    ) : null}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.solidButtonContainer}
                            onPress={() => this.onButtonPress()}>
                            <Text style={styles.solidButtonText}>Book a Covid Test</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        marginTop: 15
    },
    headerBar: {
        backgroundColor: '#0051e0',

    },
    mainText: {
        marginTop: 20,
        fontSize: 20,
        lineHeight: 23,
        fontStyle: 'normal',
        fontWeight: '500',
        color: '#380507'
    },
    smallText: {
        fontSize: 20,
        lineHeight: 23,
        fontStyle: 'normal',
        fontWeight: '500',
        color: '#380507'
    },
    headerText: {
        color: "#FFF",
        fontStyle: 'normal',
        fontWeight: '500',
        fontSize: 22,
        paddingLeft: 11,
        paddingTop: 20,
        paddingBottom: 20
    },
    scrollView: {
        backgroundColor: 'transparent',
    },
    listItemDiv: {
        marginLeft: 31,
        marginRight: 29,
        marginBottom: 15,
        borderRadius: 16,
        overflow: 'hidden'
    },
    listContentView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    customListItemDiv: {
        marginLeft: 31,
        marginRight: 29,
        marginBottom: 15,
        borderRadius: 16,
        overflow: 'hidden'
    },
    customListContentView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    textStyle: {
        color: '#FFF',
        fontSize: 22
    },
    logoContainer: {
        width: 500,
        height: 120,
    },
    isolateBody: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 26,
        borderBottomLeftRadius: 0,
        borderBottomEndRadius: 0

    },
    isolateDaysTxt: {
        fontSize: 40,
        lineHeight: 56,
        color: '#0051e0',
        fontWeight: '500'
    },
    promptText: {
        fontSize: 24,
        lineHeight: 46,
        backgroundColor: '#e08200',
        color: '#FFF',
        fontWeight: '500'
    },
    descriptionText: {
        marginTop: 20,
        marginBottom: 20,
        fontSize: 16,
        lineHeight: 18,
        color: '#380507',
        textAlign: 'left',
        fontStyle: 'normal'
    },
    centerItems: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        marginTop: 10,
        paddingLeft: 44,
        paddingRight: 44,
        marginBottom: 30
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
});

//make this component available to the app
export default withNavigation(SelfIsolationView);