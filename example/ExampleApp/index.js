/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { init, trackEvent } from '@aptabase/react-native'

init("A-DEV-7523634193")
trackEvent("app_started")

AppRegistry.registerComponent(appName, () => App);
