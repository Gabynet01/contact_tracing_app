//import liraries
import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, FlatList, StyleSheet, ScrollView, View, Text, StatusBar, Image, Dimensions, PermissionsAndroid, TouchableOpacity, Alert } from 'react-native';
// import { Avatar, Card } from 'react-native-elements';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, Icon } from 'react-native-elements'
import appLogo from '../../images/contact-tracing.png';
import Geolocation from 'react-native-geolocation-service';
import profileImage from "../../images/profileIcon.png";

const list = [
    {
        title: 'Test for Covid-19',
        icon: 'device-thermostat'
    },
    {
        title: 'Check for Symptoms',
        icon: 'money'
    },
    {
        title: 'Self Isolation Period',
        icon: 'smartphone'
    },
    {
        title: 'Test Results',
        icon: 'pending-actions'
    },
    {
        title: 'Manage Contact Tracing',
        icon: 'groups'
    },
];


const win = Dimensions.get('window');
var allConfig = require('../Utilities/Config');
const baseUrl = allConfig["apiData"]["baseUrl"];
const apiRoute = allConfig["apiData"]["apiRoute"];
var allHelpers = require('../Utilities/Helpers');
const objectClass = allHelpers["Helpers"];


// create a component
class DashboardMenuView extends React.Component {
    // Constructor for this component
    constructor(props) {
        super(props);
        // Declare variables here
        this.state = {
            userId: '',
            usermobile: '',
            location: "",
            lastPosition: "",
            latitude: 0.1,
            longitude: 0.1,
            timer: 10000,
            counter: 0
        }
    }

    static navigationOptions = {
        headerShown: false,
    };

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

                        this.updateContactLocation();

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
            // lets get data in the storage
            AsyncStorage.getItem("allUserData")
                .then((result) => {
                    //request for device permissions to use GEOLOCATION services
                     //make call to update contact location every 1 minute
                    setInterval(this.requestLocationPermission.bind(this),10000);
                     
                    var allUserData = JSON.parse(result);
                    this.setState({ usermobile: allUserData[0]["phone_number"] });
                    this.setState({ userId: allUserData[0]["upsa_id"] });
                })

        }
    }

    //this function is used to update the location coordinates
    updateContactLocation() {
        // Make the API call here
        fetch(baseUrl + apiRoute + 'location/save', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                mobile: this.state.usermobile,
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                //console.log("my response for update user location")
                //console.log(responseJson)

                if (responseJson.code == "200") {
                    console.log("Successfully updated user location from device app-->", responseJson.message);
                }
                else {
                    console.log("Failed to update user location--->", responseJson.message)
                }
            })
            .catch((error) => {
                console.log(error)
                objectClass.displayToast("Could not connect to server to update user location");
            });

    }

    //go to logout 
    gotoLogout = () => {
        // this.hideBottomNavigationView();

        //show this
        Alert.alert(
            //title
            'Are you sure?',
            //body
            'By logging out, all your session data wil be cleared. Do you want to log out?',
            [
                {
                    text: 'Yes', style: "default", onPress: () => {
                        // Clear storage
                        AsyncStorage.clear();
                        // Display Logout Message
                        objectClass.displayToast("You are logged out");
                        // Reset the navigation Stack for back button press
                        this.props
                            .navigation
                            .navigate("LoginPage");
                    }
                },
                { text: 'No', onPress: () => objectClass.displayToast("Welcome Back"), style: 'cancel' },
            ],
            { cancelable: false }
            //clicking out side of alert will not cancel
        )
    }


    // This is called when an item is clicked
    gotoPage(rowData) {
        if (rowData.title.toUpperCase().includes("COVID")) {
            this.props.navigation.navigate('CovidTestPage', { listItemData: rowData });
        }
        if (rowData.title.toUpperCase().includes("SYMPTOMS")) {
            this.props.navigation.navigate('SymptomsPage', { listItemData: rowData });
        }
        if (rowData.title.toUpperCase().includes("ISOLATION")) {
            this.props.navigation.navigate('IsolationPage', { listItemData: rowData });
        }
        if (rowData.title.toUpperCase().includes("RESULTS")) {
            this.props.navigation.navigate('TestResultPage', { listItemData: rowData });
        }
        if (rowData.title.toUpperCase().includes("MANAGE")) {
            this.props.navigation.navigate('ManageContactsPage', { listItemData: rowData });
        }
    }

    renderHeader = () => {
        return (
            <>

                <View style={styles.headerBar}>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 15,
                        // marginLeft: 31,
                        marginRight: 30

                    }}>
                        <Text style={styles.headerText}>UPSA Contact Tracing</Text>
                        <TouchableOpacity onPress={() => this.gotoLogout()}>
                            <Image style={styles.profileImage}
                                source={profileImage}
                            />
                        </TouchableOpacity>

                    </View>
                </View>


                <View style={styles.logoBody}>
                    <View style={styles.centerItems}>
                        <Image style={styles.logoContainer}
                            source={appLogo}
                        />
                    </View>
                </View>
            </>
        )
    };
    // Set the list items elements here
    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <>
            {item.title.toUpperCase().includes("COVID-19") ? (
                <ListItem onPress={this.gotoPage.bind(this, item)} style={styles.listItemDiv} containerStyle={{ backgroundColor: "#0051e0" }}>
                    <Icon name={item.icon} color="#FFF" />
                    <ListItem.Content style={styles.listContentView}>
                        <ListItem.Title style={styles.textStyle}>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            ) : null}

            {item.title.toUpperCase().includes("SYMPTOMS") ? (
                <ListItem onPress={this.gotoPage.bind(this, item)} style={styles.listItemDiv} containerStyle={{ backgroundColor: "#e0003b" }}>
                    <Icon name={item.icon} color="#FFF" />
                    <ListItem.Content style={styles.listContentView}>
                        <ListItem.Title style={styles.textStyle}>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            ) : null}

            {item.title.toUpperCase().includes("ISOLATION") ? (
                <ListItem onPress={this.gotoPage.bind(this, item)} style={styles.listItemDiv} containerStyle={{ backgroundColor: "#e08200" }}>
                    <Icon name={item.icon} color="#FFF" />
                    <ListItem.Content style={styles.listContentView}>
                        <ListItem.Title style={styles.textStyle}>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            ) : null}

            {item.title.toUpperCase().includes("RESULTS") ? (
                <ListItem onPress={this.gotoPage.bind(this, item)} style={styles.listItemDiv} containerStyle={{ backgroundColor: "#006be0" }}>
                    <Icon name={item.icon} color="#FFF" />
                    <ListItem.Content style={styles.listContentView}>
                        <ListItem.Title style={styles.textStyle}>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            ) : null}

            {item.title.toUpperCase().includes("MANAGE") ? (
                <ListItem onPress={this.gotoPage.bind(this, item)} style={styles.listItemDiv} containerStyle={{ backgroundColor: "#00d18e" }}>
                    <Icon name={item.icon} color="#FFF" />
                    <ListItem.Content style={styles.listContentView}>
                        <ListItem.Title style={styles.textStyle}>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            ) : null}

        </>
    )

    render() {
        return (
            <>
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={list}
                    ListHeaderComponent={this.renderHeader}
                    renderItem={this.renderItem}
                />
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
        paddingLeft: 32,
        marginTop: 8,
        fontSize: 18,
        lineHeight: 23,
        color: '#212121',
        fontFamily: 'Montserrat-Bold',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 16
    },
    headerText: {
        color: "#FFF",
        fontStyle: 'normal',
        fontWeight: '500',
        paddingLeft: 32,
        marginTop: 8,
        marginBottom: 15,
        fontSize: 22,
        lineHeight: 25,
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
        marginBottom: 20,
        width: 500,
        height: 240,
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
});

//make this component available to the app
export default withNavigation(DashboardMenuView);