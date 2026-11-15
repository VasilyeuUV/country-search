/** @file Application entry point. */

import { installMockTransportIfRequested } from './data/mock/install-mock-transport.js';
import { mountApp } from './ui/app.js';

installMockTransportIfRequested(window.location.search);
mountApp(document.body);
