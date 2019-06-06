titulo= "¡Los Rescataletras Intergalácticos!";

//ciencias // espanol // formacion //  geografia // historia //  matematicas 
  
materia= "espanol";  // con minúsculas, sin caracteres especiales ni espacios

grado = 3 // el correspondiente del 1 al 3
bloque= 6; // el que corresponda según el bloque al que pertenezca el recurso
skin= "azul"; // 'negro' // 'azul' //  'gris' // 'cafe' // 'marfil'

// texto de introducción
intro= 'Lorem ipsum dolor sit amet, <b>consectetur </b>adipiscing elit. Vivamus vestibulum massa et lorem aliquam sed ¿';


// 'home' 'imprimir' 'info' 'ayuda' 'sugerencias' etc...
botones = ['home', 'sugerencias', 'imprimir']; //agregar o quitar botones, separar con comas. Con cada botón que se
//agregue se genera un id con su nombre, por ejemplo: '#imprimir', '#info'.
//'home' e 'imprimir' ya tienen funcionamiento y graficos preconfigurados, no obstante, es permitido sobreescribir 
//el funcionamiento de 'imprimir'. Agregar  los gráficos de los botones en formato png a la carpeta 'img-html'

centrar =  true  //centrar automáticamente el interactivo, true o false

transicion = 'horizontal' // horizontal // vertical //fade

var paneles = [

/// agregar o quitar segmentos  entre corchetes, según el número de sections que tenga el html.

/// separar  con comas.  ejemplo: {...}, {...}, {...}

{//panel 1
	
	"nombre": "nombre del panel", // opcional, si no se ocupa quitar todo el re nglón
	"instrucciones" : "", // opcional, si no se ocupa quitar todo el renglón
	"bloqueado" : false //true o false
},

{//panel 2
	
	"nombre": "PANEL 2", // opcional, si no se ocupa quitar todo el renglón
	"instrucciones" : "<i>específicas</i> del panel.", // opcional, si no se ocupa quitar todo el renglón
	"bloqueado" : false //true o false
},

{//panel 2
	
	"nombre": "PANEL 2", // opcional, si no se ocupa quitar todo el renglón
	"instrucciones" : "Instrucciones <b>específicas</b> del panel.", // opcional, si no se ocupa quitar todo el renglón
	"bloqueado" : false //true o false
},

{//panel 2
	
	"nombre": "PANEL 2", // opcional, si no se ocupa quitar todo el renglón
	"instrucciones" : "Instrucciones específicas del panel.", // opcional, si no se ocupa quitar todo el renglón
	"bloqueado" : false //true o false
},

{//panel 2
	
	"nombre": "PANEL 2", // opcional, si no se ocupa quitar todo el renglón
	"instrucciones" : "Instrucciones específicas del panel.", // opcional, si no se ocupa quitar todo el renglón
	"bloqueado" : false //true o false
}


] // termina paneles