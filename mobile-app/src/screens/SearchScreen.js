import React, { useContext } from 'react';
import { Platform, StatusBar, Button, Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors } from '../common/theme';
import {
    Google_Map_Key,
    language
} from 'config';
import { useDispatch } from 'react-redux';
import { FirebaseContext } from 'common/src';

export default function SearchScreen(props) {
    const { api } = useContext(FirebaseContext);
    const {
        fetchCoordsfromPlace,
        updateTripPickup,
        updateTripDrop
    } = api;
    const dispatch = useDispatch();
    const locationType = props.navigation.getParam('locationType');

    const updateLocation = (data) => {
        fetchCoordsfromPlace(data.place_id).then((res)=>{
            if(res && res.lat){
                if(locationType=='pickup'){
                    dispatch(updateTripPickup({
                        lat:res.lat,
                        lng:res.lng,
                        add:data.description,
                        source: 'search'
                    }));
                }else{
                    dispatch(updateTripDrop({
                        lat:res.lat,
                        lng:res.lng,
                        add:data.description,
                        source: 'search'
                    }));
                }

                props.navigation.pop();
            }else{
                Alert.alert(language.alert,language.place_to_coords_error);
            }
        });
    }

    return (
        <GooglePlacesAutocomplete
            placeholder={language.search}
            minLength={2} // minimum length of text to search
            autoFocus={true}
            returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
            listViewDisplayed='auto'  // true/false/undefined
            fetchDetails={true}
            renderLeftButton={() => <Button
                title="Back"
                onPress={() => { props.navigation.goBack(); }}
            />
            }
            textInputProps={{ clearButtonMode: 'while-editing' }}
            onPress={(data) => { // 'details' is provided when fetchDetails = true
                updateLocation(data);
            }}

            query={{
                key: Google_Map_Key,
                language: 'en', // language of the results
            }}

            styles={{
                container: {
                    marginTop: Platform.OS == 'android' ? StatusBar.currentHeight : 44,
                    backgroundColor: colors.GREY.default
                },
                textInputContainer: {
                    width: '100%',
                },
                description: {
                    fontWeight: 'bold'
                },
                description: {
                    color: colors.WHITE
                },
                predefinedPlacesDescription: {
                    color: colors.BLUE.light
                },
            }}
            renderDescription={(row) => row.description || row.formatted_address || row.name}
            fetchDetails={false}
            minLength={4}
            debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
        />
    );
}