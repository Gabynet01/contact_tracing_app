//import liraries
import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    FlatList,
    Button,
    PermissionsAndroid,
    SafeAreaView, ScrollView, StatusBar, Image, Dimensions, TouchableOpacity, BackHandler
} from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import { ListItem, Icon } from 'react-native-elements';
import { Card, Checkbox } from 'react-native-paper';
import appLogo from '../../images/contact-tracing-rg.png';
import Geolocation from 'react-native-geolocation-service';

const win = Dimensions.get('window');
var allConfig = require('../Utilities/Config');
const baseUrl = allConfig["apiData"]["baseUrl"];
const apiRoute = allConfig["apiData"]["apiRoute"];
var allHelpers = require('../Utilities/Helpers');
const objectClass = allHelpers["Helpers"];

// create a component
class SymptomsView extends React.Component {
    // Constructor for this component
    constructor(props) {
        super(props);
        // Declare variables here
        this.state = {
            loggedInUserName: '',
            usermobile: '',
            showLoading: false,
            state: false,
            userId: '',
            symptomsList: [],
            selectedSymptomsList: [],
            checked: false,
            listReady: false,
            latitude: 0.1,
            longitude: 0.1,
            tracedUserIds: []
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
            this.requestLocationPermission();
            //set the number to the state for display
            this.setState({ userId: dataStored });

            //first make the call to check user booking
            this.checkPendingUserBooking(dataStored);
        }
    }

    //check user pending bookings / Isolations
    checkPendingUserBooking(userId) {
        this.showLoader();
        // Make the API call here
        fetch(baseUrl + apiRoute + 'symptoms/check/pending/booking/isolation', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                // console.log("my response for checking pending booking / isolation")
                // console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();
                    // objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST

                    //call the fetch symptoms list
                    this.fetchItemList();
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

    //fetch symptoms list
    fetchItemList() {
        this.showLoader();
        // Make the API call here
        fetch(baseUrl + apiRoute + 'symptoms/list', {
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

                // console.log("my response for checking pending booking / isolation")
                // console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();

                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST
                    this.setState({ symptomsList: responseJson.data, listReady: true });
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

    // this will enforce user to accept permissions
    async requestLocationPermission() {
        /*LOCATION : */
        //Grant the permission for Location

        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                'title': 'UPSA App Location Permission',
                'message': 'UPSA Contact Tracing App needs access to your location ',
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            })

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            try {
                Geolocation.getCurrentPosition(
                    (position) => {
                        console.log("My current location", JSON.stringify(position));

                        // this.setState({
                        //     location: (position.coords.latitude.toString() + ", " + position.coords.longitude.toString())
                        // })

                        this.setState({
                            latitude: parseFloat(position.coords.latitude),
                            longitude: parseFloat(position.coords.longitude)
                        })

                    },
                    (error) => {
                        // See error code charts below.
                        console.log("Error showwnnn--->>", error.code, error.message);
                        // objectClass.displayToast(error.message);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );

                this.watchID = navigator.geolocation.watchPosition((lastPosition) => {
                    console.log("lastPosition---->>>>", lastPosition);
                    this.setState({ lastPosition: lastPosition });
                });
            }
            catch (e) {
                console.log("Error has been caught when getting location coordinates of users", e);
            }
        }
        else {
            //console.log("Location permission denied");
            objectClass.displayToast("Location permission denied by user");
        }

        //----LOCATION END----//
    }

    componentWillUnmount() {
        Geolocation.clearWatch(this.watchID);
    }

    //submit all symptoms selected
    onButtonPress() {
        this.showLoader();

        //check if latitude and longitude are not 0.1
        if (this.state.latitude == 0.1 && this.state.longitude == 0.1) {
            objectClass.displayToast("Location permissions need to be accepted before submiting symptoms");
            return false;
        }

        // Make the API call here
        fetch(baseUrl + apiRoute + 'booking/contacts/traced', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.state.userId,
                latitude: this.state.latitude,
                longitude: this.state.longitude
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                console.log("my response for checking all contacts traced")
                console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();

                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST
                    //if it is empty set ""
                    if (responseJson.tracedUserIds.length == 0) {
                        this.setState({tracedUserIds: []})
                    } else {
                        this.setState({ tracedUserIds: responseJson.tracedUserIds });
                    }
                    //submit the final symptoms data here 

                    this.submitFinalData();
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

    //submit the final data here
    submitFinalData() {
        //first lets get all the checked symptoms items

        var allSymptoms = this.state.symptomsList;
        var selectedSymptoms = [];

        var operationCounter = 0;

        for (var i = 0; i < allSymptoms.length; i++) {
            var mainData = allSymptoms[i];
            //check if isCheched in the list is true then push to array

            if (mainData["isChecked"] == true) {
                selectedSymptoms.push(mainData["id"]);
            }

            operationCounter++
        }

        //check the selected symptoms length if is not 0
        if (operationCounter == allSymptoms.length) {
            if (selectedSymptoms.length == 0) {
                objectClass.displayToast("Please select at least one symptom");
                return false;
            }
            else {
                this.setState({ selectedSymptoms: selectedSymptoms })
            }
        }

        // Make the API call here
        fetch(baseUrl + apiRoute + 'symptoms/register/isolate', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.state.userId,
                selectedSymptoms: this.state.selectedSymptoms,
                selectedContacts: this.state.tracedUserIds
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                console.log("my response for submiting all checked symptoms")
                console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();

                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST
                    this.handleBackButtonClick();

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

    handleChange = (id) => {
        var temp = this.state.symptomsList.map((product) => {
            if (id === product.id) {
                return { ...product, isChecked: !product.isChecked };
            }
            return product;
        });
        console.log("TEMMPPP---->>>>", temp)
        this.setState({
            symptomsList: temp,
        });
    };

    renderFlatList = (renderData) => {
        return (
            <>
                {this.state.listReady == true ? (
                    <FlatList
                        data={renderData}
                        renderItem={({ item }) => (
                            <Card style={{ marginLeft: 20, marginRight: 21, marginTop: 15, borderRadius: 8 }}>
                                <View style={styles.card}>
                                    <View
                                        style={{
                                            marginLeft: 5,
                                            marginRight: 32,
                                            flexDirection: 'row',
                                            flex: 1,
                                            justifyContent: 'flex-start',
                                        }}>
                                        <Checkbox
                                            status={item.isChecked ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.handleChange(item.id);
                                            }}
                                        />
                                        <Text style={styles.labelTxt}>{item.label}{"\n"}{"\n"}<Text style={styles.descritptionTxt}>{item.description}</Text></Text>

                                    </View>
                                </View>
                            </Card>
                        )}
                    />
                ) : null}

                {/* Show loader */}
                {this.state.isLoading ? (
                    <ProgressBar color="#0051e0" style={{ marginTop: 20, marginBottom: 20 }} />
                ) : null}

                {this.state.listReady == true ? (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.solidButtonContainer}
                            onPress={() => this.onButtonPress()}>
                            <Text style={styles.solidButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

            </>
        );
    };

    render() {
        let selected = this.state.symptomsList?.filter((product) => product.isChecked);
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
                            <Text style={styles.headerText}>Check for symptoms</Text>
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

                <View style={styles.formBody}>
                    <Text style={styles.mainText}>Select all symptoms that applies to you</Text>
                </View>

                <View style={{ flex: 1 }}>
                    {this.renderFlatList(this.state.symptomsList)}

                </View>
                {/* <Text style={styles.text}>Selected </Text>
                    <View style={{ flex: 1 }}>{this.renderFlatList(selected)}</View> */}


            </>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 30,
        backgroundColor: '#ecf0f1',
        padding: 8,
    },

    card: {
        padding: 10,
        margin: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    text: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    headerBar: {
        backgroundColor: '#0051e0',

    },
    labelTxt: {
        marginTop: 7,
        fontSize: 20,
        lineHeight: 23,
        fontStyle: 'normal',
        fontWeight: '500',
        color: '#380507'
    },
    descritptionTxt: {
        fontSize: 16,
        lineHeight: 23,
        fontStyle: 'normal',
        color: '#380507'
    },
    mainText: {
        paddingLeft: 32,
        marginTop: 30,
        marginBottom: 10,
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
    buttonContainer: {
        marginTop: 10,
        paddingLeft: 44,
        paddingRight: 44,
        marginBottom: 10
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
export default withNavigation(SymptomsView);