const version = "1.84"
var CHARAHelp_ruta_parametros ='../../wp-content/plugins/Cheq_RA_CEFYCA_WP_LOMLOE_LFP/public/js/parametros.json'

//PARA DESARROLLO USAR ESTA.
//const CHARAHelp_ruta_parametros ='../wp-content/plugins/Cheq_RA_CEFYCA_WP_LOMLOE_LFP/public/js/parametros.json'

const ensenanzas_FP_con_temporalidad = ['151','152','153','154','155'] // para estas enseñanzas mostramos el porcentaje de temporales en los warnings, ya que es un dato relevante a tener en cuenta.

const CHRAHelp_trad = function(valor, listado, p){
    texto = valor

    //falta un try
    texto += ' : '
    texto += p[listado][valor]


    return texto
}

const CHRAHelpDesplegarTodo = function(){
    let btn = document.getElementById('CHRAHelpBotonDesplegar')
    if(btn.innerText == 'Desplegar todo'){
        for (let elemento of document.getElementsByClassName('accordion-collapse')){
            elemento.classList.add('show')
        }
        btn.innerText = 'Ocultar todo'
    }else{
        for (let elemento of document.getElementsByClassName('accordion-collapse')){
            elemento.classList.remove('show')
        }
        btn.innerText = 'Desplegar todo'
    }

}

const CHRAHelpWarnings = function(p){
    //console.log(limites_suspensos_por_ensenanza)
    let txt = "<br><h4>Configuración de advertencias por enseñanza</h4>"
    txt += "<p>En esta sección se muestran los límites configurados para mostrar advertencias en el caso de que el porcentaje de promoción, aprobados, recuperan o temporales sea inferior al límite establecido para cada tipo de enseñanza. Para que se muestre la advertencia, además del porcentaje, debe haber un mínimo de estudiantes suspensos establecido en el parámetro 'Mínimo de estudiantes para mostrar aviso'.</p>"
    txt += '<div class="accordion-flush">'
    txt += '<div class="accordion-item" id="accordionWarnings">'
    //Ordenamos limites_suspensos_por_ensenanza, primero default y luego de menor a mayor id
    
    const limites_ordenados = Object.keys(limites_suspensos_por_ensenanza).sort((a, b) =>{
        if(a === "_default_") return -1; // "_default_" va al principio
        if(b === "_default_") return 1; // "_default_" va al principio
        return parseInt(a) - parseInt(b); // Ordena numéricamente por id de enseñanza
        return a.localeCompare(b); // Ordena alfabéticamente el resto
    });
    //console.log(limites_ordenados)
    for(let key of limites_ordenados){ 
        //console.log(key)
        if(key == "_default_"){
            auxiliar = 'Por defecto'
        }else{
            auxiliar =  CHRAHelp_trad(key,'denominacion_tipos_ensenanzas',p) 
        }
        txt += '<h2 class="accordion-header">' 
        txt += '<button class="accordion-button collapsed" style="background-color:#e0e0e0" '
        txt += 'type="button" data-bs-toggle="collapse" data-bs-target="#collapse_E_' + key +'" aria-expanded="false" aria-controls="collapse_E_' + key +'">' 
        txt += auxiliar  + '</button>'
        txt += '</h2>'
        txt += '<div id="collapse_E_' + key +'" class="accordion-collapse collapse" '
        txt += ' aria-labelledby="heading_E_' + key +'" data-bs-parent="#accordionLimMaterias">'
        txt += '<div class="accordion-body"><ul>'
        if(limites_suspensos_por_ensenanza[key]['minimo_para_warning']){
            txt += '<li><strong>Mínimo de estudiantes para mostrar aviso:</strong> ' + limites_suspensos_por_ensenanza[key]['minimo_para_warning'] + ' .</li>'
        }
        if(limites_suspensos_por_ensenanza[key]['minimo_promocion']){
            txt += '<li><strong>Porcentaje mínimo de estudiantes promocionados:</strong> ' + (limites_suspensos_por_ensenanza[key]['minimo_promocion'])*100 + ' % </li>'
        }
        if(limites_suspensos_por_ensenanza[key]['minimo_aprobados']){
            txt += '<li><strong>Porcentaje mínimo de estudiantes aptos:</strong> ' + (limites_suspensos_por_ensenanza[key]['minimo_aprobados'])*100 + ' % </li>'
        }
        if(limites_suspensos_por_ensenanza[key]['minimo_recuperan']){
            txt += '<li><strong>Porcentaje mínimo de estudiantes aptos en extraordinaria:</strong> ' + (limites_suspensos_por_ensenanza[key]['minimo_recuperan'])*100 + ' %</li>'
        }
        /*
            Para las enseñanzas de FP con temporalidad (151,152,153,154 y 155) 
            Mostramos el porcentaje máximo de temporales para que no salte el warning, 
            ya que en estas enseñanzas es un dato relevante a tener en cuenta.
        */
        if(ensenanzas_FP_con_temporalidad.includes(key)){
            txt += '<li><strong>Porcentaje máximo de estudiantes temporales:</strong> ' + (limites_suspensos_por_ensenanza[key]['maximo_temporales'])*100 + ' %</li>'
        }
        txt += '</ul></div></div>'
        
    }
    

    return txt
}

const CHRAHelp_pintarLimitesMaterias = function(p){
    let txt = ""
    txt += "<br><h4>Limites de congruencia de asignaturas</h4>"
    txt += '<div class="accordion-flush">'
    txt += '<div class="accordion-item" id="accordionLimMaterias">'
    for (let tipo_ens in p['ensenanzas_relacion_materias']){
        //console.log(tipo_ens)
        txt += '<h2 class="accordion-header">' 
        txt += '<button class="accordion-button collapsed" style="background-color:#e0e0e0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_L_' + tipo_ens +'" aria-expanded="false" aria-controls="collapse_L_' + tipo_ens +'">' 
        txt += CHRAHelp_trad(tipo_ens,'denominacion_tipos_ensenanzas',p) + '</button>'
        txt += '</h2>'
        txt += '<div id="collapse_L_' + tipo_ens +'" class="accordion-collapse collapse" aria-labelledby="heading_L_' + tipo_ens +'" data-bs-parent="#accordionLimMaterias">'
        txt += '<div class="accordion-body">'
        for(let ense in p['ensenanzas_relacion_materias'][tipo_ens]){
            
            txt += '<strong>' + CHRAHelp_trad(ense,'denominacion_ensenanzas',p) + '</strong>'
            for (let curso in p['ensenanzas_relacion_materias'][tipo_ens][ense]){
                txt += '<div class="accordion-item">'
                txt += '<h3 class="accordion-header">'
                txt += '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_L_' + tipo_ens + ense + curso + '" aria-expanded="false" aria-controls="collapse_L_' + tipo_ens + ense + curso + '">' 
                txt += 'Curso: ' + curso + ': </button>'
                txt += '</h3>'
                txt += '<div id="collapse_L_' + tipo_ens + ense + curso + '" class="accordion-collapse collapse" aria-labelledby="heading_L_' + tipo_ens + ense + curso +'">'
                txt += '<div class="accordion-body">'
                if(p['ensenanzas_limites'][tipo_ens][curso]){
                    txt += '<strong>Número de asignaturas del curso:</strong><ul>'
                    txt += '<li>'+ p['ensenanzas_limites'][tipo_ens][curso].join(', ')
                    txt += '</ul>'
                }
                if(p['ensenanzas_calificaciones'][tipo_ens]){
                    txt += '<strong>Calificaciones válidas para el tipo de enseñanza:</strong><ul>'
                    txt += '<li>'+ p['ensenanzas_calificaciones'][tipo_ens].join(', ')
                    txt += '</ul>'
                }
                if (p['ensenanzas_relacion_materias'][tipo_ens][ense][curso]['obligatorias']){
                    txt += '<strong>Asignaturas obligatorias:</strong><ul>'
                    for (let oblig of p['ensenanzas_relacion_materias'][tipo_ens][ense][curso]['obligatorias']){
                        txt += '<li>' + CHRAHelp_trad(oblig,'denominacion_asignaturas',p)
                    }
                    txt += '</ul>'
                }
                if (p['ensenanzas_relacion_materias'][tipo_ens][ense][curso]['incompatibilidad']){
                    txt += '<strong>Incompatibilidades:</strong><ul>'
                    for (let incompatibilidad of p['ensenanzas_relacion_materias'][tipo_ens][ense][curso]['incompatibilidad']){
                        txt += '<li>Mínimo: ' + incompatibilidad['min'] + ', máximo: ' + incompatibilidad['max'] + ' '
                        txt += incompatibilidad['error']
                        for(let asig of incompatibilidad['materias']){
                            txt += '<br>' + CHRAHelp_trad(asig,'denominacion_asignaturas',p)
                        }
                    }
                    txt += '</ul>'
                }
                txt += '</div></div></div>'
            }
        }
        txt += '</div></div>'
    }
    txt += '</div></div>'

    return txt
}


const CHRAHelp_pintarVariablesCruce = function(p,f){
    //Esta function muestra algunas variables de cruce con ayuda para depurar.
    let txt = ""

    // Si es raiz_tipo = mostramos por la key
    if (f['raiz_tipo']){
        let variable_cruce = p[f['raiz_tipo']]
        txt += '<li>Relación de tipos de matrícula<br><ul>'
        for(let tipo in f['tipo']){
            if (tipo == 0) {
                txt += '<li> 0 : [' + f['tipo'][tipo] + '] (valor por defecto si no se encuentra la enseñanza en la configuración)'
            }else{
                txt += '<li>'+ variable_cruce[tipo] + ' : [' + f['tipo'][tipo] + ']'
            }
        }
        txt += '</ul>'
        return txt
    }
    // Si es raiz_tipo = mostramos por la key
    if (f['definicion_tipo']){
        //console.log(f['definicion_tipo'])
        let variable_cruce = p[f['definicion_tipo']]
        
        txt += '<li>Relación de tipos de calificación particulares y sus enseñanzas<br><ul>'
        for(let key in f['var']){
            if (key == 0) {
                txt += '<li> Tipo de calificación 0: por defecto' 
            }else if (Array.isArray(f['var'][key])){
                
                txt += '<li> Tipo de calificación ' + key
                txt += '<ul>'
                for(let i of f['var'][key]){
                    txt += '<li> '+variable_cruce[i] 
                }
                txt += '</ul>'
            }else{
                txt += '<li> Tipo de calificación '+ key ;
                txt += '<ul>'
                txt += '<li> '+variable_cruce[f['var'][key]] 
                txt += '</ul>'
            }
        }
        txt += '</ul>'
        return txt
    }


    
}

const CHRAHelp_pintarMateriasAsignaturas = function(p){
    let txt =""
    txt += '<br><h4>Materias por enseñanza y tipo</h4>'
    txt += '<div class="accordion-flush">'
    txt += '<div class="accordion-item" id="accordionMatAsignaturas">'
    for (let tipo_ens in p['ensenanzas_asignaturas']){
        txt += '<h2 class="accordion-header">' 
        txt += '<button class="accordion-button collapsed"  style="background-color:#e0e0e0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse' + tipo_ens +'" aria-expanded="false" aria-controls="collapse' + tipo_ens +'">' 
        txt += CHRAHelp_trad(tipo_ens,'denominacion_tipos_ensenanzas',p) + '</button>'
        txt += '</h2>'
        txt += '<div id="collapse' + tipo_ens +'" class="accordion-collapse collapse" aria-labelledby="heading' + tipo_ens +'" data-bs-parent="#accordionMatAsignaturas">'
        txt += '<div class="accordion-body">'

        for(let ense in p['ensenanzas_asignaturas'][tipo_ens]){
            txt += '<div class="accordion-item">'
            txt += '<h3 class="accordion-header">'
            txt += '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse' + tipo_ens + ense +'" aria-expanded="false" aria-controls="collapse' + tipo_ens + ense +'">' 
            txt += CHRAHelp_trad(ense,'denominacion_ensenanzas',p) + '</button>'
            txt += '</h3>'
            txt += '<div id="collapse' + tipo_ens + ense + '" class="accordion-collapse collapse" aria-labelledby="heading' + tipo_ens + ense + '">'
            txt += '<div class="accordion-body">'
            for (let curso in p['ensenanzas_asignaturas'][tipo_ens][ense]){
                txt += '<h6>Curso: ' + curso + ', asignaturas: </h6><ul>'
                for(let asig of p['ensenanzas_asignaturas'][tipo_ens][ense][curso]){
                    txt += '<li>' + CHRAHelp_trad(asig,'denominacion_asignaturas',p)
                }
                txt += '</ul>'
            }
            txt += '</div></div></div>'
        }
        txt += '</div></div>'
    }
    txt += '</div></div>'
    return txt
}

const CHRAHelp_mostrarErrores = function(parametros_rec){
    let txt = ""
    let auxiliar = ""
    txt += "<br><h4>Listado de comprobaciones en líneas por tipo de línea del archivo.</h4>"
    txt += '<div class="accordion-flush">'
    txt += '<div class="accordion-item" id="accordionErrores">'
    for (let key in validacion){
        if(key == 0){
            auxiliar = 'Validación general'
        }else{
            auxiliar = 'Validación específica líneas de tipo: ' + key 
        }
        txt += '<h2 class="accordion-header">' 
        txt += '<button class="accordion-button collapsed" style="background-color:#e0e0e0" '
        txt += 'type="button" data-bs-toggle="collapse" data-bs-target="#collapse_E_' + key +'" aria-expanded="false" aria-controls="collapse_E_' + key +'">' 
        txt += auxiliar  + '</button>'
        txt += '</h2>'
        txt += '<div id="collapse_E_' + key +'" class="accordion-collapse collapse" '
        txt += ' aria-labelledby="heading_E_' + key +'" data-bs-parent="#accordionLimMaterias">'
        txt += '<div class="accordion-body">'
        for (let f of validacion[key]){
            //console.log(f,key)
            //console.log(tipos_matricula_materia);
            txt += '<ul><li><strong>' + f['txt_error'] +'</strong>'
            txt += '<li>Caracter inicial: ' + f['inicio'] 
            txt += '<li>Caracteres del dato: ' + f['long'] 
            if(f['raiz_tipo'] || f['definicion_tipo']){
                txt += CHRAHelp_pintarVariablesCruce(parametros_rec,f)
            }else if (Array.isArray(f['tipo'])){
                if(f['tipo'].length <=0){
                    txt += '<li>No hay parámetro de validación.'
                }else{
                    txt += '<li>Validación según los valores: '
                    txt += f['tipo'].join(' - ')
                }
            }else if(f['tipo'] instanceof RegExp){
                txt += '<li>Validación por la expresión regular: ' + f['tipo'] 
            }else  if(f['tipo'] instanceof Object){
                //Si hay un objeto cruzado con raiz_tipo o definicicon_tipo mostramos los valores de ese objeto.
                txt += '<li>Validación por los siguientes parámetros: <ul>'
                for(let k in f['tipo']){
                    txt += '<li>' + k + ': ' + f['tipo'][k]
                }
                txt += '</ul>'
                
            }else if(f['tipo'] == ""){
                txt += '<li>No hay parámetro de validación.'
            }else{
                txt += '<li>Validación: ' + f['tipo'] 
            }
            
            if(f['cruce']){
                txt += '<li>Validación por cruce con otros campos. ' 
            }
            if(f['opcion']){
                txt += '<li>Campo opcional' 
            } 
            txt += '</ul>'
        }
        txt += '</div></div>'
    }
    
    return txt
}

const CHRAHelp_pintarAyuda = function(parametros_rec){
    //console.log(parametros_rec)
    let textoAyuda = "<h3>Parámetros usados en el plugin de Resultados Académicos</h3>"
    textoAyuda += "<p> Versión del plugin: v" + version + ", versión de parámetros: " + parametros_rec['version']   + "</p>"; 
    textoAyuda += "<div style='text-align:center;'><button id='CHRAHelpBotonDesplegar' onclick='CHRAHelpDesplegarTodo();'>Desplegar todo</button></div>"

    textoAyuda += CHRAHelp_pintarLimitesMaterias(parametros_rec)
    textoAyuda += CHRAHelpWarnings(parametros_rec)
    textoAyuda += CHRAHelp_mostrarErrores(parametros_rec)
    textoAyuda += CHRAHelp_pintarMateriasAsignaturas(parametros_rec)  // "ensenanzas_asignaturas"
    
    document.getElementById('Cheq_RA_CEFYCA_WP_HELP').innerHTML = textoAyuda
}

const CHRAhelp_cargarAjax = function(){
    
    let http = new XMLHttpRequest();
    http.onreadystatechange = function(){
        if(http.readyState == 4 && http.status == 200){
            let recibido = JSON.parse(http.responseText)
            CHRAHelp_pintarAyuda(recibido['p'])
        }else{
            //console.log('Estamos en ello')
        }
    }
    http.open('GET',CHARAHelp_ruta_parametros,false)
    http.send(null)

}

window.addEventListener("load", (event) => {
    let URLactual = String(window.location).toLowerCase()
    if(URLactual.indexOf('localhost')>=0){
        //PARA DESARROLLO USAMOS ESTA.
        //console.log('en desarrollo')
        
        CHARAHelp_ruta_parametros ='../wp-content/plugins/Cheq_RA_CEFYCA_WP_LOMLOE_LFP/public/js/parametros.json'
        //console.log(CHARAHelp_ruta_parametros)
    }
    CHRAhelp_cargarAjax();
  });

