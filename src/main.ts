/** @file Application entry point. */

import { installMockTransportIfRequested } from './data/mock/install-mock-transport.js';

installMockTransportIfRequested(window.location.search);
