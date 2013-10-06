(function() {

  return {

    MAX_ATTEMPTS : 20,

    defaultState: 'loading',
    locale: undefined,

    storeUrl: '',

    resources: {
      PROFILE_URI       : '/admin/customers/search.json?query=email:',
      CUSTOMER_URI      : '%@/admin/customers/%@',
      ORDERS_URI        : '%@/admin/orders.json?customer_id=%@&status=any',
      ORDER_PATH        : '%@/admin/orders/%@'
    },

    requests: {
      'getZendeskUser': {
        url: '/api/v2/users/me.json',
        proxy_v2: true
      },

      'getProfile' : function(email) {
        return this.getRequest('https://app.totango.com/api/v1/search/name.json?query='+email+'&get=users');
      },
      'getUserData' : function(email,accountName) {
        return this.getRequest('https://app.totango.com/api/v1/user/get.json?account='+accountName+'&name='+email);
      },
      'getUserStream' : function(email,accountName) {
        var tNowStream = new Date();
        var tStartStream = new Date(tNowStream.getTime() - 1000*60*60*24*10);
        return this.getRequest('https://app.totango.com/api/v1/realtime/stream.json?start='+tStartStream.toISOString()+'&account='+accountName+'&user='+email);
      },
      'getAccountData' : function(accountName) {
        return this.getRequest('https://app.totango.com/api/v1/account.json?name='+accountName+'&return=all');
      }
    },

    events: {
      'app.activated'                  : 'init',
      'ticket.requester.email.changed' : 'queryCustomer',
      '*.changed'                      : 'handleChanged',
      'requiredProperties.ready'       : 'queryCustomer',
      'getProfile.done'                : 'handleProfile',
      'getUserData.done'               : 'handleUserData',
      'getUserStream.done'             : 'handleUserStream',
      'getAccountData.done'            : 'handleAccountData',
      'getZendeskUser.done'            : 'handleZendeskUser',
      'click .toggle-address'          : 'toggleAddress'
    },

    init: function(data){
      if(!data.firstLoad){
        return;
      }
      this.ajax('getZendeskUser').done((function() {
        this.hasActivated = true;
        this.currAttempt = 0;
        // this.storeUrl = this.storeUrl || this.checkStoreUrl(this.settings.url);
        this.requiredProperties = [
          'ticket.requester.email'
        ];

        if (this.currentLocation() === 'ticket_sidebar') {
          this.allRequiredPropertiesExist();
        } else if (this.ticket().requester()) {
          // user may have selected a requester and reloaded the app
          console.log('CHECK THISSS Query customer ');
          this.queryCustomer();
        }
      }).bind(this));
    },

    queryCustomer: function() {
      if (this.hasActivated) {
        this.switchTo('requesting');
        this.ajax('getProfile', this.ticket().requester().email());
      }
    },

    getRequest: function(resource) {
      return {
        headers  : {
          // 'Authorization': this.settings.api_key
          'app-token': this.settings.api_key
        },
        url      : resource,
        method   : 'GET',
        dataType : 'json'
      };
    },

    handleZendeskUser: function(data) {
      this.locale = data.user.locale;
    },

    handleChanged: _.debounce(function(e) {
      // test if change event fired before app.activated
      if (!this.hasActivated) {
        return;
      }

    }, 500),

    handleProfile: function(data) {
      if (data.errors) {
        this.showError(null, data.errors);
        return;
      }

      if (data.response && data.response.hits && data.response.hits.users && data.response.hits.users.list  && data.response.hits.users.list.length > 0)
      {
           var targetObj = data.response.hits.users.list[0];
           this.customer = {
              email : targetObj.name
            };

            this.customer.isOnline = targetObj.is_online;
            this.customer.avatar = this.getGravatarImgLink(targetObj.name,80);
            this.customer.uri = ('https://app.totango.com/#!/userProfile?user='+encodeURIComponent(targetObj.name)+'&customer='+encodeURIComponent(targetObj.account.name));
            this.customer.accountUri = ('https://app.totango.com/#!/customerDetails?customer='+encodeURIComponent(targetObj.account.name));
            this.customer.accountName = targetObj.account.name;
            this.customer.accountDisplayName = targetObj.account.display_name;

          this.clearCanvasRefresh();

          this.ajax('getUserData', targetObj.name, targetObj.account.name);
          this.ajax('getUserStream', targetObj.name, targetObj.account.name);
          this.ajax('getAccountData',  targetObj.account.name);
          var that = this;
          var refreshWidget=setInterval(function(){
            that.clearCanvasRefresh();
            that.ajax('getUserData', targetObj.name, targetObj.account.name);
            that.ajax('getUserStream', targetObj.name, targetObj.account.name);
            that.ajax('getAccountData',  targetObj.account.name);
          },120000);

      } else {
        this.showError(this.I18n.t('global.error.customerNotFound'), " ");
      }
      return;


    },

    handleUserData: function(data) {

      if (data.errors) {
        this.showError(this.I18n.t('global.error.orders'), data.errors);
        return;
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
        var tmpExpandObj;

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
              tmpExpandObj = {
                "tag" : "More...",
                "cssClass" : 'totMoreLessButton totExpandButton ',
                "onClick": "this.parentNode.className = '';"
              };
              finalUserTags.push(tmpExpandObj);
              hasExpand = true;
            }
            tmpTagObj.cssClass = 'totExpand';
          }
          finalUserTags.push(tmpTagObj);
        }
        if (hasExpand)
        {
          tmpExpandObj = {
            "tag" : "Less...",
            "cssClass" : 'totExpand totMoreLessButton totExtractButton',
            "onClick": "this.parentNode.className = 'totExpandBox';"
          };
          finalUserTags.push(tmpExpandObj);
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
      if (this.customer.canvasHasUser && this.customer.canvasHasStream && this.customer.canvasHasAccount)
      {
        this.updateTemplate('customer', {
                customer: this.customer
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
      var tmpObj, tmpValue;
      for(var prop in tmpActionsObj) {
            if(tmpActionsObj.hasOwnProperty(prop))
            {
              tmpValue = tmpActionsObj[prop];
              tmpUsageActionsArr.push(
                {
                  "usage":prop,
                  "usage_count":tmpValue,
                  "cssClass":'totFirst'
                }
              );

            }
        }
      tmpUsageActionsArr.sort(function(a, b) {
          return b.usage_count - a.usage_count;
      });

      var finalUsageActions = [];
      var rowCharCount =0;

      var hasExpand = false;
      var tmpExpandObj;

      for (var z =0; z< Math.min(tmpUsageActionsArr.length,maxUsageShow);z++)
      {
        rowCharCount += 15;
        rowCharCount += tmpUsageActionsArr[z].usage.length;

        if (rowCharCount > 62)
        {
          if (!hasExpand)
          {
            tmpExpandObj = {
              "usage" : "More...",
              "cssClass" : 'totMoreLessButton totExpandButton ',
              "onClick": "this.parentNode.className = '';"
            };
            finalUsageActions.push(tmpExpandObj);
            hasExpand = true;
          }

          tmpUsageActionsArr[z].cssClass = 'totExpand';
        }
        finalUsageActions.push(tmpUsageActionsArr[z]);
      }
      if (hasExpand)
      {
        tmpExpandObj = {
          "usage" : "Less...",
          "cssClass" : 'totExpand totMoreLessButton totExtractButton',
          "onClick": "this.parentNode.className = 'totExpandBox';"
        };
        finalUsageActions.push(tmpExpandObj);
      }
      this.customer.finalUsageActions = finalUsageActions;

      // Modules Calculations
      var tmpModulesObj = this.customer.totModules;
      var tmpUsageModulesArr = [];
      for(var prop2 in tmpModulesObj) {
            if(tmpModulesObj.hasOwnProperty(prop2))
            {
              tmpValue = tmpModulesObj[prop2];
              tmpUsageModulesArr.push(
                {
                  "usage":prop2,
                  "usage_count":tmpValue
                }
              );

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
            tmpExpandObj = {
              "usage" : "More...",
              "cssClass" : 'totMoreLessButton totExpandButton ',
              "onClick": "this.parentNode.className = '';"
            };
            finalUsageModules.push(tmpExpandObj);
            hasExpand = true;
          }
          tmpUsageModulesArr[x].cssClass = 'totExpand';
        }
        finalUsageModules.push(tmpUsageModulesArr[x]);
      }
      if (hasExpand)
      {
        tmpExpandObj = {
          "usage" : "Less...",
          "cssClass" : 'totExpand totMoreLessButton totExtractButton',
          "onClick": "this.parentNode.className = 'totExpandBox';"
        };
        finalUsageModules.push(tmpExpandObj);
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
        this.customer.accountStatus = tmpAccount.status.current;
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
        this.customer.accountUsageFrequency = tmpAccount.frequency.current;

        // Create Date
        var tmpCreateDate = new Date(tmpAccount.create_date);
        this.customer.accountCreateDate = this.timeago(tmpCreateDate.getTime());

        // Account tags
        var totAttribute;
        var tmpAccountTags = [];
        var rowCharCount =0;
        var hasExpand = false;
        var tmpTagObj;
        var tmpExpandObj;

        for(var prop in tmpAccount.attributes) {
            if(tmpAccount.attributes.hasOwnProperty(prop))
            {
              totAttribute = tmpAccount.attributes[prop];
              if (totAttribute.type==='Tag')
              {


                rowCharCount += 8;
                rowCharCount += totAttribute.key.length;

                tmpTagObj = {
                    "tag" : totAttribute.key,
                    "cssClass" : 'totFirst'
                };
                if (rowCharCount > 62)
                {
                  if (!hasExpand)
                  {
                    tmpExpandObj = {
                      "tag" : "More...",
                      "cssClass" : 'totMoreLessButton totExpandButton ',
                      "onClick": "this.parentNode.className = '';"
                    };
                    tmpAccountTags.push(tmpExpandObj);
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
          tmpExpandObj = {
            "tag" : "Less...",
            "cssClass" : 'totExpand totMoreLessButton totExtractButton',
            "onClick": "this.parentNode.className = 'totExpandBox';"
          };
          tmpAccountTags.push(tmpExpandObj);
        }

        this.customer.accountTags = tmpAccountTags;


        this.customer.canvasHasAccount = true;
        this.attemptCanvasRefresh();
      }
    },

    getGravatarImgLink: function(email,size)
    {
      var mail="";

      var MD5 = function (string) {

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

              // var temp = 'sdkjfhjkdshfnjksdf';

              return temp.toLowerCase();
            };


      if (email)
      {
        mail = MD5(email.trim().toLowerCase()).toString();

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

    allRequiredPropertiesExist: function() {
      if (this.requiredProperties.length > 0) {
        var valid = this.validateRequiredProperty(this.requiredProperties[0]);

        // prop is valid, remove from array
        if (valid) {
          this.requiredProperties.shift();
        }

        if (this.requiredProperties.length > 0 && this.currAttempt < this.MAX_ATTEMPTS) {
          if (!valid) {
            ++this.currAttempt;
          }

          _.delay(_.bind(this.allRequiredPropertiesExist, this), 100);
          return;
        }
      }

      if (this.currAttempt < this.MAX_ATTEMPTS) {
        this.trigger('requiredProperties.ready');
      } else {
        this.showError(null, this.I18n.t('global.error.data'));
      }
    },

    safeGetPath: function(propertyPath) {
      return _.inject( propertyPath.split('.'), function(context, segment) {
        if (context == null) { return context; }
        var obj = context[segment];
        if ( _.isFunction(obj) ) { obj = obj.call(context); }
        return obj;
      }, this);
    },

    validateRequiredProperty: function(propertyPath) {
      var value = this.safeGetPath(propertyPath);
      return value != null && value !== '' && value !== 'no';
    },


    handleFail: function() {
      // Show fail message
      this.showError();
    }

  };

}());
