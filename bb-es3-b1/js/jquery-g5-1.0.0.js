(function ($) {

    //Sonido de fondo
    var aEnvironment = new Audio();

    //Elemento canvas
    var canvas = null;

    //Contexto del canvas
    var ctx = null;

    //Contexto auxiliar del juego
    var ctxAux = null;

    //Final del juego
    var GameOver = false;

    //Final del juego
    var callGameOverFunction = false;

    //Indica si se mostraran las instrucciones del juego
    var instructions = true;

    //Almacena la ultima tecla presionada
    var lastKey = null;

    //Nivel en el que se encuentra el jugador
    var level = 1;

    //Vidas del jugador
    var lives = 0;

    //Guarda los calculos realizados en el juego
    var oAllocator = new Object();

    //Almacena el objeto del jugador
    var oPlayer;

    //Guarda la informacion del juego
    var oSettings;

    //Juego Detenido
    var Pause = false;

    //Puntos del juego
    var points = 0;

    //Almacena las teclas presionadas
    var PRESSING = [];

    //Guarda la configuracion del juego 
    var settings;

    //Velocidad del juego
    var speed;

    //Detecta si el dispositivo es touch screen
    var touchable = 'createTouch' in document;

    //Imagen del jugador
    var iPlayer = new Image();

    //Imagen de fondo del entorno
    var iEnvironment = new Image();

    //Guarda todas las imagenes del juego
    var dicImages = [];

    $.fn.extend({

        G5: function (options) {

            //Obtiene los valores por defecto o los personalizados
            settings = $.extend({}, $.fn.G5.defaults, options);

            Start(this.selector);

            //Obtimiza la creacion de ciclos
            window.requestAnimationFrame = (function () {

                return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) { window.setTimeout(callback, speed); };
            })();
        }
    });

    // Valores iniciales
    $.fn.G5.defaults = {

        backgroundColor: "#000",
        speed: 100,
        lives: 3,
        playerStyle: "#fff",
        instructions: true,
        instructionsRemovekeyCode: 13,
        gameOverRemovekeyCode: 13,
        pausekeyCode: 13,
        pathImages: "",

        //Indica que el juego esta funcionando
        run: function (Player, Settings, Allocator) { },

        //Indica cuando el usuario pierde
        gameOver: function (Allocator, Settings, Points, Level) { },

        //Indica cuando se presiona una tecla 
        onKeyDown: function (Key, keys, Allocator) { },

        //Indica cuando se suelta una tecla 
        onKeyUp: function (Key, keys, Allocator) { },

        //Indica cuando se genera un evento touch
        onTouch: function (Type, Touches, Settings, Allocator) { },

        //Indica cuando se genera un evento con el raton
        onMouse: function (Type, x, y, Settings, Allocator) { },

        //Indica cuando se dibuja en el canvas
        paint: function (Ctx, Settings, Allocator, Player) { },

        //Indica cuando se reiniciara los valores del juego
        reset: function (Player, Settings, Allocator) { },

        //Indica cuando comienza el juego
        start: function (Allocator, Player) { },

        //Indica cuando se actualizan los puntos
        updatePoints: function (Points) { }
    };

    //Verifica el tipo de recurso
    function TypeResources(value) {

        if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value))   //Valor hexadecimal
            return 1;
        else if (/\.(jpg|png)$/.test(value))                    //Imagen
            return 2;
        else                                                    // No identificado
            return 0;
    }

    function Game() {

        //Verifica si el jugador esta listo DEBE CAMBIARSE POR UN LOAD DE LOS ELEMENTOS DEL JUEGO
        if ((typeof oPlayer != "undefined")) {

            //Verifica si el juego esta en modo intruccion
            if (!instructions) {

                if (GameOver) {

                    if (lastKey == settings.gameOverRemovekeyCode) {

                        Reset();
                        lastKey = null;
                    }

                } else if (lastKey == settings.pausekeyCode) {

                    Pause = !Pause;
                    lastKey = null;
                }
            }
            else {

                //Quita las instrucciones
                if (lastKey == settings.instructionsRemovekeyCode) {

                    Pause = false;
                    GameOver = false;
                    instructions = false;

                    lastKey = null;
                }
            }

            var oSettings = GetSettings();

            settings.run(oPlayer, oSettings, oAllocator);

            SetSettings(oSettings);

            if (callGameOverFunction == false && oSettings.gameOver == true) {

                callGameOverFunction = true;

                var oSettings = GetSettings();

                settings.gameOver(oAllocator, oSettings, points, level);

                SetSettings(oSettings);

            }
        }
    }

    //Recupera la configuracion del juego
    function GetSettings(oSettings) {

        oSettings = new Object();

        oSettings.instructions = instructions;
        oSettings.gameOver = GameOver;
        oSettings.pause = Pause;
        oSettings.points = points;

        return oSettings;
    }

    //Verifica si una imagen existe
    function ImageExists(url, callback) {

        var img = new Image();

        img.onload = function () { callback(true); };
        img.onerror = function () { callback(false); };

        img.src = url;
    }

    //Crea un diccionario con las imagenes del juego
    function LoadImages(images) {

        for (var name in images) {

            var img = new Image();
            img.src = settings.pathImages + '/' + images[name];

            dicImages[name] = img;
        }
    }

    //Carga las imagenes y sonidos del juego
    function LoadResources() {

        //Crea el jugador principal del juego
        var playerStyle = settings.playerStyle;

        oPlayer = new GenericPlayer(ctx, null, null, null, null, null, null);

        if (TypeResources(playerStyle) == 1) {

            oPlayer.color = playerStyle;
        }
        else if (TypeResources(playerStyle) == 2) {

            ImageExists(playerStyle, function (exists) {

                if (exists) {

                    var img = new Image();
                    img.src = playerStyle;
                    img.height;
                    img.width;

                    iPlayer.src = playerStyle;

                    oPlayer.width = img.width;
                    oPlayer.height = img.height;
                    oPlayer.img = iPlayer;
                }
            });
        }
    }

    //Pinta el contexto
    function Paint() {

        //Limpia el contexto
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctxAux.Img("backGround", 0, 0, canvas.width, canvas.height);

        //Pinta al jugador principal
        oPlayer.lives = lives;
        oPlayer.level = level;
        oPlayer.points = points;

        settings.paint(ctxAux, GetSettings(), oAllocator, oPlayer);
    }

    //Reincia los valores del juego a su estado original
    function Reset() {

        lives = settings.lives;
        instructions = settings.instructions;
        GameOver = false;
        points = 0;
        level = 1;
        callGameOverFunction = false;

        //Reinicio el audio del juego
        if (aEnvironment.currentTime != 0)
            aEnvironment.currentTime = 0;

        settings.updatePoints(points);

        var oSettings = GetSettings();

        settings.reset(oPlayer, oSettings, oAllocator);

        SetSettings(oSettings);
    }

    function SetSettings(oSettings) {

        instructions = oSettings.instructions;
        GameOver = oSettings.gameOver;
        Pause = oSettings.pause;

        if (points != oSettings.points)
            settings.updatePoints(oSettings.points);

        points = oSettings.points;
    }

    function Start(Canvas) {

        //Obtiene el canvas
        canvas = document.getElementById(Canvas.replace("#", ""));

        //Configura los controles del juego
        if (touchable) {

            if (canvas.webkitRequestFullScreen)
                canvas.webkitRequestFullScreen();

            canvas.addEventListener('touchstart', function (e) {

                SetTouch("down", e);
            }, false);

            canvas.addEventListener('touchmove', function (e) {

                SetTouch("move", e);
            }, false);

            canvas.addEventListener('touchend', function (e) {

                SetTouch("up", e);
            }, false);
        }
        else {

            //Agrega una escucha, se presiona una tecla
            document.addEventListener('keydown', function (evt) {

                //Indica la ultima tecla presionada
                lastKey = evt.keyCode;

                //Agrega al arreglo la tecla precionada
                PRESSING[evt.keyCode] = true;

                //Solo se llama a la funcion externa cuando la tecla presionada no pertenece a la configuracion inicial
                if (lastKey != settings.instructionsRemovekeyCode)
                    settings.onKeyDown(lastKey, PRESSING, oAllocator);

                if (lastKey == 70) {
                    toggleFullScreen();
                }

            }, false);

            //Elimina una escucha, se suelta una tecla
            document.addEventListener('keyup', function (evt) {

                //Elimina del arreglo la tecla presionada
                PRESSING[evt.keyCode] = false;

                //Solo se llama a la funcion externa cuando la tecla soltada no pertenece a la configuracion inicial
                if (lastKey != settings.instructionsRemovekeyCode)
                    settings.onKeyUp(evt.keyCode, PRESSING, oAllocator);

            }, false);

            //Agrega la escucha al presionar el raton
            canvas.addEventListener('mousedown', function (e) {

                var oSettings = GetSettings();

                var rect = canvas.getBoundingClientRect();

                settings.onMouse('down', e.pageX - rect.left, e.pageY - rect.top, oSettings, oAllocator);

                rect = null;

                SetSettings(oSettings);

            }, false);

            //Agrega la escucha al movimiento del raton
            canvas.addEventListener('mousemove', function (e) {

                var oSettings = GetSettings();

                var rect = canvas.getBoundingClientRect();

                settings.onMouse('move', e.pageX - rect.left, e.pageY - rect.top, oSettings, oAllocator);

                rect = null;

                SetSettings(oSettings);

            }, false);

            //Agrega la escucha al soltar el raton
            canvas.addEventListener('mouseup', function (e) {

                var oSettings = GetSettings();

                var rect = canvas.getBoundingClientRect();

                settings.onMouse('up', e.pageX - rect.left, e.pageY - rect.top, oSettings, oAllocator);

                rect = null;

                SetSettings(oSettings);

            }, false);
        }

        //Configura la musica de fondo
        if (typeof aEnvironment.loop == 'boolean') {
            aEnvironment.loop = true;
        }
        else {
            aEnvironment.addEventListener('ended', function () {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        //configura la velocidad del juego
        speed = settings.speed;

        //Cambia el color de fondo del canvas
        canvas.style.background = settings.backgroundColor;

        //Configura el contexto
        ctx = canvas.getContext('2d');

        ctxAux = new Context(ctx);

        //Carga imagenes y sonidos del juego
        LoadResources();

        //Llama a la configuracion inicial personalizada del juego
        settings.start(oAllocator, oPlayer);

        //Carga las imagenes
        LoadImages(oAllocator.Images);

        //Envia el contexto para pintarlo
        Run();

        //Indica los vaores por default
        Reset();
    }

    function SetTouch(Action, e)
    {
        var oSettings = GetSettings();

        settings.onTouch(Action, e.changedTouches, oSettings, oAllocator);

        SetSettings(oSettings);

        e.preventDefault();

        oSettings = null;
    }

    //Inicia la ejecucion del juego
    function Run() {

        //Crea un ciclo
        requestAnimationFrame(Run);

        //Configura el juego
        Game();

        //Dibuja en el canvas
        Paint();
    }

    function toggleFullScreen() {

        if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    //Seudo clase helper para el multimedia 
    function Context(ctx) {

        var ctx = ctx;

        this.Img = function (key, x, y, w, h) {

            var img = dicImages[key];

            if (img != undefined) {

                x = x == undefined ? 0 : x;
                y = y == undefined ? 0 : y;

                if (w != undefined && h != undefined)
                    ctx.drawImage(img, x, y, w, h);
                else
                    ctx.drawImage(img, x, y);
            }
        }

        this.Rect = function (Color, x, y, w, h) {

            ctx.fillStyle = Color;

            ctx.fillRect(x, y, w, h);
        }

        this.Txt = function (Text, x, y, Color, Font) {

            if (Color != undefined)
                ctx.strokeStyle = Color;

            ctx.lineWidth = 1;
            ctx.font = Font;
            ctx.strokeText(Text, x, y);
        }
    }

    //Seudo clase para pintar personajes
    function GenericPlayer(ctx, x, y, width, height, img, color) {

        this.x = (x == null) ? 0 : x;

        this.y = (y == null) ? 0 : y;

        this.width = (width == null) ? 50 : width;

        this.height = (height == null) ? this.width : height;

        var ctx = ctx;

        this.img = img;

        this.color = (color == null) ? "" : color;

        this.paint = function () {

            if (this.img != null) {

                ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            }

            else if (this.color != "") {

                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        this.intersects = function (Player) {

            //Verifica si el cuadro con el que se coliciono es diferente de nulo
            if (Player != null) {

                //Indica si se cumple la regla de colicion
                return (this.x < Player.x + Player.width &&
                    this.x + this.width > Player.x &&
                    this.y < Player.y + Player.height &&
                    this.y + this.height > Player.y);
            }
        }

    }
})(jQuery);