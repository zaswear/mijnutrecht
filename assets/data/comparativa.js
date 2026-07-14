const COMPARACIONES = {
      oudegracht: {
        titulo: "Ayer y Hoy en el Oudegracht",
        desc: "Desliza el tirador central de izquierda a derecha para comparar el Oudegracht de Utrecht en 1900 frente a la actualidad.",
        imgModern: "fotos/oudegracht_modern.jpg",
        imgOld: "fotos/oudegracht_old.jpg",
        altModern: "Utrecht Moderno - Oudegracht",
        altOld: "Utrecht 1900 - Oudegracht",
        caption: "La foto histórica (izquierda) muestra el bullicio fluvial del canal Oudegracht en 1900, con barcazas de carga. A la derecha, la vista actual del mismo canal, convertido en un animado paseo lleno de terrazas y arbolado."
      },
      domplein: {
        titulo: "El Domplein y la Nave Perdida",
        desc: "Compara la plaza actual con la catedral unida a su gran torre antes de la histórica tormenta de 1674.",
        imgModern: "fotos/domplein_modern.jpg",
        imgOld: "fotos/domplein_old.jpg",
        altModern: "Plaza Domplein actual",
        altOld: "Catedral de Utrecht antes de 1674",
        caption: "El grabado antiguo (izquierda) reconstruye la gran catedral gótica antes del tornado de 1674, con la nave central uniendo la torre y el coro. A la derecha, la plaza Domplein actual con la torre totalmente aislada."
      },
      vredenburg: {
        titulo: "Transformación de Vredenburg",
        desc: "Compara el mercado de ganado y tranvías antiguos con el actual distrito comercial futurista de Hoog Catharijne.",
        imgModern: "fotos/vredenburg_modern.jpg",
        imgOld: "fotos/vredenburg_old.jpg",
        altModern: "Vredenburg moderno",
        altOld: "Vredenburg en los años 1920",
        caption: "En 1920 (izquierda), la plaza Vredenburg albergaba mercados tradicionales de ganado y los primeros tranvías. Hoy (derecha), es la puerta de entrada a Hoog Catharijne, el complejo de tiendas e intercambiador de transportes más grande de los Países Bajos."
      }
    };

const UV_VS = {
      car: { rows: [
        { k: 'Espacio para personas', v: '30%', w: 30, c: '#c81919' },
        { k: 'Zonas verdes y árboles', v: 'Escasas', w: 25, c: '#c81919' },
        { k: 'Seguridad vial', v: 'Siniestralidad alta', w: 35, c: '#c81919' },
        { k: 'Aire y silencio', v: 'Ruido y humos', w: 30, c: '#c81919' },
      ]},
      utr: { rows: [
        { k: 'Espacio para personas', v: '70%', w: 70, c: '#4E6E58' },
        { k: 'Zonas verdes y árboles', v: 'Abundantes', w: 85, c: '#4E6E58' },
        { k: 'Seguridad vial', v: 'De las más bajas del mundo', w: 95, c: '#4E6E58' },
        { k: 'Aire y silencio', v: 'Limpio y tranquilo', w: 90, c: '#4E6E58' },
      ]},
    };