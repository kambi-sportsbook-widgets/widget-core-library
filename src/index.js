import './polyfills'
import './widget-api'
import coreLibrary from './coreLibrary'
import offeringModule from './Module/offeringModule'
import statisticsModule from './Module/statisticsModule'
import translationModule from './Module/translationModule'
import utilModule from './Module/utilModule'
import widgetModule from './Module/widgetModule'
import eventsModule from './Module/EventsModule/index'
import eventUpdatesModule from './Module/eventUpdatesModule'

if (window != null) {
  window.WidgetCoreLibrary = {
    coreLibrary,
    offeringModule,
    statisticsModule,
    translationModule,
    utilModule,
    widgetModule,
    eventsModule,
    eventUpdatesModule,
  }
}

export {
  coreLibrary,
  offeringModule,
  statisticsModule,
  translationModule,
  utilModule,
  widgetModule,
  eventsModule,
  eventUpdatesModule,
}
