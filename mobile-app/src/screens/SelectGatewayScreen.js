import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, TouchableHighlight, Image, TouchableWithoutFeedback, Text, Alert } from 'react-native';
import { Header, } from 'react-native-elements';
import { language } from 'config';
import { colors } from '../common/theme';
import PaymentWebView from '../components/PaymentWebView';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';

export default function SelectGatewayPage(props) {
  const { api } = useContext(FirebaseContext);
  const {
    updateWalletBalance,
    clearMessage,
    updateBooking
  } = api;
  const dispatch = useDispatch();

  const [state, setState] = useState({
    payData: props.navigation.getParam('payData'),
    providers: props.navigation.getParam('providers'),
    userdata: props.navigation.getParam('userdata'),
    settings: props.navigation.getParam('settings'),
    booking: props.navigation.getParam('booking'),
    selectedProvider: null
  });

  const paymentmethods = useSelector(state => state.paymentmethods);
  useEffect(()=>{
    if(paymentmethods.message){
      Alert.alert(language.alert,paymentmethods.message);
      dispatch(clearMessage());
    }
  },[paymentmethods.message]);


  const onSuccessHandler = (order_details) => {
    if (state.booking) {
      let curBooking = { ...state.booking };
      curBooking.status = 'PAID';
      curBooking.gateway = order_details.gateway,
      curBooking.transaction_id = order_details.transaction_id,
      dispatch(updateBooking(curBooking));
      
      if(state.booking.usedWalletMoney>0){
        let walletBalance = state.userdata.walletBalance - state.booking.usedWalletMoney;
        let tDate = new Date();
        let details = {
          type: 'Debit',
          amount: state.booking.usedWalletMoney,
          date: tDate.toString(),
          txRef: state.booking.id,
          transaction_id: state.booking.id
        }
        dispatch(updateWalletBalance(walletBalance,details));
      }
      setTimeout(() => {
        props.navigation.navigate('DriverRating',{booking:curBooking});
      }, 3000);
    } else {
      let walletBalance = state.userdata.walletBalance + parseInt(state.payData.amount);
      let tDate = new Date();
      let details = {
        type: 'Credit',
        amount: parseInt(state.payData.amount),
        date: tDate.toString(),
        txRef: state.payData.order_id,
        gateway: order_details.gateway,
        transaction_id: order_details.transaction_id
      }
      dispatch(updateWalletBalance(walletBalance,details));
      setTimeout(() => {
        props.navigation.navigate('wallet')
      }, 3000);
    }
  };

  onCanceledHandler = () => {
    if (state.userdata.paymentType) {
      setTimeout(() => {
        props.navigation.navigate('PaymentDetails',{booking:booking})
      }, 5000)
    } else {
      setTimeout(() => {
        props.navigation.navigate('wallet')
      }, 5000)
    }
  };

  goBack = () => {
    setState({ ...state, selectedProvider: null });
    props.navigation.goBack();
  }

  selectProvider = (provider) => {
    setState({ ...state, selectedProvider: provider });
  };

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={colors.GREY.default}
        leftComponent={{ icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }}
        centerComponent={<Text style={styles.headerTitleStyle}>{language.payment}</Text>}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      {state.selectedProvider ? <PaymentWebView provider={state.selectedProvider} payData={state.payData} onSuccess={onSuccessHandler} onCancel={onCanceledHandler} /> : null}
      {state.providers && state.selectedProvider == null ?
        <ScrollView>
          {
            state.providers.map((provider) => {
              return (
                <View style={[styles.box, { marginTop: 6 }]} key={provider.name}>
                  <TouchableHighlight onPress={selectProvider.bind(this, provider)} underlayColor={colors.BLUE.light}>
                    <Image
                      style={styles.thumb}
                      source={{ uri: provider.image }}
                    />
                  </TouchableHighlight>
                </View>
              );
            })
          }
        </ScrollView>
        : null
      }
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    flex: 1
  },
  headerStyle: {
    backgroundColor: colors.GREY.default,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: 'Roboto-Bold',
    fontSize: 20
  },
  box: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.GREY.whiteish,
    borderRadius: 8,
    marginBottom: 4,
    marginHorizontal: 20,
    marginTop: 8
  },

  thumb: {
    height: 35,
    width: 100,
    resizeMode: 'contain'

  }
});