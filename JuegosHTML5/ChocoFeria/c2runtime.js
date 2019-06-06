//*********************************CONFIGURACION*********************************

var SPEEDGAME = 17;
var SPEEDPIZZAS = 8000;
var SPEEDUP = 160;
var SPEEDMAX = 300;
var LIVES = 3;
var POSITIONREMOVEROWS = 0;
var NUMBERREMOVEROWS = 2;
var POINTSFORGROUP = 87;
var TIMEDISPLAYBETWEENLEVEL = 28;
var INCREASEDLEVELFACTORA = 217;
var INCREASEDLEVELFACTORB = 83;

//*********************************GENERICOS*********************************

//Elemento canvas
var canvas = null;

//Contexto del canvas
var ctx = null;

//Final del juego
var GameOver = false;

//Indica si se mostraran las instrucciones del juego
var instructions = 1;

//Nivel en el que se encuentra el jugador
var level = 1;

//Vidas con las que inicia el jugador  MINIMO 1 - MAXIMO 5
var lives = (typeof LIVES == "undefined" || LIVES == null || LIVES > 5 || LIVES < 1) ? 3 : LIVES;

//Juego Detenido
var Pause = false;

//Detecta el path del juego
var pathMedia = (typeof pathGame == "undefined") ? "" : pathGame;

//Puntos del juego
var points = 0;

//Velocidad del juego
var speed = SPEEDGAME;

//Juego iniciado
var Star = true;

//Tiempo que se muestra la imagen de nivel
var titleLevel = 0;

//Detecta si el dispositivo es touch screen
var touchable = 'createTouch' in document;

//Indica el si el volumen esta prendido o apagado
var VolumeON = true;

//Agrega una escucha, cuando termina de cargar la pagina se ejecuta la funcion Init
window.addEventListener('load', Init, false);

function ExternalCallSaveGame() {

    //Determina si las variables existen
    if (points > 0 && typeof functionName != "undefined" && typeof q != "undefined") {

        if (typeof (window[functionName]) === "function") {

            var key = hex_md5(q + "wH4DsxHyu8dAqsdeAqCbHfsD" + points);

            window[functionName](key, points, level);
        }
    }
}

function ExternalCallUpgradePoint(score) {

    if (typeof (window["updateScore"]) === "function")
        window["updateScore"](score);
}

function Init() {

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

    //Obtiene el canvas
    canvas = document.getElementById('c2canvas');

    //Cambia el color de fondo del canvas
    canvas.style.background = '#000';

    //Configura el contexto
    ctx = canvas.getContext('2d');

    //Llama a la configuracion inicial personalizada del juego
    CustomInit();

    //Envia el contexto para pintarlo
    Run();
}

//Crea numeros aleatorios
function Random(min, max) {

    return Math.floor(Math.random() * max) + min
}

//Reincia los valores del juego a su estado original
function Reset() {

    lives = (typeof LIVES == "undefined" || LIVES == null || LIVES > 5 || LIVES < 1) ? 3 : LIVES;

    points = 0;
    level = 1;

    //Reinicio el audio del juego
    if (aEnvironment.currentTime != 0)
        aEnvironment.currentTime = 0;

    //Llama a la funcion encargada de reiniciar los valores del juego de manera personalizada
    CustomReset();
}

//Inicia la ejecucion del juego
function Run() {

    //Crea un ciclo
    requestAnimationFrame(Run);

    //Configura el juego
    Game();

    //Envia el contexto para pintarlo
    Paint(ctx);
}

//Obtimiza la creacion de ciclos
window.requestAnimationFrame = (function () {

    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function (callback) { window.setTimeout(callback, speed); };
})();

//*********************************PERSONALIZADOS*********************************

//Velocidad con la que bajan las pizzas (Esta es la velocidad que va disminuyendo para aumentar la velocidad del juego)
var speedPizzasLess = SPEEDPIZZAS;

//velocidad con la que bajan las pizzas
var speedPizzas = speedPizzasLess;

//Arreglo para guardar los canales
var channel = new Array(5);

//Lugar donde se eliminan las filas
//  0 = Inicio
//  1 = Final
var PositionRemoveRows = POSITIONREMOVEROWS;

//Numero de filas que se eliminan
var NumberRows = NUMBERREMOVEROWS;

//Variables para la posicion del raton
var mousex = 0;
var mousey = 0;
var x = 0;
var y = 0;

//Boton del mouse precionado
var lastPress = null;

//Indica si se encuentra presionado un boton de mouse
var IsPress = false;

//Almacena la ultima tecla presionada
var lastKey = null;

//Guarda la pieza seleccionada
var SelectedPart = new Array();

//Sonido de fondo
var aEnvironment = new Audio();
aEnvironment.src = pathMedia + "media/audio/environment.mp3";

//Imagenes de fondo del juego
var iBackground = new Image();
iBackground.src = pathMedia + 'media/images/background.png';

//Imagenes de fondo de instruccioes
var iBackgroundInstructionsMouse = new Image();
iBackgroundInstructionsMouse.src = pathMedia + 'media/images/backgroundInstructionsMouse.png';

var iBackgroundInstructionsTouch = new Image();
iBackgroundInstructionsTouch.src = pathMedia + 'media/images/backgroundInstructionsTouch.png';

//Instrucciones para equipos no tactiles
var iMouse = new Image();
iMouse.src = pathMedia + 'media/images/mouse.png';

//Instrucciones para equipos tactiles
var iTouch = new Image();
iTouch.src = pathMedia + 'media/images/touch.png';

var iCoins = new Image();
iCoins.src = pathMedia + 'media/images/moneda.png';

var iGameOver = new Image();
iGameOver.src = pathMedia + 'media/images/game-over.png';

var iPause = new Image();
iPause.src = pathMedia + 'media/images/pausa.png';

var iPizza1 = new Image();
iPizza1.src = pathMedia + 'media/images/pizza1.png';

var iPizza2 = new Image();
iPizza2.src = pathMedia + 'media/images/pizza2.png';

var iPizza3 = new Image();
iPizza3.src = pathMedia + 'media/images/pizza3.png';

var iPizza4 = new Image();
iPizza4.src = pathMedia + 'media/images/pizza4.png';

var iPizza5 = new Image();
iPizza5.src = pathMedia + 'media/images/pizza5.png';

var iPizzaWildcard = new Image();
iPizzaWildcard.src = pathMedia + 'media/images/comodin.png';

var iPizzaCoins = new Image();
iPizzaCoins.src = pathMedia + 'media/images/moneda.png';

var iVolumeOff = new Image();
iVolumeOff.src = pathMedia + 'media/images/volumenOff.png';

var iVolumeOn = new Image();
iVolumeOn.src = pathMedia + 'media/images/volumenOn.png';

var i0 = new Image();
i0.src = pathMedia + 'media/images/0.png';

var i1 = new Image();
i1.src = pathMedia + 'media/images/1.png';

var i2 = new Image();
i2.src = pathMedia + 'media/images/2.png';

var i3 = new Image();
i3.src = pathMedia + 'media/images/3.png';

var i4 = new Image();
i4.src = pathMedia + 'media/images/4.png';

var i5 = new Image();
i5.src = pathMedia + 'media/images/5.png';

var i6 = new Image();
i6.src = pathMedia + 'media/images/6.png';

var i7 = new Image();
i7.src = pathMedia + 'media/images/7.png';

var i8 = new Image();
i8.src = pathMedia + 'media/images/8.png';

var i9 = new Image();
i9.src = pathMedia + 'media/images/9.png';

var iLevel = new Image();
iLevel.src = pathMedia + 'media/images/level.png';

//Id del jostick
var IdFinger = -1;

function CustomInit() {

    //Se pone en cero para agregar mas pizzas
    speedPizzas = 0;

    //Verifica el tipo de dispositivo
    if (touchable) {

        //Muestra el icono de volumen apagado
        aEnvironment.volume = 0
        VolumeON = false;

        //Agrega la escucha al tocar la pantalla
        canvas.addEventListener('touchstart', function (e) {

            for (var i = 0; i < e.changedTouches.length; i++) {

                var touch = e.changedTouches[i];

                //Verifica si es el primer contacto
                if (IdFinger == -1) {

                    //Si el juego esta en game over o esta en instrucciones lo inicia
                    if (instructions == 1 || GameOver) {
                        
                        lastKey = 13;
                    } //Controla el push en el icono de audio del juego
                    else if ((touch.clientX >= 862 && touch.clientX <= 897) &&
                             (touch.clientY && touch.clientY <= 41)) {

                        if (aEnvironment.volume == 1) {

                            VolumeON = false;
                            aEnvironment.volume = 0;
                        }
                        else {

                            VolumeON = true;
                            aEnvironment.volume = 1;
                        }
                    }
                    else {

                        //Asigna el identificador del contacto al dedo
                        IdFinger = touch.identifier;

                        //Asigna las coordenadas
                        mousex = touch.clientX;
                        mousey = touch.clientY;

                        //Indica que se presiono la pantalla(boton derecho del raton)
                        lastPress = 1;
                        IsPress = true;

                        continue;
                    }
                }
            }
        }, false);

        canvas.addEventListener('touchmove', function (e) {

            // Evita el scroll y zoom de la pagina
            e.preventDefault();

            //Recorre la matriz de contacto en busca del dedo
            for (var i = 0; i < e.changedTouches.length; i++) {

                var touch = e.changedTouches[i];

                //Si el contacto es el dedo
                if (IdFinger == touch.identifier) {

                    //Cambia la posicion del dedo
                    mousex = touch.clientX;
                    mousey = touch.clientY;

                    break;
                }
            }
        }, false);

        canvas.addEventListener('touchend', function (e) {

            //Recorre la matriz de contacto en busca del dedo
            for (var i = 0; i < e.changedTouches.length; i++) {

                var touch = e.changedTouches[i];

                //Si el contacto es el dedo
                if (IdFinger == touch.identifier) {

                    IdFinger = -1;

                    IsPress = false;

                    SwitchPizza();
                    SetPart();

                    break;
                }
            }
        }, false);

    }
    else {

        //Agrega la escucha al presionar el raton
        document.addEventListener('mousedown', function (e) {

            //Controla el clic en el icono de audio del juego
            if ((e.pageX >= 862 && e.pageX <= 897) &&
                (e.pageY >= 6 && e.pageY <= 41)) {

                if (aEnvironment.volume == 1) {

                    VolumeON = false;
                    aEnvironment.volume = 0;
                }
                else {

                    VolumeON = true;
                    aEnvironment.volume = 1;
                }
            }
            else {

                lastPress = e.which;
                IsPress = true;

                mousex = e.pageX;
                mousey = e.pageY;
            }
        }, false);

        //Agrega la escucha al movimiento del raton
        document.addEventListener('mousemove', function (e) {

            mousex = e.pageX;
            mousey = e.pageY;
        }, false);

        //Agrega la escucha al soltar el raton
        document.addEventListener('mouseup', function (e) {

            IsPress = false;

            SwitchPizza();
            SetPart();

        }, false);

        //Agrega una escucha, se presiona una tecla
        document.addEventListener('keydown', function (evt) {

            lastKey = evt.keyCode;
        }, false);
    }
}

//Configura el juego
function Game() {

    //Verifica si el juego esta en modo intruccion
    if (instructions == 0) {

        // Acciona y detiene el juego o lo reinicia si esta en GameOver
        if (lastKey == 13) {

            if (!GameOver) {

                Pause = !Pause;
                lastKey = null;

                if (Pause)
                    aEnvironment.pause();
                else
                    aEnvironment.play();
            }
            else {

                GameOver = false;
                Pause = true;
                Star = true;

                Reset();
            }
        }

        //Verifica si el juego no esta activo, en pausa o en game over
        if (Star && !Pause && !GameOver) {

            if (speedPizzas <= 0) {

                //Agrega pizzas a los canales
                for (var i = 0; i < channel.length; i++) {

                    var pizzas = channel[i];

                    //Verifica si se deben agregar pizzas
                    if (Random(0, 2) == 1 || pizzas.length == 0) {

                        //Canal auxiliar para guardar las pizzas
                        var pizzasAux = new Array();

                        //Agrega una pizza al inicio del canal
                        var possiblePizza = new Pizza(); ;

                        //Verifica que las 2 pizzas siguientes no sean del mismo tipo que la pizza generada
                        if (pizzas.length > 1) {

                            do {
                                possiblePizza = new Pizza();
                            }
                            while (possiblePizza.Type == pizzas[0].Type && pizzas[0].Type == pizzas[1].Type);
                        }

                        pizzasAux[0] = possiblePizza;

                        //Agrega las pizzas existentes
                        for (var j = 0; j < pizzas.length; j++) {

                            pizzasAux[j + 1] = pizzas[j];
                        }

                        //Coloca las pizzas en el canal correspondiente
                        channel[i] = pizzasAux;
                    }
                }

                //Determina si se acumulo el numero maximo de pizzas en un canal
                for (var i = 0; i < channel.length; i++) {

                    var pizzas = channel[i];

                    if (pizzas.length >= 7) {

                        //Verifica si la pizza genera impacto (comodin y monedas no generan impacto)
                        if (pizzas[pizzas.length - 1].Impact) {

                            //Elimina una vida
                            lives--;

                            //Si el usuario pierde todas sus vidas termina el juego
                            if (lives == 0) {

                                GameOver = true;
                                Star = false;

                                //Realiza la llamada de la funcion externa que guarda los datos del juego
                                ExternalCallSaveGame();

                                //Para el audio del juego
                                aEnvironment.pause();
                            }
                            else
                                RemovePizzas();

                            break;
                        }
                        else {

                            //Elimina la pizza que se encuentra en la parte de abajo sin causar danio
                            pizzas.pop();
                            break;
                        }
                    }
                }

                speedPizzas = speedPizzasLess;
            }
            else
                speedPizzas -= speed;

            //Cuando una figura es arrastrada calcula su posicion
            x = mousex;
            y = mousey;

            //Obtiene la mitad del tamanio de la pizza, con esto se evita que las pizzas salgan de los canales
            var halfOfPizza = 136 / 2;

            if (x < halfOfPizza - 20)
                x = halfOfPizza - 20;
            else if (x > 815 - halfOfPizza + 20)
                x = 815 - halfOfPizza + 20;

            if (y < 0)
                y = 0;
            else if (y > canvas.height)
                y = canvas.height;

            for (var i = 0; i < channel.length; i++) {

                var pizzas = channel[i];

                //Obtiene la pizza con el indice mas bajo
                var axisY = pizzas.length - 1 < 0 ? 0 : pizzas.length - 1

                var pizza = pizzas[axisY];

                if (pizza != undefined) {

                    //Si el boton izquierdo del mouse se encuentra presionado
                    if (lastPress == 1 && IsPress) {

                        //Verifica si ya se encuentra seleccionada una pizza 
                        //o no se ecuentra seleccionada ninguna
                        if ((SelectedPart[0] == i && SelectedPart[1] == axisY) ||
                            (SelectedPart[0] == 0 && SelectedPart[1] == 0)) {

                            //Determina si la pizza fue seleccionada
                            if (pizza.DetermineSelect(x, y)) {

                                SetPart(i, axisY);

                                //Coloca el centro de la pizza en el puntero del mouse
                                pizza.AxisX = x - (pizza.Width / 2);
                                pizza.AxisY = y - (pizza.High / 2);

                                pizza.IsSelect = true;
                            }
                            else
                                pizza.IsSelect = pizza.IsDraggable = false;
                        }
                        else
                            pizza.IsSelect = pizza.IsDraggable = false;
                    }
                    else
                        pizza.IsSelect = pizza.IsDraggable = false;
                }
            }
        }
    }
    else {

        //Quita las instrucciones
        if (lastKey == 13) {

            Reset();
            PAUSE = false;
            GAMEOVER = false;
            instructions = 0;

            lastKey = null;
        }
    }
}

function CustomReset() {

    speedPizzasLess = SPEEDPIZZAS;

    //Agrega los arreglos de pizzas a los canales
    for (var i = 0; i < 5; i++) {

        var pizzas = new Array();

        for (var j = 0; j < 1; j++) {

            pizzas[j] = new Pizza();
        }

        //Agrega las pizzas al canal
        channel[i] = pizzas;
    }

    SetPart();

    aEnvironment.play();
}

//Mueve las pizzas entre canales
function SwitchPizza() {

    //Verifica si el juego esta en modo instruccion
    if (instructions == 0) {

        //Obtiene el canal seleccionado
        var pizzas = channel[SelectedPart[0]];

        //Obtiene la pizza seleccionada
        var pizza = pizzas[SelectedPart[1]];

        //Verifica si la pizza esta seleccionada
        if (pizza != undefined && pizza.IsSelect) {

            //Canal al cual se movera la pizza
            var ToChanel = Math.floor(mousex / 168) > 4 ? 4 : Math.floor(mousex / 168);

            //Si el canal al que se desea mover la pizza tiene menos de 7 pizzas se realiza
            //el cambio de canal
            if (channel[ToChanel].length < 7) {

                channel[ToChanel].push(pizza);
                channel[SelectedPart[0]].pop()

                //Busca 3 pizzas del mismo tiempo
                var pizzas = channel[ToChanel];

                //Verifica que por lo menos existan 3 pizzas en el canal
                if (pizzas.length >= 3) {

                    var pop = false;

                    //Verifica que las pizzas sean del mismo tipo o comodin
                    if ((pizzas[pizzas.length - 1].Type == pizzas[pizzas.length - 2].Type || pizzas[pizzas.length - 1].Type == 7) &&
                 pizzas[pizzas.length - 2].Type == pizzas[pizzas.length - 3].Type) {

                        //Variable para almacenar el numero de pizzas de vida
                        var countLives = 0;

                        //Identifica las pizzas de vida
                        for (var i = 0; i < 3; i++) {

                            if (pizzas[pizzas.length - (i + 1)].Type == 6)
                                countLives++;
                        }

                        //Elimina las pizzas
                        for (var i = 0; i < 3; i++) {

                            pizzas.pop();
                        }

                        //Incrementa la velocidad de las pizzas
                        if (speedPizzasLess >= SPEEDMAX)
                            speedPizzasLess -= SPEEDUP;

                        //Si por lo menos dos monedas son vida
                        //Verifica si se tienen menos vidas de las maximas permitidas
                        //Si tiene menos agrega una vida si no incrementa el puntaje 
                        //(multiplica el incremento por el numero de monedas de vida)
                        //Si no son monedas de vida incrementa el puntaje de manera normal
                        if (countLives > 1) {

                            if (lives < 5)
                                lives++;
                            else
                                points += (POINTSFORGROUP * countLives);
                        }
                        else
                            points += POINTSFORGROUP;

                        //Realiza la llamada de la funcion externa que actualiza los puntos
                        ExternalCallUpgradePoint(points);

                        if (points > (level * INCREASEDLEVELFACTORA + (level * (INCREASEDLEVELFACTORB * level)))) {

                            //Incrementa el nivel del usuario
                            level++;

                            //Indica el tiempo que se muestra la imagen del nivel
                            titleLevel = TIMEDISPLAYBETWEENLEVEL;
                        }
                    }
                }
            }
        }
    }
}

//Remueve las pizzas de las filas indicadas
function RemovePizzas() {

    for (var i = 0; i < channel.length; i++) {

        var pizzas = channel[i];

        var pizzasAux = new Array();

        //Indica si las filas se remueven de final o del inicio
        if (PositionRemoveRows == 0) {

            //Elimina las fila de pizzas del inicio
            for (var j = NumberRows; j < pizzas.length; j++) {

                pizzasAux[j - NumberRows] = pizzas[j];
            }
        }
        else {

            //Elimina las fila de pizzas del final
            for (var j = 0; j < pizzas.length - NumberRows; j++) {

                pizzasAux[j] = pizzas[j];
            }
        }

        //Coloca las pizzas en el canal correspondiente
        channel[i] = pizzasAux;
    }
}

//Dibuja el juego
function Paint(ctx) {

    //Limpia el contexto
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Verifica si el juego esta detenido
    if (instructions == 1) {

        //Dibuja el fondo
        if (!touchable) {

            ctx.drawImage(iBackgroundInstructionsMouse, 0, 0, 900, 450);
            ctx.drawImage(iMouse, 5, 10, 298, 430);
        }
        else {

            ctx.drawImage(iBackgroundInstructionsTouch, 0, 0, 900, 450);
            ctx.drawImage(iTouch, 5, 10, 298, 430);
        }

        return;
    }
    else {

        //Dibuja el fondo
        ctx.drawImage(iBackground, 0, 0, 900, 450);

        //Dibuja las vidas
        for (var i = 0; i < lives; i++) {

            ctx.drawImage(iCoins, 835, ((i + 1) * 47), 44, 44);
        }

        //Dibuja las pizzas
        for (var i = 0; i < channel.length; i++) {

            var pizzas = channel[i];

            for (var j = 0; j < pizzas.length; j++) {

                var pizza = pizzas[j];

                //Indica el color del cuadro
                ctx.fillStyle = pizza.PathImage;

                //Pizza generica
                var iPizzaX;

                //Selecciona la imagen de la pizza
                switch (pizza.Type) {

                    case 1:

                        iPizzaX = iPizza1;
                        break;

                    case 2:

                        iPizzaX = iPizza2;
                        break;

                    case 3:

                        iPizzaX = iPizza3;
                        break;

                    case 4:

                        iPizzaX = iPizza4;
                        break;

                    case 5:

                        iPizzaX = iPizza5;
                        break;

                    case 6:

                        iPizzaX = iPizzaCoins;
                        break;

                    case 7:

                        iPizzaX = iPizzaWildcard;
                        break;
                }

                //Si la pieza no fue seleccionada la pinta en el canal correspondiente
                if (!pizza.IsSelect) {

                    //Calcula la posicion de las pizzas
                    pizza.AxisX = ((i + 1) * 12) + (i * (pizza.Width + 15.5));
                    pizza.AxisY = (j + 1) * (pizza.High + 1);
                }

                ctx.drawImage(iPizzaX, pizza.AxisX, pizza.AxisY, pizza.Width, pizza.High);
            }
        }

        //Pinta los puntos
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12pt Calibri';
        ctx.textAlign = 'center';
        ctx.fillText(points, 858, 413);
        ctx.textAlign = 'left';

        //Formatea el nivel a dos digitos 
        var levelPrint = level < 10 ? "0" + level : level;

        //Pinta el nivel
        ctx.fillText(levelPrint, 850, 337);
        ctx.textAlign = 'left';

        //Pinta el volumen
        if (VolumeON)
            ctx.drawImage(iVolumeOn, 862, 4, 34, 42);
        else
            ctx.drawImage(iVolumeOff, 862, 4, 34, 42);

        //Pinta el cambio de nivel
        if (titleLevel > 0) {

            //Digitos del nivrl generico
            var iLevelA, iLevelB;

            //Selecciona la imagen del primer digito del nivel
            switch (levelPrint[0]) {

                case '0':

                    iLevelA = i0;
                    break;

                case '1':

                    iLevelA = i1;
                    break;

                case '2':

                    iLevelA = i2;
                    break;

                case '3':

                    iLevelA = i3;
                    break;

                case '4':

                    iLevelA = i4;
                    break;

                case '5':

                    iLevelA = i5;
                    break;

                case '6':

                    iLevelA = i6;
                    break;

                case '7':

                    iLevelA = i7;
                    break;

                case '8':

                    iLevelA = i8;
                    break;

                case '9':

                    iLevelA = i9;
                    break;
            }

            //Selecciona la imagen del segundo digito del nivel
            switch (levelPrint[1]) {

                case '0':

                    iLevelB = i0;
                    break;

                case '1':

                    iLevelB = i1;
                    break;

                case '2':

                    iLevelB = i2;
                    break;

                case '3':

                    iLevelB = i3;
                    break;

                case '4':

                    iLevelB = i4;
                    break;

                case '5':

                    iLevelB = i5;
                    break;

                case '6':

                    iLevelB = i6;
                    break;

                case '7':

                    iLevelB = i7;
                    break;

                case '8':

                    iLevelB = i8;
                    break;

                case '9':

                    iLevelB = i9;
                    break;
            }

            //Pinta la palabra nivel
            ctx.drawImage(iLevel, 0, 0, 900, 450);

            //Pinta el primer digito
            ctx.drawImage(iLevelA, 410, 220, 60, 75);

            //Pinta el segundo digito
            ctx.drawImage(iLevelB, 447, 220, 60, 75);

            titleLevel--;
        }

        //Si el juego esta pausado
        if (Pause)
            ctx.drawImage(iPause, 0, 0, 900, 450);
        else if (GameOver)
            ctx.drawImage(iGameOver, 0, 0, 900, 450);
    }
}

//Carga la posicion x y y de la pizza seleccionada
function SetPart(x, y) {

    SelectedPart[0] = (x == null) ? 0 : x;
    SelectedPart[1] = (y == null) ? 0 : y;
}

//Representa las pizzas y sus propiedades
function Pizza() {

    //Alto de la pieza
    this.High = 50;

    //Indica si la pieza causa impacto en la parte baja del canal
    this.Impact = true;

    //Indica si la pieza esta selccionada
    this.IsSelect = false;

    //Indica si la pieza esta siendo arrastrada
    this.IsDraggable = false;

    //Indica el path de la imagen que muestra la pieza
    this.PathImage = "";

    //Indica el tipo de la pieza
    this.Type = 1;

    //Ancho de la pieza
    this.Width = 136;

    //Posicion de la ezquina superior izquierda en el eje x.
    this.AxisX = 0;

    //Posicion de la ezquina superior izquierda en el eje y.
    this.AxisY = 0;

    this.AssignType = function () {

        this.Type = Random(1, 7);

        //Verifica si la pizza es moneda da vidas
        //o si la pizza es comodin
        if (this.Type == 6)
            this.Type = this.SelectOtherType(10, 6);
        else if (this.Type == 7)
            this.Type = this.SelectOtherType(6, 7);
    }

    this.SelectOtherType = function (frequency, Type) {

        //Disminuye la frecuendia de aparicion
        if (Random(1, frequency) == (frequency / 2)) {

            if (Type == 6 || Type == 7)
                this.Impact = false;

            return Type;
        }
        else {

            do {
                this.Type = Random(1, 7);
            }
            while (this.Type == 6 || this.Type == 7);
        }

        return this.Type;
    }

    this.DetermineSelect = function (x, y) {

        if (this.IsDraggable) {

            return true;
        }
        else if ((x >= this.AxisX) && (x <= (this.AxisX + this.Width)) &&
                (y >= this.AxisY) && (y <= (this.AxisY + this.High))) {

            this.IsDraggable = true;
            return true;
        }
    }

    this.AssignType();
}

//*********************************MD5*********************************
var hexcase = 0; function hex_md5(a) { return rstr2hex(rstr_md5(str2rstr_utf8(a))) } function hex_hmac_md5(a, b) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b))) } function md5_vm_test() { return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72" } function rstr_md5(a) { return binl2rstr(binl_md5(rstr2binl(a), a.length * 8)) } function rstr_hmac_md5(c, f) { var e = rstr2binl(c); if (e.length > 16) { e = binl_md5(e, c.length * 8) } var a = Array(16), d = Array(16); for (var b = 0; b < 16; b++) { a[b] = e[b] ^ 909522486; d[b] = e[b] ^ 1549556828 } var g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8); return binl2rstr(binl_md5(d.concat(g), 512 + 128)) } function rstr2hex(c) { try { hexcase } catch (g) { hexcase = 0 } var f = hexcase ? "0123456789ABCDEF" : "0123456789abcdef"; var b = ""; var a; for (var d = 0; d < c.length; d++) { a = c.charCodeAt(d); b += f.charAt((a >>> 4) & 15) + f.charAt(a & 15) } return b } function str2rstr_utf8(c) { var b = ""; var d = -1; var a, e; while (++d < c.length) { a = c.charCodeAt(d); e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0; if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) { a = 65536 + ((a & 1023) << 10) + (e & 1023); d++ } if (a <= 127) { b += String.fromCharCode(a) } else { if (a <= 2047) { b += String.fromCharCode(192 | ((a >>> 6) & 31), 128 | (a & 63)) } else { if (a <= 65535) { b += String.fromCharCode(224 | ((a >>> 12) & 15), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } else { if (a <= 2097151) { b += String.fromCharCode(240 | ((a >>> 18) & 7), 128 | ((a >>> 12) & 63), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } } } } } return b } function rstr2binl(b) { var a = Array(b.length >> 2); for (var c = 0; c < a.length; c++) { a[c] = 0 } for (var c = 0; c < b.length * 8; c += 8) { a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << (c % 32) } return a } function binl2rstr(b) { var a = ""; for (var c = 0; c < b.length * 32; c += 8) { a += String.fromCharCode((b[c >> 5] >>> (c % 32)) & 255) } return a } function binl_md5(p, k) { p[k >> 5] |= 128 << ((k) % 32); p[(((k + 64) >>> 9) << 4) + 14] = k; var o = 1732584193; var n = -271733879; var m = -1732584194; var l = 271733878; for (var g = 0; g < p.length; g += 16) { var j = o; var h = n; var f = m; var e = l; o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936); l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586); m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819); n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330); o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897); l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426); m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341); n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983); o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416); l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417); m = md5_ff(m, l, o, n, p[g + 10], 17, -42063); n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162); o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682); l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101); m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290); n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329); o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510); l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632); m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713); n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302); o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691); l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083); m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335); n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848); o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438); l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690); m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961); n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501); o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467); l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784); m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473); n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734); o = md5_hh(o, n, m, l, p[g + 5], 4, -378558); l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463); m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562); n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556); o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060); l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353); m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632); n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640); o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174); l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222); m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979); n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189); o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487); l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835); m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520); n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651); o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844); l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415); m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905); n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055); o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571); l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606); m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523); n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799); o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359); l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744); m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380); n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649); o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070); l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379); m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259); n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551); o = safe_add(o, j); n = safe_add(n, h); m = safe_add(m, f); l = safe_add(l, e) } return Array(o, n, m, l) } function md5_cmn(h, e, d, c, g, f) { return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d) } function md5_ff(g, f, k, j, e, i, h) { return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h) } function md5_gg(g, f, k, j, e, i, h) { return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h) } function md5_hh(g, f, k, j, e, i, h) { return md5_cmn(f ^ k ^ j, g, f, e, i, h) } function md5_ii(g, f, k, j, e, i, h) { return md5_cmn(k ^ (f | (~j)), g, f, e, i, h) } function safe_add(a, d) { var c = (a & 65535) + (d & 65535); var b = (a >> 16) + (d >> 16) + (c >> 16); return (b << 16) | (c & 65535) } function bit_rol(a, b) { return (a << b) | (a >>> (32 - b)) };