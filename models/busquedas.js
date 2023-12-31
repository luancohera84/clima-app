const fs = require('fs');
const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath    = './db/database.json';


    constructor(){
        this.leerDB();
    };

    get paramsMapBox() {
        return {
            'language'     : 'es',
            'access_token' : process.env.MAPBOX_KEY,
            'limit'        : 5
        };
    };

    get paramsWeather() {
        return {
            'lang'  : 'es',
            'appid' : process.env.OPENWEATHER_KEY,
            'units' : 'metric',
        };
    };

    get historialCapitalizado(){
        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras     = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join(' ');

        });
    };

    async cuidad( lugar = '' ){
        try {
            // Petición http
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapBox
            });

            const resp = await intance.get();
            
            return  resp.data.features.map( lugar => ({
                id     : lugar.id,
                nombre : lugar.place_name,
                lng    : lugar.center[0],
                lat    : lugar.center[1]
            })) ;  // Retorna los lugares
            
        } catch (error) {
            console.log('Error cuidad =>', error);
            return [];  // Retorna los lugares
        }

    };

    async climaLugar( lat, lon ){

        try {
            const intance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsWeather, lat, lon }
            });
            
            const resp = await intance.get();
            const { weather, main } = resp.data;
            return  {
                temparatura : main.temp,
                temMax      : main.temp_max,
                temMin      : main.temp_min,
                humeD       : main.humidity,
                desClima    : weather[0].description
            };  // Retorna los lugares
            return [];  // Retorna el clima
        } catch (error) {
            // console.log('Error climaLugar =>', error);
            return false;  // Retorna el clima
        }

    };

    agregarHistorial( lugar = '' ){
        // TODO: prevenir duplicados
        if ( this.historial.includes( lugar.toLocaleLowerCase() ) ) {
            return;
        }

        this.historial  = this.historial.splice(0,5);

        this.historial.unshift(  lugar.toLocaleLowerCase() );
        // Guardar en DB
        this.guardarDB();
    };

    guardarDB(){
        const payload = {
            historial : this.historial 
        }
        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
    };

    leerDB(){
        if ( fs.existsSync( this.dbPath ) ) {
            const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
            const data = JSON.parse(info);
            this.historial  = data.historial;
        }
    };


}

module.exports = Busquedas;