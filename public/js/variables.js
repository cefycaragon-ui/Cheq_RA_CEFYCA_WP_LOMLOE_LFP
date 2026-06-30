const ano_evaluacion = '2026'

expFechaEval = new RegExp('^'+ ano_evaluacion +'(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$','i')
expFechaNac = new RegExp('^(((19[0-9]{2})|(20[01][0-9]{1})|(2020|2021|2022|2023))(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01]))$','i')

//(  ((19[0-9]{2})|(20[01][0-9]{1})|(2020|2021|2022|2023))   (0[1-9]|1[0-2])  (0[1-9]|[12][0-9]|3[01])   )

var tipos_calificacion_2025 = {
    '0' : '0',
    '18' : '145',
    '19' : '145',
    '20' : '145',
    '29' : '145',
    '16' : '147',
    '17' : '147',
    '31' : '147',
    '35' : '147',
    '33' : '149',
    '37' : '149',
    '81' : '145',
    '82' : '147'
}
var tipos_calificacion = {
    '0' : '0',
    '10' : ['152', '153', '154', '155'],
    //'10' : '153',
    //'10' : '154',
    //'10' : '155',
    '18' : '145',
    '19' : '145',
    '20' : '145',
    '29' : '145',
    '81' : '145',
    '16' : '147',
    '17' : '147',
    '31' : '147',
    '35' : '147',
    '82' : '147',
    '33' : '149',
    '37' : '149'
}
var tipos_matricula_materia = {
    '0' : [1,2,3,4,5,6,7,9,10,11,12,13,14], // Valores por defecto, en algunas enseñanzas tendremos menos opciones.
    '145' : [1,4,6,7,9], // PRIMARIA
    '147' : [1,2,3,4,6,7,9], // ESO
    '149' : [1,2,3,4,6,7,9], // BACH
    '151' : [1,4,5,6,10,11,12,13,14], // LFP, Ciclos Formativos de Grado Básico
    '152' : [1,4,5,6,10,11,12,13,14], // LFP, Ciclos Formativos de Grado Medio 
    '153' : [1,4,5,6,10,11,12,13,14], // LFP, Ciclos Formativos de Grado Superior
    '154' : [1,4,5,6,10,11,12,13,14], // LFP, Cursos de Especialización de Grado Medio
    '155' : [1,4,5,6,10,11,12,13,14], // LFP, Cursos de Especialización de Grado Superior
}
var ensenanzas_con_extraordinaria = [
    '24', 
    '25', 
    '110', 
    '111', 
    '112', 
    '139', 
    '140', 
    '149', 
    '151', 
    '152', 
    '153', 
    '154', 
    '155'
]
var limites_suspensos_por_ensenanza = 
{
    "_default_" : {
        "minimo_promocion" : 0.5, // con menos promoción salta un warning
        'minimo_para_warning': 6,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,  // porcentaje. con menos aptos sobre tipo 1 hay warning
        "minimo_recuperan" : 0.5,  // porcentaje. con menos que pasan la estraordinaria sobre no aptos en ordinaria
        "maximo_temporales" : 0 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"24" : {   // Ciclos Formativos de Grado Medio
        "minimo_promocion" : 0.5, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0.5,
        "maximo_temporales" : 0 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"25" : { // Ciclos Formativos de Grado Superior
        "minimo_promocion" : 0.6, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0.5,
        "maximo_temporales" : 0 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"112" : { // Ciclos Formativos de Grado Básico
        "minimo_promocion" : 0.5, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.4,
        "minimo_recuperan" : 0.4,
        "maximo_temporales" : 0 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"145" : { // PRIMARIA
        "minimo_promocion" : 0.8, // con menos promoción salta un warning
        'minimo_para_warning': 5,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.65,
        "minimo_recuperan" : 0,
        "maximo_temporales" : 0 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"147" : { // ESO
        "minimo_promocion" : 0.7, // con menos promoción salta un warning
        'minimo_para_warning': 5,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0,
        "maximo_temporales" : 0 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"149" : { // BACH  
        "minimo_promocion" : 0.7, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0.5,
        "maximo_temporales" : 0 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"151" : { // Ciclos Formativos de Grado Básico
        "minimo_promocion" : 0.5, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.4,
        "minimo_recuperan" : 0.4,
        "maximo_temporales" : 0.1 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"152" : {   // Ciclos Formativos de Grado Medio
        "minimo_promocion" : 0.5, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0.5,
        "maximo_temporales" : 0.1 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"153" : { // Ciclos Formativos de Grado Superior
        "minimo_promocion" : 0.6, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0.5,
        "maximo_temporales" : 0.1 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"154" : {  // Cursos de Especialización de Grado Medio
        "minimo_promocion" : 0.65, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0.5,
        "maximo_temporales" : 0.1 // porcentaje. con más temporales sobre el total de alumnos hay warning
    },"155" : { // Cursos de Especialización de Grado Superior
        "minimo_promocion" : 0.65, // con menos promoción salta un warning
        'minimo_para_warning': 4,  //mínimo de alumnado para mostrar warning
        "minimo_aprobados" : 0.5,
        "minimo_recuperan" : 0.5,
        "maximo_temporales" : 0.1 // porcentaje. con más temporales sobre el total de alumnos hay warning
    }
}

var __tipos_bilinguismo = {
    '0' : '0',
    '1' : '1',
    '2' : '2',
    '3' : '3',
    '4' : '4',
    '5' : '5'
}

var subtipos_acneae = {
    '0' : '0',
    '10' : '1',
    '11' : '1',
    '12' : '1',
    '13' : '1',
    '14' : '1',
    '15' : '1',
    '16' : '1',
    '17' : '1',
    '18' : '1',
    '19' : '1',
    '30' : '1',
    '33' : '1',
    '34' : '1',
    '53' : '1',
    '20' : '2',
    '35' : '2',
    '36' : '2',
    '37' : '2',
    '21' : '3',
    '38' : '3',
    '39' : '3',
    '40' : '3',
    '41' : '3',
    '47' : '3',
    '51' : '3',
    '22' : '4',
    '32' : '4',
    '42' : '4',
    '43' : '4',
    '44' : '4',
    '45' : '4',
    '23' : '5',
    '24' : '5',
    '25' : '5',
    '26' : '5',
    '27' : '5',
    '28' : '5',
    '46' : '5',
    '48' : '5',
    '49' : '5',
    '50' : '5',
    '52' : '5',
    '31' : '29'
}

var cursos_no_permitidos = {
    "116": ["1","3","3PMAR"],
    "136": ["1","3","5"],
    "117": ["1"]
}

var validacion = {}

validacion[0]=[
    {
        'cod'       : '01',
        'inicio'    : 27, //   TIPO ENSEÑANZA
        'long'      : 4,
        'tipo'      : [24,25,110,111,112,116,117,132,136,139,140,143,145,147,149,151,152,153,154,155],  
        'txt_error' : "Error en TIPO DE ENSEÑANZA"
    },{
        'cod'       : '02',
        'inicio'    : 31, //    ENSEÑANZA
        'long'      : 4,
        'tipo'      : [],  
        'txt_error' : "Error en CÓDIGO DE ENSEÑANZA, no pertenece al tipo de enseñanza o no es válido.",
        'cruce'     : true
    },{
        'inicio'    : 35, //   TURNO
        'long'      : 1,
        'tipo'      : [1,2,3,4],  
        'txt_error' : "Error en TURNO"
    },{
        'cod'       : '04',
        'inicio'    : 36, //   CURSO
        'long'      : 1,
        'tipo'      : [1,2,3,4,5,6],  
        'txt_error' : "Error en CURSO"
    }
]
validacion[1]=[
    {
        'inicio'    : 77, //   FECHA
        'long'      : 8,
        //'tipo'      : new RegExp('^[0-9]{8}$','i'), 
        'tipo'      : expFechaEval,
        'txt_error' : "Error en FECHA"
    }
]
validacion[2]=[
    {
        'cod'       : '20',
        'inicio'    : 13, //NUM GIR
        'long'      : 14,
        'tipo'      : '',
        'txt_error' : "Nº GIR, Error. ",
        'cruce'     : true
    },{
        'inicio'    : 177, //SEXO
        'long'      : 1,
        'tipo'      : [1,2],
        'txt_error' : "Sexo ha de ser 1 ó 2"
    },{
        'inicio'    : 178, //TIPO DOCUMENTO (0 CUANDO NO ES OBLIGATORIO)
        'long'      : 1,
        'tipo'      : new RegExp('^[\\s,0-3]{1}$','i'),  
        'txt_error' : "Documento ha de ser ' ', 0, 1, 2 ó 3"
    },{
        'inicio'    : 179, //NUM DOCUMENTO
        'long'      : 12,
        'tipo'      : new RegExp('^[\\w,\\s]{12}$','i'),   //modificar para patron de documento.
        'txt_error' : "Error en patrón de documento"
    },{
        'inicio'    : 191, //FECHA NACIMIENTO
        'long'      : 8,
        //'tipo'      : new RegExp('^[0-9]{8}$','i'),   //modificar para patron de fecha.
        'tipo'      : expFechaNac,
        'txt_error' : "Error en fecha de nacimiento"
    },{
        'inicio'    : 199, //PAIS
        'long'      : 3,
        'tipo'      : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,80,81,82,83,84,85,86,87,88,89,90,91,92,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,222,223,224,225,226,227,228,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,249,250,251,253,254,255],   //paises de 1 a 254.
        'txt_error' : "Error en PAIS"
    },{
        'inicio'    : 202, //   NACIONALIDAD
        'long'      : 3,
        'tipo'      : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,80,81,82,83,84,85,86,87,88,89,90,91,92,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,222,223,224,225,226,227,228,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,249,250,251,253,254,255],   //igual que pais.
        'txt_error' : "Error en NACIONALIDAD"
    },{
        'cod'       : '27',
        'inicio'    : 205, //   TIPO ENSEÑANZA
        'long'      : 4,
        'tipo'      : [24,25,43,53,54,60,61,85,110,111,112,113,114,115,118,119,120,138,142,143,145,147,149,150,151,152,153,155],
        'txt_error' : "Error en TIPO DE ENSEÑANZA"
    },{
        'cod'       : '28',
        'inicio'    : 209, //    ENSEÑANZA
        'long'      : 4,
        'tipo'      : [],  
        'txt_error' : "Error en CÓDIGO DE ENSEÑANZA en línea tipo 2, no pertenece al tipo de enseñanza o no es válido",
        'cruce'     : true,
    },{
        'inicio'    : 213, //   TURNO
        'long'      : 1,
        'tipo'      : [1,2,3,4,5,6],  
        'txt_error' : "Error en TURNO"
    },{
        'cod'       : '310',
        'inicio'    : 214, //   CURSO
        'long'      : 1,
        'tipo'      : [1,2,3,4,5,6],  
        'txt_error' : "Error en CURSO"
    },{
        'cod'       : '311',
        'inicio'    : 215, //   TIPO MATRICULA
        'long'      : 2,
        'tipo'      : [0,1,2,3,5,6,7,9,10,11,12,13,14,15,16,18,19,20,21],  
        'txt_error' : "Error en TIPO MATRICULA",
        'cruce'     : true,
    },{
        'cod'       : '312',
        'inicio'    : 217, //   EVALUADO, PROMOCIONADO, TITULA
        'long'      : 1,
        'tipo'      : [0,1],  
        'txt_error' : "Error en EVALUADO"
    },{
        'cod'       : '313',
        'inicio'    : 218, //   PROMOCIONADO
        'long'      : 1,
        'tipo'      : [0,1,2],  
        'txt_error' : "Error en PROMOCIONADO",
        'cruce'     : true
    },{
        'cod'       : '314',
        'inicio'    : 219, //   TITULA
        'long'      : 1,
        'tipo'      : [0,1],  
        'txt_error' : "Error en TITULA",
        'cruce'     : true
    }
   

]
validacion[3]=[   //ALUMNOACNEAE
    {
        'cod'       : '30',
        'inicio'    : 13, //NUM GIR
        'long'      : 14,
        'tipo'      : new RegExp('(^[0-9]{14}$)|(^[\\s,0]{5}[0-9a-z]{1}[0-9]{7}[a-z]{1}$)','gi'),
        'txt_error' : "Nº GIR, formato incorrecto en linea tipo 3",
        'cruce'     : true
    },{
        'cod'       : '31',
        'inicio'    : 37, //   ACNEAE
        'long'      : 2,
        'tipo'      : [0,1,2,3,4,5,29],  
        'txt_error' : "Error en TIPO ACNEAE"
    },{
        'cod'       : '32',
        'inicio'    : 39, //   SUB TIPO ACNEAE, DEP DEL ANTERIOR
        'long'      : 2,
        'tipo'      : [0,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53],  
        'txt_error' : "Error en SUBTIPO ACNEAE",
        'cruce'     : true
    },{
        'inicio'    : 41, //   FECHA RESOLUCION
        'long'      : 8,
        //'tipo'      : new RegExp('^[\\s,0-9]{8}$','i'),  
        'tipo'      : expFechaNac,
        'txt_error' : "Error en FECHA RESOLUCION",
        'opcion'    : true
    },{
        'inicio'    : 49, //   FECHA INICIO ADAPTACIÓN
        'long'      : 8,
        //'tipo'      : new RegExp('^[\\s,0-9]{8}$','i'),  
        'tipo'      : expFechaNac,
        'txt_error' : "Error en FECHA INICIO ADAPTACION",
        'opcion'    : true
    },{
        'inicio'    : 57, //   FECHA INFORME
        'long'      : 8,
        //'tipo'      : new RegExp('^[\\s,0-9]{8}$','i'),  
        'tipo'      : expFechaNac,
        'txt_error' : "Error en FECHA INFORME",
        'opcion'    : true
    }

]
validacion[4]=[
    {
        'cod'       : '40',
        'inicio'    : 13, //NUM GIR
        'long'      : 14,
        'tipo'      : new RegExp('(^[0-9]{14}$)|(^[\\s,0]{5}[0-9a-z]{1}[0-9]{7}[a-z]{1}$)','gi'),
        'txt_error' : "Nº GIR, formato incorrecto en linea tipo 4",
        'cruce'     : true
    },{
        'cod'       : '41',
        'inicio'    : 37, //   MATERIA (Hay una tabla de 4000 entradas con sus enseñanzas. Por ahora sólo verificamos sintaxis)
        'long'      : 5,
        'tipo'      : new RegExp('^[\\s,1]{0,1}[0-9]{4}$','i'),  
        'txt_error' : "Error en MATERIA",
        'cruce'     : true
    },{
        'cod'       : '42',
        'inicio'    : 42, //   TIPOMATRICULAMATERIA 
        'long'      : 2,
        'tipo'      : tipos_matricula_materia, // Originalmente solo mirabamos esto: [1,2,3,4,5,6,7,9,10,11,12,13,14],  
        'txt_error' : "Error en TIPOMATRICULAMATERIA",
        'cruce'     : true,
        'raiz_tipo' : 'denominacion_tipos_ensenanzas' // sirve para mostrar en la ayuda
    },{
        'cod'       : '43',
        'inicio'    : 44, //   CALIFICACION1 
        'long'      : 3,
        'tipo'      : [],  
        'txt_error' : "Error en CALIFICACIÓN 1",
        'cruce'     : true
    },{
        'cod'       : '44',
        'inicio'    : 47, //   FECHA CALIFICACION1
        'long'      : 8,
        //'tipo'      : new RegExp('^'+ ano_evaluacion +'(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$','i'),  
        'tipo'      : expFechaEval,
        'txt_error' : "Error en FECHA CALIFICACIÓN 1",
        'cruce'     : true
    },{
        'cod'       : '45',
        'inicio'    : 55, //   TIPO CALIFICACION1
        'long'      : 2,
        //'tipo'      : [0,3,4,5,7,1,2,10,6,8,11,12,13],  
        'tipo'      : [1,34,2,30,36,32,14,10,11,12,13,28,23,18,19,20,29,16,35,17,31,37,33,80,81,82],  // OJO!!!!! REVISAR AQUI. 
        'txt_error' : "Error en TIPO CALIFICACIÓN 1",
        'var'       : tipos_calificacion,
        'padre'     : '01',
        'cruce'     : true,
        'definicion_tipo' : 'denominacion_tipos_ensenanzas' // sirve para mostrar en la ayuda
    },{
        'cod'       : '46',
        'inicio'    : 57, //   BILINGUISMO1
        'long'      : 1,
        'tipo'      : [0,1,2,3,4,5],  
        'txt_error' : "Error en TIPO BILINGÜISMO 1",
        //'var'       : tipos_bilinguismo,
        'padre'     : '46',
        'cruce'     : true
    },{
        'cod'       : '47',
        'inicio'    : 58, //   CALIFICACION2
        'long'      : 3,
        'tipo'      : [],  
        'txt_error' : "Error en CALIFICACIÓN 2",
        'cruce'     : true,
        'opcion'    : true
    },{
        'cod'       : '48',
        'inicio'    : 61, //   FECHA CALIFICACION2
        'long'      : 8,
        //'tipo'      : new RegExp('^[0-9]{8}$','i'),  
        'tipo'      : expFechaEval,
        'txt_error' : "Error en FECHA CALIFICACIÓN 2",
        'opcion'    : true
    },{
        'cod'       : '49',
        'inicio'    : 69, //   TIPO CALIFICACION2
        'long'      : 2,
        //'tipo'      : [0,3,4,5,7,1,2,10,6,8,11,12,13],  
        'tipo'      : [1,34,2,30,36,32,14,10,11,12,13,28,23,18,19,20,29,16,35,17,31,37,33,80,81,82], // OJO!!!!! REVISAR AQUI. 
        'txt_error' : "Error en TIPO CALIFICACIÓN 2",
        'var'       : tipos_calificacion,
        'padre'     : '01',
        'opcion'    : true,
        'cruce'     : true
    },{
        'cod'       : '410',
        'inicio'    : 71, //   BILINGUISMO2
        'long'      : 1,
        'tipo'      : [0,1,2,3,4,5],  
        'txt_error' : "Error en TIPO BILINGUISMO2",
        'opcion'    : true
    },{
        'cod'       : '411',
        'inicio'    : 36, //   CURSO MATERIA
        'long'      : 1,
        'tipo'      : [1,2,3,4,5,6],  
        'txt_error' : "Error en CURSO DE LA MATERIA",
        'opcion'    : true
    }
]
validacion[5]=[
    {
        'cod'       : '50',
        'inicio'    : 13, //NUM GIR
        'long'      : 14,
        'tipo'      : new RegExp('^[0-9]{14}$','i'),
        'txt_error' : "Nº GIR, formato incorrecto",
        'cruce'     : true
    },{
        'inicio'    : 37, //   COMPETENCIAS
        'long'      : 1,
        'tipo'      : [1,2,3,4,5,6,7,8],  
        'txt_error' : "Error en COMPETENCIAS"
    },{
        'cod'       : '52',
        'inicio'    : 38, //   CALIFICACION COMPETENCIA 1 
        'long'      : 2,
        'tipo'      : [1,2,3,4],  
        'txt_error' : "Error en CALIFICACIÓN COMPETENCIA 1",
        'cruce'     : true
    },{
        'inicio'    : 40, //   FECHA CALIFICACION1
        'long'      : 8,
        //'tipo'      : new RegExp('^[0-9]{8}$','i'),  
        'tipo'      : expFechaEval,
        'txt_error' : "Error en FECHA CALIFICACIÓN COMPETENCIA 1"
    },{
        'inicio'    : 48, //   CALIFICACION2
        'long'      : 2,
        'tipo'      : [1,2,3,4],  
        'txt_error' : "Error en CALIFICACIÓN COMPETENCIA 2",
        'opcion'    : true
    },{
        'inicio'    : 50, //   FECHA CALIFICACION2
        'long'      : 8,
        //'tipo'      : new RegExp('^[0-9]{8}$','i'),  
        'tipo'      : expFechaEval,
        'txt_error' : "Error en FECHA CALIFICACIÓN COMPETENCIA 2",
        'opcion'    : true
    }
]

const comparar = function(a,b){
    //Esta función repasa un elemento de un array con la versión de valores únicos de ese array.
    //Devuelve un array con los que estan repetidos.
    a = a.sort()
    b = b.sort()
    let repetidas = []
    let j=0
    for(let i=0;i<a.length;i++){
        if(a[i] === b[j]){
            //Hay match y avanzamox
            //console.log('match',a[i],b[j])
            j++
        }else{
            //console.log('no match',a[i],b[j])
            //no avanzamos el array de únicos
            repetidas.push(a[i])
        }
    }
    return repetidas
}

const lineaValida = function(linea){
    
    //OJO a esta línea comentada...
    //datos_temporales_linea = {}
    contador_lineas++
    datosEstructura['lineas'][contador_lineas] = {
        'tipo'      : linea[0],
        'longitud'  : linea.length,
        'valida'    : false
    }

    if (linea[0] > String(5) || linea[0] < String(1)) return "El primer caracter de línea ha de ser un entero entre 1 y 5"
    
    //Si el CURSOACTUAL no se ha definido lo hacemos, de lo contrario, comparamos.
    if(CURSOACTUAL == ''){
        CURSOACTUAL = linea.substring(1,5)
        if( isNaN(parseInt(CURSOACTUAL)) || CURSOACTUAL != CURSOACTUAL * 1){
            CURSOACTUAL == ''
            return "ERROR en la inicialización del curso actual."
        }
    }else{
        if(linea.substring(1,5) != CURSOACTUAL) return "Los caracteres 2 a 5 deben ser el curso actual y coincidir en todas las líneas, curso actual iniciado a: " + CURSOACTUAL 
    }
    patron = /^[0-9]{8}$/;
    if( ! patron.test(linea.substring(5,13)) ) {
        return "ERROR Se esperaban 8 dígitos en las posiciones 6 a 14"
    }else{
        if (CODIGOCENTRO == ''){
            CODIGOCENTRO = linea.substring(5,13)
        }else if (CODIGOCENTRO != linea.substring(5,13)){
            return "ERROR se han encontrado 2 códigos diferentes de centro"
        }
    }

    // A partir de aqui se valida en función del tipo de línea

    let tipoLinea = parseInt(linea[0])

    if(tipoLinea == 1){
        //Validamos estructuralmente la línea de tipo 1, sólo debe haber una de estas líneas.
        let subcadena = linea.substr(85,6)
        //patron = /^[0-9]{6}$/;
        //if( ! patron.test(subcadena) ) {
        let cadena_lineas = parseInt(subcadena)
        if(isNaN(cadena_lineas)){
            return "ERROR se esperaba número de registros en los caracteres 85 a 91"
        }else{
            //datosEstructura['n_lineas_declaradas'] = parseInt(subcadena)
            datosEstructura['n_lineas_declaradas'] = cadena_lineas
        }
    }else if(tipoLinea == 2){
        //Metemos el tipo de enseñanza, enseñanza, curso... en las líneas 2. (las referentes al alumnado)
        datosEstructura['lineas'][contador_lineas]['numeroGIR'] = linea.substr(13,14)
        datosEstructura['lineas'][contador_lineas]['nombre'] = linea.substr(27,150)
        datosEstructura['lineas'][contador_lineas]['tipo_ens'] = parseInt(linea.substr(205,4)).toString()
        datosEstructura['lineas'][contador_lineas]['ensenanza'] = parseInt(linea.substr(209,4)).toString()
        datosEstructura['lineas'][contador_lineas]['curso'] = parseInt(linea.substr(214,1)).toString()
        datosEstructura['lineas'][contador_lineas]['eval'] = parseInt(linea.substr(217,1)).toString()
        datosEstructura['lineas'][contador_lineas]['prom'] = parseInt(linea.substr(218,1)).toString()
        datosEstructura['lineas'][contador_lineas]['titu'] = parseInt(linea.substr(219,1)).toString()
    }else if(tipoLinea == 4){
        //Metemos el tipo de enseñanza, enseñanza, curso... en las líneas 4. (las referentes a las materias) y las tipo 5 (competencias)
        datosEstructura['lineas'][contador_lineas]['numeroGIR'] = linea.substr(13,14)
        datosEstructura['lineas'][contador_lineas]['tipo_ens'] = parseInt(linea.substr(27,4)).toString()
        datosEstructura['lineas'][contador_lineas]['ensenanza'] = parseInt(linea.substr(31,4)).toString()
        datosEstructura['lineas'][contador_lineas]['curso'] = parseInt(linea.substr(36,1)).toString()
        //Limpiar el primer 0 de la materia.
        let valorauxiliar = 1 * linea.substr(37,5).trim()
        //datosEstructura['lineas'][contador_lineas]['materia'] = linea.substr(37,5).trim()
        datosEstructura['lineas'][contador_lineas]['materia'] = valorauxiliar + ""
        datosEstructura['lineas'][contador_lineas]['tipo_matricula_materia'] = linea.substr(42,2).trim()
        datosEstructura['lineas'][contador_lineas]['nota_1'] = linea.substr(44,3).trim()
        datosEstructura['lineas'][contador_lineas]['tipo_calificacion_1'] = linea.substr(55,2).trim()
        //Analizamos si la nota 1 y la nota suponen aprobado o no ( 0 sin evaluar, 1 aprobado, 2 no aprobado)
        datosEstructura['lineas'][contador_lineas]['apto'] = haAprobado(datosEstructura['lineas'][contador_lineas]['tipo_ens'],datosEstructura['lineas'][contador_lineas]['nota_1'])
        datosEstructura['lineas'][contador_lineas]['nota_2'] = linea.substr(58,3).trim()
        datosEstructura['lineas'][contador_lineas]['tipo_calificacion_2'] = linea.substr(69,2).trim()
        //Analizamos si la nota 1 y la nota suponen aprobado o no ( 0 sin evaluar, 1 aprobado, 2 no aprobado)
        datosEstructura['lineas'][contador_lineas]['apto_extraordinaria'] = haAprobado(datosEstructura['lineas'][contador_lineas]['tipo_ens'],datosEstructura['lineas'][contador_lineas]['nota_2'])
        //console.log(datosEstructura['lineas'][contador_lineas])
    }else if(tipoLinea == 5){
        datosEstructura['lineas'][contador_lineas]['numeroGIR'] = linea.substr(13,14)
        datosEstructura['lineas'][contador_lineas]['competencia'] = linea.substr(37,1)
        datosEstructura['lineas'][contador_lineas]['tipo_ens'] = parseInt(linea.substr(27,4)).toString()
        datosEstructura['lineas'][contador_lineas]['ensenanza'] = parseInt(linea.substr(31,4)).toString()
        datosEstructura['lineas'][contador_lineas]['curso'] = parseInt(linea.substr(36,1)).toString()
    }
    
    if( tipoLinea >= 1 && tipoLinea < 6 ){
        //evaluamos una parte que es comun a todos los tipos mayores de 2
        if(tipoLinea>2){
            for (let r of validacion[0]){
                let respuesta = filtro1(r,linea)
                if(respuesta !=0){
                    //console.log(respuesta)
                    return respuesta
                }
            }
        }
        for(r of validacion[tipoLinea]){
            let respuesta = filtro1(r,linea)
            if(respuesta !=0)return respuesta
        }
        //Si la línea ha llegado hasta aqui como correcta validamos las notas repetidas.
    }
    //Si hemos llegado aqui es que la línea es válida hasta ahora. Evaluamos la longitud total en función del tipo
    //Decicimos que no vamos a revisar la longitud total de la línea
    /* let linea_limpia = linea.replace(/\n|\r/g, "")
        let longitud = linea.replace(/\n|\r/g, "").length
        if(tipoLinea == 1 && longitud != 91) return 'Longitud invalida, requerido (tipo 1): 91, enviado: ' + longitud
        if(tipoLinea == 2 && longitud != 220) return 'Longitud invalida, requerido (tipo 2): 220, enviado: ' + longitud
        if(tipoLinea == 3 && longitud != 65 && longitud != 41) return 'Longitud invalida, requerido (tipo 3): 65 ó 41, enviado: ' + longitud
        if(tipoLinea == 4 && (longitud != 58 && longitud != 72 )) return 'Longitud invalida, requerido (tipo 4): 58 ó 72, enviado: ' + longitud
        if(tipoLinea == 5 && (longitud != 48 && longitud != 58 )) return 'Longitud invalida, requerido (tipo 5): 48 ó 58, enviado: ' + longitud
    */
    //Estimamos que la línea es válida
    datosEstructura['lineas'][contador_lineas]['valida'] = true
    return 0
}

const haAprobado = function(tipo_ens, nota){
    //console.log('haAprobado',tipo_ens, nota)
    nota = nota.toString().trim()
    if (nota == "") return 0 // Sin evaluacion
    if (!parametros['ensenanzas_calificaciones_suspendidas'][tipo_ens]){
        //console.log('Atención, tipo de enseñanza no encontrado en las calificaciones suspendidas: ' + tipo_ens)
        return 0 // Sin evaluacion
    }
    //console.log(tipo_ens)
    //console.log(parametros['ensenanzas_calificaciones_suspendidas'])
    //console.log(parametros['ensenanzas_calificaciones_suspendidas'][tipo_ens])
    let calificaciones_suspendidas = parametros['ensenanzas_calificaciones_suspendidas'][tipo_ens]
    //console.log('Calificaciones suspendidas: ', calificaciones_suspendidas)
    if (calificaciones_suspendidas.includes(nota)){
        return 2 // No aprobado
    }else{
        return 1 // Aprobado
    }

}

const ensenanzaTitula = function(tipo_ense,curso){
    //Esta función revisa que sea un curso que pueda titular.
    tipo_ense = limpiarCodigos(tipo_ense)
    let ense_titulan = parametros['ensenanzas_titulan']
    if (ense_titulan[tipo_ense] && ense_titulan[tipo_ense].includes(curso)){
        return true
    }
    return false
}

const mostrarError = function(e){
    //console.log('mostrando error')
    let A = parametros["denominacion_asignaturas"]
    let tipoense = e.dataset.tipoense
    let ense = e.dataset.ense
    let curso = e.dataset.curso
    let num_error = e.dataset.numerror
    let txt_error = ""
    let incompatibilidad = parametros["ensenanzas_relacion_materias"][tipoense][ense][curso]['incompatibilidad']
    for(let linea of incompatibilidad){
        if(linea['num_error'] == num_error){
            //Damos la explicación del error.
            txt_error += linea['num_error'] + ' : '+ linea['error']
            txt_error += '<br>El cruce indica que que ha de haber entre ' + linea['min'] + ' y ' + linea['max'] + ' de las siguientes:<ul>'
            for (let materia_necesaria of linea['materias']){
                txt_error +='<li>'+ materia_necesaria + ': ' + A[materia_necesaria] + '</li>'
            }
            txt_error += '</ul>'
        }
    }
    capa = document.getElementById('informeExpErroresFlot')
    capa.classList.add('cefy_ocultar_resultados')
    capa.classList.remove('cefy_ocultar_resultados')
    capa.innerHTML = '<h3 class="text-center">Explicación de error ' + num_error +'</h3>' + txt_error
    //alert(incompatibilidad['num_error'])
    
}

const pintarMaterias = function(datoMaterias){
    let A = parametros["denominacion_asignaturas"]
    let cadena = ''
    if(datoMaterias.length <= 0){
        cadena += '<br><strong>El alumno no tiene materias</strong>'
    }else{
        cadena += '<br><strong>Las materias matriculadas son:</strong>'
        cadena += '<ul style="margin: 0px;">'
        for(let mat of datoMaterias.sort()){
            cadena += '<li>' + mat + ' - ' + A[mat] + '</li>'
        }
        cadena += '</ul>'
    }
    return cadena
}

const evaluarAprobados = function(tipo, mat, colspan, hayExtraordinaria = false){
    //Esta función evalua si hay un numero grande de suspensos en una materia y muestra un warning.
    //console.log(tipo, mat);
    let texto_warning = '';
    let texto = '';
    
    // De variables.js obtenemos los mínimos 
    let limites;
    if (limites_suspensos_por_ensenanza[tipo]){
        limites = limites_suspensos_por_ensenanza[tipo];
        //console.log('Limites para tipo de enseñanza: ', tipo, limites);
        }else{
        limites = limites_suspensos_por_ensenanza['_default_'];
        }
    //console.log('Limites: ', limites);
    // Miramos si hay mas alumnos que el mínimo
    const alumnos_efectivos = mat.por_tipos[1];
    //console.log('Alumnos efectivos: ', alumnos_efectivos);
    if (mat.por_tipos[1] < limites.minimo_para_warning) return "";
    // Miramos el porcentaje de suspensos
    const porcentaje_suspensos = (alumnos_efectivos-mat.aptos_1) / alumnos_efectivos;
    //console.log('Porcentaje de suspensos: ', porcentaje_suspensos, limites.minimo_aprobados);
    // Si el porcentaje de suspensos es mayor del mínimos mostramos un warning
    if (1-porcentaje_suspensos < limites.minimo_aprobados){
        texto_warning += '<span class="warning_suspensos">Atención: ' + (100*porcentaje_suspensos).toFixed(0) + '% de suspensos en la evaluación ordinaria.  </span>';
    } 
    //Evaluamos la temporalidad de las notas.
    const porcentaje_temporales = mat.temporales_1 / alumnos_efectivos;
    //console.log('Porcentaje de temporales: ', porcentaje_temporales, limites.maximo_temporales);
    if (porcentaje_temporales > limites.maximo_temporales){
        if(texto_warning.length > 0) texto_warning += '<br>';
        texto_warning += '<span class="warning_temporales">Atención: ' + (100*porcentaje_temporales).toFixed(0) + '% de notas temporales en la evaluación ordinaria.  </span>';
    }
    if (hayExtraordinaria){
        const alumnos_efectivos_extra = alumnos_efectivos - mat.aptos_1;
        if(alumnos_efectivos_extra >= limites.minimo_para_warning) {
            const porcentaje_suspensos_extra = (alumnos_efectivos_extra-mat.aptos_2) / alumnos_efectivos_extra;
            if (1-porcentaje_suspensos_extra < limites.minimo_recuperan){
                if(texto_warning.length > 0) texto_warning += '<br>';
                texto_warning += '<span class="warning_suspensos_extraordinaria">Atención: ' + (100*porcentaje_suspensos_extra).toFixed(0) + '% de suspensos en la extraordinaria. </span>';
            }
        };
        const porcentaje_temporales_extra = mat.temporales_2 / alumnos_efectivos_extra;
        if (porcentaje_temporales_extra > limites.maximo_temporales){
            if(texto_warning.length > 0) texto_warning += '<br>';
            texto_warning += '<span class="warning_temporales">Atención: ' + (100*porcentaje_temporales_extra).toFixed(0) + '% de notas temporales en la extraordinaria.  </span>';
        }
        
    }
    
    if (texto_warning.length > 0){
        // Añadimos los tag de table
        texto += `<tr><td colspan="${colspan}" class='text-center'>`;
        texto += texto_warning;
        texto += '</td></tr>';        
    }

    return texto;
    
}

const warningPromocionCursos = function(tipo, curso){
    //Esta función evalua si hay un numero grande de no promocionados en un curso y muestra un warning.
    let texto = '';
    // Mostarmos el warning de baja promoción si corresponde.
    let minimo_promocion = limites_suspensos_por_ensenanza["_default_"]['minimo_promocion']
    if (tipo in limites_suspensos_por_ensenanza){
        minimo_promocion = limites_suspensos_por_ensenanza[tipo]['minimo_promocion']
    }
    //console.log(tipo, curso, minimo_promocion)
    if (curso['prom']/ curso['eval'] < minimo_promocion){
        texto += '<br><span class="warning_suspensos">ATENCIÓN: porcentaje de promoción ' + (curso['prom']/ curso['eval']*100).toFixed(0) + ' % </span>'
    }
    return texto;
}

const warningAvisosMaterias = function(warningsMaterias,warningTemporalesFP){
    // Esta función revisa si hay warnings de muchos suspensos en materias de este curos y muestra un enlace.
    //console.log(warningsMaterias)
    for (const tipo in warningsMaterias){
        for(const ense in warningsMaterias[tipo]){
            for(const curso in warningsMaterias[tipo][ense]){
                //console.log('Avisos de materias: ', tipo, ense, curso, warningsMaterias[tipo][ense][curso]);
                if (warningsMaterias[tipo][ense][curso]){
                    //console.log('Hay avisos de materias: ', warningsMaterias[tipo][ense][curso]);
                    // Buscmoas el span y le añadimos el aviso
                    
                    let nombreSpan = 'dest_' + tipo +  ense +  curso  ;
                    let nombreBanner = 'banner_wc_' + tipo +  ense +  curso  ;
                    //console.log('Nombre del span: ', nombreSpan);   
                    //console.log('nombre del banner ', nombreBanner)
                    let spanAvisos = document.getElementById(nombreBanner);
                    if (spanAvisos){
                        //console.log('Span encontrado: ', spanAvisos);
                        // Añadimos el aviso
                        spanAvisos.innerHTML = '<br><span class="warning_suspensos_curso">Hay avisos por número de suspensos en materias de este <a href="#'+ nombreSpan +'">curso</a></span>';
                    }
                }
            }
        }
    }
    //console.log({warningTemporalesFP})
    for (const tipo in warningTemporalesFP){
        for(const ense in warningTemporalesFP[tipo]){
            for(const curso in warningTemporalesFP[tipo][ense]){
                //console.log('Avisos de materias: ', tipo, ense, curso, warningsMaterias[tipo][ense][curso]);
                if (warningTemporalesFP[tipo][ense][curso]){
                    //console.log('Hay avisos de materias: ', warningsMaterias[tipo][ense][curso]);
                    // Buscmoas el span y le añadimos el aviso
                    
                    let nombreSpan = 'dest_' + tipo +  ense +  curso  ;
                    let nombreBanner = 'banner_wc_' + tipo +  ense +  curso  ;
                    //console.log('Nombre del span: ', nombreSpan);   
                    //console.log('nombre del banner ', nombreBanner)
                    let spanAvisos = document.getElementById(nombreBanner);
                    if (spanAvisos){
                        //console.log('Span encontrado: ', spanAvisos);
                        // Añadimos el aviso
                        spanAvisos.innerHTML += '<br><span class="warning_temporales_curso">Hay avisos por número de evaluaciones temporales en materias de este <a href="#'+ nombreSpan +'">curso</a></span>';
                    }
                }
            }
        }
    }
}

const noEsMateriaPrelacionBach1 = function (auxiliar,linea){
    /* 
        Esta función mira si la asignatura es de prelación de primero y el alumno está en segundo. 
    */
    // Revisamos que el alumno este en 2º de BACH.
    const materias_prelacion_1 = [
        "13370",
        "13388",
        "13334",
        "13352",
        "13371",
        "13389",
        "13335",
        "13353",
        "13237",
        "13195",
        "13209",
        "13223",
        "13373",
        "13391",
        "13337",
        "13355",
        "13372",
        "13390",
        "13336",
        "13354",
        "13225",
        "13239",
        "13197",
        "13211",
        "13377",
        "13359",
        "13341",
        "13395",
        "13226",
        "13240",
        "13198",
        "13212",
        "13325",
        "13324",
        "13409",
        "13410",
        "13411",
        "13412",
        "13413",
        "13414",
        "13257",
        "13258",
        "13253",
        "13254",
        "13255",
        "13256",
        "13318",
        "13319",
        "13320",
        "13321",
        "13322",
        "13323",
        "13471",
        "13468",
        "13469",
        "13470",
        "13466",
        "13467",
        "13267",
        "13303",
        "13279",
        "13291",
        "13238",
        "13196",
        "13210",
        "13224",
        "13379",
        "13361",
        "13343",
        "13397",
        "13227",
        "13213",
        "13241",
        "13199",
        "13307",
        "13271",
        "13283",
        "13295",
        "13445",
        "13455",
        "13425",
        "13435"
    ]
    if (auxiliar['curso'] !=2 || auxiliar['tipo_ens'] != '149'){
        return true
    }
    if (!materias_prelacion_1.includes(linea['materia'])){
        return true
    }
    
    // Ahora miramos si la materia es de prelacion.
    //console.log(auxiliar, linea)
    return false
}


