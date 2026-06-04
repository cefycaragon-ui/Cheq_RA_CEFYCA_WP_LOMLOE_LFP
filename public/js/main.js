var CHARAHelp_ruta_parametros ='../../wp-content/plugins/Cheq_RA_CEFYCA_WP_LOMLOE_LFP/public/js/parametros.json'

//En la V2.2 reducimos las asignaturas para controlarlas sin idiomas.
//En la V4.0 entra la LOMLOE
//En la V5.0 metemos las competencias de modo especifico y parametrizable.
//En la v6.52 sacamos funciones de main
//En la v7.06 mostramos los errores agrupados
//En la v7.33 intentamos que no se cachee parametros.json
//En la v7.42 intentamos que se refresque al cargar.
//En la v7.60 ya se pueden cargar archivos uno detras de otro.
//En la v8.05 metemos todo en LOMLOE.
//En la v9.041 metemos la LFP

const v_js = "12.10"
const txtLimiteCongErrores = 300
const txtLimiteExpErrores = 300
var limiteCongErrores = txtLimiteCongErrores
var limiteExpErrores = txtLimiteExpErrores

var ficheroSinErrores = true 

var parametros = {}

var CURSOACTUAL = ""
var CODIGOCENTRO = ""
var ERRORESESTRUCTURA = ""

var RESUMENASIGNATURAS = {
    "alumnosrepetidos"  : 0,
    "numerosalumnosrepetidos" : [],
    "alumnosevaluados"  : [],
    "alumnosXensenanza" : {},
    "materiasXensenanza": {}
}
var datos_temporales_linea = {}
var datos_temporales_persona = {}

var datosEstructura = {
    'n_lineas_evaluadas'    : 0,        //las que contamos al recorrer el fichero
    'n_lineas_declaradas'   : 0,        //las que declara la primera línea del fichero   
    'n_errores'             : 0,        //Num. errores encontrados.
    'lineas'                : {},       //Guardaremos la estructura de tipos de líneas con su longitud
    'linea1'                : false,    //Marcador de existencia de línea 1,
    'txt_resumen_errores'   : ""        //Texto de resumen de errores de línea
}
var contador_lineas = 0
var lineaAnterior = {}
var numero_GIR_temporal = ''
var tipoEnsenanzaActiva = ''

var warningsMaterias = {}
var warningTemporalesFP = {}

const cadenaEnBlanco = function(cad){
    
    if (cad.trim() == '') return true 

    if (cad.length == 0) return true

    /* if (isNaN(cad)) return true
    //console.log('en f cadenaEnBlanc')
    //console.log('texto:' + cad + 'salida de texto')
    //console.log('Vamos a enviar un false') */
    return false
}
const limpiarCodigos = function(x){
    //Quitamos el 0 inicial de algunos txt
    try{
        let y = parseInt(x)  //cuando el codigo es 0848 quitamos el primer 0
        return y.toString()
    }catch(error){
        return x
    }
}

function validateDNI(dni) {
    var numero, let, letra;
    var expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;

    dni = dni.toUpperCase();
    //console.log({dni})
    if(expresion_regular_dni.test(dni) === true){
        numero = dni.substr(0,dni.length-1);
        numero = numero.replace('X', 0);
        numero = numero.replace('Y', 1);
        numero = numero.replace('Z', 2);
        let = dni.substr(dni.length-1, 1);
        numero = numero % 23;
        letra = 'TRWAGMYFPDXBNJZSQVHLCKET';
        letra = letra.substring(numero, numero+1);
        if (letra != let) {
            //alert('Dni erroneo, la letra del NIF no se corresponde');
            return false;
        }else{
            //alert('Dni correcto');
            return true;
        }
    }else{
        //alert('Dni erroneo, formato no válido');
        return false;
    }
}



//CRUCES
const cruces = function(r){
    let padre
    let datos
    let codigo = r['cod']
    if (codigo == '28'){  // evaluamos la enseñanza
        padre = '27'
        datos = parametros['ensenanzas_tipos']
    }else if(codigo == '02'){
        padre = '01'
        datos = parametros['ensenanzas_tipos']  //extender r['var]
    }else if(codigo == '32'){
        padre = '31'
        datos = subtipos_acneae
    }else if(codigo == '20'){
        //Verificamos el codigo GIR
        let valor = datos_temporales_linea['subcadena'].trim()
        numero_GIR_temporal = valor
        let patron_num = new RegExp('^[0-9]{14}$','gi')
        //console.log('En el cruce del 20')
        //console.log({valor})
        if (patron_num.test(valor))return 0  //Se han recibido 14 digitos.
        if (validateDNI(valor.trim()))return 0  //Se ha recibido un DNI/NIE rodeado de caracteres en blanco.

        //Si el formato es DNI ó NIE con caracteres '0' de relleno, solo se permiten al principio.
        let ultimos_car = valor.substring(5,14)
        let primeros_car = valor.substr(0,5)
        if ( ! validateDNI(ultimos_car) ) //console.log('Formato de DNI/NIE inválido.')
        if ( ! validateDNI(ultimos_car) )return 'Formato de DNI/NIE inválido.'
        if ( ! ( primeros_car == '00000' ) ) return 'Formato de caracteres anteriores a DNI/NIE inválido'
        
        return 0
    }else if( codigo == '30' || codigo == '40' || codigo == '50'){
        let valor = datos_temporales_linea['subcadena'].trim()
        if(valor==numero_GIR_temporal)return 0
        return 'El número GIR de la línea no coincide con el número GIR de su línea 2'
    }else if(codigo == '41'){
        //Evaluamos si la materia corresponde a la enseñanza y su tipo de enseñanza
        //Para la línea actual: cod 01 tipo enseñanza, cod 02 enseñanza, cod 04 curso
        //NOTA: A priori, si la línea de tipo 2 está bien formada, habra guardado su tipo_ens y ense 
        //      cod 27 es el tipo enseñanza, cod 28 la enseñanza y cod 30 el curso
        //      que no habrá sido sustituido.
        //console.log({datos_temporales_linea})
        let tipo_ens_linea2 = datos_temporales_linea['27']
        if(tipo_ens_linea2)tipo_ens_linea2=tipo_ens_linea2.trim()

        let ense_linea2 = datos_temporales_linea['28']
        if(ense_linea2)ense_linea2=ense_linea2.trim()
        //let curs_linea2 = datos_temporales_linea['30'].trim()
        let tipo_ens = datos_temporales_linea['01'].trim()
        let ense = datos_temporales_linea['02'].trim()
        let curs = datos_temporales_linea['04'].trim()
        tipo_ens = limpiarCodigos(tipo_ens)
        ense = limpiarCodigos(ense)
        tipo_ens_linea2 = limpiarCodigos(tipo_ens_linea2)
        ense_linea2 = limpiarCodigos(ense_linea2)
        
        //console.log(parametros["ensenanzas_asignaturas"][tipo_ens][ense])
        let materias = parametros["ensenanzas_asignaturas"][tipo_ens][ense] ? parametros["ensenanzas_asignaturas"][tipo_ens][ense][curs] : undefined
        let valor = datos_temporales_linea['subcadena'].trim()
        //console.log(datos_temporales_linea)
        //console.log(materias)
        //console.log(tipo_ens_linea2, tipo_ens, ense_linea2, ense)
        if( tipo_ens != tipo_ens_linea2) {
            //Puenteamos si la materia es LOMLOE y la definida en el alumno es LOMCE.
            //Alumnado definido LOMLOE, se permite que tengan pendientes LOMCE.
            if ( ! ( tipo_ens_linea2 == '147' && ense_linea2 == '880' && tipo_ens == '116' && ense == '813') ){    
                //console.log(tipo_ens_linea2, tipo_ens, ense_linea2, ense)
                return " El tipo de enseñanza de la materia no corresponde con el tipo de enseñanza declarada en la línea de alumnado"
            }

        }else if( ense != ense_linea2){
             return " La enseñanza no corresponde con la declarada en la línea de alumnado"
        }
        //if( curs != curs_linea2 && tipo_matricula_materia != 4) return " El curso no corresponde con el declarado en la linea de alumnado"
       
        if( materias && materias.includes(valor)){
            //console.log('materia en el array')
            return 0
        }else if(materias && materias.includes((parseInt(valor)).toString()) ){
            //console.log('materia parseada en el array')
            return 0
        }else{
            //console.log('Materias obtenidas')
            //Puenteamos las obligatorias del bachillerato cuando cruzan de tipo de bachillerato. Por ejemplo Geografía en Ciencias.    
            //console.log(tipo_ens)
            let materias_troncales_bach = parametros["materias_troncales_bach"][tipo_ens]
            if(materias_troncales_bach && materias_troncales_bach[curs] && materias_troncales_bach[curs].includes( (parseInt(valor)).toString() ) ){
                //console.log(parametros["materias_troncales_bach"][tipo_ens][curs])
                return 0
            }
            return "Materia no perteneciente a la enseñanza/curso"
        }
    }else if(codigo == '43' || codigo == '47' || codigo == '52'){
        //console.log('cruce del 43, 47, 52')
        padre = '01'
        let valor = datos_temporales_linea['subcadena']  // dato de calificación y fecha
        valor = limpiarCodigos(valor)
        let tipo_ens = datos_temporales_linea['01'].trim()
        tipo_ens = limpiarCodigos(tipo_ens)
        //console.log(datos_temporales_linea['subcadena'] )

        if(codigo=='52'){
            //Cuando es el dato 52 miramos las competencias.
            //console.log(valor,tipo_ens)
            let ense_calificaciones = parametros['ensenanzas_competencias'][tipo_ens]
            //console.log(parametros['ensenanzas_competencias'])
            //console.log(parametros['ensenanzas_competencias'][tipo_ens])
            if (ense_calificaciones){
                return ense_calificaciones.includes(parseInt(valor))?0:1
            }else{
                //console.log('hacemos return 1')
                return 1
            }
            //return ense_calificaciones?0:1
        }
        let tipomatricula = datos_temporales_linea['42'].trim()        
        tipomatricula = limpiarCodigos(tipomatricula)
        let ense_calificaciones = parametros['ensenanzas_calificaciones'][tipo_ens]
        if(!ense_calificaciones) return 1  // Devolver error si no hay entrada de datos.
        //console.log(tipomatricula)
       //console.log({ense_calificaciones})
       //console.log(valor)

        if(tipomatricula == '1' || tipomatricula == '4' ){
            
            if(ense_calificaciones.includes(parseInt(valor))){
                //console.log('incluido   ')
                return 0
            }else{
                //console.log('no incluido  ' + valor)
               //console.log(ense_calificaciones)
                return 1
            }
        }else{
            //Si esta exento, convalidada o similar, a priori nos da igual la nota, fecha..
            return 0
            //Esta linea valida que si no hay obligación de poner nota, dicha nota esté en blanco.
            return cadenaEnBlanco(valor) ? 0 : 1 //si el tipo de matrícula no es ordinaria admitimos cadenas de 'char blancos'             
        }
    }else if(codigo == '44'  || codigo == '45' || codigo == '46' || codigo == '48'  || codigo == '49' || codigo == '410'){
        //validar si tipomatricula es ordinaria y si no validar con el patrón.
        padre = '01'
        let valor = datos_temporales_linea['subcadena']  // dato de calificación y fecha
        //console.log({valor})
        let tipomatricula = datos_temporales_linea['42'].trim()
        tipomatricula = limpiarCodigos(tipomatricula)
        let tipo_ens = datos_temporales_linea['01'].trim()
        tipo_ens = limpiarCodigos(tipo_ens)
       //console.log('cruce del 44, 45, 46')
        if(tipomatricula == '1' || tipomatricula == '4' ){  //tipo matricula ordinaria o tipo matricula repetida, ha de haber nota y fecha
            if(codigo != '44' && codigo != '48' ){
                valor = limpiarCodigos(valor)  // si no es fecha limpiamos.
                //console.log({valor})
                let objeto = r['var']
                //console.log({objeto})
                //console.log(objeto[valor])0
                //console.log(tipo_ens)
                if (codigo == '49'){
                    return !(parseInt(objeto[valor]) == parseInt(tipo_ens) || valor == 0)
                }
                if(codigo == '45'){
                    /* Hay que verificar si el parametro es un valor o un array */
                    if (Array.isArray(objeto[valor])){
                        //Cuando el parametro es un array valoramos asi:
                        return (!objeto || !objeto[valor] || !objeto[valor].includes(tipo_ens))
                    }else{
                        return !(parseInt(objeto[valor]) == parseInt(tipo_ens) || valor == 0)
                    }                    
                }else{ //codigo 46 por eliminación
                    return !r['tipo'].includes(parseInt(valor))
                }

            }else{  //evaluamos la fecha
                let patron = r['tipo'] //cogemos patron de la configuracion
                return !(patron.test(valor))
            }
            
        }else{
            //Si esta exento, convalidada o similar, a priori nos da igual la nota, fecha..
            return 0
            return cadenaEnBlanco(valor) ? 0 : 1 //si el tipo de matrícula no es ordinaria admitimos cadenas de 'char blancos'             
        }
        
    }else if(codigo == '311'){
        //tipos de matricula segun enseñanza.
        let valor = datos_temporales_linea['subcadena'] //tipo de matricula
        valor = limpiarCodigos(valor)
        let tipo_ens = datos_temporales_linea['27'].trim()
        tipo_ens = limpiarCodigos(tipo_ens)
        let tipos_matricula_ensenanza = parametros['tipos_matricula_ensenanza'][tipo_ens]
        if (tipos_matricula_ensenanza){
            return tipos_matricula_ensenanza.includes(parseInt(valor))?0:1
        }else{
            return 0 //Por defecto lo damos por bueno.
        }
    }else if(codigo == '313'){  //PROMOCIONADO
        //1. Promocionado no PIL
        //2. Promocionado PIL
        //0. No promocionado
        //Si Evaluado es 0 => Promocionado = 0. Si Evaluado es 1 => Promocionado = 0, 1 ó 2"
        let evaluado = datos_temporales_linea['312'].trim()
        let valor = datos_temporales_linea['subcadena']
        if(evaluado == '0' && evaluado != valor){
            return "Error, evaluado es 0 y promocionado distinto de 0."  // Error, si no está evaluado no puede promocionar.
        }else return !r['tipo'].includes(parseInt(valor))

    }else if(codigo == '314'){  //TITULA
        //1. Titula
        //0. No Titula
        //Solo puede titular en 4º de ESO o 2º de BCH o 2º de Ciclos.
        //Si Promocionado es 0 => Titula = 0. Si Promocionado = 1 y es uno de los cursos indicados Titula = 0 ó 1."
        let tipo_ense = datos_temporales_linea['27'].trim()
        let curso = datos_temporales_linea['310'].trim()
        let promocionado = datos_temporales_linea['313'].trim()
        let valor = datos_temporales_linea['subcadena']

        if(promocionado == 0){
            if(valor != 0 )return "Error promocionado es 0 y titula es distinto de 0"
            return 0 // Correcto, promocion 0 y titula 0 (No titula)
        }else if(promocionado == 1){
            //Verificamos que promociona en una de las enseñanzas q puede hacerlo.
            //116 es ESO (LOMCE)
            //let ense_titulan = parametros['ensenanzas_titulan']
            // CFGM, CFGS, BACH, FPB
            //if( (curso == '4' && tipo_ense == '116') || (curso == '2' && ensenanzas.includes(tipo_ense)) ){
            //if( ense_titulan[tipo_ense] && ense_titulan[tipo_ense] == curso){
            if(ensenanzaTitula(tipo_ense,curso)){
                //promocion es 1 y estamos en último curso
                if(valor == 0){
                    return 'Error, promocion es 1 y alumno en último curso (' + curso + ') de ensenanza (' + tipo_ense + '), pero titula es 0' 
                }
                return !r['tipo'].includes(parseInt(valor))
            }else{
                //promocion es 1 pero no es último curso
                if(valor !=0) return 'Error, promoción es 1 y titula es 1, pero no es útimo curso de enseñanzas que titulan.'
                return 0
            }
        }else if(promocionado == 2){
            //Promoción por PIL, no puede titular.
            if(valor !=0) return 'Error, promoción PIL y titula distinto de 0.'
            return 0
        }else{
            //No se debería llegar a este punto.
            return "Atención, detectado valor de promocionado distinto de 0,1 ó 2" //Por si acaso devolvemos un error pero promocionado SOLO puede ser 0,1 ó 2
        }
    }else{
        return 0
    }
    //Cruces simples se valoran aquí, los complejos cada uno su función.

    let key = datos_temporales_linea['subcadena'].trim()
    let dato = datos_temporales_linea[padre].trim()

    if(key == '0')return 0   //las claves 0 son las por defecto.

    if(!key)return 1

    key = limpiarCodigos(key)
    dato = limpiarCodigos(dato)
    /* if(key[0]== '0'){
        let new_key = key.slice(1)  //cuando el codigo es 0848 quitamos el primer 0
        key = new_key
    }
    if(dato[0]=='0'){
        let new_dato = dato.slice(1)
        dato = new_dato
    } */
    //console.log('Marcador 2')
    //console.log(datos)
    if(!datos || dato != datos[key]){
       //console.log({dato})
       //console.log(key)  //la key va con un 0 delante a veces.
       //console.log(datos[key])
        return 1
    }
    return 0
}

//FIN DE CRUCES
const filtro1 = function(r,linea){
    let subcadena = linea.substr(r['inicio'],r['long']) 
    
    if(r['cod']){
        datos_temporales_linea[r['cod']] = subcadena
    }

    if(! r['opcion'] || r['opcion'] == false || (r['opcion'] == true && !cadenaEnBlanco(subcadena))){ //los campos opcionales no se evaluan
        if(r['cruce']){
            datos_temporales_linea['subcadena'] = subcadena
            let respuesta_cruces = cruces(r)
            if(respuesta_cruces != 0) {
                if(respuesta_cruces == 1) return subcadena + ' : ' + r['txt_error']
                return subcadena + ' : ' + r['txt_error'] + ' ' + respuesta_cruces
            }
        }else if(Array.isArray(r['tipo'])){
            if(! r['tipo'].includes(parseInt(subcadena))) {
                return subcadena + ' : ' + r['txt_error']
            }
        }else{
            let patron = r['tipo']
            //console.log(patron)
            //console.log({subcadena})
            //console.log(patron.test(subcadena))
            if(! patron.test(subcadena)){
                return subcadena + ' : ' + r['txt_error']
            }
        }
    }
    
    return 0
}

const validarEstructura = function(fichero){
    let cadena = ''
    if(datosEstructura['n_lineas_evaluadas'] != datosEstructura['n_lineas_declaradas'] ){
        cadena += '<span class="cefy_linea_invalida">Número de líneas declaradas INCORRECTO, evaluadas: ' + datosEstructura['n_lineas_evaluadas'] + ' frente a declaradas: ' + datosEstructura['n_lineas_declaradas'] + '</span>'
    }else{
        cadena += '<span class="cefy_linea_valida">Número de líneas declaradas CORRECTO, evaluadas: ' + datosEstructura['n_lineas_evaluadas'] + ', declaradas: '+datosEstructura['n_lineas_declaradas'] + '</span>'
    }
    cadena += '<p class="TituloInformeEstructura">Errores en el análisis línea a línea</p>'
    if(datosEstructura['n_errores'] > 0){
        
        cadena += '<span class="cefy_linea_invalida">Se han encontrado al menos ' + datosEstructura['n_errores'] + ' errores en las líneas:' + '</span><br>'
        cadena += datosEstructura['txt_resumen_errores']  //cuando hay errores mostramos las líneas.
    }else{
        cadena += '<span class="cefy_linea_valida">No se han encontrado errores en las líneas.' + '</span><br>'
    }
    cadena += '<p class="TituloInformeEstructura">Errores en la disposición de las líneas:</p>'
    //Evaluamos la estructura usando datosEstructura['lineas'] 
    let disposicionCorrecta = true
    for( let key in datosEstructura['lineas']){
        //console.log(key)
        let tipo = datosEstructura['lineas'][key]['tipo']
        if(tipo == 1){
            if(datosEstructura['linea1']){
                cadena += '<a href="#link' + key + '">ERROR, se han detectado más de una línea de tipo 1 en la línea ' + key + '</a><br>'
                disposicionCorrecta = false
            }else{
                datosEstructura['linea1'] = true  //se inicializa
            }
        }else{
            let tipoLineaAnterior = lineaAnterior['tipo']*1
            if(tipo == 2){
                tipoEnsenanzaActiva = datosEstructura['lineas'][key]['tipo_ens']
                //console.log(tipoEnsenanzaActiva)
                //primaria LOMCE, 136
                //fijamos que haya que enviar competencias en LOMCE, para LOMLOE hemos parametrizado.
                //v 6.43 Eliminamos esta parte y vemos siempre parametrización
                /* if(tipoEnsenanzaActiva && tipoEnsenanzaActiva.trim() == '136'){
                    if(tipoLineaAnterior != 1 && tipoLineaAnterior != 5){
                        disposicionCorrecta = false
                        cadena += '<a href="#link' + key + '">ERROR, En enseñanza que precisa evaluacion de competencias: línea de tipo 2 precedida de línea de tipo distinto a tipo 1 o tipo 5 en línea ' + key + '</a><br>'
                    }
                }else{
                    if(tipoLineaAnterior != 1 && tipoLineaAnterior != 4 && tipoLineaAnterior != 5) {
                        disposicionCorrecta = false
                        cadena += '<a href="#link' + key + '">ERROR, línea de tipo 2 precedida de línea de tipo distinto a tipo 1,4 ó 5, en línea ' + key + '</a><br>'
                    }
                }  */
                if(tipoLineaAnterior != 1 && tipoLineaAnterior != 4 && tipoLineaAnterior != 5) {
                    disposicionCorrecta = false
                    cadena += '<a href="#link' + key + '">ERROR, línea de tipo 2 precedida de línea de tipo distinto a tipo 1,4 ó 5, en línea ' + key + '</a><br>'
                }
            }else if(tipo == 3){
                if(tipoLineaAnterior != 2) {
                    disposicionCorrecta = false
                    cadena += '<a href="#link' + key + '">ERROR, línea de tipo 3 NO precedida de línea de tipo 2 en línea ' + key + '</a><br>'
                }

            }else if(tipo == 4){
                if(tipoLineaAnterior != 3 && tipoLineaAnterior != 4 && tipoLineaAnterior != 2) {
                    disposicionCorrecta = false
                    cadena += '<a href="#link' + key + '">ERROR, línea de tipo 4 precedida de línea de tipo distinto a tipo 3 o tipo 4 en línea ' + key + '</a><br>'
                }
            }else if(tipo == 5){
                if(tipoLineaAnterior != 4 && tipoLineaAnterior != 5) {
                    disposicionCorrecta = false
                    cadena += '<a href="#link' + key + '">ERROR, línea de tipo 5 precedida de línea de tipo distinto a tipo 4 o tipo 5 en línea ' + key + '</a><br>'
                }
            }else{
                disposicionCorrecta = false
                cadena += '<a href="#link' + key + '">ERROR, tipo de línea incoherente en la línea: ' + key + '</a><br>'
            }
        }
        lineaAnterior = datosEstructura['lineas'][key]
    }
    if (disposicionCorrecta){
        cadena+= '<span class="cefy_linea_valida">No se han encontrado errores en la disposición de las lineas</span><br>'
    }else{
        ficheroSinErrores = false
    }
    return cadena
}

const existeCoincidencia = function(array_entrada, array_base){
    //console.log('En existe coincidencia')
    //console.log({array_entrada})
    //console.log({array_base})
    for(let elemento of array_entrada){      
        if(array_base.includes(elemento))return true
    }
    return false
}

const almacenarAlumno = function(dato_alumno, dato_materias_matricula, cursoEnsenanzaActiva){
    //ALUMNADO REPETIDO
    //console.log(dato_alumno)
    let asignaturas = parametros['denominacion_asignaturas']
    //console.log({cursoEnsenanzaActiva})
    //console.log(dato_materias_matricula)
    if(RESUMENASIGNATURAS.alumnosevaluados.includes(dato_alumno['numeroGIR'])){
        RESUMENASIGNATURAS.alumnosrepetidos++
        //console.log(RESUMENASIGNATURAS)
        RESUMENASIGNATURAS['numerosalumnosrepetidos'].push(dato_alumno['numeroGIR'])
    }else{
        RESUMENASIGNATURAS.alumnosevaluados.push(dato_alumno['numeroGIR'])
    }
    //NUMERO DE ALUMNOS POR ENSEÑANZA
    if(!RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']]){
        RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']] = {}
    }
    if(!RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']]){
        RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']] = {}
    }
    if(!RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][cursoEnsenanzaActiva]){
        RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][cursoEnsenanzaActiva] = {
            "total" : 0,
            "eval"  : 0,
            "prom"  : 0,
            'PIL'   : 0,
            "titu"  : 0
        }
    }
    RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][cursoEnsenanzaActiva]['total'] += 1
    //AÑADIMOS LOS DATOS DE EVALUADOS, PROMOCIONADOS, PIL Y TITULADOS
    //console.log(dato_alumno)
    if(dato_alumno['eval'] == '1')RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][cursoEnsenanzaActiva]['eval'] +=1
    if(dato_alumno['prom'] == '1')RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][cursoEnsenanzaActiva]['prom'] +=1
    if(dato_alumno['prom'] == '2')RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][cursoEnsenanzaActiva]['PIL'] +=1
    if(dato_alumno['titu'] == '1')RESUMENASIGNATURAS.alumnosXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][cursoEnsenanzaActiva]['titu'] +=1

    //MATERIAS POR ENSEÑANZA
    if(!RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']]){
        RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']] = {}
    }
    if(!RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']]){
        RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']] = {}
    }
    if(!RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']]){
        RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']] = {}
    }
    for(let key_materia of dato_materias_matricula){
        //console.log(key_materia)
        //console.log(key_materia, dato_alumno['curso'], asignaturas[key_materia['materia']], dato_alumno)
        
        //console.log (dato_alumno)
        //console.log(key_materia)
        if(!RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]){
            //console.log('creamos la materia ' + key_materia['materia'] + ' para el curso ' + dato_alumno['curso']);
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']] = {
                'total'     : 0,
                'efectiva'  : 0,
                'resto'     : 0,
                'aptos_1'   : 0,
                'aptos_2'   : 0,
                'temporales_1' : 0,
                'temporales_2' : 0,
                'por_tipos' : {}
            }
        }
        RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['total'] += 1
        //Ahora discriminamos segun dato_materias_matricula[dato_materia]
        //if(key_materia['tipo_matricula'] == "1"){
        //Ahora buscamos las matriculas de los parámetros
        if(parametros.tipos_matricula_materia_efectivas.includes(key_materia['tipo_matricula']*1)){
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['efectiva'] += 1
        }else{
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['resto'] += 1
        }
        if (!RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['por_tipos'][key_materia['tipo_matricula']]){
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['por_tipos'][key_materia['tipo_matricula']] = 0
        }
        RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['por_tipos'][key_materia['tipo_matricula']] += 1
        //Parte para mostrar el numero de aptos por convocatoria.
        //console.log(key_materia);
        if ( key_materia['apto'] == 1){
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['aptos_1'] += 1;
        }
        if (key_materia['apto_extraordinaria'] == 1){
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['aptos_2'] += 1;
        }
        //Contamos los temporales de la primera y la segunda convocatoria
        if (key_materia['nota_temporal_1']){
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['temporales_1'] += 1;
        }

        if (key_materia['nota_temporal_2']){
            RESUMENASIGNATURAS.materiasXensenanza[dato_alumno['tipo_ens']][dato_alumno['ensenanza']][dato_alumno['curso']][key_materia['materia']]['temporales_2'] += 1;
        }   
    }

    //console.log({RESUMENASIGNATURAS})
}

const alumnosLOMCE_22_23 = function(resumen){
    //Parametrizamos cursos no permitidos.
    cadena = ""
    let ensenanzas = parametros['denominacion_ensenanzas']
    for(let tipo in RESUMENASIGNATURAS['alumnosXensenanza']){

        if (cursos_no_permitidos[tipo]){
            for(let ense in RESUMENASIGNATURAS.alumnosXensenanza[tipo]){
                let keys = Object.keys(RESUMENASIGNATURAS.alumnosXensenanza[tipo][ense])

                for(let k of keys){
                    
                    if (cursos_no_permitidos[tipo].indexOf(k)>=0){
                        
                        ficheroSinErrores = false
                        cadena += 'Detectado Error, alumnado con matricula en ' + k + ' de enseñanza: ' + ense + ' ' + ensenanzas[ense] + '<br>'
                    }
                }
            }
        }
    }


    return cadena
}

const maquetarResumenAsignaturas = function(){

    //console.log({RESUMENASIGNATURAS})
    let cadena = ""
    let tipos_ense = parametros['denominacion_tipos_ensenanzas']
    let ensenanzas = parametros['denominacion_ensenanzas']
    let asignaturas = parametros['denominacion_asignaturas']

    let desc_asignaturas = parametros['descripcion_tipo_matricula_materia']
    //let ense_titulan = parametros['ensenanzas_titulan']
    //los alumnos repetidos si existen
    if(RESUMENASIGNATURAS.alumnosrepetidos > 0){
        cadena += '<br><span class="cefy_linea_invalida">Se han encontrado: ' + RESUMENASIGNATURAS.alumnosrepetidos + ' número/s identificador/es repetido/s en el fichero. El/Los número/s son:</span>'
        let numerosrepetidosunicos = [...(new Set(RESUMENASIGNATURAS.numerosalumnosrepetidos))]
        cadena += '<ul>'
        for (let num_aux of numerosrepetidosunicos){
            cadena += '<li>' + num_aux
        }
        cadena += '</ul>'
    }else{
        cadena += '<br>No se han encontrado números identificadores repetidos en el fichero'
    }
    //Ordenamos RESUMENASIGNATURAS
    //console.log(RESUMENASIGNATURAS['alumnosXensenanza'])
    //Vamos a revisar para el curso 22-23 que no hay alumnos ordinarios en LOMCE
    if(alumnosLOMCE_22_23(RESUMENASIGNATURAS) != ""){
        cadena  += '<span style="color:red; font-weight: bold;"><br>' + alumnosLOMCE_22_23(RESUMENASIGNATURAS) +'</span>'
    }
    //Mostramos los alumnos por enseñanza
    cadena += '<br><span class="tituloEnsenanza">Resumen del alumnado por enseñanzas</span>'
    for(let tipo in RESUMENASIGNATURAS['alumnosXensenanza']){
        //console.log({tipo})
        cadena += '<br>Tipo enseñanza: (' + tipo + ') <span class="textoResaltado">' + tipos_ense[tipo] + '</span>'
        for(let ense in RESUMENASIGNATURAS.alumnosXensenanza[tipo]){
            //console.log({ense})
            cadena += '<br>Enseñanza: (' + ense + ') <span class="textoResaltado">' + ensenanzas[ense] + '</span><ul>'
            let keys = Object.keys(RESUMENASIGNATURAS.alumnosXensenanza[tipo][ense]);
            //console.log({keys})
            keys = keys.sort()
            //for(let curso in RESUMENASIGNATURAS.alumnosXensenanza[tipo][ense] ){
            for(let k of keys){
                curso = RESUMENASIGNATURAS.alumnosXensenanza[tipo][ense][k]
                //console.log({curso})
                cadena += '<li>Curso ' + k 
                cadena += (k == '4ACAD' || k== '4APLI' || k=='3PMAR' || k == '2PMAR' 
                || k=='3DIVER' || k == '4DIVER' || k == '1BACIMG' || k == '1BACMUS' )?' : ': 'º : '
                cadena += curso['total']
                cadena += ' alumnos, '
                cadena += curso['eval']
                cadena += ' evaluados, '
                cadena += curso['prom']
                cadena += ' promocionados, '
                cadena += curso['PIL']
                cadena += ' PIL '
                //SEPARAMOS SI ES CURSO FINAL O NO PARA MOSTRAR UN WARNING SI TITULAN SIN QUE SEA POSIBLE Y SI NO TITULA NINGUNO EN CURSOS FINALES.
                //curso_titulan = ense_titulan[tipo]
                //Si curso_titulan existe es que es una enseñanza que puede titular.

                //por comodidad declaramos numero_titulan
                let numero_titulan = RESUMENASIGNATURAS.alumnosXensenanza[tipo][ense][k]['titu']
                //if(!curso_titulan){ //no es un tipo ense que pueda titular
                if(!ensenanzaTitula(tipo,k)){
                    if (numero_titulan >0) cadena += ', ATENCIÓN: ' + numero_titulan + ' alumnos titulados en tipo enseñanza y curso que no lo permite (' + k + ', ' + tipo + ') '
                }else{
                    if(numero_titulan == 0){
                        cadena += ', ATENCIÓN: ' + numero_titulan + ' alumnos titulan en curso final (' + k + ') con tipo enseñanza: ' + tipo
                    }else{
                        cadena += ', ' + numero_titulan + ' alumnos titulan'
                    }
                }
                cadena += warningPromocionCursos(tipo, curso);
                cadena += '<span class="warningCursosAvisos" id="banner_wc_' + tipo  + ense + k + '"></span>';
                
                
            }
            cadena += '</ul>'
        }
    }
    cadena += '<span class="tituloEnsenanza">Resumen de materias por enseñanzas</span>'
    
    for(let tipo in RESUMENASIGNATURAS['materiasXensenanza']){
        let colspan = 4; // Numero de columnas de la tabla cuando no hay extraordinaria
        let hayExtraordinaria = false;
        if(ensenanzas_con_extraordinaria.includes(tipo)){
            colspan = 5;
            hayExtraordinaria = true;
        }
        cadena += '<table>';
        cadena += '<tr><th colspan="5">Tipo enseñanza: (' + tipo + ') <span class="textoResaltado">' + tipos_ense[tipo] + '</span><th></tr>'
        for(let ense in RESUMENASIGNATURAS.materiasXensenanza[tipo]){
            
            for(let curso in RESUMENASIGNATURAS.materiasXensenanza[tipo][ense] ){
                let destinoSpan = 'dest_' + tipo + ense +  curso;
                cadena += '<tr><th colspan=' + colspan + '><a name="' + destinoSpan + '"></a><strong>Curso: ' + curso + 'º. </strong>'
                cadena += 'Enseñanza: (' + ense + ') <span class="textoResaltado">' + ensenanzas[ense] + '</span></th><tr>'
                cadena += '<tr><td><strong>Asignatura</strong></td><td><strong>Total alumnos</strong></td><td><strong>Por tipos</strong></td><td><strong>Aptos ordinaria</strong></td>'
                if(hayExtraordinaria) {
                    cadena += '<td><strong>Aptos extraordinaria</strong></td>'
                }
                cadena += '</tr>'
                for(let materia in RESUMENASIGNATURAS.materiasXensenanza[tipo][ense][curso] ){
                    const mat = RESUMENASIGNATURAS.materiasXensenanza[tipo][ense][curso][materia];
                    cadena+='<tr>'
                        cadena+='<td>(' + materia + ') ' + asignaturas[parseInt(materia).toString()] + '</td>'
                        cadena+='<td>'+mat.total+'</td>'
                        cadena+='<td>'
                        for(let tip in mat.por_tipos){
                            if(mat.por_tipos[tip]>0){
                                cadena += mat.por_tipos[tip] +' : '
                                cadena += desc_asignaturas[tip]['desc'] + '<br> ' 
                            }
                        }
                        cadena += '</td>'
                        cadena+='<td>' + mat.aptos_1 + '</td>';
                        if(hayExtraordinaria){
                            cadena+='<td>' + mat.aptos_2 + '</td>'
                        }
                    cadena+='</tr>';
                    let evalAprobados = evaluarAprobados(tipo, mat, colspan, hayExtraordinaria);
                    //console.log({evalAprobados});
                    // Cuando evalAprobados es distinto de "" añadimos a la enseñanza y curso que hay warnings.
                    if(evalAprobados.includes("warning_suspensos")){
                        if(!warningsMaterias[tipo]) warningsMaterias[tipo] = {};
                        if(!warningsMaterias[tipo][ense]) warningsMaterias[tipo][ense] = {};
                        if(!warningsMaterias[tipo][ense][curso]) warningsMaterias[tipo][ense][curso] = {};
                        warningsMaterias[tipo][ense][curso] =  true;
                    }
                    if(evalAprobados.includes("warning_temporales")){
                        if(!warningTemporalesFP[tipo]) warningTemporalesFP[tipo] = {};
                        if(!warningTemporalesFP[tipo][ense]) warningTemporalesFP[tipo][ense] = {};
                        if(!warningTemporalesFP[tipo][ense][curso]) warningTemporalesFP[tipo][ense][curso] = {};
                        warningTemporalesFP[tipo][ense][curso] =  true;
                    }
                    //console.log({warningsMaterias})
                    cadena += evalAprobados;
                }
            }
        }
        cadena += '</table>';
    }
    

    /* Se añade una leyenda con los tipos de matricula de las materias. */
    cadena+= "<h4>Se consideran aquí las asignaturas con tipo matrícula materia: </h4><ul>"
    //let desc_asignaturas = parametros['descripcion_tipo_matricula_materia']
    //console.log(desc_asignaturas)
    for(let key in desc_asignaturas){
        //console.log(key)
        cadena += '<li>' + key + ' : <span class="texto_matricula">' + desc_asignaturas[key]['desc'] +'</span>'
        cadena += desc_asignaturas[key]['FP']?', <span class="texto_resaltado"> sólo en enseñanzas de F.P.</span>':""
    }
    cadena += "<br>"

    return cadena
}

const evaluarAlumnoMateria = function(linea_alumno, dato_alumno, dato_materias, numero_materias, dato_materias_matricula,numero_competencias,dato_competencias){
    //Función para verificar repetidos, y numero de materias no adecuado.
    //console.log('datos de entrada en evaluarAlumnoMateria')
    //console.log(linea_alumno)
    //console.log(dato_alumno)
    //console.log(dato_materias)
    //console.log(numero_materias)
    //console.log(dato_materias_matricula)
    //console.log((linea_alumno, dato_alumno, dato_materias, numero_materias, dato_materias_matricula))
    //Vamos a usar una función auxiliar para almacenar los datos de cada linea.
    //console.log(dato_competencias)
    //try{
        //El numero_materias, refleja el numero de materias con tipomatriculamateria distinto de 4.
        let cadena = ""
        //let cadenaExpErrores = ""
        //console.log(dato_alumno)
        if (!dato_alumno['tipo_ens'] || !dato_alumno['ensenanza'] || !dato_alumno['curso']){
            cadena = "<br>Error en linea: " + linea_alumno + " que imposibilita validación."
            return[cadena,""]
        }
        let tipoEnsenanzaActiva = parseInt(dato_alumno['tipo_ens'].trim()).toString()
        let ensenanzaActiva = parseInt(dato_alumno['ensenanza'].trim()).toString()
        let cursoEnsenanzaActiva = parseInt(dato_alumno['curso'].trim()).toString()
        //console.log(tipoEnsenanzaActiva)
        //El cursoEnsenanzaActiva viene como 1,2,3... hay que evaluar si es PMAR, 4º ACADEMICAS ó APLICADAs...  para los parametros 
        //Con la LOMLOE vamos a evaluar si es Diversificación (3DIVER, 4DIVER)
        //console.log(tipoEnsenanzaActiva)
        //console.log(cursoEnsenanzaActiva)
        if(tipoEnsenanzaActiva == '116'){ //Estamos evaluando ESO LOMCE
            //console.log('Evaluamos en la ESO')
            //console.log(dato_materias)
            if(cursoEnsenanzaActiva=='2'){
                //evaluamos si es 2º PMAR
                let cod_ambitos_pmar = ["8596","8597","8598"]
                if(existeCoincidencia(cod_ambitos_pmar, dato_materias)){
                    cursoEnsenanzaActiva = '2PMAR'
                }
            }else if(cursoEnsenanzaActiva=='3'){
                //evaluamos si es 3º PMAR (OBSOLETO A PARTIR DE LOMLOE)
                let cod_ambitos_pmar = ["8648","8649","8650"]
                if(existeCoincidencia(cod_ambitos_pmar, dato_materias)){
                    cursoEnsenanzaActiva = '3PMAR'
                }
                

            }else if(cursoEnsenanzaActiva=='4'){
                //evaluamos académicas o aplicadas
                //los codigos de aplicadas son: 8738, 8739, 9406
                let cod_mates_aplicadas = ["8740","8741","9407"]
                cursoEnsenanzaActiva = '4ACAD' //Ponemos por defecto academicas y evaluamos si están presentes las mates aplicadas
                if(existeCoincidencia(cod_mates_aplicadas, dato_materias)){
                    cursoEnsenanzaActiva = '4APLI'
                    //console.log({cursoEnsenanzaActiva})
                }
                //console.log('hemos codificado un ESO4 a aplicadas o academicas' + cursoEnsenanzaActiva)
                //Cuando entre en vigor meteremos el 4DIVER
                
            }
            //console.log({cursoEnsenanzaActiva})
        }
        if( tipoEnsenanzaActiva == '147' ){ //Estamos evaluando ESO LOMLE
            if(cursoEnsenanzaActiva=='3'){
                let cod_ambitos_diver = ["13898","13897","13899"]
                if(existeCoincidencia(cod_ambitos_diver, dato_materias)){
                    cursoEnsenanzaActiva = '3DIVER'
                }
            }else if(cursoEnsenanzaActiva=='4'){
                //PARA COMPLETAR CUANDO ENTRE EN VIGOR 4º ESO LOMLOE
                let cod_ambitos_diver = ["13901","13902","13903"]
                if(existeCoincidencia(cod_ambitos_diver, dato_materias)){
                    cursoEnsenanzaActiva = '4DIVER'
                }
            }
        }
        if( tipoEnsenanzaActiva == '149' && ensenanzaActiva == '883' ){ //Estamos evaluando BACH. LOMLOE de Artes. Vamos a separar el bachillerato de Artes en Música e Imagen
            if(cursoEnsenanzaActiva == '1'){
                cursoEnsenanzaActiva = '1BACMUS' //Por defecto ponemos el bac de Música pq el de Imagen tiene una asignatura marcador (Dibujo Artístico I)
                let cod_itinerarios_bach_artes_img = ["13336","13390","13372","13354"]
                if(existeCoincidencia(cod_itinerarios_bach_artes_img,dato_materias)){
                    cursoEnsenanzaActiva = '1BACIMG'
                }
            }
        }
        if(dato_alumno['tipo'] && dato_alumno['tipo'] == 2){
            //Todas deberian ser tipo 2 pero comprobamos por si acaso.
            //console.log('almacenamos alumno.')
            //console.log({dato_alumno},{dato_materias_matricula}, {cursoEnsenanzaActiva})
            almacenarAlumno(dato_alumno, dato_materias_matricula,cursoEnsenanzaActiva)
        }
        let A = parametros["denominacion_asignaturas"]
        dato_materias = dato_materias.map(x=>x.trim())
        dato_materias = dato_materias.map(x=>parseInt(x).toString())
        dato_competencias = dato_competencias.map(x=>x.trim())
        dato_competencias = dato_competencias.map(x=>parseInt(x).toString())
        let dato_materias_unico = [...new Set(dato_materias)]
        if (dato_materias_unico.length != dato_materias.length){
            //Hay materias repetidas.
            cadena = "<a href='#link"+ linea_alumno +"'><br><span class='textoResaltado'>Línea: " + linea_alumno + ": " + dato_alumno['nombre'] + "</span> ATENCIÓN: materias repetidas </a>"
            materiasRepetidas = comparar(dato_materias,dato_materias_unico)
            cadena += '<ul style="margin-bottom: 0;">'
            for(let materia of materiasRepetidas.sort()){
                cadena += "<li>" + materia + ": " + A[materia] 
            }
            cadena +='</ul>'
            cadena += "<strong>Listado completo de materias del alumno/a:</strong><ul>"
            for(let materia of dato_materias.sort()){ //Para que se muestren ordenadas
                cadena += "<li>" + materia + ": " + A[materia]
            }
            cadena +='</ul>'
            //return [cadena,cadenaExpErrores]
            return cadena
        }
        //Buscamos competencias repetidas
        let parametros_competencias = parametros["ensenanzas_relacion_competencias"]
        let dato_competencias_unico = [...new Set(dato_competencias)]
        //console.log(dato_competencias_unico)
        //console.log(dato_competencias_unico.length)
        if(parametros_competencias[tipoEnsenanzaActiva] && parametros_competencias[tipoEnsenanzaActiva][ensenanzaActiva]){
            //Hay parametros para el tipo de enseñanza y el curso. Por tanto evaluamos.
            let C = parametros_competencias[tipoEnsenanzaActiva][ensenanzaActiva]
            if (dato_competencias_unico.length != dato_competencias.length){
                //Hay competencias repetidas.
                cadena = "<a href='#link"+ linea_alumno +"'><br><span class='textoResaltado'>Línea: " + linea_alumno + ": " + dato_alumno['nombre'] + "</span> ATENCIÓN: competencias repetidas </a>"
                for(let competencia of dato_competencias.sort()){
                    cadena += "<br> " + competencia + ": " + C['competencias'][competencia]
                }
                //return [cadena,cadenaExpErrores]
                return cadena
            }
        }
        //console.log('Marcador 3')
        //console.log(parametros['ensenanzas_limites'])
        if(parametros['ensenanzas_limites'][tipoEnsenanzaActiva]){
            let rango_materias = parametros['ensenanzas_limites'][tipoEnsenanzaActiva][cursoEnsenanzaActiva]
            if (!cursoEnsenanzaActiva || !rango_materias){
                //console.log('En el error')
                cadena = '<br><a href="#link' + linea_alumno + '"><span class="textoResaltado">Linea: ' + linea_alumno  + ': no evaluable, no detectado curso del alumno</a>'               
            }else if ( rango_materias.includes(numero_materias)){
                //console.log('Numero de materias correcto : ' + numero_materias)
                //console.log(rango_materias)
                //txtDevolucion += '<br>Linea: ' + aux_linea  + ', Alumno: ' + dato['nombre'] + ' ATENCIÓN: Número de materias ( ' + numero_materias + ' ) correcto para la enseñanza del alumno.' + rango_materias
            }else{
                //console.log('Numero de materias inadecuado : ' + numero_materias)
                //console.log(rango_materias)
            //console.log(dato_alumno)
            //console.log(dato_materias)
            //console.log(rango_materias)
            //console.log(numero_materias)
                cadena = '<a href="#link' + linea_alumno + '"><span class="textoResaltado">Linea: ' + linea_alumno  + ': ' + dato_alumno['nombre'] + '</span> ATENCIÓN: Número de materias ( ' + numero_materias + ' ) inadecuado para la enseñanza (' + cursoEnsenanzaActiva + ') del alumno: ' + rango_materias.join(' - ') + '</a>'
                cadena += pintarMaterias(dato_materias)
                //return [cadena,cadenaExpErrores]
                return cadena
            }
        }
        //En caso de que el numero de materias sea correcto evaluamos segun los parametros de la enseñanza y el curso las asignaturas imprescindibles e incompatibles 
        let parametros_materias = parametros["ensenanzas_relacion_materias"]

        if(cursoEnsenanzaActiva && cursoEnsenanzaActiva != "NaN"){
            if (parametros_materias[tipoEnsenanzaActiva] && parametros_materias[tipoEnsenanzaActiva][ensenanzaActiva][cursoEnsenanzaActiva]){
                //Hay parametros para el tipo de enseñanza y el curso. Por tanto evaluamos.
                //Evaluamos las asignaturas obligatorias.
                
                let P = parametros_materias[tipoEnsenanzaActiva][ensenanzaActiva][cursoEnsenanzaActiva]
                cadena = ""
                if(P['obligatorias']){
                    for(let mat_obligatoria of P["obligatorias"]){
                        if( ! dato_materias.includes(mat_obligatoria)){
                            cadena += '<a href="#link' + linea_alumno + '"><span class="textoResaltado">Linea: ' + linea_alumno  + ': ' + dato_alumno['nombre'] + '</span> ATENCIÓN: Materia obligatoria: '
                            cadena += A[mat_obligatoria] ? mat_obligatoria + ": " + A[mat_obligatoria] : mat_obligatoria
                            cadena += " no encontrada</a>"
                            //Mostramos TODAS LAS MATERIAS DEL ALUMNO
                            cadena += pintarMaterias(dato_materias)
                            //cadenaExpErrores += '<div class="divExpError"><strong>Alumno de linea: ' + linea_alumno+ '. Error: materia obligatoria en la enseñanza no encontrada. </strong>'
                            //cadenaExpErrores += '<br>La materia ' + mat_obligatoria + ' ' + A[mat_obligatoria] + ' no se ha encontrado o su linea no es correcta.</div>'
                            //console.log(cadenaExpErrores)
                        }
                    }
                }
                if(P['incompatibilidad']){
                    //console.log('Evaluamos incompatibilidad')
                    for(let incompatibilidad of P['incompatibilidad']){
                        //console.log(dato_materias)
                        //console.log(incompatibilidad)
                        let materias_chequeo = incompatibilidad['materias']
                        let materias_encontradas = dato_materias.filter(x=>{
                            if (materias_chequeo.includes(x)) return true
                            return false
                        })
                        //console.log({materias_encontradas})
                        if(materias_encontradas.length<incompatibilidad['min'] || materias_encontradas.length>incompatibilidad['max'] ){
                            cadena += '<a href="#link' + linea_alumno + '"><span class="textoResaltado">Línea: ' + linea_alumno  + ': ' + dato_alumno['nombre'] + ':</span> ' + incompatibilidad['error'] + '</a>'
                            //mostrarError(linea_alumno,incompatibilidad)
                            //cadenaExpErrores += '<div class="divExpError"><strong>Alumno de linea: ' + linea_alumno+ '. Error: incompatibilidad en las materias encontradas. </strong>' 
                            //cadenaExpErrores += '<br>' + incompatibilidad['error']
                            //cadenaExpErrores += '<br>El cruce indica que que ha de haber entre ' + incompatibilidad['min'] + ' y ' + incompatibilidad['max'] + ' de las siguientes:<ul>'
                            //for (let materia_necesaria of incompatibilidad['materias']){
                            //    cadenaExpErrores +='<li>'+ materia_necesaria + ': ' + A[materia_necesaria] + '</li>'
                            //}
                            //cadenaExpErrores += '</ul>'
                            let numeroError = incompatibilidad['num_error']
                            cadena += "<br><a class='enlace_error btn btn-primary' href='#' onclick='event.preventDefault();mostrarError(this);'" 
                            cadena += ' data-tipoense="' + tipoEnsenanzaActiva
                            cadena += '" data-ense="' + ensenanzaActiva
                            cadena += '" data-curso="' + cursoEnsenanzaActiva
                            cadena += '" data-numerror="' + numeroError
                            cadena += '">Información del error ' + numeroError + '</a>'
                            if(materias_encontradas.length >0){
                                cadena += '<br><strong>Las materias encontradas correspondientes al cruce son:</strong>'
                                //cadenaExpErrores += 'Se han encontrado las siguientes: <ul>'
                                cadena += '<ul style="margin: 0px;">'
                                for(let m of materias_encontradas.sort()){
                                    cadena += '<li>' + m + ': ' + A[parseInt(m)] + '</li>'
                                    //cadenaExpErrores += '<li>' + m + ': ' + A[parseInt(m)] + '</li>'
                                }
                                cadena += '</ul>'
                                //cadenaExpErrores += '</ul>'
                                //Mostramos TODAS LAS MATERIAS DEL ALUMNO
                                cadena += pintarMaterias(dato_materias)
                            }else{
                                cadena += '<br><strong>No se han encontrado materias correspondientes al cruce.</strong>'
                                //cadenaExpErrores += 'No se han encontrado ninguna de las materias correspondientes a este cruce.'
                                cadena += pintarMaterias(dato_materias)
                            }
                            //cadenaExpErrores += '</div>'
                            //return [cadena,cadenaExpErrores]
                            return cadena
                        }
                    }
                }
                if(cadena != "") return cadena //return [cadena,cadenaExpErrores]
            }
        }else{
        //console.log('No hay parametros para evaluar las materias incompatibles en este tipo de enseñanza y curso ')
        }

        // En el caso de que no hayamos obtenido errores hasta aqui, pasamos a evaluar las competencia. 
        // Podriamos fijar número pero lo dejamos parametrizable.
        
        if(parametros_competencias[tipoEnsenanzaActiva] && parametros_competencias[tipoEnsenanzaActiva][ensenanzaActiva]){
            //Hay parametros para el tipo de enseñanza y el curso. Por tanto evaluamos.
            let C = parametros_competencias[tipoEnsenanzaActiva][ensenanzaActiva]
            cadena = ""
            if (C['evaluar_competencias'][cursoEnsenanzaActiva] == true){
                
                for(let competencia in C['competencias']){
                    //console.log(competencia)
                    //console.log(dato_competencias)
                    if( ! dato_competencias.includes(competencia.toString()) ){
                        //console.log('error de competencia')
                        cadena += '<br><a href="#link' + linea_alumno + '"><span class="textoResaltado">Linea: ' 
                        cadena += linea_alumno  + ': ' + dato_alumno['nombre'] + '</span> ATENCIÓN: Competencia obligatoria: '
                        cadena += C['competencias'][competencia]
                        cadena += " no encontrada</a>"
                    }
                }
            }
            if(cadena != "") return cadena //return [cadena,cadenaExpErrores]
        }else{
        //console.log('No hay parametros para evaluar las competencias en este tipo de enseñanza ')
        }

    //}catch(error){
        //console.log(error)
        
        //return '<br><a href="#link' + linea_alumno + '">Error, no ha sido posible evaluar la linea: ' + linea_alumno + '</a>' 
    //}
    return ""
}
const validarCongruencia = function(){
    //Vamos a validar la congruencia usando datosEstructura
    //console.log('En validar Congruencia')
    //console.log({datosEstructura})
    //Aqui llegan los datos bien.
    let datos = datosEstructura["lineas"]
    //console.log({datos})
    let lineas_evaluadas = datosEstructura["n_lineas_evaluadas"]
    let textoApoyoDevolucion = ""
    let txtDevolucion = "" //Si no hay errores devolveremos en blanco.
    //let txtDevolucionExpErrores = "" //Explicación de los errores de congruencia.
    //Declaramos un alumno temporal
    
    let tmp_dato_materias  = []
    let tmp_dato_materias_matricula = []
    let tmp_numero_materias = 0

    let tmp_numero_competencias = 0
    let tmp_dato_competencias = []
    let tmp_n_gir_ppal   = ""
    
    let j = 1  //Declaramos un índice auxiliar
    let auxiliar = 2 //La usamos para guardar el indice del alumno.
    //console.log(datosEstructura.n_lineas_evaluadas)
    //console.log(datos[datosEstructura.n_lineas_evaluadas])
    let i=0;
    //console.log({lineas_evaluadas})
    //console.log({datos})
    while( i <= lineas_evaluadas){
        //console.log({i},{auxiliar})
        //console.log(datosEstructura.n_lineas_evaluadas)
        i++
        //console.log({i},{auxiliar})
        let tipoLinea
        if(i>lineas_evaluadas){
            tipoLinea = null
        }else{
           //console.log(datos[i])
            tipoLinea = datos[i]['tipo']
        }
        //console.log({tipoLinea})
        if(i==1){
            //Primera línea de fichero
            if (tipoLinea != 1){
                ficheroSinErrores = false
                return '<br>Error de estructura, la primera línea no es de tipo 1, no se puede comprobar la congruencia.'
            }
        }else if (i>lineas_evaluadas){
            //Hemos terminado el fichero y hay que evaluar al último alumno.
            //tmp_dato_materias y el tmp_numero_materias llega mal.
            //console.log('Hemos llegado al final del fichero A.')
            textoApoyoDevolucion = evaluarAlumnoMateria(auxiliar, datos[auxiliar], tmp_dato_materias, tmp_numero_materias, tmp_dato_materias_matricula, tmp_numero_competencias, tmp_dato_competencias)
            if ( limiteCongErrores > 0 && textoApoyoDevolucion.length > 1){
                txtDevolucion += textoApoyoDevolucion
                limiteCongErrores--
            }
            /* if ( limiteExpErrores > 0 && textosApoyoDevolucion[1].length > 1){
                txtDevolucionExpErrores += textosApoyoDevolucion[1]
                limiteExpErrores--
            } */
            //console.log({txtDevolucion})
        }else{
            //Evaluamos si hay otra línea de tipo 1
            if (tipoLinea == 1){
                ficheroSinErrores = false
                return "<br>Error de estructura, encontrada línea de tipo 1 fuera de la primera posición, no se puede comprobar la congruencia. "
            }
            if(tipoLinea == 2 ){
                //Excepto si estamos en la segunda línea hay que valorar el alumno anterior.
                if(i!=2){
                    //Evaluamos al alumno anterior
                    //console.log('Antes de llamar a evaluarAlumnoMateria')
                    //console.log(auxiliar, datos[auxiliar], tmp_dato_materias, tmp_numero_materias, tmp_dato_materias_matricula)
                    textoApoyoDevolucion = evaluarAlumnoMateria(auxiliar, datos[auxiliar], tmp_dato_materias, tmp_numero_materias, tmp_dato_materias_matricula, tmp_numero_competencias, tmp_dato_competencias)
                    //Si se devuelve un texto vacio no se cuenta como error mostrado
                    if ( limiteCongErrores > 0 && textoApoyoDevolucion.length > 1){
                        txtDevolucion += textoApoyoDevolucion
                        limiteCongErrores--
                    }
                    /* if ( limiteExpErrores > 0 && textosApoyoDevolucion[1].length > 1){
                        txtDevolucionExpErrores += textosApoyoDevolucion[1]
                        limiteExpErrores--
                    } */
                    //console.log({txtDevolucion})
                }
                //Inicializamos al proximo alumno.
                tmp_dato_materias.length = 0
                tmp_dato_materias_matricula.length = 0
                tmp_numero_materias = 0
                j = i+1
                auxiliar = i
                tmp_n_gir_ppal = datos[auxiliar]['numeroGIR']+'' //+'' // Guardamos el numero GIR de la linea 2 para comprobar que la materia es del alumno
                tmp_numero_competencias = 0
                tmp_dato_competencias.length = 0
                //Vamos a avanzar hasta que o bien se acabe el fichero, o bien tipo linea sea 2
                
                //console.log(datos)
                do{ 
                    //console.log('inicio del do')
                    //console.log(j)
                    let datoLinea = datos[j]   
                    //SOLO EVALUAMOS LAS LINEAS DE TIPO 4 (FALTARIAN LAS COMPETENCIAS)
                    if(datoLinea && datoLinea['tipo'] == 4){
                        //console.log('linea tipo 4')
                        
                        let n_GIR = datoLinea['numeroGIR']
                        //console.log({n_GIR}, {tmp_n_gir_ppal})
                        if( n_GIR != tmp_n_gir_ppal){
                            if(limiteCongErrores > 0){
                                txtDevolucion += '<br>Error de estructura, línea ' + j + ' con número GIR diferente al del alumno. No se puede valorar su congruencia.'
                                limiteCongErrores--
                            }
                        }else if(!datoLinea['valida']){
                            if(limiteCongErrores > 0){
                                txtDevolucion += 'Línea ' + j + ' no válida, no es posible evaluar su congruencia.<br>'
                                limiteCongErrores--
                            }
                        }else{
                            //Evaluamos si el tipoMatriculaMateria está entre los que hay que contar.
                            //"tipos_matricula_materia_efectivas" en parametros.
                            tipos_matricula_materia_efectivas = parametros['tipos_matricula_materia_efectivas']
                            tipo_matricula_materia = parseInt(datoLinea['tipo_matricula_materia'])
                            

                            if(tipos_matricula_materia_efectivas.includes(tipo_matricula_materia)){
                                //Es una matricula efectiva
                                //console.log('Es una matrícula efectiva')
                                tmp_numero_materias += 1
                                //Validamos si hay asignaturas con tipomatriculamateria 1 en otro curso.
                                if(datos[auxiliar]['curso'] != datoLinea['curso']){
                                    //Hay una asignatura de otro curso con tipoMatriculaMateria tipo 1 o convalidada...
                                    if(limiteCongErrores>0){
                                        txtDevolucion += '<br>ATENCIÓN, línea ' + j + ' con tipo de matrícula de materia efectiva ( ' +tipo_matricula_materia+ ' ) para asignatura ( ' + datoLinea['materia'] + ' ) de otro curso.'
                                        limiteCongErrores--
                                    }
                                }
                            }else if(tipo_matricula_materia == '4' && datos[auxiliar]['curso'] == datoLinea['curso'] ){
                                if(limiteCongErrores>0){
                                    txtDevolucion += '<br>ATENCIÓN, línea ' + j + ' con tipo de matrícula de materia efectiva ( ' +tipo_matricula_materia+ ' ) para asignatura ( ' + datoLinea['materia'] + ' ) en su mismo curso.'
                                    limiteCongErrores--
                                }
                            }
                            tmp_dato_materias.push(datoLinea["materia"])
                            //console.log(datoLinea);
                            let itemTMP = {
                                "materia" : datoLinea.materia,
                                "tipo_matricula" : datoLinea.tipo_matricula_materia,
                                "nota_1": datoLinea.nota_1,
                                "nota_2": datoLinea.nota_2,
                                "apto" : datoLinea.apto,
                                "nota_temporal_1" : datoLinea.tipo_calificacion_1 == 10,
                                "nota_temporal_2" : datoLinea.tipo_calificacion_2 == 10,
                                "apto_extraordinaria" : datoLinea.apto_extraordinaria
                            }
                            //console.log({itemTMP})
                            tmp_dato_materias_matricula.push(itemTMP)
                        }
                    }
                    if(datoLinea && datoLinea['tipo'] == 5){
                        //console.log('linea tipo 5')
                        //console.log(datoLinea)
                        let n_GIR = datoLinea['numeroGIR']
                        if( n_GIR != tmp_n_gir_ppal){
                            if(limiteCongErrores > 0){
                                txtDevolucion += '<br>Error de estructura, línea ' + j + ' con número GIR diferente al del alumno. No se puede valorar su congruencia.'
                                limiteCongErrores--
                            }
                        }else if(!datoLinea['valida']){
                            if(limiteCongErrores > 0){
                                txtDevolucion += 'Línea ' + j + ' no válida, no es posible evaluar su congruencia.<br>'
                                limiteCongErrores--
                            }
                        }else{
                            //Evaluamos las competencias. Evaluamos TODAS independientemente de exenciones y convalidaciones.
                            tmp_numero_competencias += 1
                            tmp_dato_competencias.push(datoLinea['competencia'])
                        }
                    }
                    
                    j++
                }while( j <= lineas_evaluadas && datos[j]['tipo'] != 2 )
                if(j==datos.length){
                    //Final de fichero
                    //console.log('Hemos llegado al final del fichero')
                    textoApoyoDevolucion = evaluarAlumnoMateria(i, datos[i], tmp_dato_materias, tmp_numero_materias, tmp_dato_materias_matricula,  tmp_numero_competencias, tmp_dato_competencias)
                    
                    if ( limiteCongErrores > 0 && textoApoyoDevolucion.length > 1){
                        txtDevolucion += textoApoyoDevolucion
                        limiteCongErrores--
                    }
                    /* if ( limiteExpErrores > 0 && textosApoyoDevolucion[1].length > 1){
                        txtDevolucionExpErrores += textosApoyoDevolucion[1]
                        limiteExpErrores--
                    } */
                }
                i=j-1 //Avanzamos todas las lineas de tipo 3, 4 y 5
            }

        }
    }
    //console.log(txtDevolucionExpErrores)
    if(txtDevolucion == ''){
        txtDevolucion = "No se han encontrado errores de incongruencia."
    }else{
        ficheroSinErrores = false
    }
    /* if(txtDevolucionExpErrores == ''){
        txtDevolucionExpErrores = "No hay errores con explicación."
    } 
    if ( limiteExpErrores <= 0 ){
        txtDevolucionExpErrores += '<h2>Por motivos de tamaño no se muestran más explicaciones a partir de este error ( '+ txtLimiteExpErrores +').</h2>'
    } */
    if ( limiteCongErrores <= 0){
        let txt_aux = '<h2>Límite de errores a mostrar (' + txtLimiteCongErrores + ') sobrepasado</h2>'
        txtDevolucion = txt_aux + txtDevolucion 
    }
    i
    return txtDevolucion //[txtDevolucion,txtDevolucionExpErrores]
}

const limpiarWeb = function(){
    //Función para despejar cuando cargamos otro fichero.
   //console.log('Limpiamos la web.. ')
    document.getElementById('informeFallos').innerHTML = ""
    document.getElementById('informeCongruencia').innerHTML = ""
    document.getElementById('informeEstructura').innerHTML = ""
    document.getElementById('informeResumen').innerHTML = ""
    document.getElementById("informeResultadoFinal").innerHTML = ""
    //document.getElementById('informeExpErrores').innerHTML = ""
    //document.getElementById('informeExpErroresFlot').innerHTML = ""
    
    //Inicializamos:
    limiteCongErrores = txtLimiteCongErrores
    limiteExpErrores = txtLimiteExpErrores

    ficheroSinErrores = true 
    
    parametros = {}

    CURSOACTUAL = ""
    CODIGOCENTRO = ""
    ERRORESESTRUCTURA = ""

    RESUMENASIGNATURAS = {
        "alumnosrepetidos"  : 0,
        "alumnosevaluados"  : [],
        "numerosalumnosrepetidos" : [],
        "alumnosXensenanza" : {},
        "materiasXensenanza": {}
    }
    datos_temporales_linea = {}
    datos_temporales_persona = {}

    datosEstructura = {
        'n_lineas_evaluadas'    : 0,        //las que contamos al recorrer el fichero
        'n_lineas_declaradas'   : 0,        //las que declara la primera línea del fichero   
        'n_errores'             : 0,        //Num. errores encontrados.
        'lineas'                : {},       //Guardaremos la estructura de tipos de líneas con su longitud
        'linea1'                : false,    //Marcador de existencia de línea 1,
        'txt_resumen_errores'   : ""        //Texto de resumen de errores de línea
    }
    contador_lineas = 0
    lineaAnterior = {}
    numero_GIR_temporal = ''
    tipoEnsenanzaActiva = ''
}

const validarFichero = function(fichero){
    //console.log('en validar Fichero')
    //console.log({ficheroSinErrores})
    //console.log(datosEstructura)
    var fileReader = new FileReader();
    fileReader.onload = (ev) =>{
        let cadena = ""
        //Vamos a ir linea por linea revisando parámetros. Revisaremos por un lado las lineas y por otro la estructura
        var lineas = fileReader.result.split('\n');
        let contador = 0

        for(let linea of lineas){
            if (linea.length >0 ){
                let errorLinea = '#'
                if(linea[0] != '#'){
                    errorLinea = lineaValida(linea)
                    if(errorLinea != 0)ficheroSinErrores = false
                    datosEstructura["n_lineas_evaluadas"] += 1
                    contador++
                }
                //Mostramos los datos de entrada. 
                cadena += "<a name='link"+ contador+"'> </a><pre>" + linea + "</pre>" 
                //Mostramos un mensaje de OK ó con el error de línea.
                //La función lineaValida devuelve un 0 si la línea está bien formada y 
                //un 1 si es error. También puede devolver un mensaje especifico de error que se añade al error de 'txt_error'
                if (errorLinea == '#'){
                    cadena += 'Línea NO EVALUADA'
                    //datosEstructura['lineas']
                }else if (errorLinea == 0){
                    cadena += "<span class='cefy_linea_valida'>línea " + contador + ": VALIDA</span>" 
                }else{
                    datosEstructura['n_errores'] += 1
                    ficheroSinErrores = false
                    
                    cadena += "<span class='cefy_linea_invalida'>línea " + contador + ": NO VALIDA</span> " + errorLinea
                    //Acumulamos los errores de las líneas para mostrarlos como resumen.
                    datosEstructura['txt_resumen_errores'] += "<a href='#link"+ contador + "'>línea " + contador + ": " + errorLinea + "</a><br>"
                }
            }
        }
        let textoEstructura = validarEstructura(fileReader.result)
        /* let devValidarCongruencia = validarCongruencia(fileReader.result)
        let textoCongruencia = devValidarCongruencia[0] */
        let textoCongruencia = validarCongruencia(fileReader.result)
        //let textoExpErrores = devValidarCongruencia[1]
        let textoAsignaturas = maquetarResumenAsignaturas()
                

        document.getElementById('informeFallos').innerHTML = cadena
        document.getElementById('informeCongruencia').innerHTML = textoCongruencia
        document.getElementById('informeEstructura').innerHTML = textoEstructura
        document.getElementById('informeResumen').innerHTML = textoAsignaturas
        //document.getElementById('informeExpErrores').innerHTML = textoExpErrores
        
        if (!ficheroSinErrores){
            document.getElementById("informeResultadoFinal").innerHTML = "Se han detectado errores en el fichero, por favor, revíselo antes de enviarlo. Muchas gracias."
        }

        /* Una vez llenos los warnings revisamos los cursos con warnings y mostarmos..*/
        warningAvisosMaterias(warningsMaterias,warningTemporalesFP);
    }
    fileReader.readAsText(fichero);
}

const cargarParametrosAjax = function(fichero){
    var http = new XMLHttpRequest();
    
    http.onreadystatechange = function(){
        //console.log(http.readyState)
        if(http.readyState == 4 && http.status == 200){
            let recibidos = JSON.parse(http.responseText)
            parametros = recibidos['p']
            //console.log({parametros})
            
            let version = document.getElementById('version_cefy_cheq_RA_js')
            version.innerHTML = '. V Parámetros: ' + parametros['version']
            validarFichero(fichero)
        }else{
            document.getElementById('informeFallos').innerHTML = "Cargando parámetros"
            document.getElementById('informeCongruencia').innerHTML = "Cargando parámetros"
            document.getElementById('informeEstructura').innerHTML = "Cargando parámetros"
            document.getElementById('informeResumen').innerHTML = "Cargando parámetros"
            //document.getElementById('informeExpErrores').innerHTML = "Cargando parámetros"
        }
    }
    //poner el open y el send
    //console.log(CHARAHelp_ruta_parametros)
    
    http.open("GET",CHARAHelp_ruta_parametros,false)
    http.setRequestHeader("Cache-Control","no-cache,no-store, must-revalidate")
    http.setRequestHeader("Pragma","no-cache")
    http.setRequestHeader("Expires","0")
    http.send(null)
}

const asignarOcultadores = function(){
    
    document.getElementById('informeEstructuraExt').onclick = function(ev){
        if(ev.target.id == 'informeEstructuraExt'){
            ev.target.classList.toggle('cefy_minimizar_resultados')
        }
    }
    document.getElementById('informeCongruenciaExt').onclick = function(ev){
        if(ev.target.id == 'informeCongruenciaExt'){
            ev.target.classList.toggle('cefy_minimizar_resultados')
        }
    }
    document.getElementById('informeResumenExt').onclick = function(ev){
        if(ev.target.id == 'informeResumenExt'){
            ev.target.classList.toggle('cefy_minimizar_resultados')
        }
    }
    /* document.getElementById('informeExpErroresExt').onclick = function(ev){
        if(ev.target.id == 'informeExpErroresExt'){
            ev.target.classList.toggle('cefy_minimizar_resultados')
        }
    } */
    document.getElementById('informeExpErroresFlot').onclick = function(ev){
        document.getElementById('informeExpErroresFlot').classList.toggle('cefy_ocultar_resultados')
        
    }
    
}

function cefy_chequeo_RA_uploadFile(ev){
    
    cad_res = ""
    //Deberíamos actualizar al cargar.
    //console.log('Inicio boton Cargar archivo')
    limpiarWeb()
    const fi = document.getElementById('fileupload');
    //alert('espera... ')
    //Cargamos la versión de JS
    //alert('vamos')
    //let version = document.getElementById('version_cefy_cheq_RA')
    //version.innerHTML += parametros['version'] + 'proboando'

    if (fi.files.length > 0) {
        for (let i = 0; i <= fi.files.length - 1; i++) {
            const fsize = fi.files.item(i).size;
            const tamanyo = Math.round((fsize / 1024));
            // The size of the file.
            if (tamanyo >= 50000) {
                alert(
                  "Fichero demasiado grande, límite 50mb");
            } else if (tamanyo <= 0) {
                alert(
                  "Fichero demasiado pequeño o vacio");
            } 
                //metemos en medio una carga de parametros para separarlos
                //validarFichero(fi.files.item(i))
                
                cargarParametrosAjax(fi.files.item(i))
                asignarOcultadores()
            }
        }
    }

window.onload = (event) => {

    //console.log('pa dentro...')
    let version = document.getElementById('version_cefy_cheq_RA')
    version.innerHTML += ', V JS: ' + v_js 
    let URLactual = String(window.location).toLowerCase()
    if(URLactual.indexOf('localhost')>=0){
        //PARA DESARROLLO USAMOS ESTA.
        //console.log('en desarrollo')
        
        CHARAHelp_ruta_parametros ='../wp-content/plugins/Cheq_RA_CEFYCA_WP_LOMLOE_LFP/public/js/parametros.json'
        //console.log(CHARAHelp_ruta_parametros)
    }
    //console.log(CHARAHelp_ruta_parametros)
    asignarOcultadores()
}

 