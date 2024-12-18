// A wrapper class for environment values. Custom values are provided by .env files. See below for more details.
// https://parceljs.org/features/node-emulation/#environment-variables

// the command 'parcel build index.html' will set the NODE_ENV to 'production', as opposed to 'parcel index.html' which will set it to 'development'. 
export const isDevelopment = process.env.NODE_ENV === 'development' ? true : false;

//  This should help prevent publishes to the container from having isLocal enabled accidentally.
/** If true, should pull data from local sources instead of google. */
export const useLocalData = isDevelopment && (typeof google === 'undefined' || process.env.USE_LOCAL_DATA === 'true');

/** @type {import("react-hot-toast").ToastOptions} */
export const toastSuccessSettings = {
    style: {
        border: '1px solid #0c9112',
        padding: '16px',
        color: '#000000',
    },
    iconTheme: {
        primary: '##ffffff',
        secondary: '#0c9112',
    },
    duration: 7000
};

/** @type {import("react-hot-toast").ToastOptions} */
export const toastFailureSettings = {
    style: {
        border: '1px solid #a10808',
        padding: '16px',
        color: '#000000',
    },
    iconTheme: {
        primary: '##ffffff',
        secondary: '#a10808',
    },
    duration: 7000
}

const AppConfig = {
    isDevelopment: isDevelopment,
    useLocalData: useLocalData,
    toastSuccessSettings,
    toastFailureSettings
};

export default AppConfig;