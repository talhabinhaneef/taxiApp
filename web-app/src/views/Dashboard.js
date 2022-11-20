import React,{ useState,useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography
} from '@material-ui/core';
import DashboardCard from '../components/DashboardCard';
import Map from '../components/Map';
import { useSelector} from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { 
    language,
    Google_Map_Key 
} from "config";

const Dashboard = () => {
    const [mylocation, setMylocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [dailygross,setDailygross] = useState(0);
    const [monthlygross,setMonthlygross] = useState(0);
    const [totalgross,setTotalgross] = useState(0);

    const [settings,setSettings] = useState({});

    const usersdata = useSelector(state => state.usersdata);
    const bookinglistdata = useSelector(state => state.bookinglistdata);
    const settingsdata = useSelector(state => state.settingsdata);

    useEffect(()=>{
        if(mylocation == null){
            navigator.geolocation.getCurrentPosition(
                position => setMylocation({ 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude
                }), 
                err => console.log(err)
            );
        }
    },[mylocation]);

    useEffect(()=>{
        if(settingsdata.settings){
          setSettings(settingsdata.settings);
        }
    },[settingsdata.settings]);

    useEffect(()=>{
        if(usersdata.users){
            const drivers = usersdata.users.filter(({ usertype }) => usertype === 'driver' );  
            let locs = [];
            for(let i=0;i<drivers.length;i++){
                if(drivers[i].approved && drivers[i].driverActiveStatus && drivers[i].location){
                    locs.push({
                        id:i,
                        lat:drivers[i].location.lat,
                        lng:drivers[i].location.lng,
                        drivername:drivers[i].firstName + ' ' + drivers[i].lastName
                    });
                }
            }
            setLocations(locs);
        }
    },[usersdata.users]);

    useEffect(()=>{
        if(bookinglistdata.bookings){
            let today =  new Date();
            let tdTrans = 0;
            let mnTrans = 0;
            let totTrans = 0;
            let convenniencefees = 0;
            let totconvenienceTrans = 0;
            let todayConvenience = 0;
            for(let i=0;i<bookinglistdata.bookings.length;i++){
                const {trip_cost,discount_amount,tripdate,convenience_fees} = bookinglistdata.bookings[i];
                let tDate = new Date(tripdate);
                if(trip_cost>=0 && discount_amount >=0){
                    if(tDate.getDate() === today.getDate() && tDate.getMonth() === today.getMonth()){
                        tdTrans  = tdTrans + trip_cost+discount_amount;
                    }          
                    if(tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()){
                        mnTrans  = mnTrans + trip_cost+discount_amount;
                    }
                    
                    totTrans  = totTrans + trip_cost + discount_amount;
                }if(convenience_fees>0){

                    if(tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()){
                        convenniencefees = convenniencefees+convenience_fees
                    }
                    if(tDate.getDate() === today.getDate() && tDate.getMonth() === today.getMonth()){
                        todayConvenience  = todayConvenience + convenience_fees;
                    } 
                    totconvenienceTrans  = totconvenienceTrans+convenience_fees;
                }
            }
            setDailygross(parseFloat(tdTrans).toFixed(2));
            setMonthlygross(parseFloat(mnTrans).toFixed(2));
            setTotalgross(parseFloat(totTrans).toFixed(2));
        }
    },[bookinglistdata.bookings]);

    return (
        bookinglistdata.loading || usersdata.loading ? <CircularLoading/> :
        <div>
            <Typography variant="h4" style={{margin:"20px 0 0 15px"}}>{language.gross_earning}</Typography>
            <Grid container direction="row" spacing={2}>
                <Grid item xs>
                    <DashboardCard title={language.today_text} image={require("../assets/img/money1.jpg")}>{ settings.symbol + ' ' + dailygross}</DashboardCard>
                </Grid>
                <Grid item xs>
                    <DashboardCard title={language.this_month_text} image={require("../assets/img/money2.jpg")}>{ settings.symbol +' ' +  monthlygross}</DashboardCard>
                </Grid>
                <Grid item xs>
                    <DashboardCard title={language.total} image={require("../assets/img/money3.jpg")}>{ settings.symbol +' ' +  totalgross}</DashboardCard>
                </Grid>
            </Grid>
            { mylocation?
            <Paper style={{marginTop:'25px'}}>
                <Typography variant="h4" style={{margin:"20px 0 0 15px"}}>{language.real_time_driver_section_text}</Typography>
                <Map mapcenter={mylocation} locations={locations}
                    googleMapURL={"https://maps.googleapis.com/maps/api/js?key=" + Google_Map_Key + "&v=3.exp&libraries=geometry,drawing,places"}
                    loadingElement={<div style={{ height: `480px` }} />}
                    containerElement={<div style={{ height: `480px` }} />}
                    mapElement={<div style={{ height: `480px` }} />}
                />
            </Paper>
            :
            <Typography variant="h6" style={{margin:"20px 0 0 15px",color:'#FF0000'}}>{language.allow_location}</Typography>
            }
        </div>
        
    )
}

export default Dashboard;