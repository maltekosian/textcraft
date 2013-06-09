/**
@license
Licensed to hogventure.com under one
<br>or more contributor license agreements.  See the NOTICE file
<br>distributed with this work for additional information
<br>regarding copyright ownership.  The hogventure.com licenses this file
<br>to you under the hogventure.com License, Version 1.0 (the
<br>"License"); you may not use this file except in compliance
<br>with the License. You may obtain a copy of the License at
<br>
<br>         http://www.hogventure.com/purchase.html
<br>
<br>Unless required by applicable law or agreed to in writing,
<br>software distributed under the License is distributed on an
<br>"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
<br>KIND, either express or implied.  See the License for the
<br>specific language governing permissions and limitations
<br>under the License.<br>
*/
/*
@author Malte Kosian
@since 2012-06-01
@version 2013-06-07

@namespace Game
@namespace window
@since 2013-06-06
*/ 
  /**

  */
  var version = '20130607';
  
  /**
  usally only with the use of an Media and Textmanager
  and an UidCounter(Generator for unique Ids)
  */
  function DialogGame() {
    /**

    */
    this.canvas = getElement('canvas');
    /**

    */
    this.ctx = null;
    /**

    */
    this.canvasWidth = 480;
    /**

    */
    this.canvasHeight = 320;
    /**

    */
    this.screenWidth = null;
    /**

    */
    this.screenHeight = null;
    /**

    */
    this.backbuffer = null;//createElement('canvas');
    /**

    */
    this.btx = null;
    /**

    */
    this.bufferWidth = 800;
    /**

    */
    this.bufferHeight = 480;
    /**

    */
    this.intervalId = null;
    /**

    */
    this.intervalListeners = [];
    /**

    */
    this.addIntervalListener = function(_name, _method, _t) {
      this.intervalListeners.push(
        {
          name: _name,
          m: _method,
          t: _t,
          ot: Date.now()
        }
      );
    }
    /**

    */
    this.removeIntervalListener = function(_name) {
      for (var i = 0; i < this.intervalListeners.length; i++) {
        if (this.intervalListeners[i].name == _name) {
          this.intervalListeners[i] = null;
          //the null listeners will be removed in update
        }
      }
    }
    /**

    */
    this.animationOldTime = null;
    /**

    */
    this.animationTime = null;
    /**
    the array of dialog-text data
    each data-set has an unique id a text, a method, a speaker, a next
    posible values are 
    wrongCase and wrongGoto 
    in the case of a select this is necessary
    in the case of input it's posible
    image
    points - default is null
    */
    this.data = [
      {uid: 'step1', texts: ['Hello, my name is Hans. Who are you?'], next: 'step2'},
      {uid: 'step2', key: 'name', method: 'showKeyInput', next: 'step3'},
      {uid: 'step3', texts: ['Welcome to Bizcademy, #name#. Do you have an idea?'], next: 'step4'},
      {uid: 'step4', method: 'showSelect', texts: ['Yes, a rockstart idea!','No, but i want develope one.'], wrong:[''], right: 'step6', next: 'step5'},
      {uid: 'step5', texts: ['#name#, choose product.'], method: 'goto', key: 'step4'},
      {uid: 'step6', texts: ['Tell us! What is it?'], next: 'step7'},
      {uid: 'step7', method: 'showSelect', texts:  ['IT/Tech','ECommerce'], next: 'step7', wrong:[''], right: 'step8'},
      {uid: 'step8', texts: ['Status Quo?'], next: 'step9'},
      {uid: 'step9', method: 'showSelect', texts:  ['Just starting','in the middle of the storm.'], todo: 'todo2', wrong:[''], right: 'step10'},
      {uid: 'step10', texts: ['Okay, #name#. You should choose one of these lectures:']},
      {uid: 'step11', method: 'showFinalSelect', texts:  ['How to build a LEAN STARTUP','Disruptive Innovation or Copy Cat?','The 8 Basic Principles of eCommerce'], todo: 'todo3', logo: ['images/badge-hour.png','images/badge-guitar.png','images/badge-four.png'], wrong:[''], right: 'step12'},
      {uid: 'step12', texts: [''], method: 'launchRocket', end: true},
      {}
    ];
    /**
    an array of key-value storages
    {key: [..], value: [..]}
    */
    this.keyValues = [];
    /**

    */
    this.historyOfIds = [];
    /**

    */
    this.points = 0;
    /**
    an editor function
    */
    this.setData = function(_data) {
      if (!hasData(_data.uid)) {
        this.data.push(_data);
      } else {
        this.getData(_data.uid) = _data;
      }      
    }
    /**
    running in backwards order through the array is lock save.
    */
    this.getData = function(_id) {
      for (var i = this.data.length - 1; i >= 0; i--) {
        if (this.data[i].uid == _id) {
          return this.data[i];
        }
      }
      return null;
    }
    /**
    an editor function
    running in backwards order through the array is lock save.
    */
    this.removeData = function(_id) {
      for (var i = this.data.length - 1; i >= 0; i--) {
        if (this.data[i].uid == _id) {
          this.data[i].splice(i, 1);
        }
      }
    }
    /**
    running in backwards order through the array is lock save.
    */
    this.hasData = function(_id) {
      for (var i = this.data.length - 1; i >= 0; i--) {
        if (this.data[i].uid == _id) {
          return true;
        }
      }
      return false;
    }
    /**

    */
    this.setKeyValue = function(_k, _v) {
      if (!this.hasKeyValue(_k)) {
        this.keyValues.push({key: _k, value: _v});
      } else {
        this.getKeyValue(_k).value = _v;
      }
    }
    /**

    */
    this.getKeyValue = function(_k) {
      for (var i = this.keyValues.length - 1; i >= 0; i--) {
        if (this.keyValues[i].key == _k) {
          return this.keyValues[i];
        }      
      }
      return null;
    }
    /**

    */
    this.getValueForKey = function(_k) {
      for (var i = this.keyValues.length - 1; i >= 0; i--) {
        if (this.keyValues[i].key == _k) {
          return this.keyValues[i].value;
        }      
      }
      return null;
    }
    /**
    
    */
    this.hasKeyValue = function(_k) {
      for (var i = this.keyValues.length - 1; i >= 0; i--) {
        if (this.keyValues[i].key == _k) {
          return true;
        }      
      }
      return false;
    }
    /**

    */
    this.hasIdInHistory = function(_id) {
      for (var i = 0; i < this.historyOfIds.length; i++) {
        if (this.historyOfIds == _id) {
          return true;
        }
      }
      return false;
    }
    /**

    */
    this.nextData = function(_id) {
      console.log('currentData '+_id);
      var currentData = this.getData(_id);
      console.log(currentData);
      this.historyOfIds.push(_id);
      //currentId = id;
      if (null) { 
        alert('no data with "'+_id+'".');
        return;
      }
      if (currentData.method == null) {
        currentData.method = '';
      }
      switch (currentData.method) {
        case 'showKeyInput':
          this.showKeyInput(currentData);
        break;
        case 'showInput':
          this.showInput(currentData);
        break;
        case 'goto':
          this.nextData(currentData.next);
        break;
        case 'showSelect':
          this.showSelect(currentData);
        break;
        case 'showFinalSelect':
          this.showFinalSelect(currentData);
        break;
        case 'showTimer':
          this.showTimer(currentData);
        break;
        case 'clearScreen':
          this.clearScreen(currentData);
        break;
        case 'showText':
        default:
          this.showText(currentData);
        break;
      } 
    }
    /**

    */
    this.previousData = function() {
      this.nextData(this.historyOfIds[this.historyOfIds.length - 2]);
    }
    /**

    */
    this.scrollToBottom = function() {
      var height = document.getElementById('game-inner').offsetHeight;
      console.log('scrollToBottom '+height);
      if (height > 499) {
         document.getElementById('game-inner').style.top = -(height - 500)+'px';
      }
    }
    /**
    
    */
    this.showText = function(currentData) {
      var _ele = document.createElement('div');
      var ele = document.createElement('div');
      ele.className = 'tooltip-arrow';
      _ele.className = 'tooltip fade top in';
      _ele.appendChild(ele);
      ele = document.createElement('div');
      ele.className = 'hans_bubble';
      ele.innerHTML = currentData.texts[0].replace(/#name#/g, this.getValueForKey('name'));
      _ele.appendChild(ele);
      _ele.style.position = 'relative';
      _ele.style.width = '50%';
      $('#game-inner').append(_ele);      
      $('#game-inner').append(document.createElement('br'));
      this.scrollToBottom();
      if (currentData.next != null) {
        this.nextData(currentData.next);
      }
    }
    /**

    */
    this.showKeyInput = function(currentData) {
      var _ele = document.createElement('div');
      var ele = document.createElement('div');
      ele.className = 'tooltip-arrow';
      ele.style.borderTopColor = '#ddd863';
      _ele.className = 'tooltip fade top in';  
      _ele.style.marginLeft = '51%';
      _ele.appendChild(ele);
      ele = document.createElement('input');
      ele.addEventListener('keyup', function(eve) {
        game.setKeyInput(eve, this, currentData.next, currentData.key);
      }, true);
      ele.setAttribute('autofocus', 'autofocus');
      ele.type = 'text';
      ele.className = 'you_input_bubble';
      var __ele = document.createElement('div');
      __ele.appendChild(ele);
      __ele.style.background = '#ddd863';
      __ele.style.borderRadius = '6px';
      __ele.style.width = '90%';
      _ele.appendChild(__ele);
      _ele.style.position = 'relative';
      
      $('#game-inner').append(_ele);
      $('#game-inner').append(document.createElement('br'));
    }
    /**

    */
    this.setKeyInput = function(eve, element, _nextDataId, _key) {
      console.log('setInputVar '+eve.keyCode+' + '+element.value+' + '+_key);
      if (eve.keyCode == 13) {
        this.setKeyValue(_key, element.value);  
        this.nextData(_nextDataId);
      }
    }
    /**

    */
    this.showInput = function(currentData) {
    
    }
    /**

    */
    this.validateInput = function(_dataId, _key, _value) {
    
    }    
    /**

    */
    this.showSelect = function(currentData) {
      var ele = document.createElement('div');
      ele.className = 'tooltip fade top in';
      ele.style.position = 'relative';
      ele.style.marginLeft = '51%';
      var _ele = document.createElement('div');
        _ele.className = 'tooltip-arrow';
        _ele.style.borderTopColor = '#ddd863'; 
        _ele.style.borderWidth = '9px 9px 0'; 
        _ele.style.bottom = '0'; 
        _ele.style.marginLeft = '0';
        ele.appendChild(_ele);
      for (var i = 0; i < currentData.texts.length; i++) {        
        _ele = document.createElement('div');
        _ele.className = 'you_button';
        $(_ele).click( function() { game.validateSelection(currentData.uid, currentData.texts[i]); } );
        _ele.innerHTML = currentData.texts[i];
        ele.appendChild(_ele);
      }
      $('#game-inner').append(ele);
      this.scrollToBottom();
    }
    /**

    */
    this.validateSelection = function(_dataId, _key) {
      var data = this.getData(_dataId);
      console.log(_key+', '+_dataId+', '+data.right);
      if (this.isWrongSelection(data, _key)) {  
        var next_data = this.getData(data.next);
        var _ele = document.createElement('div');
        var ele = document.createElement('div');
        ele.className = 'tooltip-arrow';
        ele.style.borderTopColor = '#e00';
        _ele.className = 'tooltip fade top in';
        _ele.appendChild(ele);
        ele = document.createElement('div');
        ele.className = 'hans_bubble';
        ele.style.background = '#e00';
        ele.innerHTML = n_text.texts[0].replace(/#name#/g, this.getValueForKey('name'))
        _ele.appendChild(ele);
        _ele.style.position = 'relative';
        _ele.style.width = '50%';
        $('#game-inner').append(_ele);      
        $('#game-inner').append(document.createElement('br'));
        this.scrollToBottom();
        this.nextData(next_data.uid);
      } else {
        console.log('->text.right ');    
        //setTodoDone(text.todo);
        this.setPoints(data.points);
        this.nextData(data.right); 
      }
    }
    /**

    */
    this.isWrongSelection = function(data, _key) {
      for (var i = 0; i < data.wrong.length; i++) {
        if (data.wrong[i] == _key) {
          return true; 
        }
      }
      return false;
    }
    /**

    */
    this.showTimer = function(currentData) {
    
    }
    /**

    */
    this.clearScreen = function(currentData) {
      if (currentData != null) {  
        //show the last textbox?

      }
    } 
    /**

    */
    this.setPoints = function(_p) {
      this.points = this.points + _p;
    }
    /**

    */
    this.updateInterval = function() {
      var time = Date.now();
      //console.log('updateInterval '+time);
      var len = game.intervalListeners.length;
      if (len > 0) {
        for (var i = len - 1; i >= 0; i--) {
          if (game.intervalListeners[i] != null) {
            if (time + game.intervalListeners[i].t >= game.intervalListeners[i].ot) {
              game.intervalListeners[i].m(time - game.intervalListeners[i].ot);  
              game.intervalListeners[i].ot = time;            
            }
          } else {
            game.intervalListeners.splice(i, 1);
          } 
        }       
      }
      /*if (!game.drawUpdate) {
        return; has to be placed in the loop
        look for gdbb
      }*/
      if (game.backbuffer == null) {
        return;
      }      
      game.ctx.drawImage(game.backbuffer, 0, 0, 480, 320);//screenWidth, screenHeight here 
      //only if it is canvasWidth and height!
    }
    /**
      a method that is the demonstrate the basics of the game-engine
        -requestAnimationFrame and 
        -an intervalListener for non animation related processes aka threads
        -double-buffering  
      missing a real implementation of real data
    */
    this.drawBackBuffer = function(tdif) {
      if (game.backbuffer == null) {
        game.backbuffer = createElement('canvas');
        game.backbuffer.width = game.bufferWidth;
        game.backbuffer.height = game.bufferHeight;
        game.btx = game.backbuffer.getContext('2d');
      }
      console.log('drawBackBuffer -> '+tdif);
      //if (!game.drawUpdate) return;
      game.btx.fillStyle = 'rgba(224,220,99,0.75)'; //#ddd863
      game.btx.strokeStyle = 'rgba(224,254,250,0.75)';

      var img = new Image();
      img.src = "http://hogventure.com/image/3piggies.jpg";
      game.btx.drawImage(img, 0, 0, game.bufferWidth, game.bufferHeight);//
      
      game.btx.beginPath();
      game.btx.moveTo(50,50);
      game.btx.lineTo(150, 50);
      game.btx.bezierCurveTo(150, 50, 175, 50, 175, 75);
      game.btx.lineTo(175, 100);
      game.btx.bezierCurveTo(175, 100, 175, 125, 150, 125);
      game.btx.lineTo(75, 125);
      game.btx.lineTo(50, 150);
      game.btx.lineTo(50, 125);
      game.btx.bezierCurveTo(50, 125, 25, 125, 25, 100);
      game.btx.lineTo(25, 75);
      game.btx.bezierCurveTo(25, 75, 25, 50, 50, 50);
      
      
      for (var i = 0; i < 3; i++) {
        game.btx.moveTo(250, 50 + i * 75);
        game.btx.lineTo(350, 50 + i * 75);
        game.btx.bezierCurveTo(350, 50 + i * 75, 375, 50 + i * 75, 375, 75 + i * 75);
        game.btx.lineTo(375, 100 + i * 75);
        game.btx.bezierCurveTo(375, 100 + i * 75, 375, 125 + i * 75, 350, 125 + i * 75);
        if (i==2) {
          //game.btx.lineTo(350, 125 + i * 75);
          game.btx.lineTo(350, 150 + i * 75);
          game.btx.lineTo(325, 125 + i * 75);
        } 
        game.btx.lineTo(250, 125 + i * 75);
        game.btx.bezierCurveTo(250, 125 + i * 75, 225, 125 + i * 75, 225, 100 + i * 75);
        game.btx.lineTo(225, 75 + i * 75);
        game.btx.bezierCurveTo(225, 75 + i * 75, 225, 50 + i * 75, 250, 50 + i * 75);
      }
      game.btx.closePath();
      game.btx.stroke();
      game.btx.fill();
      //requestAnimationFrame(game.drawBackBuffer);
    }
    /**

    */
    this.requestBackBuffer = function() {
      //console.log('requestBackBuffer');
      //if (!game.drawUpdate) {
      //only animate if needed!
      game.animationOldTime = game.animationTime;
      game.animationTime = Date.now();
      game.drawBackBuffer( game.animationTime - game.animationOldTime);
      //}
      requestAnimationFrame(game.requestBackBuffer);
    }
    /**
    this is the context of the game
    so this is why any function that is called from here
    refers to game instead of this (don't use this. -> use game.)
    */
    this.start = function() {
      //game = this;
      this.canvas = getElement('canvas');
      this.canvas.width = 480;
      this.canvas.height = 320;
      this.ctx = this.canvas.getContext('2d');
      this.intervalListeners = [];
      try {
        this.animationTime = Date.now();        
        //test_requestAnimationFrame(this.requestBackBuffer);
        requestAnimationFrame(this.requestBackBuffer);
      } catch (e) {
        this.addIntervalListener('gdbb', game.drawBackBuffer, 16);
      }    
      this.intervalId = setInterval(this.updateInterval, 10);
      //to abbond an interval call clearInterval!
    }
    /**
    
    */
    this.load = function() {
    
    }
    /**
    
    */
    this.store = function() {
    
    }
    /**
    
    */
    this.openGame = function() {
    
    }
    /**
    
    */
    this.saveGame = function() {
    
    }
  }


  /*########################################
    basic functions
  #########################################*/

  /**
  @param id
  @return {HTMLDomElement} or null
  */
  function getElement(id) {
    return document.getElementById(id);
  }
  /**
  @param type
  @return {HTMLDomElement}
  */ 
  function createElement(type) {
    return document.createElement(type);
  }
  /**
  placebo method
  does nothing except that it posts this to the console
  use it for development to see if you have to implement
  an event, method, callback or not

  @param id
  */
  function doNothing(id) {
    console.log('method "'+id+'" not implemented');
  }
  

