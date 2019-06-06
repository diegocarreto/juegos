// ++++++++++++++++++++++++++++++++++++++++++++++++++
//		TYPEWRITER: Escribir el texto letra por letra
// ++++++++++++++++++++++++++++++++++++++++++++++++++

	jQuery.fn.typwriter = function(options){
		var defaults = $.extend({
			// Dentro del objeto, por default selecciona los párrafos
			parrafs: 'p',
			// Tiempo de escritura entre letra y letra
			timeWrite: 50
		}, options),
		// Método para escribir letra por letra
		escribe = function(obj, timeOut){
			// Variable para guardar el texto del objeto
			var string = $(obj).text(),
			// Variable usada para contar el progreso
				progress = 0;
			// Vaciamos de texto el objeto
			$(obj).text('');
			// En un intervalo de tiempo escribe el párrafo
			setTimeout(function(){
				// En un intervalo de tiempo escribe cada letra. Se asigna a variable para después limpiarla
				var timer = setInterval(function(){
					// Mandamos llamar método que nos pondrá el cursor
					var divider = chooseDivider(progress);
					// Escribe en nuestro objeto la subcadena desde el inicio hasta lo que valga progress más el cursor
					$(obj).text(string.substring(0, progress++) + divider);
					// Si el progress ya ha alcanzado el número de letras de la cadena
					if(progress >= string.length) {
						// Vacía la variable de intervalo
						clearInterval(timer);
						// Escribe el texto que originalmente estaba
						$(obj).text(string);
					}
					// Tiempo por default para escribir cada letra
				}, defaults.timeWrite);
				// Tiempo para toda la animación
			}, timeOut);
				
		},
		// Método para simular el cursor
		chooseDivider = function(progress){
			// Si el número del progreso módulo 2 nos arroja 1, quiere decir que es none
			if(progress % 2 === 1){
				// Entonces regresa el guión bajo
				return '_';
			} else {
				// Si no es none, regresa nada
				return '';
			}
		};
		return this.each(function() {
			// Encuentra los párrafos en el objeto
			var parrafo = $(this).find(defaults.parrafs),
			// Contador de letras inicial en 10
				count = 10,
			// Tiempo para escribir
				timeOut = defaults.timeWrite;
			// Buscamos los párrafos
			if(parrafo.length){
				// Empezamos recorrido por los párrafos del objeto
				for(var i = 0; i < parrafo.length; i ++){
					// El tiempo que queremos para escribir es igual a contador por el tiempo definido por default
					timeOut = count * defaults.timeWrite;
					// Se incrementa el contador de letras con el número de letras del párrafo
					count = count + parrafo.eq(i).text().length;
					// Llamada al método para escribir el párrafo
					escribe(parrafo.eq(i), timeOut);
				}
			} else {
				escribe(this, defaults.timeWrite);
			}
		});
	};

// ++++++++++++++++++++++++++++++++++++++++++++++++++
//		MOVESPACESHIP: Mover la nave
// ++++++++++++++++++++++++++++++++++++++++++++++++++

	jQuery.fn.moveSpaceship = function(options){
		var defaults = $.extend({
			// Tiempo que pasa entre una y otra animación en milisegundos
			time: 5000,
			// Margen de movimiento
			margin: 20
		}, options),
		// Aqui asignaremos el margen superior del objeto que traiga por default
		topMargin,
		// Aqui asignaremos el margen izquierdo del objeto que traiga por default
		leftMargin,
		// Arreglo donde se colocan los número aleatorios + margin
		randomNum = new Array(8),
		// Método para iterar y animar
		timeOut = function(obj){
			// Iteración para animar 8 veces, formando un cuadro
			for(var i=0; i<8; i+=2){
				$(obj).animate({
					// Mover el objeto en su margen superior los pixeles que estan en el arreglo
					marginTop: randomNum[i],
					// Mover el objeto en su margen izquierdo los pixeles que estan en el arreglo
					marginLeft: randomNum[i+1]
					// El tiempo de duración de la animación definido en defaults + 1
				}, defaults.time*(i+1));
			}
		},
		// Método para asignar valores
		asignValues = function(obj){
			// Asignar a variable global el valor margen superior del objeto para hacer operaciones
			topMargin = parseInt($(obj).css('marginTop'), 10);
			// Asignar a variable global el valor margen izquierdo del objeto para hacer operaciones
			leftMargin = parseInt($(obj).css('marginLeft'), 10);
			// Asignar al arreglo los 4 movimientos que hará el objeto:
			// 1. Esquina superior derecha
			randomNum[0] = topMargin - defaults.margin;
			randomNum[1] = leftMargin + defaults.margin;
			// 2. Esquina inferior derecha
			randomNum[2] = topMargin + defaults.margin;
			randomNum[3] = leftMargin + defaults.margin;
			// 3. Esquina inferior izquierda
			randomNum[4] = topMargin + defaults.margin;
			randomNum[5] = leftMargin - defaults.margin;
			// 4. Esquina superior izquierda
			randomNum[6] = topMargin - defaults.margin;
			randomNum[7] = leftMargin - defaults.margin;
		};
		// Iniciamos...
		return this.each(function(){
			// Llamar el método asignValues, que asigna los valores del movimiento
			asignValues(this);
			// Iterar animaciones para mover el objeto
			timeOut(this);
			// Asignar a la variable este el objeto
			var este = this;
			// Establecer intervalo de tiempo que se repite la animación
			setInterval(function(){
				// Llamamos al método para para mover el objeto
				timeOut(este);
				// Tiempo entre uno y otro intervalo. 4 tiempos
			}, defaults.time*4 , function(){
				// Patrón nullify
				este = topMargin = leftMargin = randomNum = null;
			});
		});
	};

// ++++++++++++++++++++++++++++++++++++++++++++++++++
//		TOGGLECLASE: Intercambia clases
// ++++++++++++++++++++++++++++++++++++++++++++++++++

	jQuery.fn.toggleClase = function(options){
		var defaults = $.extend({
			// Tiempo entre una y otra animación en milisegundos
			time: 50,
			// Clase que se intercambiará
			clase: 'bigFlame',
		}, options),
		// Método que intercambia clases
		toggleIt = function(obj){
			// Asignar el intervalo a variable
			toggleIt = setInterval(function(){
				// Intercambiar clase en la mitad de tiempo
				setTimeout(function(){
					// Toggle clase en el objeto
					$(obj).toggleClass(defaults.clase);
					// Tiempo en que se cambian las clases
				}, defaults.time/2);
				// Tiempo en que se repite el ciclo
			}, defaults.time);
		};
		// Iniciamos...
		return this.each(function(){
			// Llamamos al método para intercambiar
			toggleIt(this);
		});
	};

// ++++++++++++++++++++++++++++++++++++++++++++++++++
//		MOVEOBJ: Mover los objetos a intervalos
// ++++++++++++++++++++++++++++++++++++++++++++++++++

	jQuery.fn.moveObj = function(options){
		var defaults = $.extend({
			// Intervalo de tiempo que se repite la animación
			interval: 400,
			// Pixeles que se mueve a la izquierda
			pixelesLeft: 1,
			// Pixeles que se mueve hacia arriba. Por default, ninguno
			pixelesTop: 0
		}, options),
		// Aquí asignaremos los valores de background-position del objeto
		bgPosition,
		// Aqui asignaremos la posición de la primera ocurrencia de la cadena px
		pxPosition,
		// Aqui asignaremos el valor x de bgPosition
		xPosition,
		// Aqui asingaremos el valor Y de bgPosition
		yPosition,
		// Aqui asignaremos el objeto
		obj,
		// Obtener la posición del background
		getPosition = function(){
			// Valor del background-position
			bgPosition = $(obj).css('background-position');
			pxPosition = bgPosition.indexOf('px');
			// Posición del valor top en la cadena del background-position
			yPosition = parseInt(bgPosition.substr(pxPosition + 3, bgPosition.lastIndexOf('px')), 10) - defaults.pixelesTop;
			// Posición del valor left en la cadena del background-position
			xPosition = parseInt(bgPosition.substr(0, pxPosition), 10) - defaults.pixelesLeft;
			if(pxPosition !== -1){
			// Si la posición no es la inicial, empezar a mover en background de acuerdo a la cantidad de pixeles del default
				$(obj).css('background-position',  xPosition + 'px ' + yPosition + 'px');
			} else {
			// La primera vez que se ejecuta la animación
				$(obj).css('background-position', '1px 0px');
			}
		};
		return this.each(function(){
			// Asignar a variable 'este' el objeto a mover
			obj = this;
			// Iniciar el intervalo
			setInterval(function(){
			// Mandar llamar la función asignándoselo al objeto
				getPosition(obj);
			// Intervalo de tiempo desde la variable global interval
			}, defaults.interval, function(){
				// Patrón nullify
				obj = bgPosition = pxPosition = xPosition = yPosition = null;
			});
		});
	};

// ++++++++++++++++++++++++++++++++++++++++++++++++++
//		GOTOPLANET: Ir al planeta
// ++++++++++++++++++++++++++++++++++++++++++++++++++

	jQuery.fn.gotoPlanet = function(options){
		var defaults = $.extend({
			// La nave que moveremos
			nave: '.space-spaceship',
			// Planeta donde aterriza
			planeta: '.space-planets7',
			// Planetas a eliminar
			planetas: '.spacePlanets',
			// Pixeles para desaparecer planetas
			recorrePlanetas: '-1200px',
			// Clase que se le agrega al planeta para crecer
			clasePlaneta: 'growPlanet',
			// Clase que se agrega al botón para animarlo cuando le das click
			claseBtn: 'active',
			// Clase que se intercambia en el botón para que brille
			claseGlow: 'glowMe',
			// Clase para hacer el blur a la nave
			claseBlur: 'blurMe',
			// Clase para mover la nave hasta la izquierda
			claseGotPlanet: 'gotPlanet',
			// Clase para mover la nave de la izquierda hasta el planeta
			claseArrive: 'arrivePlanet',
			// Intervalo para la animación del botón
			timeBtn: 100,
			// Intervalo para hacer brillar el botón
			timeGlow: 500,
			// Intervalo para animar desaparición de planetas
			timePlanets: 500,
			// Clase para ocultar los elementos
			hideItem: 'hideItem',
			// Objeto que esta escribiendo el texto
			typingObj: '.space-text',
			// Ventana Modal
			modal: '.modalWindow',
			// Número de iteracione en el vortex
			numVortex: 5,
			// Iniciar el juego
			initCanvas: false
		}, options),
		// Aqui asignaremos el objeto
		este,
		// Aqui asignaremos el intervalo del glow
		interGlow,
		// Aqui asignaremos el intervalo del vórtex
		interVortex,
		// Método para hacer brillar el botón intercambiando clases
		glowBtn = function(obj){
			// Asignar el intervalo a variable interGlow
			interGlow = setInterval(function(){
				// Intercambiar clase en la mitad de tiempo
				setTimeout(function(){
					// Toggle clase en el objeto
					$(obj).find('a').toggleClass(defaults.claseGlow);
					// Tiempo en que se cambian las clases
				}, defaults.timeGlow/2);
				// Tiempo en que se repite el ciclo
			}, defaults.timeGlow);
		},
		// Metodo que llamaremos en el click
		doVortex = function(obj){
			// Inicializando variable contador
			var i = 0;
			// Asignar el intervalo a variable interVortex
			interVortex = setInterval(function(){
				// Iterar x veces para agregar/eliminar clase
				if(i < defaults.numVortex){
					// Incrementar i
					i = i+1;
					// Agregar y eliminar la clase
					$(obj).find('a').addClass(defaults.claseBtn+i).removeClass(defaults.claseBtn+(i-1));
				} else {
					// Una vez finalizado, detener intervalo
					clearInterval(interVortex);
					// Llamámos al método para animar desaparición de los planetas
					hidePlanets();
					// Eliminar del visual el vortex
					$(obj).slideUp();
				}
			// Intervalo entre una y otro intercambio de clases
			}, defaults.timeBtn);
		},
		// Método para ocultar los planetas y eliminarlos del DOM
		hidePlanets = function(){
			$(defaults.planetas).each(function(index) {
				$(this).animate({
					left: defaults.recorrePlanetas
				}, defaults.timePlanets*index, function(){
					$(this).remove();
				});
			});
			// Ir al método donde se acelera la nave
			warpSpaceship();
		},
		// Acelera la nave y la pone en el planeta
		warpSpaceship = function(){
			// Agrega la clase blur para que se vea el efecto de aceleración y se mueve
			$(defaults.nave).addClass(defaults.claseBlur);
			setTimeout(function(){
				// Agregar la clase gotPlanet que hará que la nave sea pequeña
				$(defaults.nave).addClass(defaults.claseGotPlanet).removeClass(defaults.claseBlur);
				// Hacemos que el planeta se ponga en el plano
				$(defaults.planeta).animate({
					left: 0
				}, 400);
				// Le agregamos la clase arrive a la nave
				setTimeout(function(){
					$(defaults.nave).addClass(defaults.claseArrive);
				}, 100);
				setTimeout(function(){
					// Abrimos el div modal
					showModal();
				}, 1500);
			}, 1000);
		},
		showModal = function(){
			// Muestra el modaal e inicia el API escoge personaje
			$(este).siblings(defaults.modal).slideDown().chooseCharacter({ initCanvas: defaults.initCanvas });
			// Elimina el planeta ignorantum del DOM
			removeElements(defaults.planeta);
			// Elimina la nave del DOM
			$(defaults.nave).hide().remove();
			// Eliminamos del DOM este objeto
			$(este).remove();
		},
		removeElements = function(obj){
			$(obj).slideUp('fast', function(){
				$(this).remove();
			});
		};
		return this.each(function(){
			// Hacemos que brille en un intervalo de tiempo
			glowBtn(this);
			// Asignar a la variable este el objeto
			este = this;
			// Asignamos los métodos a los eventos
			$(this).on({
				// En el click
				click: function(e){
					// Detenemos el comportamiento por default
					e.preventDefault();
					// Detenemos el intervalo que cambia la clase en el botón
					clearInterval(interGlow);
					// Llamamos al método para animar el vórtice y desaparecer los planetas
					doVortex(this);
					// Quitamos el typing si sigue haciendolo
					removeElements($(this).siblings(defaults.typingObj));
				},
				mouseenter: function(){
					// Cuando el mouse entra, eliminamos el intervalo para intercambiar clases
					clearInterval(interGlow);
				},
				mouseleave: function(){
					// Cuando sale el mouse reiniciamos el intercambio de clases
					glowBtn(este);
				}
			});
		});
	};

// ++++++++++++++++++++++++++++++++++++++++++++++++++
//		CHOOSECHARACTER: Escojer personaje
// ++++++++++++++++++++++++++++++++++++++++++++++++++

	jQuery.fn.chooseCharacter = function(options){
		var defaults = $.extend({
			// Elemento de título para animar typewriter
			title: 'h2',
			// Objetos astronautas
			astronauts: '.astronauta',
			// Clase para agregar a astronautas
			showMeFront: 'showMeFront',
			// Tiempo para el intervalo
			timeAstronauts: 100,
			// Mano del astronauta para animarlo
			hand: '.astronauta-hand',
			// Clase para animar mano
			handClass: 'shakeHand',
			// Número de animaciones de mano
			handNum: 9,
			// Tiempo para intercambio de clase en el saludo
			timeSalute: 2000,
			// Tiempo entre uno y otro saludo
			timeShake: 50,
			// Clase para animar personaje para salir
			walkClass: 'animateMe',
			// Número de pasos para salir
			walkSteps: 12,
			// Tiempo para los pasos al salir
			timeWalk: 120,
			// Callback al inicio del juego
			initCanvas: false
		}, options),
		// Aqui se asigna el contenedor
		este,
		// Método para agregar clase y mostrar astronautas
		showMe = function(obj){
			// Igualar a variable el objeto astronautas
			var astronauta = $(obj).find(defaults.astronauts),
			// Variable contador
				i = 0;
			// En un intervalo de tiempo, agregamos la clase para mostrar
			var timer = setInterval(function(){
				// Mandamos llamar método que nos pondrá el cursor
				astronauta.eq(i).addClass(defaults.showMeFront);
				// Incrementamos i
				i++;
				// Si el contador es mayor al número de astronautas
				if(i >= astronauta.length) {
					// Vacía la variable de intervalo
					clearInterval(timer);
				}
				// Tiempo por default para escribir cada letra
			}, defaults.timeAstronauts);
			$(obj).find(defaults.astronauts).each(function(){
				doSalute(this, Math.floor(Math.random() *(10000 - defaults.timeSalute) + defaults.timeSalute));
			});
		},
		// Método para mover la mano
		doSalute = function(obj, time){
			// Inicializando variable contador
			var i = 0;
			// Iniciar intervalo para saludar
			setInterval(function() {
			// Intervalo para mover manitas
				var inter = setInterval(function(){
					// Iterar 2 veces para agregar/eliminar clase
					if(i < defaults.handNum){
						// Incrementar i
						i = i + 1;
						// Agregar y eliminar la clase
						$(obj).each(function(){
							$(this).find(defaults.hand).addClass(defaults.handClass+i).removeClass(defaults.handClass+(i-1));
						});
					} else {
						// Reiniciamos variable
						i = 0;
						// Eliminamos el intervalo
						clearInterval(inter);
						// Eliminar la clase última
						$(obj).each(function(){
							$(this).find(defaults.hand).removeClass(defaults.handClass+defaults.handNum);
						});
					}
				// Intervalo entre una y otro intercambio de clases
				}, defaults.timeShake);
				// Tiempo de espera entre una y otra animación
			}, time);
		},
		// Método para animar el personaje cuando sale
		walkChar = function (obj) {
			// Agregamos clase y la eliminamos de sus nodos hermanos
			$(obj).addClass(defaults.walkClass).siblings().removeClass(defaults.walkClass);
			// Inicializando variable contador
			var i = 0;
			// Asignar el intervalo a variable interWalk
			var interWalk = setInterval(function(){
				// Iterar x veces para agregar/eliminar clase de acuerdo a la cantidad de pasos establecida
				if(i < defaults.walkSteps){
					// Incrementar i
					i = i+1;
					// Agregar y eliminar la clase
					$(obj).addClass(defaults.walkClass+i).removeClass(defaults.walkClass+(i-1));
				} else {
					// Una vez finalizado, detener intervalo
					clearInterval(interWalk);
					// Llamamos al método que oculta esta pantalla y muestra el canvas
					setTimeout(function(){
						openCanvas(obj);
					}, 1000);
				}
			// Intervalo entre una y otro intercambio de clases
			}, defaults.timeWalk);
		},
		openCanvas = function (obj) {
			// Objeto canvas
			var $canvas = $(este).parent().siblings('canvas');
			// Remueve la última clase
			$(obj).removeClass(defaults.walkClass+defaults.walkSteps).removeClass(defaults.walkClass);
			// Ocultamos el div modal
			$(este).slideUp('fast');
			// Pasamos el valor del jugador al canvas y el valor inicial que es verdadero
			$canvas.attr('data-character', $(obj).data('character')).
			attr('data-init', $(este).data('init'));
			// Ejecutamos la función externa para iniciar el juego
			defaults.initCanvas($(obj).attr('data-character'), $(este).attr('data-init'));
			setTimeout(function(){
				// Mostramos el canvas
				$canvas.slideDown('fast');
			}, 1000);
		};
		return this.each(function(){
			// Asigna a la variable este el objeto contenedor
			este = this;
			// Escribe el título como máquina de escribir
			$(this).find(defaults.title).typwriter();
			// Mostramos los astronautas
			showMe(this);
			// En el click, animamos para salir
			$(this).find(defaults.astronauts).click(function(){
				// Llamámos al método para caminar
				walkChar(this);
			});

		});
	};

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++
//		SHOWMECHAR: Escojer personaje desde el canvas
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++

	function showmeChar(canvas, obj, init) {
		$(canvas).slideUp();
		$(obj).slideDown().attr('data-init', init);
	}