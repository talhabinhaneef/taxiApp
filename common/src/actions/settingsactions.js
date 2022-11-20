import {
  FETCH_SETTINGS,
  FETCH_SETTINGS_SUCCESS,
  FETCH_SETTINGS_FAILED,
  EDIT_SETTINGS,
  CLEAR_SETTINGS_ERROR
} from "../store/types";

import { language } from 'config';

export const fetchSettings= () => (dispatch) => (firebase) => {

  const {
    settingsRef
  } = firebase;

  dispatch({
    type: FETCH_SETTINGS,
    payload: null,
  });
  settingsRef.on("value", (snapshot) => {
    if (snapshot.val()) {
      dispatch({
        type: FETCH_SETTINGS_SUCCESS,
        payload: snapshot.val(),
      });
    } else {
      dispatch({
        type: FETCH_SETTINGS_FAILED,
        payload: language.settings_error,
      });
    }
  });
};

export const editSettings = (settings) => (dispatch) => (firebase) => {

  const {
    settingsRef
  } = firebase;

  dispatch({
    type: EDIT_SETTINGS,
    payload: settings
  });
  settingsRef.set(settings);
}

export const clearSettingsViewError = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_SETTINGS_ERROR,
    payload: null
  });  
};