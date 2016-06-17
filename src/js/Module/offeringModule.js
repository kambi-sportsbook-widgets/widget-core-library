CoreLibrary.offeringModule = (function () {
   'use strict';

   return {
      getGroupEvents ( groupId ) {
         var requesPath = '/event/group/' + groupId + '.json';
         return this.doRequest(requesPath);
      },
      getEventsByFilter ( filter, params ) {
         // Todo: Update this method once documentation is available
         var requestPath = '/listView/' + filter;
         return this.doRequest(requestPath, params, 'v3');
      },
      adaptV2BetOffer ( betOffer ) {
         if ( betOffer.suspended === true ) {
            betOffer.open = false;
         }
      },
      adaptV2LiveData ( liveData ) {
         if ( liveData != null && liveData.statistics != null ) {
            var statistics = liveData.statistics;
            if ( statistics.sets != null ) {
               statistics.setBasedStats = statistics.sets;
               delete statistics.sets;
            }

            if ( statistics.football != null ) {
               statistics.footballStats = statistics.football;
               delete statistics.football;
            }
         }
      },
      adaptV2Event ( event ) {
         // v3 and v2 event objects are almost the same
         // only a few attributes we don't are different
      },
      getLiveEventData ( eventId ) {
         var requestPath = '/event/' + eventId + '/livedata.json';
         return this.doRequest(requestPath, null, null, true)
            .then(( res ) => {
               this.adaptV2LiveData(res);
               return res;
            });
      },
      getLiveEvents () {
         var requestPath = '/event/live/open.json';
         return this.doRequest(requestPath, null, null, true)
            .then(( res ) => {
               if ( res.error != null ) {
                  return res;
               }
               var events = res.liveEvents;
               res.events = events;
               res.events.forEach(this.adaptV2Event);
               delete res.liveEvents;
               delete res.group;
               events.forEach(( e ) => {
                  e.betOffers = [];
                  if ( e.mainBetOffer != null ) {
                     this.adaptV2BetOffer(e.mainBetOffer);
                     e.betOffers.push(e.mainBetOffer);
                     delete e.mainBetOffer;
                  }
                  this.adaptV2LiveData(e.liveData);
               });
               return res;
            });
      },
      getLiveEvent ( eventId ) {
         var requestPath = '/betoffer/live/event/' + eventId + '.json';
         return this.doRequest(requestPath, null, null, true)
            .then(( res ) => {
               res.betOffers = res.betoffers;
               delete res.betoffers;
               res.betOffers.forEach(this.adaptV2BetOffer);
               res.event = res.events[0];
               this.adaptV2Event(res.event);
               delete res.events;
               return res;
            });
      },
      getLiveEventsByFilter ( filter ) {
         // Todo: implement a filter request when the offering API supports it
         filter = filter.replace(/\/$/, '');

         var filterTerms = filter.split('/');
         filterTerms = filterTerms.slice(0, 3);

         var requestPath = '/listView/all/all/all/all/in-play/';

         var liveEventsPromise = new Promise(( resolve, reject ) => {
            this.doRequest(requestPath, null, 'v3')
               .then(( response ) => {
                  var result = {
                        events: []
                     },
                     i = 0, len = response.events.length;
                  for ( ; i < len; ++i ) {
                     var j = 0, termLen = response.events[i].event.path.length, addEvent = true;
                     if ( termLen > filterTerms.length ) {
                        termLen = filterTerms.length;
                     }
                     for ( ; j < termLen; ++j ) {
                        if ( filterTerms[j] !== 'all' && response.events[i].event.path[j].termKey !== filterTerms[j] ) {
                           addEvent = false;
                        }
                     }
                     if ( addEvent ) {
                        result.events.push(response.events[i]);
                     }
                  }
                  resolve(result);
               });
         });

         return liveEventsPromise;
      },
      getEvent ( eventId ) {
         return this.doRequest('/betoffer/event/' + eventId + '.json');
      },
      getEventBetoffers ( eventId ) {
         console.warn('getEventBetoffers is deprecated, use getEvent instead');
         return this.getEvent.apply(this, arguments);
      },
      doRequest ( requestPath, params, version, noCache ) {
         if ( CoreLibrary.config.offering == null ) {
            console.warn('The offering has not been set, is the right widget api version loaded?');
         } else {
            var apiUrl = CoreLibrary.config.apiBaseUrl.replace('{apiVersion}',
               (version != null ? version : CoreLibrary.config.version));
            var requestUrl = apiUrl + CoreLibrary.config.offering + requestPath;
            var overrideParams = params || {};
            var requestParams = {
               lang: overrideParams.locale || CoreLibrary.config.locale,
               market: overrideParams.market || CoreLibrary.config.market,
               client_id: overrideParams.client_id || CoreLibrary.config.client_id,
               include: overrideParams.include || '',
               betOffers: overrideParams.betOffers || 'COMBINED',
               categoryGroup: overrideParams.categoryGroup || 'COMBINED',
               displayDefault: overrideParams.displayDefault || true
            };
            if ( noCache === true ) {
               requestParams.nocache = Date.now();
            }
            requestUrl += '?' + Object.keys(requestParams).map(function ( k ) {
                  return encodeURIComponent(k) + '=' + encodeURIComponent(requestParams[k]);
               }).join('&');

            return CoreLibrary.getData(requestUrl);
         }
      }
   };
})();
