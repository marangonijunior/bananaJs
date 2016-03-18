/**
 * 
 * Developer by: Hednei Carlos Marangoni Junior
 * Company: marangonijunior - 2016
 * bananaJs.xyz
 * 
 */

var bananaJs = angular.module('bananaJs', []);
bananaJs.service('bananaJs', function($http,$location,$filter) {

        var contPost = null;
        var contGps = null;

        /* 
         *   Return status GPS
         */
        this.getGps = function(Callback) {

            if(contGps === 1){
                //break;
            }else{

                // Wait for device API libraries to load
                document.addEventListener("deviceready", onDeviceReady, false);

                // device APIs are available
                function onDeviceReady() {
                    var options = { maximumAge: 0, timeout: 20000,  enableHighAccuracy: true };         
                    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
                }

                // onSuccess Geolocation
                function onSuccess(position) {
                    contGps = 0;

                    //if day equal
                    if(parseInt($filter('date')(new Date(),'dd')) === parseInt($filter('date')(position.timestamp,'dd'))){
                        //If hour equal
                        if(parseInt($filter('date')(position.timestamp,'hh')) === parseInt($filter('date')(new Date(),'hh'))){
                            //If minute equal or small
                            if(parseInt($filter('date')(position.timestamp,'mm')) === parseInt($filter('date')(new Date(),'mm')) ){
                                //return
                                coord = angular.fromJson('{"stats":"1","lat":"'+ position.coords.latitude +'","long":"'+ position.coords.longitude +'","accuracy":"'+position.coords.accuracy+'","msg":"Your location."}');
                                Callback(coord);
                            }else{
                                coord = angular.fromJson('{"stats":"0","msg":"GPS not found."}');
                                Callback(coord);
                            }
                        }else{
                            coord = angular.fromJson('{"stats":"0","msg":"GPS not found."}');
                            Callback(coord);
                        }
                    }else{
                        coord = angular.fromJson('{"stats":"0","msg":"GPS not found."}');
                        Callback(coord);
                    }
                }

                // onError Callback receives a PositionError object
                function onError(error) {     
                    if (error.code === 3)
                    {
                        var optionsTry = { maximumAge: 0, timeout: 20000,  enableHighAccuracy: false };         
                        navigator.geolocation.getCurrentPosition(onSuccessTry, onErrorTry, optionsTry);
                    }else{
                        contGps = 0;
                        coord = angular.fromJson('{"stats":"0","msg":"GPS not found."}');
                        Callback(coord);
                    }
                }

                // onSuccess Geolocation
                function onSuccessTry(position) {
                    contGps = 0;
                    //return
                    coord = angular.fromJson('{"stats":"1","lat":"'+ position.coords.latitude +'","long":"'+ position.coords.longitude +'","accuracy":"'+position.coords.accuracy+'","msg":"Your location."}');
                    Callback(coord);
                }

                function onErrorTry(error) {
                    contGps = 0;
                    //return
                    coord = angular.fromJson('{"stats":"0","msg":"GPS not found."}');
                    Callback(coord);
                }
            }
            
        }

        /* 
         *   look Internet and return status.
         */
        this.getNet = function(Callback) {

            // Wait for device API libraries to load
            document.addEventListener("deviceready", onDeviceReady, false);

            // device APIs are available
            function onDeviceReady() {
                var networkState = navigator.connection && navigator.connection.type;
                var states = {};
                states[Connection.UNKNOWN]  = 'Unknown connection';
                states[Connection.ETHERNET] = 'Ethernet connection';
                states[Connection.WIFI]     = 'WiFi connection';
                states[Connection.CELL_2G]  = 'Cell 2G connection';
                states[Connection.CELL_3G]  = 'Cell 3G connection';
                states[Connection.CELL_4G]  = 'Cell 4G connection';
                states[Connection.NONE]     = 'No network connection';

                if(states[networkState] === 'No network connection'){
                    //return off
                    network = angular.fromJson('{"stats":"0","msg":"'+states[networkState]+'"}');
                    Callback(network);

                }else{
                    //return online
                    network = angular.fromJson('{"stats":"1","msg":"'+states[networkState]+'"}');
                    Callback(network);
                }
            }
        }

        /* 
         *   Get image camera or library
         */
        this.getPhoto = function(tipo, Callback) {
            /*
             * Converts an image to
             * a base64 string.
            */
            function imgToDataURL(url, callbackURL, outputFormat){

                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var img = new Image;
                img.crossOrigin = 'Anonymous';
                img.onload = function(){
                    canvas.height = img.height;
                    canvas.width = img.width;
                    ctx.drawImage(img,0,0);
                    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
                    callbackURL.call(this, dataURL);
                    // Clean up
                    canvas = null; 
                };
                img.src = url;
            }

            // Wait for device API libraries to load
            document.addEventListener("deviceready", onDeviceReady, false);

            // device APIs are available
            function onDeviceReady() {
                pictureSource=navigator.camera.PictureSourceType;
                destinationType=navigator.camera.DestinationType;
            }

            function onPhotoDataSuccess(imageData) {
                photo = angular.fromJson('{"stats":"1","foto":"data:image/jpeg;base64,'+imageData+'","msg":"Get picture with success."}');
                Callback(photo);
            }

            // Called when a photo is successfully retrieved
            function onPhotoURISuccess(imageURI) {
                // Coloca imagem na DIV
                imgToDataURL(imageURI, function(base64Img){
                    photo = angular.fromJson('{"stats":"1","foto":"'+base64Img+'","msg":"Get picture with success."}');
                    Callback(photo);
                });
            }

            function capturePhoto() {
                // Tira foto com a camera e retorna imagem base64-encoded string
                navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
                destinationType: destinationType.DATA_URL, correctOrientation: true, targetWidth: 370, targetHeight: 500});
            }

            function getLibrary(source) {
                // Pega foto da galeria
                navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
                destinationType: destinationType.FILE_URI,
                sourceType: source, correctOrientation: true, targetWidth: 500, targetHeight: 450});
            }

            // Caso ocorra erro no momento de pegar a foto
            function onFail(message) {
                photo = angular.fromJson('{"stats":"0","msg":"Error Picture"}');
                Callback(photo);
            }

            //Validando se é camera ou biblioteca
            if(tipo === 1){
                capturePhoto();
            }
            if(tipo === 0){
                getLibrary(pictureSource.PHOTOLIBRARY);
            }
        }

        /* 
         *   Controll POST.
         */
        this.post = function(endereco,dados, Callback) {
            if(contPost === 1){
                //wait resp
            }else{
                contPost = 1;            
                // Wait for device API libraries to load
                document.addEventListener("deviceready", onDeviceReady, false);
                // device APIs are available
                function onDeviceReady() {
                    var networkState = navigator.connection && navigator.connection.type;
                    var states = {};
                    states[Connection.UNKNOWN]  = 'Unknown connection';
                    states[Connection.ETHERNET] = 'Ethernet connection';
                    states[Connection.WIFI]     = 'WiFi connection';
                    states[Connection.CELL_2G]  = 'Cell 2G connection';
                    states[Connection.CELL_3G]  = 'Cell 3G connection';
                    states[Connection.CELL_4G]  = 'Cell 4G connection';
                    states[Connection.NONE]     = 'No network connection';

                    if(states[networkState] === 'No network connection'){
                        // POST
                        contPost = 0;
                        //return
                        datapost = angular.fromJson('{"stats":"2","msg":"You dont have connection."}');
                        Callback(datapost);
                    }else{
                        var req = {
                            method: 'POST',
                            url: endereco,
                            headers: {'Content-Type': 'application/json'},
                            data: dados
                        };
                        $http(req).
                            success(function(resp) {
                                if(resp !== null){
                                    // POST
                                    contPost = 0;
                                    //return
                                    datapost = {"stats":"1","msg":"Success return POST [SUCCESS].","resp":resp};
                                    Callback(datapost);
                                }else{
                                    // POST
                                    contPost = 0;
                                    //return
                                    datapost = {"stats":"0","msg":"Error return POST."};
                                    Callback(datapost);
                                } 
                            }).
                            error(function(resp) {
                                if(resp !== null){
                                    // POST
                                    contPost = 0;
                                    //return
                                    datapost = {"stats":"1","msg":"Success return POST [ERROR].","resp":resp};
                                    Callback(datapost);
                                }else{
                                    // POST
                                    contPost = 0;
                                    //return
                                    datapost = {"stats":"0","msg":"Error return POST."};
                                    Callback(datapost);
                                } 
                                
                            });
                    }
                }
            }
        }

        /* 
         *   BackButton / use alone in Android
         */
        this.backMenu = function() {

            // Wait for device API libraries to load
            document.addEventListener("deviceready", onDeviceReady, false);
            // device APIs are available
            function onDeviceReady() {
                // Register the event listener
                document.addEventListener("backbutton", onBackKeyDown, false);
            };

            // Handle the back button
            function onBackKeyDown() {
                
                //array pages and destiny
                $http.get("backBannaJs.js")
                .success(function(response) {
                    var backList = response;
                    
                    //Get name file
                    var urldest = $location.absUrl();
                    var pathName = urldest.split("/");
                    var count = pathName.length - 1;
                    var pagina = pathName[count];
                    var countBack = backList.length;

                    if(countBack > 0){
                        var cont = 0;
                        for (i = 0; i < countBack; i++){
                            if(backList[i].pag === pagina){
                                cont = 1;
                                var backMenu = backList[i].volt;
                            }
                        }
                        if(cont === 1){
                            document.location.href = backMenu;
                        }else{
                            navigator.app.backHistory();
                        }
                    }else{
                       navigator.app.backHistory(); 
                    }
                })
                .error(function(err){
                    var backList = null;
                    navigator.app.backHistory(); 
                });
                
            };
        }


        /* 
         *   return Globalization.
         */
        this.getLang = function(local,langs, Callback) {
            document.addEventListener("deviceready", onDeviceReady, false);
            function onDeviceReady() {
                navigator.globalization.getLocaleName(
                    function (locale) {
                        //carregando lista de traducao.
                        if(langs.langs.length > 0){
                            cont = 0;
                            contt = 0;
                            for (i in langs.langs) {
                                if(langs.langs[i] === locale.value){
                                    $http.get(local+langs.langs[i]+'.json').success(function(data) {
                                        Callback(data);
                                    });
                                    cont = 1;
                                    contt = 1;
                                }
                            }
                            if(cont == 0){
                                for (i in langs.langs) {
                                    if(langs.langs[i].split('-')[0] === locale.value.split('-')[0]){
                                        contt = 1;
                                        $http.get(local+langs.langs[i]+'.json').success(function(data) {
                                            Callback(data);
                                        });
                                    }
                                }
                            }
                            if(contt == 0){
                                $http.get(local+langs.langs[0]+'.json').success(function(data) {
                                    Callback(data);
                                });
                            }
                        }else{
                            $http.get(local+langs.langs[0]+'.json').success(function(data) {
                                Callback(data);
                            });
                        }
                    },function () {
                        $http.get(local+langs.langs[0]+'.json').success(function(data) {
                                Callback(data);
                        });
                    }
                );

            };
        }


        /* 
         *   Return cod QrCode
         *   com.phonegap.plugins.barcodescanner
         */
        this.qrCode = function(Callback) {

            // Wait for device API libraries to load
            document.addEventListener("deviceready", onDeviceReady, false);

            // device APIs are available
            function onDeviceReady() {
                cordova.plugins.barcodeScanner.scan(
                  function (result) {
                        code = {"stats":"1","msg":"Success get QrCode","qrcode":result}; 
                        Callback(code);
                        // result.text / result.format / result.cancelled
                  }, 
                  function (error) {
                        code = {"stats":"0","msg":"Error get QrCode","qrcode":error}; 
                        Callback(code);
                  }
               );
            }
        }

        /* 
         *   Send Push Local
         *   de.appplant.cordova.plugin.local-notification
         */
        this.pushLocal = function(min,titl,msg) {

            // Wait for device API libraries to load
            document.addEventListener("deviceready", onDeviceReady, false);
            // device APIs are available
            function onDeviceReady() {
                //get date and new date for push
                var now      = new Date().getTime(),
                    pushdate = new Date(now + min * 1000);
                //push
                cordova.plugins.notification.local.schedule({
                    id:     1,
                    title:  titl,
                    text:   msg,
                    at:     pushdate,
                    led:    "FF0000",
                    sound:  null
                });  
            }
        }

        /* 
         *   Get Battery
         *   org.apache.cordova.battery-status
         */
        this.getBattery = function(Callback) {

            window.addEventListener("batterystatus", onBatteryLow, false);
            function onBatteryLow(info) {
                // Status battery
                battery = {"stats":"1","msg":"Battery","level":info.level,"plugged":info.isPlugged}; 
                Callback(battery);
            }
        }

        /* 
         *   Compass
         *   org.apache.cordova.CompassListener
         */
        this.getCompass = function(Callback) {

            // Wait for device API libraries to load
            document.addEventListener("deviceready", onDeviceReady, false);

            // device APIs are available
            function onDeviceReady() {
                navigator.compass.getCurrentHeading(onSuccess, onError);
            }

            // onSuccess: Get the current heading
            //
            function onSuccess(heading) {
                bussola = {"stats":"1","msg":"Compass Success","direction":heading.magneticHeading}; 
                Callback(bussola);
            }

            // onError: Failed to get the heading
            //
            function onError(compassError) {
                bussola = {"stats":"0","msg":"Compass Error","error":compassError.code}; 
                Callback(bussola);
            }
        }

});