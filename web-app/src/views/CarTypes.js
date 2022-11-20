import React, { useState, useEffect, useContext } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { 
  features,
  language
} from 'config';
import { FirebaseContext } from 'common';

export default function CarTypes() {
  const { api } = useContext(FirebaseContext);
  const {
    editCarType
  } = api;
  const columns = [
    { title: language.image, field: 'image', render: rowData => <img alt='Car' src={rowData.image} style={{ width: 50 }} /> },
    { title: language.name, field: 'name' },
    { title: language.rate_per_km, field: 'rate_per_kilometer', type: 'numeric' },
    { title: language.rate_per_hour, field: 'rate_per_hour', type: 'numeric' },
    { title: language.min_fare, field: 'min_fare', type: 'numeric' },
    { title: language.convenience_fee_percent, field: 'convenience_fees', type: 'numeric' },
    { title: language.extra_info, field: 'extra_info' }
  ];
  const [data, setData] = useState([]);
  const cartypes = useSelector(state => state.cartypes);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cartypes.cars) {
      setData(cartypes.cars);
    }else{
      setData([]);
    }
  }, [cartypes.cars]);

  const removeExtraKeys = (tblData) => {
    for (let i = 0; i < tblData.length; i++) {
      if (tblData[i].rate_per_kilometer) tblData[i].rate_per_kilometer = parseFloat(tblData[i].rate_per_kilometer);
      if (tblData[i].rate_per_hour) tblData[i].rate_per_hour = parseFloat(tblData[i].rate_per_hour);
      if (tblData[i].convenience_fees) tblData[i].convenience_fees = parseFloat(tblData[i].convenience_fees);
    }
    return tblData;
  }

  return (
    cartypes.loading ? <CircularLoading /> :
      <MaterialTable
        title={language.car_type}
        columns={columns}
        data={data}
        options={{
          exportButton: true
        }}
        editable={features.AllowCriticalEditsAdmin ? {
          onRowAdd: newData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                const tblData = data;
                tblData.push(newData);
                dispatch(editCarType(removeExtraKeys(tblData), "Add"));
              }, 600);
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                const tblData = data;
                tblData[tblData.indexOf(oldData)] = newData;
                dispatch(editCarType(removeExtraKeys(tblData), "Update"));
              }, 600);
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                const tblData = data;
                tblData.splice(tblData.indexOf(oldData), 1);
                dispatch(editCarType(removeExtraKeys(tblData), "Delete"));
              }, 600);
            }),
        } : null}
      />
  );
}
