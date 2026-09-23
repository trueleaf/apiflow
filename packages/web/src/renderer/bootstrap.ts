import { initializePlatform } from './platform/bootstrap';

void initializePlatform().then(() => import('./main')).catch(error => window.reportError(error));
