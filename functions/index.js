const fs = require('fs');
const functions = require('firebase-functions');
const fetch = require("node-fetch");
const admin = require('firebase-admin');
const language = require('./language.json');

admin.initializeApp();

const providers = [
    'paypal',
    'braintree',
    'stripe',
    'paytm',
    'payulatam',
    'flutterwave',
    'paystack',
    'securepay',
    'payfast',
    'liqpay',
    'culqi'
]

exports.paypal = require('./providers/paypal');
exports.braintree = require('./providers/braintree');
exports.stripe = require('./providers/stripe');
exports.paytm = require('./providers/paytm');
exports.payulatam = require('./providers/payulatam');
exports.flutterwave = require('./providers/flutterwave');
exports.paystack = require('./providers/paystack');
exports.securepay = require('./providers/securepay');
exports.payfast = require('./providers/payfast');
exports.liqpay = require('./providers/liqpay');
exports.culqi = require('./providers/culqi');

exports.get_providers = functions.https.onRequest((request, response) => {
    let arr = [];
    for (let i = 0; i < providers.length; i++) {
        arr.push({
            name: providers[i],
            image: 'https://dev.exicube.com/images/' + providers[i] + '-logo.png',
            link: '/' + providers[i] + '-link'
        });
    }
    response.send(arr);
});

exports.setup = functions.https.onRequest((request, response) => {

    const sample_db = {
        "cancel_reason": [{
            "label": language.cancel_reason_1,
            "value": 0
        }, {
            "label": language.cancel_reason_2,
            "value": 1
        }, {
            "label": language.cancel_reason_3,
            "value": 2
        }, {
            "label": language.cancel_reason_4,
            "value": 3
        }, {
            "label": language.cancel_reason_5,
            "value": 4
        }],
        "offers": {
            "offer1": {
                "max_promo_discount_value": 10,
                "min_order": 10,
                "promo_description": "Free $10 for everybody",
                "promo_discount_type": "flat",
                "promo_discount_value": 10,
                "promo_name": "First ride bonus",
                "promo_start": "11/20/2019",
                "promo_usage_limit": 1000,
                "promo_validity": "01/01/2021"
            }
        },
        "rates": {
            "car_type": [{
                "convenience_fees": 10,
                "image": "https://dev.exicube.com/images/car0.png",
                "min_fare": 15,
                "name": "Economy",
                "rate_per_hour": 10,
                "rate_per_kilometer": 10,
                "extra_info": "Rate - 10/km,Minimum - 15"
            }, {
                "convenience_fees": 15,
                "image": "https://dev.exicube.com/images/car1.png",
                "min_fare": 15,
                "name": "Comfort",
                "rate_per_hour": 20,
                "rate_per_kilometer": 20,
                "extra_info": "Rate - 20/km,Minimum - 15"
            }, {
                "convenience_fees": 20,
                "image": "https://dev.exicube.com/images/car2.png",
                "min_fare": 20,
                "name": "Exclusive",
                "rate_per_hour": 30,
                "rate_per_kilometer": 30,
                "extra_info": "Rate - 30/km,Minimum - 20"
            }]
        },
        "settings": {
            "code": "USD",
            "panic": "991",
            "symbol": "$",
            "driver_approval": true,
            "otp_secure": false,
            "email_verify": true,
            "bonus": 10,
            "CarHornRepeat": false,
            "CompanyName": "Exicube App Solutions",
            "CompanyWebsite": "https://exicube.com",
            "CompanyTerms": "https://exicube.com/privacy-policy.html",
            "TwitterHandle": "https://facebook.com/exicube",
            "FacebookHandle": "https://twitter.com/exicube",
            "InstagramHandle": "",
            "AppleStoreLink": "https://apps.apple.com/app/id1501332146#?platform=iphone",
            "PlayStoreLink": "https://play.google.com/store/apps/details?id=com.exicube.grabcab"
        }
    }
    
    admin.database().ref('/users').once("value", (snapshot) => {
        if (snapshot.val()) {
            response.send({ message: language.setup_exists });
        } else {
            admin.auth().createUser({
                email: request.query.email,
                password: request.query.password,
                emailVerified: false
            })
                .then((userRecord) => {
                    let users = {};
                    users[userRecord.uid] = {
                        "firstName": "Admin",
                        "lastName": "Admin",
                        "email": request.query.email,
                        "usertype": 'admin',
                        "approved": true
                    };
                    sample_db["users"] = users;
                    admin.database().ref('/').set(sample_db);
                    response.send({ message: language.setup_done });
                    return true;
                })
                .catch((error) => {
                    response.send({ error: error });
                    return true;
                });
        }
    });
});

exports.success = functions.https.onRequest((request, response) => {
    var amount_line = request.query.amount ? `<h3>${language.payment_of}<strong>${request.query.amount}</strong>${language.was_successful}</h3>` : '';
    var order_line = request.query.order_id ? `<h5>${language.order_no}${request.query.order_id}</h5>` : '';
    var transaction_line = request.query.transaction_id ? `<h6>${language.transaction_id}${request.query.transaction_id}</h6>` : '';
    response.status(200).send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.success_payment}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                h3, h6, h4 { margin: 0px; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'>
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/accept-47587_960_720.png' alt='Icon'> 
                    ${amount_line}
                    ${order_line}
                    ${transaction_line}
                    <h4>${language.payment_thanks}</h4>
                </div>
            </div>
        </body>
        </html>
    `);
});

exports.cancel = functions.https.onRequest((request, response) => {
    response.send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.payment_cancelled}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                h3, h6, h4 { margin: 0px; } .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'> 
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/cancel-47588_960_720.png' alt='Icon'> 
                    <h3>${language.payment_fail}</h3> 
                    <h4>${language.try_again}</h4>
                </div> 
            </div>
        </body>
        </html>
    `);
});

const getDistance = (lat1, lon1, lat2, lon2) => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    }
}

const RequestPushMsg = async (token, title, msg) => {
    let response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'accept-encoding': 'gzip, deflate',
            'host': 'exp.host'
        },
        body: JSON.stringify({
            "to": token,
            "title": title,
            "body": msg,
            "data": { "msg": msg, "title": title },
            "priority": "high",
            "sound": "default",
            "channelId": "messages",
            "_displayInForeground": true
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        return await response.json()
    }
}

exports.newBooking = functions.database.ref('/bookings/{bookingId}')
    .onCreate((snapshot, context) => {
        const booking = snapshot.val();
        booking.key = context.params.bookingId;
        if (!booking.bookLater) {
            admin.database().ref('/users').orderByChild("queue").equalTo(false).once("value", (ddata) => {
                let drivers = ddata.val();
                if (drivers) {
                    for (let dkey in drivers) {
                        let driver = drivers[dkey];
                        driver.key = dkey;
                        if (driver.usertype === 'driver' && driver.approved === true && driver.driverActiveStatus === true && driver.location) {
                            let originalDistance = getDistance(booking.pickup.lat, booking.pickup.lng, driver.location.lat, driver.location.lng);
                            if (originalDistance <= 10 && driver.carType === booking.carType) {
                                admin.database().ref('bookings/' + booking.key + '/requestedDrivers/' + driver.key).set(true);
                                RequestPushMsg(driver.pushToken, language.notification_title, language.new_booking_notification);
                            }
                        }
                    }
                }
            });
        }
    });

exports.bookingScheduler = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
    admin.database().ref('/bookings').orderByChild("status").equalTo('NEW').once("value", (snapshot) => {
        let bookings = snapshot.val();
        if (bookings) {
            for (let key in bookings) {
                let booking = bookings[key];
                booking.key = key;
                let date1 = new Date();
                let date2 = new Date(booking.tripdate);
                let diffTime = date2 - date1;
                let diffMins = diffTime / (1000 * 60);
                if (diffMins > 0 && diffMins < 15 && booking.bookLater && !booking.requestedDrivers) {
                    admin.database().ref('/users').orderByChild("queue").equalTo(false).once("value", (ddata) => {
                        let drivers = ddata.val();
                        if (drivers) {
                            for (let dkey in drivers) {
                                let driver = drivers[dkey];
                                driver.key = dkey;
                                if (driver.usertype === 'driver' && driver.approved === true && driver.driverActiveStatus === true && driver.location) {
                                    let originalDistance = getDistance(booking.pickup.lat, booking.pickup.lng, driver.location.lat, driver.location.lng);
                                    if (originalDistance <= 10 && driver.carType === booking.carType) {
                                        admin.database().ref('bookings/' + booking.key + '/requestedDrivers/' + driver.key).set(true);
                                        RequestPushMsg(driver.pushToken, language.notification_title, language.new_booking_notification);
                                    }
                                }
                            }
                        }
                    });
                }
                if (diffMins < -15) {
                    admin.database().ref("bookings/" + booking.key + "/requestedDrivers").remove();
                    admin.database().ref('bookings/' + booking.key).update({
                        status: 'CANCELLED',
                        reason: 'RIDE AUTO CANCELLED. NO RESPONSE'
                    });
                }
            }
        }
    });
});

exports.send_notification = functions.https.onRequest((request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    if (request.body.token === 'token_error' || request.body.token === 'web') {
        response.send({ error: 'Token found as ' + request.body.token });
    } else {
        RequestPushMsg(request.body.token, request.body.title, request.body.msg).then((responseData) => {
            response.send(responseData);
            return true;
        }).catch(error => {
            response.send({ error: error });
        });
    }
});

exports.userDelete = functions.database.ref('/users/{uid}')
    .onDelete((snapshot, context) => {
        let uid = context.params.uid
        return admin.auth().deleteUser(uid);
    });

exports.userCreate = functions.database.ref('/users/{uid}')
    .onCreate((snapshot, context) => {
        let uid = context.params.uid;
        let userInfo = snapshot.val();
        return userInfo.createdByAdmin ? admin.auth().createUser({
            uid: uid,
            email: userInfo.email,
            emailVerified: true,
            phoneNumber: userInfo.mobile
        }) : true
    });

exports.check_user_exists = functions.https.onRequest((request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    let arr = [];

    if (request.body.email || request.body.mobile) {
        if (request.body.email) {
            arr.push({ email: request.body.email });
        }
        if (request.body.mobile) {
            arr.push({ phoneNumber: request.body.mobile });
        }
        try{
            admin
            .auth()
            .getUsers(arr)
            .then((getUsersResult) => {
                response.send({ users: getUsersResult.users });
                return true;
            })
            .catch((error) => {
                response.send({ error: error });
            });
        }catch(error){
            response.send({ error: error });
        }
    } else {
        response.send({ error: "Email or Mobile not found." });
    }
});


exports.validate_referrer = functions.https.onRequest(async (request, response) => {
    let referralId = request.body.referralId;
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const snapshot = await admin.database().ref("users").once('value');
    let value = snapshot.val();
    if(value){
        let arr = Object.keys(value);
        let key;
        for(let i=0; i < arr.length; i++){
            if(value[arr[i]].referralId === referralId){
                key = arr[i];
            }
        }
        response.send({uid: key}); 
    }else{
        response.send({uid: null});
    }
});

const addToWallet = async (uid,amount) =>{
    let snapshot =  await admin.database().ref("users/" + uid).once("value");
    if (snapshot.val()) {
        let walletBalance = snapshot.val().walletBalance;
        walletBalance = walletBalance + amount;
        let details = {
            type: 'Credit',
            amount: amount,
            date: new Date().toString(),
            txRef: 'AdminCredit'
        }
        await admin.database().ref("users/" + uid + "/walletBalance").set(walletBalance);
        await admin.database().ref("users/" + uid + "/walletHistory").push(details);
        if(snapshot.val().pushToken){
            RequestPushMsg(snapshot.val().pushToken, language.notification_title, language.wallet_updated);
        }  
        return true;
    }else{
        return false;
    }
}

exports.user_signup = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    let userDetails = request.body.regData;
    try {
        let regData = {
            createdAt: userDetails.createdAt,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            mobile: userDetails.mobile,
            email: userDetails.email,
            usertype: userDetails.usertype,
            referralId: userDetails.firstName.toLowerCase() + Math.floor(1000 + Math.random() * 9000).toString(),
            approved: true,
            walletBalance: 0,
            pushToken: 'init'
        };
        let settingdata = await admin.database().ref('settings').once("value");
        let settings = settingdata.val();
        if (userDetails.usertype === 'driver') {
            regData.licenseImage = userDetails.licenseImage;
            regData.vehicleNumber = userDetails.vehicleNumber;
            regData.vehicleModel = userDetails.vehicleModel;
            regData.vehicleMake = userDetails.vehicleMake;
            regData.carType = userDetails.carType;
            regData.bankCode = userDetails.bankCode;
            regData.bankName = userDetails.bankName;
            regData.bankAccount = userDetails.bankAccount;
            regData.other_info = userDetails.other_info;
            regData.queue = false;
            regData.driverActiveStatus = true;
            if (settings.driver_approval) {
                regData.approved = false;
            }
        } 
        let userRecord = await admin.auth().createUser({
            email: userDetails.email,
            phoneNumber: userDetails.mobile,
            password: userDetails.password,
            emailVerified: settings.email_verify ? false : true
        });
        if(userRecord && userRecord.uid){
            if(userDetails.signupViaReferral){
                await addToWallet(userDetails.signupViaReferral, settings.bonus);
            }
            await admin.database().ref('users/' + userRecord.uid).set(regData);
            response.send({ uid: userRecord.uid });
        }else{
            response.send({ error: "User Not Created" });
        }
    }catch(error){
        response.send({ error: "User Not Created" });
    }
});
