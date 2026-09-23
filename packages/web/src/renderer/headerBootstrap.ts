import { initializePlatform } from './platform/bootstrap';

void initializePlatform().then(() => import('./pages/appWorkbench/header/header')).catch(error => window.reportError(error));
