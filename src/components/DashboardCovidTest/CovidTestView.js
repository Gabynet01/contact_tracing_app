//import liraries
import React, { Component } from 'react';
import { SafeAreaView, FlatList, StyleSheet, ScrollView, View, Text, StatusBar, Image, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from '@react-native-community/progress-bar-android';
import { withNavigation, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, Icon, Badge } from 'react-native-elements'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import appLogo from '../../images/contact-tracing-rg.png';
import moment from 'moment';
import BookingImage from '../../images/booking.png';

const win = Dimensions.get('window');
var allConfig = require('../Utilities/Config');
const baseUrl = allConfig["apiData"]["baseUrl"];
const apiRoute = allConfig["apiData"]["apiRoute"];
var allHelpers = require('../Utilities/Helpers');
const objectClass = allHelpers["Helpers"];

// create a component
class CovidTestView extends React.Component {
    // Constructor for this component
    constructor(props) {
        super(props);
        // Declare variables here
        this.state = {
            loggedInUserName: '',
            userId: '',
            isLoading: false,
            state: false,
            allowBooking: null,
            bookedDate: "",
            displayText: "",
            upsaId: "",
            bookingCode: "",
            appointmentDate: ""
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

            //first make the call to check user booking
            this.checkUserBooking(dataStored);
        }
    }

    //check user booking
    checkUserBooking(userId) {
        this.showLoader();
        // Make the API call here
        fetch(baseUrl + apiRoute + 'booking/check', {
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

                // console.log("my response for checking booking")
                // console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();

                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST
                    this.setState({ displayText: "See your scheduled appointment", allowBooking: false });

                    //set the data into the card
                    var bookingData = responseJson.data[0];
                    this.setState({ bookingCode: bookingData["booking_code"], appointmentDate: bookingData["booked_date"] })
                }

                //if 201, show booking calendar
                else if (responseJson.code == "201") {

                    this.hideLoader();

                    objectClass.displayToast(objectClass.toTitleCase(responseJson.message)); //DISPLAY TOAST

                    //show the calendar
                    this.setState({ displayText: "Select a day from the available dates", allowBooking: true });

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

    //book user 
    onButtonPress() {
        if (this.state.bookedDate.trim() == "") {
            objectClass.displayToast("Kindly select a date before confirming your booking");
            return false;
        }
        console.log(this.state.bookedDate)
        this.showLoader();
        // Make the API call here
        fetch(baseUrl + apiRoute + 'booking/register', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.state.userId,
                selectedDate: this.state.bookedDate + " 11:00 AM"
            }),
        })
            .then((response) => response.json())
            .then((responseJson) => {

                // console.log("my response for checking booking")
                // console.log(responseJson)

                if (responseJson.code == "200") {

                    this.hideLoader();
                    this.checkUserBooking(this.state.userId);
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

    //mark the selected dates with color
    getSelectedDayEvents = date => {
        let markedDates = {};
        markedDates[date] = { selected: true, color: '#0051e0', textColor: '#FFFFFF' };

        this.setState({
            markedDates: markedDates
        });
    };

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
                            <Text style={styles.headerText}>Book Your Covid Test</Text>
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
                    <Text style={styles.mainText}>{this.state.displayText}</Text>
                </View>

                {this.state.allowBooking == false ? (
                    <ListItem titleNumberOfLines={1}
                        style={styles.listItemDiv} containerStyle={{ backgroundColor: "#FFFFFF" }}
                    >
                        <Image source={BookingImage} style={styles.imageBg} />

                        <View style={styles.listContentView}>
                            <Text numberOfLines={1} style={styles.titleStyle}>{this.state.userId}</Text>

                            <Text numberOfLines={1} style={styles.subTitleStyle}>{"Booking # " + this.state.bookingCode}</Text>
                            <Text numberOfLines={1} style={styles.subTitleStyle2}>UPSA Clinic</Text>

                            <View style={styles.footerView}>
                                <Text style={styles.transactionDate}>{moment(this.state.appointmentDate).format('D MMM : h:MM A')}</Text>
                                <Badge
                                    value={"PENDING"}
                                    badgeStyle={{ backgroundColor: '#4BB543' }}
                                    textStyle={{ color: '#FFFFFF', fontSize: 9, lineHeight: 11, fontFamily: 'Montserrat-Medium' }}
                                />
                            </View>
                        </View>
                    </ListItem>
                ) : null}

                {this.state.allowBooking == true ? (
                    <Calendar
                        // Initially visible month. Default = now
                        current={moment().startOf('day').format('YYYY-MM-DD')}
                        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                        minDate={moment().startOf('day').add(1, 'days').format('YYYY-MM-DD')}
                        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
                        maxDate={moment().startOf('day').add(14, 'days').format('YYYY-MM-DD')}
                        // Handler which gets executed on day press. Default = undefined
                        onDayPress={day => {
                            console.log('selected day', day);
                            //set the date value selected into memory
                            this.setState({ bookedDate: day.dateString });
                            this.getSelectedDayEvents(day.dateString);
                        }}
                        // Handler which gets executed on day long press. Default = undefined
                        onDayLongPress={day => {
                            console.log('selected day', day);
                            //set the date value selected into memory
                            this.setState({ bookedDate: day.dateString });
                        }}
                        // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                        monthFormat={'MMMM yyyy '}
                        // Handler which gets executed when visible month changes in calendar. Default = undefined
                        onMonthChange={month => {
                            console.log('month changed', month);
                        }}
                        markedDates={this.state.markedDates}
                        // Hide month navigation arrows. Default = false
                        hideArrows={false}
                        // Replace default arrows with custom ones (direction can be 'left' or 'right')
                        // renderArrow={direction => <Arrow />}
                        // Do not show days of other months in month page. Default = false
                        hideExtraDays={false}
                        // If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
                        // day from another month that is visible in calendar page. Default = false
                        disableMonthChange={false}
                        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
                        firstDay={7}
                        // Hide day names. Default = false
                        hideDayNames={false}
                        // Show week numbers to the left. Default = false
                        showWeekNumbers={false}
                        // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                        onPressArrowLeft={subtractMonth => subtractMonth()}
                        // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                        onPressArrowRight={addMonth => addMonth()}
                        // Disable left arrow. Default = false
                        disableArrowLeft={false}
                        // Disable right arrow. Default = false
                        disableArrowRight={false}
                        // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
                        disableAllTouchEventsForDisabledDays={true}
                        // Replace default month and year title with custom one. the function receive a date as parameter
                        // renderHeader={date => {
                        //     /*Return JSX*/
                        // }}
                        // Enable the option to swipe between months. Default = false
                        enableSwipeMonths={true}
                    />

                ) : null}

                {/* Show loader */}
                {this.state.isLoading ? (
                    <ProgressBar color="#0051e0" style={{ marginTop: 20, marginBottom: 20 }} />
                ) : null}

                {this.state.allowBooking == true ? (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.solidButtonContainer}
                            onPress={() => this.onButtonPress()}>
                            <Text style={styles.solidButtonText}>Confirm Booking</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}


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
        marginTop: 30,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 0,
        marginTop: 8,
        marginBottom: 10
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
        marginTop: 20,
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
});

//make this component available to the app
export default withNavigation(CovidTestView);