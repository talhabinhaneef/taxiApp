import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    TouchableWithoutFeedback, Alert
} from 'react-native';
import { Icon, Button, Header } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { language } from 'config';
import { FirebaseContext } from 'common/src';

export default function FareScreen(props) {
    const { api } = useContext(FirebaseContext);
    const {
        addBooking,
        clearEstimate,
        clearBooking
    } = api;
    const dispatch = useDispatch();

    const settings = useSelector(state => state.settingsdata.settings);
    const tripdata = useSelector(state => state.tripdata);
    const auth = useSelector(state => state.auth);
    const estimate = useSelector(state => state.estimatedata.estimate);
    const bookingdata = useSelector(state => state.bookingdata);

    const mapRef = useRef(null);

    const [buttonDisabled, setButtonDisabled] = useState(false);

    const onPressCancel = () => {
        setButtonDisabled(false);
        props.navigation.goBack();
    }

    useEffect(() => {
        setTimeout(() => {
            mapRef.current.fitToCoordinates([{ latitude: tripdata.pickup.lat, longitude: tripdata.pickup.lng }, { latitude: tripdata.drop.lat, longitude: tripdata.drop.lng }], {
                edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                animated: true,
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (bookingdata.booking) {
            dispatch(clearEstimate());
            dispatch(clearBooking());
            if(bookingdata.booking.mainData.bookLater){
                props.navigation.navigate('RideList');
            }else{
                props.navigation.navigate('BookedCab',{bookingId:bookingdata.booking.booking_id});
            }
        }
        if (bookingdata.error && bookingdata.error.flag) {
            Alert.alert(bookingdata.error.msg);
            dispatch(clearBooking());
        }
    }, [bookingdata.booking, bookingdata.error, bookingdata.error.flag]);

    const bookNow = () => {
        setButtonDisabled(true);
        dispatch(addBooking({
            pickup: estimate.pickup,
            drop: estimate.drop,
            carDetails: estimate.carDetails,
            userDetails: auth.info,
            estimate: estimate,
            tripdate: estimate.bookLater ? new Date(estimate.bookingDate).toString() : new Date().toString(),
            bookLater: estimate.bookLater,
            settings: settings,
            booking_type_web: false
        }));
    };

    return (
        <View style={styles.container}>
            <Header
                backgroundColor={colors.GREY.default}
                leftComponent={{ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } }}
                centerComponent={<Text style={styles.headerTitleStyle}>{language.confrim_booking}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={styles.headerInnerStyle}
            />

            <View style={styles.topContainer}>
                <View style={styles.topLeftContainer}>
                    <View style={styles.circle} />
                    <View style={styles.staightLine} />
                    <View style={styles.square} />
                </View>
                <View style={styles.topRightContainer}>
                    <TouchableOpacity style={styles.whereButton}>
                        <View style={styles.whereContainer}>
                            <Text numberOfLines={1} style={styles.whereText}>{tripdata.pickup.add}</Text>
                            <Icon
                                name='gps-fixed'
                                color={colors.WHITE}
                                size={23}
                                containerStyle={styles.iconContainer}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropButton}>
                        <View style={styles.whereContainer}>
                            <Text numberOfLines={1} style={styles.whereText}>{tripdata.drop.add}</Text>
                            <Icon
                                name='search'
                                type='feather'
                                color={colors.WHITE}
                                size={23}
                                containerStyle={styles.iconContainer}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.mapcontainer}>
                {tripdata && tripdata.pickup.lat ?
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: (tripdata.pickup.lat),
                            longitude: (tripdata.pickup.lng),
                            latitudeDelta: 0.9922,
                            longitudeDelta: 1.9421
                        }}
                    >
                        <Marker
                            coordinate={{ latitude: (tripdata.pickup.lat), longitude: (tripdata.pickup.lng) }}
                            title={tripdata.pickup.add}
                            pinColor={colors.GREEN.default}
                        >
                        </Marker>


                        <Marker
                            coordinate={{ latitude: (tripdata.drop.lat), longitude: (tripdata.drop.lng) }}
                            title={tripdata.drop.add}
                        >
                        </Marker>

                        {estimate && estimate.waypoints ?
                            <MapView.Polyline
                                coordinates={estimate.waypoints}
                                strokeWidth={4}
                                strokeColor={colors.BLUE.default}
                            />
                            : null}

                    </MapView>
                    : null}
            </View>
            <View style={styles.bottomContainer}>
                <View style={styles.offerContainer}>
                    <TouchableOpacity >
                        <Text style={styles.offerText}> {language.estimate_fare_text}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.priceDetailsContainer}>
                    <View style={styles.priceDetailsLeft}>
                        <View style={styles.priceDetails}>
                            <View style={styles.totalFareContainer}>
                                <Text style={styles.totalFareText}>{language.total_fare}</Text>
                            </View>
                            <Icon
                                name='info'
                                color={colors.WHITE}
                                type='simple-line-icon'
                                size={15}
                                containerStyle={styles.infoIcon}
                            />
                        </View>

                        <View style={styles.iconContainer}>
                            <Text style={styles.priceText}> {settings ? settings.symbol : null} {estimate ? estimate.estimateFare : null}</Text>
                        </View>

                    </View>
                    <View style={styles.priceDetailsMiddle}>
                        <View style={styles.triangle} />
                        <View style={styles.lineHorizontal} />
                    </View>
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/images/paytm_logo.png')} style={styles.logoImage} />
                    </View>
                </View>
                <View style={styles.buttonsContainer}>
                    <View style={styles.iconContainer}>
                        <Button
                            title={language.cancel}
                            loading={false}
                            loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
                            titleStyle={styles.buttonText}
                            onPress={onPressCancel}
                            buttonStyle={styles.buttonStyle}
                            containerStyle={styles.buttonContainerStyle}
                        />
                    </View>
                    <View style={styles.flexView}>
                        <Button
                            title={language.confrim_booking}
                            loading={false}
                            loadingProps={{ size: "large", color: colors.BLUE.default.primary }}
                            titleStyle={styles.buttonText}
                            disabled={buttonDisabled}
                            onPress={bookNow}
                            buttonStyle={styles.confirmButtonStyle}
                            containerStyle={styles.confirmButtonContainerStyle}
                        />
                    </View>
                </View>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.GREY.default,
        borderBottomWidth: 0
    },
    headerInnerStyle: {
        marginLeft: 10,
        marginRight: 10
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 18
    },
    container: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight
    },
    topContainer: {
        flex: 1.5,
        flexDirection: 'row',
        borderTopWidth: 0,
        alignItems: 'center',
        backgroundColor: colors.GREY.default,
        paddingEnd: 20
    },
    topLeftContainer: {
        flex: 1.5,
        alignItems: 'center'
    },
    topRightContainer: {
        flex: 9.5,
        justifyContent: 'space-between',
    },
    circle: {
        height: 12,
        width: 12,
        borderRadius: 15 / 2,
        backgroundColor: colors.YELLOW.light
    },
    staightLine: {
        height: height / 25,
        width: 1,
        backgroundColor: colors.YELLOW.light
    },
    square: {
        height: 14,
        width: 14,
        backgroundColor: colors.GREY.iconPrimary
    },
    whereButton: { flex: 1, justifyContent: 'center', borderBottomColor: colors.WHITE, borderBottomWidth: 1 },
    whereContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    whereText: { flex: 9, fontFamily: 'Roboto-Regular', fontSize: 14, fontWeight: '400', color: colors.WHITE },
    iconContainer: { flex: 1 },
    dropButton: { flex: 1, justifyContent: 'center' },
    mapcontainer: {
        flex: 7,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    bottomContainer: { flex: 2.5, alignItems: 'center' },
    offerContainer: { flex: 1, backgroundColor: colors.YELLOW.secondary, width: width, justifyContent: 'center', borderBottomColor: colors.YELLOW.primary, borderBottomWidth: Platform.OS == 'ios' ? 1 : 0 },
    offerText: { alignSelf: 'center', color: colors.GREY.btnPrimary, fontSize: 12, fontFamily: 'Roboto-Regular' },
    priceDetailsContainer: { flex: 2.3, backgroundColor: colors.WHITE, flexDirection: 'row', position: 'relative', zIndex: 1 },
    priceDetailsLeft: { flex: 19 },
    priceDetailsMiddle: { flex: 2, height: 50, width: 1, alignItems: 'center' },
    priceDetails: { flex: 1, flexDirection: 'row' },
    totalFareContainer: { flex: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    totalFareText: { color: colors.GREY.btnPrimary, fontFamily: 'Roboto-Bold', fontSize: 15, marginLeft: 40 },
    infoIcon: { flex: 2, alignItems: 'center', justifyContent: 'center' },
    priceText: { alignSelf: 'center', color: colors.GREY.iconSecondary, fontFamily: 'Roboto-Bold', fontSize: 20 },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: colors.TRANSPARENT,
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderBottomWidth: 10,
        borderLeftColor: colors.TRANSPARENT,
        borderRightColor: colors.TRANSPARENT,
        borderBottomColor: colors.YELLOW.secondary,
        transform: [
            { rotate: '180deg' }
        ],
        marginTop: -1, overflow: 'visible'
    },
    lineHorizontal: { height: height / 18, width: 1, backgroundColor: colors.BLACK, alignItems: 'center', marginTop: 10 },
    logoContainer: { flex: 19, alignItems: 'center', justifyContent: 'center' },
    logoImage: { width: 80, height: 80 },
    buttonsContainer: { flex: 1.5, flexDirection: 'row' },
    buttonText: { color: colors.WHITE, fontFamily: 'Roboto-Bold', fontSize: 17, alignSelf: 'flex-end' },
    buttonStyle: { backgroundColor: colors.GREY.secondary, elevation: 0 },
    buttonContainerStyle: { flex: 1, backgroundColor: colors.GREY.secondary },
    confirmButtonStyle: { backgroundColor: colors.GREY.btnPrimary, elevation: 0 },
    confirmButtonContainerStyle: { flex: 1, backgroundColor: colors.GREY.btnPrimary },

    flexView: {
        flex: 1
    }
});
