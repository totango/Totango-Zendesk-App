(function() {

  return {

    MAX_ATTEMPTS : 20,

    defaultState: 'loading',
    locale: undefined,
    usingCustomfieldFallback: false,

    requests: {
      'getZendeskUser': {
        url: '/api/v2/users/me.json',
      },

      'getProfile' : function(email) {
        return this.getRequest(helpers.fmt('/search/name.json?query=%@&get=users&src=zendeskApp', email));
      },
      'searchAccounts': function(name) {
        return this.getRequest(helpers.fmt('/search/name.json?query=%@&get=accounts&src=zendeskApp', name));
      },
      'searchUsersAttributes': function(attribute,valueToSearch) {
        var tmpObj = {};
        tmpObj.query = JSON.stringify({"terms":[{"type":"string_attribute","attribute":attribute,"eq":valueToSearch}],"count":60,"offset":0,"fields":[],"sort_by":"display_name","sort_order":"ASC","scope":"all"});
        tmpObj.date_term = JSON.stringify({"type":"date","term":"date","eq":0});
        return this.postRequest('/search/users', tmpObj);
      },
      'getUserData' : function(email,accountName) {
        return this.getRequest(helpers.fmt('/user/get.json?account=%@&name=%@&src=zendeskApp', accountName, email));
      },
      'getUserStream' : function(email,accountName) {
        var tNowStream = new Date();
        var tStartStream = new Date(tNowStream.getTime() - 1000*60*60*24*10);
        return this.getRequest(helpers.fmt('/realtime/stream.json?start=%@&account=%@&user=%@&src=zendeskApp', tStartStream.toISOString(), accountName, email));
      },
      'getAccountData' : function(accountName) {
        return this.getRequest(helpers.fmt('/account.json?name=%@&return=all&src=zendeskApp', accountName));
      }
    },

    events: {
      'app.created'                    : 'init',
      'ticket.requester.email.changed' : 'queryCustomer',
      'user.email.changed'             : 'queryCustomer',
      '*.changed'                      : 'handleChanged',
      'requiredProperties.ready'       : 'queryCustomer',
      'getProfile.done'                : 'handleProfile',
      'getProfile.fail'                : 'handleProfileFailed',
      'searchAccounts.done'            : 'handleSearchAccounts',
      'searchUsersAttributes.done'     : 'handleSearchUsersAttributes',
      'getUserData.done'               : 'handleUserData',
      'getUserStream.done'             : 'handleUserStream',
      'getAccountData.done'            : 'handleAccountData',
      'getZendeskUser.done'            : 'handleZendeskUser',
      'click .toggle-address'          : 'toggleAddress',
      'click .showMore'                : 'handleShowMore',
      'click .back'                    : 'handleBack'
    },

    init: function(data){
      _.defer(function() {
        this.ajax('getZendeskUser').done(function() {

          if ((this.ticket && this.ticket().requester()) || (this.user && this.user().email()) ) {
            // user may have selected a requester and reloaded the app
            this.queryCustomer();
          }
        }.bind(this));
      }.bind(this));
    },

    getCustomerEmail : function(){
      var email;
      if(this.ticket){
        email = this.ticket().requester().email();
      } else if(this.user){
        email = this.user().email();
      }
      if (this.setting('use_hashed_email')) {
        email = this.MD5(email).toString();
      }
      return email;
    },

    queryCustomer: function() {
      this.switchTo('requesting');
      var email = this.getCustomerEmail();
      this.ajax('getProfile', email);
    },

    getRequest: function(resource) {
      return {
        headers  : {
          // 'Authorization': this.settings.api_key
          'app-token': this.settings.api_key
        },
        url      : helpers.fmt("https://app.totango.com/api/v1%@", resource),
        method   : 'GET',
        dataType : 'json'
      };
    },

    postRequest: function(resource,data) {
      return {
        headers  : {
          // 'Authorization': this.settings.api_key
          'app-token': this.settings.api_key
        },
        url      : helpers.fmt("https://app.totango.com/api/v1%@", resource),
        method   : 'POST',
        dataType : 'json',
        data: data,
      };
    },

    handleZendeskUser: function(data) {
      this.locale = data.user.locale;
    },

    handleChanged: _.debounce(function(e) {
      // test if change event fired before app.activated
    }, 500),

    handleShowMore: function(event) {
      event.preventDefault();
      this.switchTo('hitsList', { hits: this.hitsList });
    },

    handleBack: function(event) {
      event.preventDefault();
      this.attemptCanvasRefresh();
    },

    handleSearchAccounts: function(data) {
      if (data.errors) {
        this.showError(null, data.errors);
        return;
      }
      if (data.error && data.error.type && data.error.message) {
        if (data.error.type == 'authentication_failed')
        {
          this.showError(null, 'Authentication with Totango has failed. Please check your API token.');
        }
        else
        {
          this.showError(null, data.error.message);
        }
        return;
      }
      if (this.safeGetPath(data, 'response.hits.accounts.list.length') > 0) {
        this.accountOnly = true;
        var targetObj = data.response.hits.accounts.list[0];
        this.hitsList = _.map(data.response.hits.accounts.list, function(account) {
          return {
            url: helpers.fmt("https://app.totango.com/#!/customerDetails?customer=%@&src=zendeskApp", account.name),
            name: account.display_name
          };
        });

        this.customer = {
          accountUri: this.buildURI('https://app.totango.com/#!/customerDetails', {
            customer: targetObj.name,
            src: 'zendeskApp'
          }),
          accountName: targetObj.name,
          accountDisplayName: targetObj.display_name
        };
        this.ajax('getAccountData',  targetObj.name);
        // Deprecated: Refresh Every 2 minutes to get online status.
        // var refreshWidget = setInterval(function(){
        //   this.clearCanvasRefresh();
        //   this.ajax('getAccountData',  targetObj.name);
        // }.bind(this), 120000);
      }
      else {
        this.showError(this.I18n.t('global.error.customerNotFound'), " ");
      }
    },

    handleSearchUsersAttributes : function(data){
      console.log("DATA IS here");
      console.log(data);
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




    handleProfile: function(data) {
      var fieldKey;
      if (data.errors) {
        this.showError(null, data.errors);
        return;
      }
      if (this.safeGetPath(data, 'response.hits.users.list.length') > 0)
      {
        this.accountOnly = false;
        this.hitsList = _.map(data.response.hits.users.list, function(user) {
          return {
            url: helpers.fmt("https://app.totango.com/#!/userProfile?user=%@&customer=%@&src=zendeskApp", user.name, user.account.name),
            name: user.display_name
          };
        });
        var targetObj = data.response.hits.users.list[0];
        this.customer = {
          email: targetObj.name,
          isOnline: targetObj.is_online,
          avatar: this.getGravatarImgLink(targetObj.name, 80),
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

        this.ajax('getUserData', targetObj.name, targetObj.account.name);
        this.ajax('getUserStream', targetObj.name, targetObj.account.name);
        this.ajax('getAccountData',  targetObj.account.name);

        // DEPRECATED: refresh every 2 minutes...
        // var refreshWidget = setInterval(function(){
        //   this.clearCanvasRefresh();
        //   this.ajax('getUserData', targetObj.name, targetObj.account.name);
        //   this.ajax('getUserStream', targetObj.name, targetObj.account.name);
        //   this.ajax('getAccountData',  targetObj.account.name);
        // }.bind(this), 120000);

      }
      else if (this.setting('fallback_custom_field') && !this.usingCustomfieldFallback) {
        this.usingCustomfieldFallback = true;
        fieldKey = helpers.fmt('custom_field_%@', this.setting('fallback_custom_field'));
        this.ajax('getProfile', this.ticket().customField(fieldKey));
      }
      else if (this.setting('fallback_custom_field') && this.usingCustomfieldFallback) {
        fieldKey = helpers.fmt('custom_field_%@', this.setting('fallback_custom_field'));
        this.ajax('searchAccounts', this.ticket().customField(fieldKey));
      }
      else if (this.setting('fallback_totango_attribute')){
        fieldKey = this.setting('fallback_totango_attribute');
        this.ajax('searchUsersAttributes',fieldKey,this.getCustomerEmail());
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
                "onClick": "this.parentNode.className = '';"
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
            "onClick": "this.parentNode.className = 'totExpandBox';"
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
      else
      {
        // console.log('still pending');
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
              "onClick": "this.parentNode.className = '';"
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
          "onClick": "this.parentNode.className = 'totExpandBox';"
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
              "onClick": "this.parentNode.className = '';"
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
          "onClick": "this.parentNode.className = 'totExpandBox';"
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

    handleAccountData: function(data) {
      if (data.errors) {
        this.showError(this.I18n.t('global.error.orders'), data.errors);
        return;
      }
      if (data.account)
      {
        var tmpAccount = data.account;
        // Status
        this.customer.accountStatus = this.capitalize(tmpAccount.status.current);
        this.customer.accountLifecycle = tmpAccount.lifecycle.current;
        if (tmpAccount.status.current.toLowerCase() == tmpAccount.lifecycle.current.toLowerCase())
        {
          this.customer.showStatus = false;
        }
        else
        {
          this.customer.showStatus = true;
        }

        // Health
        var tmpHealth = tmpAccount.engagement.health.current;
        if (tmpHealth == 'green')
        {
          this.customer.accountHealth = 'Good';
          this.customer.healthCSS = 'healthGood';
        }
        else if (tmpHealth == 'red')
        {
          this.customer.accountHealth = 'Poor';
          this.customer.healthCSS = 'healthPoor';
        }
        else if (tmpHealth == 'yellow')
        {
          this.customer.accountHealth = 'Average';
          this.customer.healthCSS = 'healthAverage';
        }
        else
        {
          this.customer.accountHealth = 'Undefined';
        }

        // Engagement
        this.customer.accountEngagement = tmpAccount.engagement.score.current;
        this.customer.accountEngagementShowTrend = (tmpAccount.engagement.score.change !== 0);
        if (tmpAccount.engagement.score.change > 0)
        {
            this.customer.accountEngagementTrendUp = true;
        }
        else
        {
            this.customer.accountEngagementTrendUp = false;
        }
        this.customer.accountEngagementTrend = Math.abs(tmpAccount.engagement.score.change);

        // Usage frequency
        this.customer.accountUsageFrequency = this.capitalize(tmpAccount.frequency.current);

        // Attributes (Contract value, Renewal date)
        var tmpContractValue = tmpAccount.attributes['Contract Value'];
        if (tmpContractValue)
        {
          this.customer.contractValue = "$"+this.formatNumber(tmpContractValue.value,'0,000');
        }
        var tmpContractRenewal = tmpAccount.attributes['Contract Renewal Date'];
        if (tmpContractRenewal)
        {
          this.customer.contractRenewal = this.dateToStr(new Date (tmpContractRenewal.value));
        }
        var tmpSuccessManager = tmpAccount.attributes['Success Manager'];
        if (tmpSuccessManager)
        {
          this.customer.successManager = tmpSuccessManager.value;
        }
        var tmpSalesManager = tmpAccount.attributes['Sales Manager'];
        if (tmpSalesManager)
        {
          this.customer.salesManager = tmpSalesManager.value;
        }
        var tmpLicences = tmpAccount.attributes.Licenses;
        if (tmpLicences)
        {
          this.customer.Licenses = this.formatNumber(tmpLicences.value,'0,000');
        }


        // Create Date
        var tmpCreateDate = new Date(tmpAccount.create_date);
        this.customer.accountCreateDate = this.timeago(tmpCreateDate.getTime());

        // Account tags
        var totAttribute;
        var tmpAccountTags = [];
        var rowCharCount = 0;
        var hasExpand = false;

        for (var prop in tmpAccount.attributes) {
            if(tmpAccount.attributes.hasOwnProperty(prop))
            {
              totAttribute = tmpAccount.attributes[prop];
              if (totAttribute.type==='Tag')
              {
                rowCharCount += 8;
                rowCharCount += totAttribute.key.length;

                var tmpTagObj = {
                    "tag" : totAttribute.key,
                    "cssClass" : 'totFirst'
                };
                if (rowCharCount > 62)
                {
                  if (!hasExpand)
                  {
                    tmpAccountTags.push({
                      "tag" : "More...",
                      "cssClass" : 'totMoreLessButton totExpandButton ',
                      "onClick": "this.parentNode.className = '';"
                    });
                    hasExpand = true;
                  }
                  tmpTagObj.cssClass = 'totExpand';
                }

                tmpAccountTags.push(tmpTagObj);
              }
            }
        }
        if (hasExpand)
        {
          tmpAccountTags.push({
            "tag" : "Less...",
            "cssClass" : 'totExpand totMoreLessButton totExtractButton',
            "onClick": "this.parentNode.className = 'totExpandBox';"
          });
        }

        this.customer.accountTags = tmpAccountTags;

        this.customer.canvasHasAccount = true;
        this.attemptCanvasRefresh();
      }
    },

    getGravatarImgLink: function(email,size)
    {
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

    capitalize: function(str) {
      if (!str || str.length < 1) { return '';}
      return str.charAt(0).toUpperCase() + str.substr(1);
    },

    localeDate: function(date) {
      return new Date(date).toLocaleString(this.locale);
    },

    // JQUERY ?
    // this.$(e.target).parent().next('p').toggleClass('hide');

    updateTemplate: function(name, data, klass) {
      if (this.currentState !== 'profile') {
        this.switchTo('profile');
      }

      var selector = '.' + (klass || name);
      this.$(selector).html(this.renderTemplate(name, data));
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

    safeGetPath: function(object, propertyPath) {
      return _.inject( propertyPath.split('.'), function(context, segment) {
        if (context == null) { return context; }
        var obj = context[segment];
        if ( _.isFunction(obj) ) { obj = obj.call(context); }
        return obj;
      }, object);
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
}());
