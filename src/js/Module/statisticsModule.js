/**
 * @module statisticsModule
 * @memberOf CoreLibrary
 */
window.CoreLibrary.statisticsModule = (() => {
   'use strict';

   return {

      /**
       * Configurations
       */
      config: {
         baseApiUrl: 'https://api.kambi.com/statistics/api/'
      },

      /**
       * Requests statistics data from api
       * @param {String} type
       * @param {string} filter
       * @returns {*|Promise}
       */
      getStatistics ( type, filter ) {
         // Remove url parameters from filter
         filter = filter.match(/[^?]*/)[0];

         // Remove trailing slash if present
         if ( filter[filter.length - 1] === '/' ) {
            filter = filter.slice(0, -1);
         }

         console.debug(this.config.baseApiUrl + CoreLibrary.config.offering + '/' + type + '/' + filter + '.json');
         return CoreLibrary.getData(this.config.baseApiUrl + CoreLibrary.config.offering + '/' + type + '/' + filter + '.json');
      }
   };
})();
