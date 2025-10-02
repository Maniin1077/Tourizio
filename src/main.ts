import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { register } from 'swiper/element/bundle';
import { environment } from './environments/environment';
import * as Sentry from "@sentry/angular-ivy";

// Register Swiper globally
register();

// Enable production optimizations
if (environment.production) {
  enableProdMode();

  Sentry.init({
    dsn: "YOUR_REAL_SENTRY_DSN_HERE",
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Bootstrap Angular app
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => {
    if (!environment.production) {
      console.error('❌ Angular bootstrap failed:', err);
    }
    Sentry.captureException(err);
  });
