import coreLibrary from '../coreLibrary';

/**
 * Module to access statistics data
 * @module statisticsModule
 * @memberOf coreLibrary
 */

export default {

   /**
    * Configuration.
    * @type {Object}
    * @property {String} baseApiUrl
    */
   config: {
      baseApiUrl: 'https://api.kambi.com/statistics/api/'
   },

   /**
    * Requests statistics data from api.
    * @param {String} type
    * @param {String} filter
    * @returns {Promise}
    */
   getStatistics (type, filter) {
      // Remove url parameters from filter
      filter = filter.match(/[^?]*/)[0];

      // Remove trailing slash if present
      if (filter[filter.length - 1] === '/') {
         filter = filter.slice(0, -1);
      }

      console.debug(this.config.baseApiUrl + coreLibrary.config.offering + '/' + type + '/' + filter + '.json');
      return coreLibrary.getData(this.config.baseApiUrl + coreLibrary.config.offering + '/' + type + '/' + filter + '.json');
   }
};