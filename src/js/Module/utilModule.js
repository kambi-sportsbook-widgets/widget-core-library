window.CoreLibrary.utilModule = (function () {
   'use strict';

   var utilModule = {
      diffArray: function ( A, B ) {
         var map = {}, C = [];

         for ( var i = B.length; i--; ) {
            map[B[i]] = null;
         } // any other value would do

         for ( var i = A.length; i--; ) {
            if ( !map.hasOwnProperty(A[i]) ) {
               C.push(A[i]);
            }
         }

         return C;
      },
      getOutcomeLabel: function ( outcome, event ) {
         switch ( outcome.type ) {
            case 'OT_ONE': // Outcome has label 1. Applies to Threeway bet offers.
               return event.homeName;
            case 'OT_CROSS': // Outcome has label X. Applies to Threeway bet offers.
               // Todo: Translation
               return CoreLibrary.translationModule.getTranslation('draw');
            case 'OT_TWO': // Outcome has label 2. Applies to Threeway bet offers.
               return event.awayName;
            // Todo: Impelement these responses with translations

            // case 'OT_OVER': //The “Over” outcome in Over/Under bet offer.
            // break;
            // case 'OT_UNDER': //The “Under” outcome in Over/Under bet offer.
            // break;
            // case 'OT_ODD': //The “Odd” outcome in Odd/Even bet offer.
            // break;
            // case 'OT_EVEN': //The “Even” outcome in Odd/Even bet offer.
            // break;
            // case 'OT_ONE_ONE': //1-1 outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_ONE_TWO': //1-2 outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_ONE_CROSS': //1-X outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_TWO_ONE': //2-1 outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_TWO_TWO': //2-2 outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_TWO_CROSS': //2-X outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_CROSS_ONE': //X-1 outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_CROSS_TWO': //X-2 outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_CROSS_CROSS': //X-X outcome in Halftime/fulltime bet offer.
            // break;
            // case 'OT_ONE_OR_TWO': //1 or 2 outcome in Double Chance bet offer.
            // break;
            // case 'OT_ONE_OR_CROSS': //1 or X outcome in Double Chance bet offer.
            // break;
            // case 'OT_CROSS_OR_TWO': //X or 2 outcome in Double Chance bet offer.
            // break;
            // case 'OT_YES': //“Yes” outcome in Head To Head and Yes/No bet offer.
            // break;
            // case 'OT_NO': //“No” outcome in Head To Head and Yes/No bet offer.
            // break;
            // case 'OT_OTHER': //“Other results” outcome in Result bet offer.
            // break;
            // case 'OT_UNTYPED': //Outcome does not have type.
            // break;
            // case 'OT_WC_HOME': //Outcome has label Home Win. Applies to WinCast bet offers.
            // break;
            // case 'OT_WC_DRAW': //Outcome has label Draw. Applies to WinCast bet offers.
            // break;
            // case 'OT_WC_AWAY': //Outcome has label Away Win. Applies to WinCast bet offers.
            // break;

            default:
               console.warn('Unhandled outcome type: ' + outcome.type, outcome);
               return outcome.label;
         }
      }
   };

   return utilModule;
})();