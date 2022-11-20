import { MainConfig }  from './mainconfig';
import { features } from './features';

import { 
    language,
    dateStyle
} from './language';

import { 
    countries,
    default_country_code
} from './countries';

const AppDetails = MainConfig.AppDetails;
const FirebaseConfig = MainConfig.FirebaseConfig;
const Google_Map_Key = MainConfig.Google_Map_Key;
const facebookAppId = MainConfig.facebookAppId;

const cloud_function_server_url = `https://us-central1-${FirebaseConfig.projectId}.cloudfunctions.net`;

export {
    AppDetails,
    language,
    FirebaseConfig,
    Google_Map_Key,
    dateStyle,
    facebookAppId,
    cloud_function_server_url,
    features,
    countries,
    default_country_code
}