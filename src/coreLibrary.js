import offeringModule from './Module/offeringModule';
import statisticsModule from './Module/statisticsModule';
import translationModule from './Module/translationModule';
import utilModule from './Module/utilModule';
import widgetModule from './Module/widgetModule';

/**
 * Main module that holds the other modules as well as widget
 * related configurations
 * @module coreLibrary
 */

function checkStatus(response) {
   if (response.status >= 200 && response.status < 300) {
      return response;
   } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
   }
}

function checkBrowser() {

   var ua = window.navigator.userAgent;

   var getFirstMatch = function (regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
   };

   var versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i);

   if (/android/i.test(ua)) {
      return {
         browser: 'android',
         browserVersion: versionIdentifier
      };
   } else if (/(ipod|iphone|ipad)/i.test(ua)) {
      return {
         browser: 'ios',
         browserVersion: getFirstMatch(/(?:mxios)[\s/](\d+(?:\.\d+)+)/i)
      };
   } else if (/msie|trident/i.test(ua)) {
      return {
         browser: 'internet-explorer',
         browserVersion: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      };
   } else if (/chrome|crios|crmo/i.test(ua)) {
      return {
         browser: 'chrome',
         browserVersion: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      };
   } else if (/safari|applewebkit/i.test(ua)) {
      return {
         browser: 'safari',
         browserVersion: versionIdentifier
      };
   } else if (/chrome.+? edge/i.test(ua)) {
      return {
         browser: 'microsoft-edge',
         browserVersion: getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
      };
   } else if (/firefox|iceweasel|fxios/i.test(ua)) {
      return {
         browser: 'firefox',
         browserVersion: getFirstMatch(/(?:firefox|iceweasel|fxios)[ /](\d+(\.\d+)?)/i)
      };
   }
}

/*
 * Downloads a resource from given URL.
 * @param {string} url URL of resource
 * @returns {Promise.<{status: number, statusText: string, body: string}>}
 */
function download(url) {
   return new Promise((resolve, reject) => {
      // fetch API is not supported in IE11 so we use
      // old-school XMLHttpRequest
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);

      xhr.onload = function() {
         const response = {
            status: xhr.status,
            statusText: xhr.statusText,
            body: 'response' in xhr ? xhr.response : xhr.responseText,
         };

         resolve(response);
      };

      xhr.onerror = () => reject(new TypeError('Network request failed'));

      xhr.ontimeout = () => reject(new TypeError('Network request failed'));

      xhr.send();
   });
}

export default {
   /**
    * Name of the browser that is running the widget
    * @type {String}
    */
   browser: checkBrowser().browser,

   /**
    * Browser version
    * @type {String}
    */
   browserVersion: checkBrowser().browserVersion,

   /**
    * Kambi Widget API version to use
    * @type {String}
    * @private
    */
   expectedApiVersion: '1.0.0.15',

   /**
    * Config object. This data comes from the sportsbook and should not be manually changed. When in running the widget stand alone this values are retrieved from ./src/mockSetupData.json
    * @name config
    * @type {Object}
    * @property {String} apiBaseUrl url of the offering api to use
    * @property {Boolean} auth
    * @property {Number} channelId
    * @property {String} currency what currency to use
    * @property {String} customer the customer to use with the offering API
    * @property {String} device what kind of device does the user have. Possible values: 'desktop', 'mobile'
    * @property {String} locale locale of the user, example: 'en_GB', 'sv_SE'
    * @property {String} market market to use with the offering API.
    * @property {String} oddsFormat the odds format to show. Possible values: 'decimal', 'fractional', 'american'. To listen to changes to this value use widgetModule.events.subscribe('ODDS:FORMAT', eventHandlerFn);
    * @property {String} offering the offering to use with the offering API
    * @property {String} routeRoot
    * @property {Boolean} streamingAllowedForPlayer
    * @property {Number} client_id
    * @property {String} version
    */
   _config: {
      apiBaseUrl: '',
      auth: false,
      channelId: 1,
      currency: 'EUR',
      customer: '',
      device: 'desktop',
      locale: 'en_GB',
      market: 'GB',
      oddsFormat: 'decimal',
      offering: '',
      routeRoot: '',
      streamingAllowedForPlayer: true,
      client_id: 2,
      version: 'v2'
   },

   /**
    * An array with the default classes that should be added to HTML tag
    */
   kambiDefaultClasses: [
      'KambiWidget-card-text-color',
      'KambiWidget-card-background-color',
      'KambiWidget-font',
   ],

   get config () {
      return this._config; // eslint-disable-line no-underscore-dangle
   },

   set config (config) {
      /* eslint-disable no-underscore-dangle */
      for (var i in config) {
         if (config.hasOwnProperty(i) && this._config.hasOwnProperty(i)) {
            this._config[i] = config[i];
         }
      }
      // Make sure that the routeRoot is not null or undefined
      if (this._config.routeRoot == null) {
         this._config.routeRoot = '';
      } else if (this._config.routeRoot.length > 0 &&
            this._config.routeRoot.slice(-1) !== '/') {
         // If the routeRoot is not empty we need to make sure it has a trailing slash
         this._config.routeRoot += '/';
      }
      /* eslint-enable no-underscore-dangle */
   },

   /**
    * Sets odds format. Calling this method changes config.oddsFormat
    * @memberOf module:coreLibrary
    * @param {String} oddsFormat
    * @private
    */
   setOddsFormat (oddsFormat) {
      this._config.oddsFormat = oddsFormat; // eslint-disable-line no-underscore-dangle
   },

   /**
    * default args object
    * @private
    */
   _defaultArgs: {},

   get defaultArgs () {
      return this._defaultArgs; // eslint-disable-line no-underscore-dangle
   },

   set defaultArgs (defaultArgs) {
      this._defaultArgs = defaultArgs; // eslint-disable-line no-underscore-dangle
   },

   /**
    * args object for the widget, merges the default args provided by coreLibrary.init() with the ones that come from the sportsbook. There are some pre-defined arguments that all widgets accept, but most of them are widget-defined.
    * @property {String} customCssUrl URL to a CSS file to add to the page, expressions like "{customer}" are replaced with their values in coreLibrary.config. This is useful to load different stylesheets based on operator name.
    Example:
    Say coreLibrary.config.customer is 'kambi', then if this argument was set:
    {
      customCssUrl: "https://someurl.com/customcss/{customer}/style.css"
    }
    It would load this CSS file and add it to the page:
    https://someurl.com/customcss/kambi/style.css

    * @property {String} customCssUrlFallback fallback if the fetching of customCssUrl fails
    * @property {Array<Object>} conditionalArgs Optional, specify arguments to be applied based on some condition based in the values inside coreLibrary.config or coreLibrary.pageInfo
    example:

    conditionalArgs: [
      // if coreLibrary.config.currency is 'EUR' apply { euro: true, dollars: false } to the arguments
      {
         config: {
            currency: 'EUR'
         },
         args: {
            euro: true,
            dollars: false
         }
      },
      // if market is 'IT' AND offering is 'IT' apply { italian: true } to the arguments
      {
         config: {
            market: 'IT',
            offering: 'IT'
         },
         args: {
            italian: true
         }
      },
    ]

    * @name args
    */
   _args: null,

   get args () {
      return this._args; // eslint-disable-line no-underscore-dangle
   },

   set args (args) {
      /* eslint-disable no-underscore-dangle */
      if (this._args != null) {
         throw Error('Do not override coreLibrary.args');
      }
      args = Object.assign({}, this.defaultArgs, args);

      // Handling conditionalArgs
      if (args.conditionalArgs != null) {
         args.conditionalArgs.forEach((carg) => {
            var apply = true;
            if (carg.clientConfig != null) {
               Object.keys(carg.clientConfig).forEach((key) => {
                  if (this.config[key] !== carg.clientConfig[key]) {
                     apply = false;
                  }
               });
            }

            if (carg.pageInfo != null) {
               Object.keys(carg.pageInfo).forEach((key) => {
                  if (this.pageInfo[key] !== carg.pageInfo[key]) {
                     apply = false;
                  }
               });
            }

            if (apply) {
               console.log('Applying conditional arguments:');
               console.log(carg.args);
               args = Object.assign(args, carg.args);
            }
         });
      }

      this._args = args
      /* eslint-enable no-underscore-dangle */
   },

   /**
    * Information about the page that the widget is being loaded from
    * @name pageInfo
    * @type {Object}
    * @property {Array(String)} leaguePaths array with league paths. Example:['football/england/premier_league']
    * @property {String} pageParam parameter for this page. For a page of type 'filter' an example would be 'football/england/premier_league'
    * @property {String} pageTrackingPath the path in the url for this page. For example: '/filter/football/england/premier_league'
    * @property {String} pageType type of the page, examples: 'home', 'filter'
    */
   _pageInfo: {
      leaguePaths: [],
      pageParam: '',
      pageTrackingPath: '',
      pageType: ''
   },

   get pageInfo () {
      return this._pageInfo; // eslint-disable-line no-underscore-dangle
   },

   set pageInfo (pageInfo) {
      /* eslint-disable no-underscore-dangle */
      // Check if the last character in the pageParam property is a slash, if not add it so we can use this property in filter requests
      if (pageInfo.pageType === 'filter' && pageInfo.pageParam.substr(-1) !== '/') {
         pageInfo.pageParam += '/';
      }
      this._pageInfo = pageInfo;
      /* eslint-enable no-underscore-dangle */
   },

   /**
    * Versions of the API provided by the sportsbook
    * @name apiVersions
    * @type {Object}
    * @property {String} client
    * @property {String} libs
    * @property {String} wapi
    */
   _apiVersions: {
      client: '',
      libs: '',
      wapi: ''
   },

   get apiVersions () {
      return this._apiVersions; // eslint-disable-line no-underscore-dangle
   },

   set apiVersions (versions) {
      /* eslint-disable no-underscore-dangle */
      for (var i in versions) {
         if (versions.hasOwnProperty(i) && this._apiVersions.hasOwnProperty(i)) {
            this._apiVersions[i] = versions[i];
         }
      }
      /* eslint-enable no-underscore-dangle */
   },

   /**
    * The name sent to Kambi API for analytics data collection
    * @private
    */
   widgetTrackingName: null,

   /**
    * Promise that is resolved when all the CSS has finished loading
    * @type Promise
    */
   cssLoadedPromise: null,

   /**
    * Initializes the Kambi api
    * Uses ./src/mockSetupData.json as coreLibrary.configs if not loaded inside the sportsbook (ie opened the widget directly).
    * @param {Object} defaultArgs arguments to be used if they are not provided by the sportsbook
    * @returns {Promise} resolved when everything is ready. If an error happens during fetching the error can be catched in a .catch() function
    */
   init (defaultArgs) {
      this.defaultArgs = defaultArgs;

      return new Promise((resolve, reject) => {
         // injecting widget-api in the page
         return this.getFile('https://c3-static.kambi.com/sb-mobileclient/widget-api/' + this.expectedApiVersion + '/kambi-widget-api.js')
            .then((content) => {
               const tag = document.createElement('script');
               tag.setAttribute('id', 'widget-api');
               tag.textContent = content;
               const head = document.getElementsByTagName('head')[0];
               // custom CSS should be the LAST CSS in the page
               head.insertBefore(tag, head.lastChild);
               return 'success';
            }).catch((err) => {
               console.error('Error loading widget api')
               console.error(err);
               reject();
            })
            .then(() => {
               // applies the setup data and sets up the CSS and translations
               var applySetupData = (setupData) => {
                  this.config = setupData.clientConfig;
                  this.pageInfo = setupData.pageInfo;
                  this.apiVersions = setupData.versions;
                  this.args = setupData.arguments;
                  this.addClasses(this.kambiDefaultClasses);

                  const translationPromise = translationModule.fetchTranslations(setupData.clientConfig.locale);

                  const operatorCssPromise = this.injectOperatorCss(
                        this.expectedApiVersion,
                        this.config.customer,
                        this.config.offering);

                  const customCssPromise = this.injectCustomCss(
                        this.args.customCssUrl,
                        this.args.customCssUrlFallback);

                  // most widgets don't need to wait for the CSS to be loaded
                  // so we keep a promise instead of waiting for it
                  this.cssLoadedPromise = Promise.all([operatorCssPromise, customCssPromise]);

                  translationPromise
                     .then(() => {
                        resolve();
                     })
                     .catch((err) => {
                        reject();
                     });
               };

               if (window.KambiWidget) {
                  // For development purposes we might want to load a widget on it's own so we check if we are in an iframe, if not then load some fake data
                  if (window.self === window.top) {
                     console.warn(window.location.host + window.location.pathname + ' is being loaded as stand-alone');
                     // Load the mock config data
                     this.getData('mockSetupData.json')
                        .then((mockSetupData) => {
                           // Output some debug info that could be helpful
                           console.debug('Loaded mock setup data');
                           console.debug(mockSetupData);
                           // Apply the mock config data to the core
                           applySetupData(mockSetupData);
                        })
                        .catch((error) => {
                           console.debug('Failed to fetch mockSetupData');
                           console.trace(error);
                           reject();
                        });
                  } else {
                     window.KambiWidget.apiReady = (api) => {
                        widgetModule.api = api;

                        // Request the setup info from the widget api
                        widgetModule.requestSetup((setupData) => {
                           // Request the outcomes from the betslip so we can update our widget, also sets up a subscription for future betslip updates
                           widgetModule.requestBetslipOutcomes();
                           // Request the odds format that is set in the sportsbook, this also sets up a subscription for future odds format changes
                           widgetModule.requestOddsFormat();

                           // Apply the config data to the core
                           applySetupData(setupData);
                        });
                     };
                     // Setup the response handler for the widget api
                     window.KambiWidget.receiveResponse = (dataObject) => {
                        widgetModule.handleResponse(dataObject);
                     };
                  }
               } else {
                  console.warn('Kambi widget API not loaded');
                  reject();
               }
            });
      });
   },

   /**
    * Dynamically creates a style tag and returns it
    * @param id {String} the id to add to the tag
    * @param content {String} text content of the tag (the styles)
    * @returns HTMLElement the tag created
    * @private
    */
   createStyleTag (id, url) {
      const tag = document.createElement('link');
      tag.setAttribute('id', id);
      tag.setAttribute('rel', 'stylesheet');
      tag.setAttribute('type', 'text/css');
      tag.setAttribute('href', url);
      return tag;
   },

   /**
    * Injects operator specific CSS based on widget API version,
    * customer and offering
    * @param wApiVersion {String|Null} If null will use expectedApiVersion
    * @param customer {String}
    * @param offering {String}
    * @returns {Promise} When resolved the stylesheet has been successfully added to the page
    * @private
    */
   injectOperatorCss (wApiVersion, customer, offering) {
      if ( wApiVersion == null || wApiVersion === '') {
         wApiVersion = this.expectedApiVersion;
      }
      const url = '//c3-static.kambi.com/sb-mobileclient/widget-api/' +
         wApiVersion +
         '/resources/css/' +
         customer +
         '/' +
         offering +
         '/widgets.css';
      return this.getFile(url)
         .then((content) => {
            const tag = this.createStyleTag('operator-css', url);
            const head = document.getElementsByTagName('head')[0];
            // opereator CSS should be the FIRST CSS in the page
            head.insertBefore(tag, head.firstChild);
         })
         .catch((err) => {
            console.warn('Could not inject Operator CSS');
         });
   },

   /**
    * Adds classes to to HTML tag
    * @param classes {Array} An array of strings with the classnames to be addes
    */
   addClasses ( classes ) {

      const html = document.getElementsByTagName('html')[0];
      classes.map((cssClass) => { html.classList.add(cssClass) });

   },

   /**
    * Injects stylesheet based on configuration parameters (coreLibrary.config)
    * Replaces expressions like "{customer}" in the strings provided
    * @param customCssUrl {String}
    * @param customCssUrlFallback {String} Fallback if the first URL fetch fails
    * @returns {Promise} when resolved the stylesheet has been successfully added to the page
    * @private
    */
   injectCustomCss (customCssUrl, customCssUrlFallback) {

      if (customCssUrl == null) {
         return Promise.resolve('');
      }
      if (customCssUrlFallback == null) {
         customCssUrlFallback = '';
      }

      customCssUrl = utilModule.replaceConfigParameters(customCssUrl);
      customCssUrlFallback = utilModule.replaceConfigParameters(customCssUrlFallback);

      const appendToHead = (url) => {
         const tag = this.createStyleTag('custom-css', url);
         const head = document.getElementsByTagName('head')[0];
         // custom CSS should be the LAST CSS in the page
         head.insertBefore(tag, null);
      };


      return this.getFile(customCssUrl)
         .then(( response ) => {
            appendToHead(customCssUrl);
            return response;
         }).catch(( error ) => {
            if (customCssUrlFallback !== '') {
               console.debug('Error fetching custom css, trying fallback');
               return this.getFile(customCssUrlFallback)
                  .then(( response ) => {
                     appendToHead(customCssUrlFallback);
                     return response;
                  }).catch(( error ) => {
                     console.debug('Error fetching custom css fallback');
                     return error;
                  });
            } else {
               console.debug('Error fetching custom css, no fallback present');
               return error;
            }
         });
   },

   /**
    * Makes a ajax request and parses its response as JSON
    * @param {String} url
    * @returns {Promise} resolved when the data fetching finishes. If an error happens during fetching the error can be catched in a .catch() function
    */
   getData (url) {
      return download(url)
         .then(checkStatus)
         .then((response) => {
            return JSON.parse(response.body)
         })
         .catch((error) => {
            console.debug('Error fetching data');
            console.trace(error);
            throw error;
         });
   },

   /**
    * Makes an ajax request and returns the response body as text
    * @param {String} url
    * @returns {Promise} resolved when the data fetching finishes. If an error happens during fetching the error can be catched in a .catch() function
    */
   getFile (url) {
      return download(url)
         .then(checkStatus)
         .then(response => response.body)
         .catch((error) => {
            console.debug('Error fetching file');
            console.trace(error);
            throw error;
         });
   },

   /**
    * Sets widget tracking name for analytics purposes. This tracking name is used for calls to add bets to the betslip
    * @param {String} name The name to use
    */
   setWidgetTrackingName (name) {
      this.widgetTrackingName = name;
   }
};
