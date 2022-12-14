//import liraries
import React, { Component } from 'react';
import { FlatList, SafeAreaView, StyleSheet, RefreshControl, ScrollView, View, Text, Image, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, SearchBar, Badge, Icon } from "react-native-elements";
import moment from 'moment';
import PositiveImage from '../../images/positive.jpg';
import NegativeImage from "../../images/negative.jpg";
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
class TestResultsView extends React.Component {
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
            allSelected: true,
            negativeSelected: false,
            positiveSelected: false,
            allNotSelected: false,
            negativeNotSelected: true,
            positiveNotSelected: true,
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

    //fetch test user results list
    fetchItemList() {
        this.showLoader();
        // Make the API call here
        fetch(baseUrl + apiRoute + 'booking/test/results', {
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

                    var testResultsData = responseJson.data;
                    this.setState({ data: testResultsData, itemData: testResultsData });

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

    // handle the searching
    searchFilterFunction = text => {
        // save what the user is searching for
        this.setState({
            value: text
        });

        // construct the new filtered data
        const newData = this.state.itemData.filter(item => {
            const itemData = `${item.test_result_status.toUpperCase()}`;
            const textData = text.toUpperCase();
            return itemData.includes(textData);
        });

        // Set the new filtered data to th
        this.setState({
            data: newData
        });
    };

    //handle button clicks
    onAllPress() {
        this.searchFilterFunction("");
        this.setState(
            {
                allSelected: true,
                allNotSelected: false,
                negativeSelected: false,
                negativeNotSelected: true,
                positiveSelected: false,
                positiveNotSelected: true
            }
        )
    }

    onNegativePress() {
        this.searchFilterFunction("negative");
        this.setState(
            {
                allSelected: false,
                allNotSelected: true,
                negativeSelected: true,
                negativeNotSelected: false,
                positiveSelected: false,
                positiveNotSelected: true
            }
        )
    }

    onPostivePress() {
        this.searchFilterFunction("positive");
        this.setState(
            {
                allSelected: false,
                allNotSelected: true,
                negativeSelected: false,
                negativeNotSelected: true,
                positiveSelected: true,
                positiveNotSelected: false
            }
        )
    }

    // Set the list items elements here
    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item }) => (
        <>
            {item.test_result_status.toUpperCase() == "POSITIVE" ? (
                <ListItem titleNumberOfLines={1} onPress={this.onButtonPress.bind(this, item)}
                    style={styles.listItemDiv} containerStyle={{ backgroundColor: "#FFFFFF" }}
                >

                    <Image source={NegativeImage} style={styles.imageBg} />

                    {/* <ListItem.Content> */}
                    <View style={styles.listContentView}>
                        <Text numberOfLines={1} style={styles.titleStyle}>{this.state.userId}</Text>

                        <Text numberOfLines={1} style={styles.subTitleStyle}>{"Booking # " + item.booking_code}</Text>
                        <Text numberOfLines={1} style={styles.subTitleStyle2}>{item.test_result_status}</Text>

                        <View style={styles.footerView}>
                            <Text style={styles.transactionDate}>{moment(item.test_result_date).format('D MMM')}</Text>
                            <Badge
                                value={"POSITIVE"}
                                badgeStyle={{ backgroundColor: '#F20000' }}
                                textStyle={{ color: '#FFFFFF', fontSize: 9, lineHeight: 11, fontFamily: 'Montserrat-Medium', }}
                            />
                        </View>
                    </View>
                    {/* </ListItem.Content> */}
                </ListItem>
            ) : null}

            {item.test_result_status.toUpperCase() == "NEGATIVE" ? (
                <ListItem titleNumberOfLines={1} onPress={this.onButtonPress.bind(this, item)}
                    style={styles.listItemDiv} containerStyle={{ backgroundColor: "#FFFFFF" }}
                >

                    <Image source={PositiveImage} style={styles.imageBg} />

                    {/* <ListItem.Content> */}
                    <View style={styles.listContentView}>
                        <Text numberOfLines={1} style={styles.titleStyle}>{this.state.userId}</Text>

                        <Text numberOfLines={1} style={styles.subTitleStyle}>{"Booking # " + item.booking_code}</Text>
                        <Text numberOfLines={1} style={styles.subTitleStyle2}>{item.test_result_status}</Text>

                        <View style={styles.footerView}>
                            <Text style={styles.transactionDate}>{moment(item.test_result_date).format('D MMM')}</Text>
                            <Badge
                                value={"NEGATIVE"}
                                badgeStyle={{ backgroundColor: '#4BB543' }}
                                textStyle={{ color: '#FFFFFF', fontSize: 9, lineHeight: 11, fontFamily: 'Montserrat-Medium' }}
                            />
                        </View>
                    </View>
                    {/* </ListItem.Content> */}
                </ListItem>
            ) : null}

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
                            <Text style={styles.headerText}>Test Results</Text>
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
                {/* Arrange the month and year pickers */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 15,
                    marginBottom: 15,
                    marginLeft: 31,
                    marginRight: 28
                }}>
                    {/* Selected buttons */}

                    {this.state.allSelected ? (
                        <View style={styles.mainButtonContainer}>
                            <TouchableOpacity style={styles.mainButton}
                                onPress={() => this.onAllPress()}>
                                <Text style={styles.mainButtonText}>ALL</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {this.state.allNotSelected ? (
                        <View style={styles.otherButtonContainer}>
                            <TouchableOpacity style={styles.otherButton}
                                onPress={() => this.onAllPress()}>
                                <Text style={styles.otherButtonText}>ALL</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {this.state.negativeSelected ? (
                        <View style={styles.mainButtonContainer}>
                            <TouchableOpacity style={styles.mainButton}
                                onPress={() => this.onNegativePress()}>
                                <Text style={styles.mainButtonText}>NEGATIVE</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {this.state.negativeNotSelected ? (
                        <View style={styles.otherButtonContainer}>
                            <TouchableOpacity style={styles.otherButton}
                                onPress={() => this.onNegativePress()}>
                                <Text style={styles.otherButtonText}>NEGATIVE</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {this.state.positiveSelected ? (
                        <View style={styles.mainButtonContainer}>
                            <TouchableOpacity style={styles.mainButton}
                                onPress={() => this.onPostivePress()}>
                                <Text style={styles.mainButtonText}>POSITIVE</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    {this.state.positiveNotSelected ? (
                        <View style={styles.otherButtonContainer}>
                            <TouchableOpacity style={styles.otherButton}
                                onPress={() => this.onPostivePress()}>
                                <Text style={styles.otherButtonText}>POSITIVE</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                </View>

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

                {/* Show loader */}
                {this.state.isLoading ? (
                    <ProgressBar color="#0051e0" style={{ marginTop: 20, marginBottom: 20 }} />
                ) : null}

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

    mainButtonContainer: {
        width: 105
    },
    mainButton: {
        backgroundColor: '#0065de',
        borderRadius: 8,
        height: 54,
    },
    mainButtonText: {
        color: '#FBFBFB',
        textAlign: 'center',
        paddingTop: 16,
        fontSize: 16,
        lineHeight: 20,

        fontFamily: 'Montserrat-Medium',

    },
    otherButtonContainer: {
        width: 105
    },
    otherButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        height: 54,
    },
    otherButtonText: {
        color: '#212121',
        textAlign: 'center',
        paddingTop: 16,
        fontSize: 16,
        lineHeight: 20,

        fontFamily: 'Montserrat-Medium',

    },
    singleButtonText: {
        color: '#666666',
        textAlign: 'center',
        paddingTop: 16,
        fontSize: 16,
        lineHeight: 20,

    },
});

//make this component available to the app
export default withNavigation(TestResultsView);