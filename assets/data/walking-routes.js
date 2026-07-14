const routeData = {
    "1": {
      title: "El Corazón Clásico",
      tags: ["URBANA", "2.5 KM"],
      dist: "2.5 km",
      time: "45 min",
      start: "Domplein",
      desc: "<p>Comenzamos a los pies de la imponente <strong>Domtoren</strong>, la torre de iglesia más alta de los Países Bajos. Esta ruta te lleva por el alma de Utrecht: sus canales hundidos. Bajaremos a los muelles del <strong>Oudegracht</strong> para caminar a ras del agua, descubriendo las antiguas bodegas medievales que hoy son acogedores restaurantes y talleres.</p><p>A lo largo del camino, pasarás por el ayuntamiento histórico, puentes con esculturas y la animada plaza de Neude. Es la introducción perfecta a la ciudad.</p>"
    },
    "2": {
      title: "Ruta de los Museos",
      tags: ["CULTURAL", "3 KM"],
      dist: "3.0 km",
      time: "1 hora",
      start: "Museum Speelklok",
      desc: "<p>Utrecht tiene una oferta de museos extraordinaria. Esta ruta zigzaguea por el llamado <em>Museumkwartier</em> (Barrio de los Museos). Iniciamos con el curioso <strong>Museum Speelklok</strong> (relojes y cajas de música), para adentrarnos en callejuelas serenas del sur del casco antiguo.</p><p>Pasaremos por el museo del ferrocarril (Spoorwegmuseum) y culminaremos en el recinto del <strong>Centraal Museum</strong> y el museo Miffy. Esta zona es muy tranquila, llena de patios escondidos (hofjes) y encanto histórico.</p>"
    },
    "3": {
      title: "Paseo Verde: Wilhelminapark",
      tags: ["PARQUES", "4 KM"],
      dist: "4.0 km",
      time: "1h 15m",
      start: "Maliebaan",
      desc: "<p>Hacia el este del centro, el paisaje cambia. Caminaremos a lo largo de <strong>Maliebaan</strong>, un ancho bulevar flanqueado por mansiones señoriales del siglo XIX, hasta llegar al gran pulmón verde de la ciudad: el <strong>Wilhelminapark</strong>.</p><p>Este parque de diseño paisajista inglés es ideal para hacer un picnic, observar a los estudiantes relajándose al sol y disfrutar de los monumentos históricos que esconde en su interior.</p>"
    },
    "4": {
      title: "Naturaleza en Amelisweerd",
      tags: ["EXTRARRADIO", "7 KM"],
      dist: "7.0 km",
      time: "2 horas",
      start: "Ledig Erf",
      desc: "<p>Para los que buscan escapar del asfalto. Comenzamos en el sur del anillo de canales y seguimos el sinuoso curso del río <strong>Kromme Rijn</strong>. Un sendero de tierra te aleja gradualmente de la ciudad hacia los densos bosques de las fincas de <strong>Oud-Amelisweerd</strong> y Nieuw-Amelisweerd.</p><p>El gran premio te espera a mitad de camino: una parada obligatoria en <em>De Veldkeuken</em>, una panadería artesanal en medio del bosque con los mejores bollos de canela ecológicos de la región.</p>"
    },
    "5": {
      title: "Ruta De Stijl",
      tags: ["ARQUITECTURA", "3.5 KM"],
      dist: "3.5 km",
      time: "1 hora",
      start: "Oudegracht",
      desc: "<p>Un tributo a la vanguardia. Utrecht es cuna de Gerrit Rietveld, figura clave del movimiento De Stijl. La ruta conecta diferentes obras y placas conmemorativas por la ciudad, saliendo del centro hacia el este.</p><p>El colofón arquitectónico es la famosa <strong>Rietveld Schröderhuis</strong>, Patrimonio de la Humanidad por la UNESCO. Ver sus líneas puras, colores primarios y distribución rompedora al final de una calle de casas tradicionales de los años 20 es una experiencia fascinante.</p>"
    },
    "6": {
      title: "Los Canales Exteriores",
      tags: ["CIRCULAR", "6 KM"],
      dist: "6.0 km",
      time: "1h 30m",
      start: "Vredenburg",
      desc: "<p>Utrecht restauró en 2020 el foso de agua defensivo que rodeaba su casco histórico, un hito del urbanismo moderno (reemplazando una autopista). Esta ruta circular completa sigue íntegramente el <strong>Zocherpark</strong>, el parque lineal ondulante que abraza el anillo de agua (Singel).</p><p>Verás antiguas puertas de la muralla, observatorios astronómicos y patos nidificando. Al no tener semáforos en la mayor parte, es la ruta predilecta de los corredores matutinos.</p>"
    },
    "7": {
      title: "Sabores del Mundo",
      tags: ["DIVERSIDAD", "2 KM"],
      dist: "2.0 km",
      time: "40 min",
      start: "Lombok",
      desc: "<p>Detrás de la Estación Central se encuentra Lombok, el barrio más multicultural de Utrecht. La arteria principal, la <strong>Kanaalstraat</strong>, está rebosante de fruterías coloridas, panaderías turcas y supermercados asiáticos.</p><p>Además del ambiente bullicioso, la ruta te desvía hacia el agua para descubrir un secreto muy bien guardado: el <strong>Houtzaagmolen De Ster</strong>, un espectacular aserradero de madera tradicional con un molino de viento, aún en funcionamiento y rodeado de un pequeño parque con animales.</p>"
    },
    "8": {
      title: "Science Park & Botánico",
      tags: ["ESTUDIANTIL", "5 KM"],
      dist: "5.0 km",
      time: "1h 15m",
      start: "Rijnsweerd",
      desc: "<p>Descubre el Utrecht del conocimiento. Al este se ubica el <strong>Utrecht Science Park</strong>, el campus universitario más grande de Países Bajos. El paseo es un contraste visual inmenso: arquitectura contemporánea, como el famoso edificio Educatorium de Rem Koolhaas, edificios brutalistas de hormigón y modernas bibliotecas de cristal.</p><p>La guinda del pastel es perderse en el inmenso <strong>Jardín Botánico</strong> de la universidad (Oude Hortus), repleto de especies raras, un jardín de rocas y grandes invernaderos.</p>"
    },
    "9": {
      title: "Historia Romana",
      tags: ["HISTÓRICA", "8 KM"],
      dist: "8.0 km",
      time: "2h 30m",
      start: "Máximapark",
      desc: "<p>Utrecht nació como un fuerte romano en la frontera del Imperio (el Limes). Esta ruta se aleja al moderno barrio de Leidsche Rijn, donde el pasado emerge entre la arquitectura del siglo XXI.</p><p>Recorrerás el gigantesco y diseñado <strong>Máximapark</strong> hasta llegar al Castellum Hoge Woerd, una reconstrucción a escala real de un antiguo fuerte romano que alberga en su interior museos, un teatro y establos. Es un contraste único entre la ingeniería holandesa moderna y sus raíces de hace dos milenios.</p>"
    },
    "10": {
      title: "Trajectum Lumen",
      tags: ["NOCTURNA", "4.5 KM"],
      dist: "4.5 km",
      time: "1h 30m",
      start: "Vredenburgplein",
      desc: "<p>Utrecht se transforma tras la puesta del sol gracias a <strong>Trajectum Lumen</strong>, una exposición permanente de luz a lo largo de las calles del casco antiguo. Siguiendo las marcas luminosas incrustadas en el suelo como gotas a la deriva, descubrirás proyecciones artísticas escondidas debajo de los puentes, iglesias que cambian de color sutilmente y callejones oscuros que cobran vida.</p><p>Un paseo mágico que demuestra cómo el diseño urbano puede usar la luz no solo para seguridad, sino para crear arte y atmósfera en el corazón de la ciudad.</p>"
    }
  };
