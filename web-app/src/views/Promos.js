import React,{ useState, useEffect, useContext } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { 
  features,
  dateStyle,
  language
} from 'config';
import { FirebaseContext } from 'common';

export default function Promos() {
  const { api } = useContext(FirebaseContext);
  const {
    editPromo
  } = api;

  const columns =  [
      { title: language.promo_name,field: 'promo_name'},
      { title: language.description, field: 'promo_description' },
      {
          title: language.title,
          field: 'promo_discount_type',
          lookup: { flat: 'Flat', percentage: 'Percentage' },
      },
      { title: language.promo_discount_value,field: 'promo_discount_value', type: 'numeric'},
      { title: language.max_limit, field: 'max_promo_discount_value', type: 'numeric' },
      { title: language.min_limit, field: 'min_order' , type: 'numeric'},
      { title: language.start_date, field: 'promo_start', render: rowData => rowData.promo_start?new Date(rowData.promo_start).toLocaleDateString(dateStyle):null},
      { title: language.end_date, field: 'promo_validity', render: rowData => rowData.promo_validity?new Date(rowData.promo_validity).toLocaleDateString(dateStyle):null},
      { title: language.promo_usage, field: 'promo_usage_limit', type: 'numeric' },
      { title: language.promo_used_by, field: 'promo_used_by', editable:'never' }
  ];

  const [data, setData] = useState([]);
  const promodata = useSelector(state => state.promodata);
  const dispatch = useDispatch();

  useEffect(()=>{
        if(promodata.promos){
            setData(promodata.promos);
        }else{
          setData([]);
        }
  },[promodata.promos]);

  const removeExtraKeys = (tblData) =>{
        if(tblData.promo_discount_value) tblData.promo_discount_value = parseFloat(tblData.promo_discount_value);
        if(tblData.max_promo_discount_value) tblData.max_promo_discount_value = parseFloat(tblData.max_promo_discount_value);
        if(tblData.min_order) tblData.min_order = parseFloat(tblData.min_order);
        if(tblData.promo_usage_limit) tblData.promo_usage_limit = parseFloat(tblData.promo_usage_limit);
    return tblData;
  }

  return (
    promodata.loading? <CircularLoading/>:
    <MaterialTable
      title={language.promo_offer}
      columns={columns}
      data={data}
      editable={features.AllowCriticalEditsAdmin?{
        onRowAdd: newData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              const tblData = data;
              tblData.push(newData);
              dispatch(editPromo(removeExtraKeys(newData),"Add"));
            }, 600);
          }),
          onRowUpdate: (newData, oldData) =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                const tblData = data;
                tblData[tblData.indexOf(oldData)] = newData;
                dispatch(editPromo(removeExtraKeys(newData),"Update"));
              }, 600);
            }),
          onRowDelete: newData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                dispatch(editPromo(removeExtraKeys(newData),"Delete"));
              }, 600);
          }), 
      }:null} 
    />
  );
}
