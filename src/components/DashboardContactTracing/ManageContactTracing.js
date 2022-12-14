//import liraries
import React, { Component } from 'react';
import { FlatList, SafeAreaView, PermissionsAndroid, StyleSheet, RefreshControl, ScrollView, View, Text, Image, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, SearchBar, Badge, Icon } from "react-native-elements";
import moment from 'moment';
import appLogo from '../../images/contact-tracing-rg.png';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from '@react-native-community/progress-bar-android';

const win = Dimensions.get('window');
var allConfig = require('../Utilities/Config');
const baseUrl = allConfig["apiData"]["baseUrl"];
const apiRoute = allConfig["apiData"]["apiRoute"];
var allHelpers = require('../Utilities/Helpers');
const objectClass = allHelpers["Helpers"];

// create a component
class ManageContactTracingView extends React.Component {
    // Constructor for this component
    constructor(props) {
        super(props);
        this.state = {
            textDisable: false,
            isListReady: false,
            isFetching: false,
            value: '',
            data: [],
            itemData: [],
            latitude: 0.1,
            longitude: 0.1
        }
    }

    static navigationOptions = {
        headerShown: false,
    };

    // Handle pull to refresh
    onRefresh() {
        this.setState({ isFetching: true },
            function () {
                this.fetchItemList();
            }
        );
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

                        //first make the call to get isolation days
                        this.fetchItemList();

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
        }
    }

    //fetch test user results list
    fetchItemList() {
        this.showLoader();
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

                // console.log("my response for isolation days count")
                // console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();

                    var tracedData = responseJson.data;
                    this.setState({ data: tracedData, itemData: tracedData });

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

    // Set the list items elements here
    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <>
            <ListItem titleNumberOfLines={1} onPress={this.onButtonPress.bind(this, item)}
                style={styles.listItemDiv} containerStyle={{ backgroundColor: "#FFFFFF" }}
            >

                <Image source={appLogo} style={styles.imageBg} />

                {/* <ListItem.Content> */}
                <View style={styles.listContentView}>
                    <Text numberOfLines={1} style={styles.titleStyle}>{item.device_id.substring(0,5) + "XXXXX"}</Text>

                    <Text numberOfLines={1} style={styles.subTitleStyle}>{"Latitude: " + item.latitude}</Text>
                    <Text numberOfLines={1} style={styles.subTitleStyle}>{"Longitude: " + item.longitude}</Text>
                    <Text numberOfLines={1} style={styles.subTitleStyle}>{"Last Location: " + item.location_name}</Text>

                    <View style={styles.footerView}>
                        <Text style={styles.transactionDate}>Last seen: {moment(item.traced_date).format('D MMM: h:MM A')}</Text>
                        <Badge
                            value={item.location_name}
                            badgeStyle={{ backgroundColor: '#0051e0' }}
                            textStyle={{ color: '#FFFFFF', fontSize: 9, lineHeight: 11, fontFamily: 'Montserrat-Medium', }}
                        />
                    </View>
                </View>
                {/* </ListItem.Content> */}
            </ListItem>
        </>

    )

    // render the SearchBar here as the header of the list
    renderHeader = () => {
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
                            <Text style={styles.headerText}>Contacts Traced to me</Text>
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

                <View style={{ marginTop: 30 }}></View>

            </>
        );
    };


    // This is called when an item is clicked
    onButtonPress(rowData) {
        console.log("item pressed--->>>>", rowData);
    }


    render() {
        return (
            // <ScrollView>
            <View style={styles.container}>

                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.data}
                    renderItem={this.renderItem}
                    // ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader}
                    onRefresh={() => this.onRefresh()}
                    refreshing={this.state.isFetching}
                // stickyHeaderIndices={[0]}
                />

            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerBar: {
        backgroundColor: '#0051e0',
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
    footerView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 0,
        marginTop: 8
    },
    transactionDate: {
        fontSize: 12,
        lineHeight: 15,
        color: '#666666',
        fontFamily: 'Montserrat-Regular',
    },
    titleStyle: {
        fontSize: 16,
        lineHeight: 20,
        marginBottom: 7,
        color: "#212121",
        fontFamily: 'Montserrat-Bold',
    },
    subTitleStyle: {
        fontSize: 15,
        lineHeight: 19,
        color: "#666666",
        fontFamily: 'Montserrat-Regular',
    },
    subTitleStyle2: {
        fontSize: 15,
        lineHeight: 19,
        marginTop: 5,
        color: "#212121",
        fontFamily: 'Montserrat-Medium',
    },
    imageBg: {
        width: 50,
        height: 50,
        resizeMode: "cover",
        justifyContent: "center",
    },
    imageAvatar: {
        width: 20,
        height: 20,
        marginLeft: 15,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    logoContainer: {
        flex: 1,
        aspectRatio: 0.2,
        resizeMode: 'contain',
    },
    centerItems: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },

});

//make this component available to the app
export default withNavigation(ManageContactTracingView);