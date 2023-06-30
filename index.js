require('dotenv').config();
const { leerInput, inquirerMenu, pausa, listadoLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");


const main = async () => {

    const busqueda = new Busquedas();
    let opt;
    
    do {
        // Imprimir el menú
        opt = await inquirerMenu();

        switch( opt ){

            case 1:
                // Mostrarmensaje
                const terminoBusqueda = await leerInput('Cuidad: '); 
                // Buscar lugar
                const lugares = await busqueda.cuidad( terminoBusqueda );
                // Seleccionar el lugar
                const idLugar = await listadoLugares( lugares );
                if ( idLugar === 0 ) continue;
                const lugarSel = lugares.find( lugar => lugar.id === idLugar );
                // Guardar en DB
                busqueda.agregarHistorial( lugarSel.nombre );
                // Clima
                const clima  = await busqueda.climaLugar( lugarSel.lat, lugarSel.lng);
                // Mostrar resultados
                if ( clima ) {
                    console.log('\nInformación de la cuidad\n'.green);
                    console.log('Cuidad:', lugarSel.nombre);
                    console.log('Lat:', lugarSel.lat);
                    console.log('Lng:', lugarSel.lng);
                    console.log('Temperatura:',clima.temparatura, 'Grados celsius'.green);
                    console.log('Mínima:', clima.temMin, 'Grados celsius'.green);
                    console.log('Maxima:', clima.temMax, 'Grados celsius'.green);
                    console.log('Humedad:', clima.humeD, '%'.green);
                    console.log('Estado clima:', clima.desClima.toString().green);
                    
                } else {
                    console.log('\nInformación de la cuidad\n'.green);
                    console.log('No se encontro información para la ciudad seleccionada'.red);
                }

            break;

            case 2:
                // Historial
                busqueda.historialCapitalizado.forEach( ( lugar, i ) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log( ` ${ idx } ${ lugar }` );
                });
            break;

        }

        if( opt !== 0 ) await pausa();
        
    } while ( opt !== 0 );

};

main();