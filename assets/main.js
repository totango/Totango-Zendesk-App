var currencyMap = {
  AED: 'د.إ',
  AFN: '؋',
  ALL: 'L',
  AMD: '֏',
  ANG: 'ƒ',
  AOA: 'Kz',
  ARS: '$',
  AUD: '$',
  AWG: 'ƒ',
  AZN: '₼',
  BAM: 'KM',
  BBD: '$',
  BDT: '৳',
  BGN: 'лв',
  BHD: '.د.ب',
  BIF: 'FBu',
  BMD: '$',
  BND: '$',
  BOB: '$b',
  BOV: 'BOV',
  BRL: 'R$',
  BSD: '$',
  BTC: '₿',
  BTN: 'Nu.',
  BWP: 'P',
  BYN: 'Br',
  BYR: 'Br',
  BZD: 'BZ$',
  CAD: '$',
  CDF: 'FC',
  CHE: 'CHE',
  CHF: 'CHF',
  CHW: 'CHW',
  CLF: 'CLF',
  CLP: '$',
  CNY: '¥',
  COP: '$',
  COU: 'COU',
  CRC: '₡',
  CUC: '$',
  CUP: '₱',
  CVE: '$',
  CZK: 'Kč',
  DJF: 'Fdj',
  DKK: 'kr',
  DOP: 'RD$',
  DZD: 'دج',
  EEK: 'kr',
  EGP: '£',
  ERN: 'Nfk',
  ETB: 'Br',
  ETH: 'Ξ',
  EUR: '€',
  FJD: '$',
  FKP: '£',
  GBP: '£',
  GEL: '₾',
  GGP: '£',
  GHC: '₵',
  GHS: 'GH₵',
  GIP: '£',
  GMD: 'D',
  GNF: 'FG',
  GTQ: 'Q',
  GYD: '$',
  HKD: '$',
  HNL: 'L',
  HRK: 'kn',
  HTG: 'G',
  HUF: 'Ft',
  IDR: 'Rp',
  ILS: '₪',
  IMP: '£',
  INR: '₹',
  IQD: 'ع.د',
  IRR: '﷼',
  ISK: 'kr',
  JEP: '£',
  JMD: 'J$',
  JOD: 'JD',
  JPY: '¥',
  KES: 'KSh',
  KGS: 'лв',
  KHR: '៛',
  KMF: 'CF',
  KPW: '₩',
  KRW: '₩',
  KWD: 'KD',
  KYD: '$',
  KZT: '₸',
  LAK: '₭',
  LBP: '£',
  LKR: '₨',
  LRD: '$',
  LSL: 'M',
  LTC: 'Ł',
  LTL: 'Lt',
  LVL: 'Ls',
  LYD: 'LD',
  MAD: 'MAD',
  MDL: 'lei',
  MGA: 'Ar',
  MKD: 'ден',
  MMK: 'K',
  MNT: '₮',
  MOP: 'MOP$',
  MRO: 'UM',
  MRU: 'UM',
  MUR: '₨',
  MVR: 'Rf',
  MWK: 'MK',
  MXN: '$',
  MXV: 'MXV',
  MYR: 'RM',
  MZN: 'MT',
  NAD: '$',
  NGN: '₦',
  NIO: 'C$',
  NOK: 'kr',
  NPR: '₨',
  NZD: '$',
  OMR: '﷼',
  PAB: 'B/.',
  PEN: 'S/.',
  PGK: 'K',
  PHP: '₱',
  PKR: '₨',
  PLN: 'zł',
  PYG: 'Gs',
  QAR: '﷼',
  RMB: '￥',
  RON: 'lei',
  RSD: 'Дин.',
  RUB: '₽',
  RWF: 'R₣',
  SAR: '﷼',
  SBD: '$',
  SCR: '₨',
  SDG: 'ج.س.',
  SEK: 'kr',
  SGD: 'S$',
  SHP: '£',
  SLL: 'Le',
  SOS: 'S',
  SRD: '$',
  SSP: '£',
  STD: 'Db',
  STN: 'Db',
  SVC: '$',
  SYP: '£',
  SZL: 'E',
  THB: '฿',
  TJS: 'SM',
  TMT: 'T',
  TND: 'د.ت',
  TOP: 'T$',
  TRL: '₤',
  TRY: '₺',
  TTD: 'TT$',
  TVD: '$',
  TWD: 'NT$',
  TZS: 'TSh',
  UAH: '₴',
  UGX: 'USh',
  USD: '$',
  UYI: 'UYI',
  UYU: '$U',
  UYW: 'UYW',
  UZS: 'лв',
  VEF: 'Bs',
  VES: 'Bs.S',
  VND: '₫',
  VUV: 'VT',
  WST: 'WS$',
  XAF: 'FCFA',
  XBT: 'Ƀ',
  XCD: '$',
  XOF: 'CFA',
  XPF: '₣',
  XSU: 'Sucre',
  XUA: 'XUA',
  YER: '﷼',
  ZAR: 'R',
  ZMW: 'ZK',
  ZWD: 'Z$',
  ZWL: '$'
};

var urlRegex = /^(http(s)?:\/\/)?(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

$(function() {

  var client = ZAFClient.init();

  var handleShowMore = function(event) {
      event.preventDefault();
      this.switchTo('hitsList', { hits: this.hitsList });
  };

  var handleBack = function(event) {
      event.preventDefault();
      this.attemptCanvasRefresh();
  };

  var handleMoreLessClick = function(event) {
      event.target.parentNode.classList.toggle('totExpandBox');
      resize();
  };

  var resize = function() {
    var height = $("#content").height();
    client.invoke('resize', { width: '100%', height: height });
  };

  var obj = {

    actions: {
        customer: {
            '.showMore': handleShowMore,
            '.totMoreLessButton': handleMoreLessClick
        },
        hitsList: {
            '.back': handleBack
        }
    },

    addClickListener: function(f, query) {
        $(query).click(f.bind(this));
    },

    switchTo: function (template_name, context) {
        var templateUrl = "templates/" + template_name + ".hdbs";
        $.ajax(templateUrl).done(function(data){
            var template = Handlebars.compile(data);
            var html_data = context ? template(context): template();
            $("#content").html(html_data);
            resize();
            _.forEach(this.actions[template_name], this.addClickListener.bind(this));
        }.bind(this));
    },

    getServiceAttributes: function() {
        var options = this.getRequest('attributes.json');
        return client.request(options).then(this.handleServiceAttributes.bind(this));
    },

    initEnrichers: function() {
      // Get attributes
      this.attributesMap = {};
      return this.getServiceAttributes();
    },

    getRequest: function(resource, version) {
      return {
        headers  : {
          'app-token': "{{setting.api_key}}"
        },
        url      : "https://" + this.apiUrl + "/api/" + (version || "v1") + "/" + resource,
        method   : 'GET',
        secure: true,
        dataType : 'json'
      };
    },

    postRequest: function(resource,data) {
      return {
        headers  : {
          'app-token': "{{setting.api_key}}"
        },
        url      : "https://" + this.apiUrl + "/api/v1/" + resource,
        method   : 'POST',
        secure: true,
        dataType : 'json',
        data: data,
      };
    },
    
    handleProfileFailed : function(data) {
      if (data.error && data.error.type && data.error.message) {
        if (data.error.type == 'authentication_failed')
        {
          this.showError(null, 'Authentication with Totango has failed. Please check your API token in the App settings or contact support@totango.com');
        }
        else
        {
          this.showError(null, data.error.message+' Please contact support@totango.com');
        }
      }
      else
      {
        this.showError(null, 'Ooops something went wrong. Please check your API token in the App settings or contact support@totango.com');
      }
      return;
    },

    handleUserFromApi: function(targetObj) {
        var tmpEmail = targetObj.name;
        if(this.settings.fallback_totango_attribute){
          tmpEmail = this.userEmail;
        }
        this.customer = {
          email: tmpEmail,
          displayName: targetObj.display_name,
          isOnline: targetObj.is_online,
          avatar: this.getGravatarImgLink(tmpEmail, 80),
          uri: this.buildURI('https://app.totango.com/#!/userProfile', {
            user: targetObj.name,
            customer: targetObj.account.name,
            src: 'zendeskApp'
          }),
          accountUri: this.buildURI('https://app.totango.com/#!/customerDetails', {
            customer: targetObj.account.name,
            src: 'zendeskApp'
          }),
          accountName: targetObj.account.name,
          accountDisplayName: targetObj.account.display_name
        };

        this.clearCanvasRefresh();

        this.getUserData(targetObj.name, targetObj.account.name).then(this.handleUserData.bind(this));
        this.getUserStream(targetObj.name, targetObj.account.name).then(this.handleUserStream.bind(this));
        this.getAccountData(targetObj.account.name).then(this.handleAccountData.bind(this));
    },

    getUserData: function(email,accountName) {
        email = encodeURIComponent(email);
        var options = this.getRequest('user/get.json?account=' + accountName + '&name=' + email + '&src=zendeskApp');
        return client.request(options);
    },

    getUserStream: function(email,accountName) {
        email = encodeURIComponent(email);
        var tNowStream = new Date();
        var tStartStream = new Date(tNowStream.getTime() - 1000*60*60*24*10);
        var options = this.getRequest('realtime/stream.json?start=' + tStartStream.toISOString() + '&account=' + accountName + '&user=' + email + '&src=zendeskApp');
        return client.request(options);
      },

    getAccountData: function(accountName) {
        var options = this.getRequest('accounts/' + accountName + '/', 'v2');
        return client.request(options);
      },

    handleServiceAttributes: function(data) {
      var attributesMap = {};
      var atts = data.list;
      if(!atts || !atts.length) { return; }
      var newObj = null;
      for( var i = 0 ;i < atts.length; i++ ) {
          newObj = null;
          if( atts[i].type.toLowerCase() === 'tag' ) {
              // No need for tag hadling
          }
          else {
              newObj = atts[i];
              if (newObj.key_name && newObj.key_name !== '' && newObj.key_name !== ' ')
              {
                  attributesMap[newObj.key_name] = newObj;
              }
          }
      }
      this.attributesMap = attributesMap;

    },

    handleProfile: function(data) {
      if (data.errors) {
        this.showError(null, data.errors);
        return;
      }
      if (_.get(data, 'response.users.hits.length') > 0)
      {
        this.accountOnly = false;
        this.hitsList = _.map(data.response.users.hits, function(user) {
          return {
            url: "https://app.totango.com/#!/userProfile?user=" + user.name + "&customer=" + user.account.name + "&src=zendeskApp",
            name: user.display_name
          };
        });
        var targetObj = data.response.users.hits[0];
        this.handleUserFromApi(targetObj);

      }
      else {
        this.showError(this.I18n.t('global.error.customerNotFound'), " ");
      }
    },

    // Build a URI with parameters.
    //
    // buildURI("http://example.com/", {arg1: "foo", arg2: "hello/world"})
    // #=> "http://example.com/?arg1=foo&arg2=hello%2Fworld"
    buildURI: function(uri, args) {
      if (args) {
        uri += "?" + _.map(args, function(value, key) {
          return [key, encodeURIComponent(value)].join('=');
        }).join('&');
      }
      return uri;
    },

    getApiUrl: async function() {
      this.apiUrl = 'api.totango.com';
      if (this.settings.service_id) {
        try {
          const serviceData = await client.request({
            url      : 'https://api.totango.com/domains/',
            method   : 'GET',
            dataType: 'json',
            data: {
              service_id: this.settings.service_id
            }
          });
          if (serviceData.site === 't11') {
            this.apiUrl = 'api-eu1.totango.com';
          }
        } catch (error) {
          console.error('error while fetching api url', error);
        }
      }
    },

    initMetadata: function() {
        this.settings = {};
        return client.metadata().then(function(metadata) {
            _.forEach(metadata.settings, function(value, key) {
                this.settings[key] = value;
            }.bind(this));
            return;
        }.bind(this));
    },

    getUserEmail: function() {
        return client.context().then(function(context) {
            var pathToUser;
            switch (context.location) {
                case 'user_sidebar':
                    pathToUser = 'user';
                    break;
                case 'ticket_sidebar':
                case 'new_ticket_sidebar':
                    pathToUser = 'ticket.requester';
                    break;
                default:
                    pathToUser = 'currentUser';
            }
            pathToUser = pathToUser + '.email';
            return client.get(pathToUser).then(function(result) {
                return result[pathToUser];
            });
        });
    },

    setCustomFiled: function() {
        var fieldKey = 'ticket.customField:' + this.settings.fallback_custom_field;
        return client.get(fieldKey)
            .then(function(result) {
                this.customField = result[fieldKey]
            }.bind(this));
    },

    setLocale: function() {
        return client.get('currentUser.locale').then(function(data) {
            this.locale = data['currentUser.locale'];
        }.bind(this));
    },

    init: async function() {
      await this.initMetadata();
      await this.getApiUrl();
      if (this.settings.fallback_custom_field) {
          this.setCustomFiled();
      }
      const email = this.getUserEmail();
      this.userEmail = this.settings.use_hashed_email ? this.MD5(email).toString() : email;
      await this.setLocale();
      this.queryCustomer();
    },

    queryCustomer: function() {
        var config = {};
        this.switchTo('requesting');
  
        // Enrich attributes and users
        this.initEnrichers().then(() => {
          // Get customer.
          config.zendesk_ticket_email = this.userEmail;
          config.totango_fallback_attribute = this.settings.fallback_totango_attribute;
      
          if (this.settings.fallback_custom_field) {
            // Use fallback field if needed.
            config.zendesk_fallback_field = this.customField;
          }

          this.locateUser(config)
              .then(this.handleProfile.bind(this))
              .catch(this.handleProfileFailed.bind(this));
          });
    },

    locateUser : function(config) {
        var tmpObj = {},terms = [{type:"or", or:[] }];
        var orTerms = terms[0].or;
        var query = {"terms":[],"count":60,"offset":0,"fields":[],"sort_by":"display_name","sort_order":"ASC","scope":"all"};
        
        function isValidValue(str){
            return (typeof str === 'string' && str !== '0' & str!== 'null');
        }

        function hasUpperCase(str){
            return (str !== str.toLowerCase());
        }
        
        function addUserIdTerm(userId){
            userId = encodeURIComponent(userId);
            orTerms.push({"type":"string","term":"identifier","eq":userId});
            if( hasUpperCase( userId ) ) {
                orTerms.push({"type":"string","term":"identifier","eq":userId.toLowerCase() });
            }
        }
        
        function addCustomAttributeTerm(attribute, attributeValue){
            attributeValue = encodeURIComponent(attributeValue);
            orTerms.push({"type":"string_attribute","attribute":attribute,"eq":attributeValue});
            if( hasUpperCase( attributeValue ) ) {
                orTerms.push({"type":"string_attribute","attribute":attribute,"eq":attributeValue.toLowerCase()});
            }
        }

        /****************
        * Accepts:
        * config.zendesk_ticket_email => the Email of the person who opened the ticket on Zendesk.
        * config.zendesk_fallback_field => the Value of a custom field in the ticket on Zendesk
        * 
        * config.totango_fallback_attribute => An attribute in the user profile on Totango
        *****************/
        
        // var date_term = {"type":"date","term":"date","eq":0};
        
        // 1. zendesk_ticket_email <=> totango_user_id + (lowercase check)
        if( isValidValue(config.zendesk_ticket_email) ){
            addUserIdTerm(config.zendesk_ticket_email);
            
            // 2. zendesk_ticket_email <=> totango_fallback_attribute + (lowercase check)
            if( isValidValue(config.totango_fallback_attribute) ){
                addCustomAttributeTerm(config.totango_fallback_attribute, config.zendesk_ticket_email);
            }
        }

        // 3. zendesk_fallback_field <=> totango_user_id + (lowercase check)
        if( isValidValue(config.zendesk_fallback_field) ){
          addUserIdTerm(config.zendesk_fallback_field);
          
          // 4. zendesk_fallback_field <=> totango_fallback_attribute + (lowercase check)
          if( isValidValue(config.totango_fallback_attribute) ){
            addCustomAttributeTerm(config.totango_fallback_attribute, config.zendesk_fallback_field);
          }
        }
        // TODO: validate that there are orTerms.
        
        query.terms = terms;
        tmpObj.query = JSON.stringify(query);

        var options = this.postRequest('search/users', tmpObj);
        return client.request(options);
      },

    handleUserData: function(data) {
      if (data.errors) {
        return this.showError(this.I18n.t('global.error.orders'), data.errors);
      }

      if (data.user)
      {
        var tmpUser = data.user;
        // Status

        this.customer.userFirstSeen = this.timeago(tmpUser.first_activity_time);
        this.customer.userLastSeen = this.timeago(tmpUser.last_activity_time);

        var tmpuserTagsArr = tmpUser.tags;
        var finalUserTags = [];
        var rowCharCount=0;
        var tmpTagObj;
        var hasExpand = false;

        // User Tags
        for (var x =0; x< tmpuserTagsArr.length;x++)
        {
          rowCharCount += 15;
          rowCharCount += tmpuserTagsArr[x].length;

          tmpTagObj = {
              "tag" : tmpuserTagsArr[x],
              "cssClass" : 'totFirst'
          };
          if (rowCharCount > 62)
          {

            if (!hasExpand)
            {
              finalUserTags.push({
                "tag" : "More...",
                "cssClass" : 'totMoreLessButton totExpandButton ',
              });
              hasExpand = true;
            }
            tmpTagObj.cssClass = 'totExpand';
          }
          finalUserTags.push(tmpTagObj);
        }
        if (hasExpand)
        {
          finalUserTags.push({
            "tag" : "Less...",
            "cssClass" : 'totExpand totMoreLessButton totExtractButton',
          });
        }
        this.customer.tags =  finalUserTags;

        this.customer.canvasHasUser = true;
        this.attemptCanvasRefresh();
      }
    },

    clearCanvasRefresh: function() {
      this.customer.canvasHasUser = false;
      this.customer.canvasHasStream = false;
      this.customer.canvasHasAccount = false;
    },

    attemptCanvasRefresh: function() {
      if (this.accountOnly && this.customer.canvasHasAccount || this.customer.canvasHasUser && this.customer.canvasHasStream && this.customer.canvasHasAccount)
      {
        this.updateTemplate('customer', {
          accountOnly: this.accountOnly,
          customer: this.customer,
          moreHits: this.hitsList.length > 1
        });
      }
    },

    handleUserStream: function(data) {
      var maxUsageShow = 100;

      if (data.errors) {
        this.showError(this.I18n.t('global.error.orders'), data.errors);
        return;
      }
      this.customer.totActions = {};
      this.customer.totModules = {};
      var totSession, totAction,totModule;
      if (data.realtime && data.realtime.stream && data.realtime.stream.items && data.realtime.stream.items.length > 0)
      {
        for (var i=0; i<data.realtime.stream.items.length; i++)
        {
            totSession=data.realtime.stream.items[i];
            for (var j=0; j<totSession.actions.length; j++)
            {
                totAction = totSession.actions[j];
                this.mergeRecentUsage ('actions',totAction);
            }
            for (var k=0; k<totSession.modules.length; k++)
            {
                totModule = totSession.modules[k];
                this.mergeRecentUsage ('modules',totModule);
            }
        }
      }

      // Actions calculations
      var tmpActionsObj = this.customer.totActions;
      var tmpUsageActionsArr = [];
      for (var prop in tmpActionsObj) {
        if(tmpActionsObj.hasOwnProperty(prop))
        {
          tmpUsageActionsArr.push({
            usage: prop,
            usage_count: tmpActionsObj[prop],
            cssClass: 'totFirst'
          });
        }
      }
      tmpUsageActionsArr.sort(function(a, b) {
        return b.usage_count - a.usage_count;
      });

      var finalUsageActions = [];
      var rowCharCount = 0;
      var hasExpand = false;

      for (var z =0; z< Math.min(tmpUsageActionsArr.length,maxUsageShow);z++)
      {
        rowCharCount += 15;
        rowCharCount += tmpUsageActionsArr[z].usage.length;

        if (rowCharCount > 62)
        {
          if (!hasExpand)
          {
            finalUsageActions.push({
              "usage" : "More...",
              "cssClass" : 'totMoreLessButton totExpandButton ',
            });
            hasExpand = true;
          }

          tmpUsageActionsArr[z].cssClass = 'totExpand';
        }
        finalUsageActions.push(tmpUsageActionsArr[z]);
      }
      if (hasExpand)
      {
        finalUsageActions.push({
          "usage" : "Less...",
          "cssClass" : 'totExpand totMoreLessButton totExtractButton',
        });
      }
      this.customer.finalUsageActions = finalUsageActions;

      // Modules Calculations
      var tmpModulesObj = this.customer.totModules;
      var tmpUsageModulesArr = [];
      for (var prop2 in tmpModulesObj) {
        if (tmpModulesObj.hasOwnProperty(prop2))
        {
          tmpUsageModulesArr.push({
            usage: prop2,
            usage_count: tmpModulesObj[prop2]
          });
        }
      }
      tmpUsageModulesArr.sort(function(a, b) {
          return b.usage_count - a.usage_count;
      });

      var finalUsageModules = [];
      rowCharCount =0;
      hasExpand = false;
      for (var x =0; x< Math.min(tmpUsageModulesArr.length,maxUsageShow);x++)
      {
        rowCharCount += 15;
        rowCharCount += tmpUsageModulesArr[x].usage.length;

        if (rowCharCount > 62)
        {
          if (!hasExpand)
          {
            finalUsageModules.push({
              "usage" : "More...",
              "cssClass" : 'totMoreLessButton totExpandButton ',
            });
            hasExpand = true;
          }
          tmpUsageModulesArr[x].cssClass = 'totExpand';
        }
        finalUsageModules.push(tmpUsageModulesArr[x]);
      }
      if (hasExpand)
      {
        finalUsageModules.push({
          "usage" : "Less...",
          "cssClass" : 'totExpand totMoreLessButton totExtractButton',
        });
      }
      this.customer.finalUsageModules = finalUsageModules;

      this.customer.canvasHasStream = true;
      this.attemptCanvasRefresh();
    },

    mergeRecentUsage: function(type,usage) {
      var flagReturn = true;
      if (type==='actions')
      {
        if (this.customer.totActions[usage.action_display_name])
        {
          this.customer.totActions[usage.action_display_name]= this.customer.totActions[usage.action_display_name] + usage.usage_count;
        }
        else
        {
          this.customer.totActions[usage.action_display_name]= usage.usage_count;
        }
      }
      else
      {
         // Modules
         if (this.customer.totModules[usage.module_display_name])
          {
            this.customer.totModules[usage.module_display_name]= this.customer.totModules[usage.module_display_name] + usage.usage_count;
          }
          else
          {
            this.customer.totModules[usage.module_display_name]= usage.usage_count;
          }
      }
      return flagReturn;
    },
    isNumber: function(o) {
        return typeof o === 'number' && isFinite(o);
    },

    attributeValueDisplay: function(attributeKey, attributeOnAccount){
      var attributesMap = this.attributesMap;
      var attributeDefinition = attributesMap[attributeKey];

      if(attributeOnAccount){
        var attributeValue = attributeOnAccount.val;
        if(attributeDefinition) {
          switch (attributeDefinition.type.toLowerCase()) {
            case 'text':
              return attributeValue;
            case 'date':
              return this.dateToStr(new Date (attributeValue));
            case 'currency': {
              var currency = _.get(this.attributesMap, [attributeKey, "formatSettings", "sign"]);
              var sign = currencyMap[currency] || "$";
              return `${sign}${this.formatNumber(attributeValue,'0,000')}`;
            }
            case 'numeric': {
              var numberValue = Number(attributeValue);
              if (this.isNumber(numberValue)){
                if(numberValue%1 === 0){
                  return this.formatNumber(numberValue,'0,000');
                }
              }
            }
            default:
              return attributeValue;
          }
        }
      }
      return '';
    },

    addOwnerAttribute: function(accountData, attributeKey) {
      var owner = accountData.attributes[attributeKey];
      var ownerEmail = accountData.attributes[`${attributeKey}___tid`];
      if (owner) {
        return {
          isOwner: true,
          displayName: owner.display_name,
          userName: owner.val,
          userEmail: ownerEmail && ownerEmail.val,
        };
      }
    },

    buildAttributeObject: function(name, value) {
      var isLink = urlRegex.test(value);
      var linkValue = value;
      if (isLink && value.indexOf('http') !== 0) {
        linkValue = 'http://' + value;
      }
      return {
        isLink: urlRegex.test(value),
        linkValue: linkValue,
        isAttribute: true,
        displayName: name,
        value: value,
      };
    },

    buildAccountAttribute: function(accountData, attributeKey) {
      var attribute = accountData.attributes[attributeKey];
      if (!attribute) {
        return;
      }
      if (attribute.business_type === 'owner') {
        return this.addOwnerAttribute(accountData, attributeKey);
      }
      return this.buildAttributeObject(attribute.display_name, this.attributeValueDisplay(attributeKey, attribute));
    },

    buildAccountStatus: function(accountData) {
      return {
        isStatus: true,
        status: _.capitalize(accountData.status_group),
        lifeCycle: accountData.status,
        showStatus: accountData.status_group.toLowerCase() !== accountData.status.toLowerCase(),
      };
    },

    buildAccountHealth: function(accountData) {
      var health = _.get(accountData, 'health.curr');
      var healthObject = {
        isHealth: true,
      };
      switch (health) {
        case 'green':
          healthObject.accountHealth = 'Good';
          healthObject.healthCSS = 'healthGood';
          break;
        case 'red':
          healthObject.accountHealth = 'Poor';
          healthObject.healthCSS = 'healthPoor';
          break;
        case 'yellow':
          healthObject.accountHealth = 'Average';
          healthObject.healthCSS = 'healthAverage';
          break;
        default:
          healthObject.accountHealth = 'Undefined';
          healthObject.healthCSS = '';
      }
      return healthObject;
    },

    buildEngagementScore: function(accountData) {
        var currScore = _.get(accountData, 'metrics.score.curr') || 0;
        var prevScore = _.get(accountData, 'metrics.score.prev') || 0;
        var scoreChange = currScore - prevScore;
        return {
          isEngagementScore: true,
          score: currScore,
          showTrend: scoreChange !== 0,
          trendUp: scoreChange > 0,
          trend: Math.abs(scoreChange),
        };
    },

    buildUsageFrequency: function(accountData) {
      return this.buildAttributeObject('Usage Frequency', _.capitalize(accountData.usage_frequency.curr));
    },

    buildCreationDate: function(accountData) {
      var createDate = _.get(accountData, ['attributes', 'Create Date', 'val']);
      var tmpCreateDate = new Date(createDate);
      return this.buildAttributeObject('Account Created', this.timeago(tmpCreateDate.getTime()));
    },

    handleAccountData: function(data) {
      if (data.errors) {
        this.showError(this.I18n.t('global.error.orders'), data.errors);
        return;
      }
      if (data.account) {
        var totangoAttributes = this.settings.totango_attributes || '';
        var additionalAttributes = this.settings.extra_totango_attributes || '[]';
        var additionalAttributesArr = [];
        try {
          additionalAttributesArr = JSON.parse(additionalAttributes);
        } catch (e) {
          console.error('extra_totango_attributes must be a an array of strings');
        }
        var attributesArr = totangoAttributes.split('\n').concat(additionalAttributesArr);
        this.customer.attributes = _.compact(attributesArr.map((attributeKey) => {
          switch (attributeKey) {
            case 'status':
              return this.buildAccountStatus(data.account);
            case 'health':
              return this.buildAccountHealth(data.account);
            case 'Engagement Score':
              return this.buildEngagementScore(data.account);
            case 'Usage Frequency':
              return this.buildUsageFrequency(data.account);
            case 'Account Created':
              return this.buildCreationDate(data.account);
            default: {
              return this.buildAccountAttribute(data.account, attributeKey);
            }
          }
        }));

        // Account tags
        if (this.settings.show_tags) {
          var tmpAccountTags = [];
          var rowCharCount = 0;
          var hasExpand = false;

          _.forEach(data.account.tags, function(tag) {
            rowCharCount += 8;
            rowCharCount += tag.length;
            
            var tmpTagObj = {
              "tag" : tag,
              "cssClass" : 'totFirst'
            };
            if (rowCharCount > 62) {
              if (!hasExpand) {
                tmpAccountTags.push({
                  "tag" : "More...",
                  "cssClass" : 'totMoreLessButton totExpandButton ',
                });
                hasExpand = true;
              }
              tmpTagObj.cssClass = 'totExpand';
            }
            tmpAccountTags.push(tmpTagObj);
          });
          if (hasExpand) {
              tmpAccountTags.push({
                "tag" : "Less...",
                "cssClass" : 'totExpand totMoreLessButton totExtractButton',
              });
          }

          this.customer.accountTags = tmpAccountTags;
        }

        this.customer.canvasHasAccount = true;
        this.attemptCanvasRefresh();
      }
    },

    getGravatarImgLink: function(email,size) {
      var mail="";

      if (email)
      {
        mail = this.MD5(email.trim().toLowerCase()).toString();
      }
      if (size==null)
      {
        size=80;
      }
      return "//www.gravatar.com/avatar/" + mail +"?size="+size+"&default=https%3A%2F%2Fapp.totango.com%2Fimages%2Fdefault-userpic-generic.gif";
    },

    timeago: function(dateUnix){
      var date = new Date(dateUnix);
      var now = new Date();
        var diff = ((now.getTime() - date.getTime()) / 1000)

        , day_diff = Math.floor(diff / 86400)
        , weeks_diff = Math.floor( day_diff / 7 )
        , months_diff = Math.floor( day_diff / 30 )
        , years_diff = Math.floor( day_diff / 365 );

        if (diff < 0)
        {
          return "N/A";
        }

        if ( isNaN(day_diff) || day_diff < 0 )
        {
            diff = (((new Date()).getTime()*1000 - date.getTime())/1000 );
            day_diff = Math.floor(diff / 86400);

            if ( isNaN(day_diff) || day_diff < 0 )
                return "";
        }

        var tr="N/A";
        if (day_diff === 0)
        {
          if (diff <60) {tr = "just now";}
          else if (diff <120) {tr = "1 minute ago";}
          else if (diff <3600) {tr = Math.floor( diff / 60 ) + " minutes ago";}
          else if (diff <7200) {tr = "1 hour ago";}
          else if (diff <86400) {tr = Math.floor( diff / 3600 ) + " hours ago";}
        }
        else if (day_diff === 1)
        {
          tr = "Yesterday";
        }
        else if (day_diff < 14)
        {
          tr = day_diff + " days ago";
        }
        else if (weeks_diff === 1)
        {
          tr = "1 week ago";
        }
        else if (weeks_diff <4)
        {
          tr = weeks_diff + " weeks ago";
        }
        else if (months_diff === 1)
        {
          tr = "1 month ago";
        }
        else if (months_diff < 24)
        {
          tr = months_diff + " months ago";
        }
        else if (years_diff === 1)
        {
          tr = "1 year ago";
        }
        else if (years_diff < 30)
        {
          tr = years_diff + " years ago";
        }

        return tr;
    },



    formatNumber: function(number, format)
    {
      if (format === null)
        format = '0,000';
      else if (typeof(format)!="string") {return '';} // sanity check

      var hasComma = -1 < format.indexOf(',');
      var psplit = this.stripNonNumeric(format).split('.');


      number=Number(number);
      // compute precision
      if (1 < psplit.length) {
        // fix number precision
        number = number.toFixed(psplit[1].length);
      }
      // error: too many periods
      else if (2 < psplit.length) {
        throw('NumberFormatException: invalid format, formats should have no more than 1 period: ' + format);
      }
      // remove precision
      else {
        number = number.toFixed(0);
      }

      // get the string now that precision is correct
      var fnum,minus='';
      if (number>=0)
      {    fnum = number.toString(); }
      else
      {
          fnum = (number*(-1)).toString();
          minus='-';
      }
      // format has comma, then compute commas
      if (hasComma)
      {
        // remove precision for computation
        psplit = fnum.split('.');

        var cnum = psplit[0],
          parr = [],
          j = cnum.length,
          m = Math.floor(j / 3),
          n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop

        // break the number into chunks of 3 digits; first chunk may be less than 3
        for (var i = 0; i < j; i += n) {
          if (i !== 0) {n = 3;}
          parr[parr.length] = cnum.substr(i, n);
          m -= 1;
        }

        // put chunks back together, separated by comma
        fnum = parr.join(',');

        // add the precision back in
        if (psplit[1]) {fnum += '.' + psplit[1];}
      }
      fnum=minus+fnum;
      // replace the number portion of the format with fnum
      return format.replace(/[\d,?\.?]+/, fnum).replace(".00","");
    },


    //This function removes non-numeric characters
    stripNonNumeric  :function( str )
    {
      str += '';
      var rgx = /^\d|\.|-$/;
      var out = '';
      for( var i = 0; i < str.length; i++ )
      {
        if( rgx.test( str.charAt(i) ) ){
          if( !( ( str.charAt(i) === '.' && out.indexOf( '.' ) !== -1 ) ||
                 ( str.charAt(i) === '-' && out.length !== 0 ) ) ){
            out += str.charAt(i);
          }
        }
      }
      return out;
    },

    dateToStr  :function( dateToConvert )
    {
      var monthsShort= ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return ''+monthsShort[dateToConvert.getMonth()]+' '+dateToConvert.getDate()+', '+dateToConvert.getFullYear();
    },

    updateTemplate: function(name, data, klass, onSuccess) {
        if (this.currentState !== 'profile') {
            this.switchTo('profile', null);
            this.currentState = 'profile';
        }

      var selector = '.' + (klass || name);
      $(selector).html(this.switchTo(name, data, onSuccess));
    },

    showError: function(title, msg, klass) {
      var data = {
        title: title || this.I18n.t('global.error.title'),
        message: msg || this.I18n.t('global.error.message')
      };

      if (klass) {
        this.updateTemplate('error', data, klass);
      } else {
        this.switchTo('error', data);
      }
    },

    handleFail: function() {
      // Show fail message
      this.showError();
    },

    MD5: function (string) {
      function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
      }

      function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
          return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
          if (lResult & 0x40000000) {
            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
          } else {
            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
          }
        } else {
          return (lResult ^ lX8 ^ lY8);
        }
      }

      function F(x,y,z) { return (x & y) | ((~x) & z); }
      function G(x,y,z) { return (x & z) | (y & (~z)); }
      function H(x,y,z) { return (x ^ y ^ z); }
      function I(x,y,z) { return (y ^ (x | (~z))); }

      function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }

      function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }

      function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }

      function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
      }

      function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
          lWordCount = (lByteCount-(lByteCount % 4))/4;
          lBytePosition = (lByteCount % 4)*8;
          lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
          lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
      }

      function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
          lByte = (lValue>>>(lCount*8)) & 255;
          WordToHexValue_temp = "0" + lByte.toString(16);
          WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
      }

      function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

          var c = string.charCodeAt(n);

          if (c < 128) {
            utftext += String.fromCharCode(c);
          }
          else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          }
          else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }

        }

        return utftext;
      }

      var x=Array();
      var k,AA,BB,CC,DD,a,b,c,d;
      var S11=7, S12=12, S13=17, S14=22;
      var S21=5, S22=9 , S23=14, S24=20;
      var S31=4, S32=11, S33=16, S34=23;
      var S41=6, S42=10, S43=15, S44=21;

      string = Utf8Encode(string);

      x = ConvertToWordArray(string);

      a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;


      for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
      }

      var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

      return temp.toLowerCase();
    }

  };

  client.on('user.email.changed', obj.queryCustomer.bind(obj));
  client.on('app.registered', obj.init.bind(obj));

});