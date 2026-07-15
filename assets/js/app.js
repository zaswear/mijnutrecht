// ── SPA NAVIGATION LÓGICA ──
    let activeTab = 'guia';
    
    function switchTab(tabId) {
      activeTab = tabId;
      
      // Ocultar todas las secciones
      document.querySelectorAll('.tab-section').forEach(sec => {
        sec.classList.add('hidden');
      });
      
      // Mostrar sección activa
      const activeSec = document.getElementById(`sec-${tabId}`);
      if (activeSec) {
        activeSec.classList.remove('hidden');
      }
      
      // Sincronizar clases activas en los enlaces de navegación (Top y Bottom)
      document.querySelectorAll('.nav-link').forEach(link => {
        const isCurrent = link.dataset.tab === tabId;
        
        // Estilos enlaces top escritorio
        if (link.classList.contains('px-2')) {
          link.classList.toggle('text-utrecht-red', isCurrent);
          link.classList.toggle('border-b-2', isCurrent);
          link.classList.toggle('border-utrecht-red', isCurrent);
          link.classList.toggle('text-slate-600', !isCurrent);
        }
        
        // Estilos botones bottom móvil
        if (link.classList.contains('flex-col')) {
          link.classList.toggle('text-utrecht-red', isCurrent);
          link.classList.toggle('bg-slate-100', isCurrent);
          link.classList.toggle('text-slate-500', !isCurrent);
        }
      });
      
      // Ajustar dimensiones del mapa Leaflet cuando se activa su pestaña
      if (tabId === 'mapa' && map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 120);
      }
      
      // Scroll hacia arriba suave
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ── COMPARADOR AYER Y HOY LÓGICA ──
    const slider = document.getElementById('comparison-slider');
    const beforeImg = document.getElementById('before-img');
    const handle = document.getElementById('slider-handle');
    
    if (slider && beforeImg && handle) {
      slider.addEventListener('input', (e) => {
        const val = e.target.value;
        beforeImg.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
        handle.style.left = `${val}%`;
      });
    }

    

    function changeComparison(key) {
      const data = COMPARACIONES[key];
      if (!data) return;

      // Actualizar textos
      document.querySelector('#sec-slider h2').textContent = data.titulo;
      document.querySelector('#sec-slider p').textContent = data.desc;
      document.getElementById('comparison-caption').textContent = data.caption;

      // Actualizar imágenes
      const modernImg = document.getElementById('modern-img');
      const beforeImg = document.getElementById('before-img');
      
      if (modernImg && beforeImg) {
        modernImg.src = data.imgModern;
        modernImg.alt = data.altModern;
        
        beforeImg.src = data.imgOld;
        beforeImg.alt = data.altOld;
      }

      // Reiniciar slider
      const slider = document.getElementById('comparison-slider');
      const handle = document.getElementById('slider-handle');
      const targetBeforeImg = document.getElementById('before-img');
      if (slider && targetBeforeImg && handle) {
        slider.value = 50;
        targetBeforeImg.style.clipPath = 'inset(0 50% 0 0)';
        handle.style.left = '50%';
      }

      // Actualizar botones
      document.querySelectorAll('.comp-btn').forEach(btn => {
        const isCurrent = btn.id === `btn-comp-${key}`;
        btn.classList.toggle('active', isCurrent);
        
        if (isCurrent) {
          btn.classList.remove('bg-white', 'text-slate-600', 'border-slate-200', 'hover:bg-slate-50');
          btn.classList.add('bg-utrecht-red', 'text-white', 'border-utrecht-red', 'shadow-sm');
        } else {
          btn.classList.remove('bg-utrecht-red', 'text-white', 'border-utrecht-red', 'shadow-sm');
          btn.classList.add('bg-white', 'text-slate-600', 'border-slate-200', 'hover:bg-slate-50');
        }
      });
    }

    // ── DICCIONARIO DE NEERLANDÉS DATOS Y LÓGICA ──
    

    function renderGlosario(filtro = '') {
      const grid = document.getElementById('glosario-grid');
      if (!grid) return;
      grid.innerHTML = '';
      
      const filtrado = GLOSARIO.filter(item => {
        const query = filtro.toLowerCase();
        return item.palabra.toLowerCase().includes(query) || 
               item.trad.toLowerCase().includes(query) ||
               item.desc.toLowerCase().includes(query);
      });
      
      if (!filtrado.length) {
        grid.innerHTML = `<div class="col-span-2 text-center py-8 text-slate-400 text-sm">No se encontraron resultados para "${filtro}"</div>`;
        return;
      }
      
      filtrado.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-slate-50 p-5 rounded-2xl border border-slate-200/60 premium-card';
        card.innerHTML = `
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <h3 class="font-extrabold text-xl text-utrecht-red">${item.palabra}</h3>
              <span class="text-xs font-mono text-slate-400 italic">${item.pron}</span>
            </div>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-300 text-slate-500 bg-white">${item.tipo}</span>
          </div>
          <p class="font-bold text-xs text-utrecht-navy mb-2">➡️ ${item.trad}</p>
          <p class="text-xs text-slate-600 leading-relaxed">${item.desc}</p>
        `;
        grid.appendChild(card);
      });
    }

    document.getElementById('glosario-search')?.addEventListener('input', (e) => {
      renderGlosario(e.target.value);
    });
    
    // Render glosario inicial
    renderGlosario();

    // ── MAPA INTERACTIVO LÓGICA ──
    const map = L.map('map').setView([52.0907, 5.1214], 14);

    // Usamos el set de mapas moderno de CartoDB Voyager en lugar del básico de OpenStreetMap
    const cartoAttr = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
    const dayTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: cartoAttr, maxZoom: 19,
    });
    const nightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: cartoAttr, maxZoom: 19,
    });
    dayTiles.addTo(map);

    // Modo noche del mapa: alterna tiles claros/oscuros con un control propio.
    let isNight = false;
    const NightControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const btn = L.DomUtil.create('button', 'leaflet-bar');
        btn.type = 'button';
        btn.title = 'Modo noche del mapa';
        btn.setAttribute('aria-label', 'Modo noche del mapa');
        btn.style.cssText = 'width:34px;height:34px;background:#fff;border:none;cursor:pointer;font-size:16px;line-height:34px;padding:0;';
        btn.textContent = '🌙';
        L.DomEvent.on(btn, 'click', (e) => {
          L.DomEvent.stop(e);
          isNight = !isNight;
          if (isNight) { map.removeLayer(dayTiles); nightTiles.addTo(map); }
          else { map.removeLayer(nightTiles); dayTiles.addTo(map); }
          btn.textContent = isNight ? '☀️' : '🌙';
          btn.title = isNight ? 'Modo día del mapa' : 'Modo noche del mapa';
        });
        return btn;
      },
    });
    map.addControl(new NightControl());

    const colorMap = {
      green:  '#16a34a',
      red:    '#dc2626',
      blue:   '#2563eb',
      orange: '#ea580c',
    };

    // Glifo Phosphor por color/categoría del punto
    const glyphMap = {
      green:  'ph-fork-knife',   // Recomendado (gastronomía)
      orange: 'ph-star',         // Imprescindible (monumentos)
      blue:   'ph-tree',         // Parques y canales
      red:    'ph-thumbs-down',  // Evitar
    };

    let allMarkers = [];

    function makeIcon(color) {
      const bg = colorMap[color] || '#666';
      const glyph = glyphMap[color] || 'ph-map-pin';
      return L.divIcon({
        className: '',
        html: `<div style="width:26px; height:26px; background:${bg}; border:2.5px solid white; border-radius:50%; box-shadow:0 1px 4px rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center;">
                 <i class="ph-fill ${glyph}" style="color:#fff; font-size:15px; line-height:1;"></i>
               </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13],
      });
    }

    fetch('./maps/puntos.json')
      .then(r => r.json())
      .then(data => {
        const nPuntosEl = document.getElementById('n-puntos');
        if (nPuntosEl) nPuntosEl.textContent = data.length;

        data.forEach(lugar => {
          const gmapsLink = lugar.google_maps_url
            ? `<a href="${lugar.google_maps_url}" target="_blank" rel="noopener"
                 style="display:inline-block;margin-top:.5rem;font-size:.75rem;color:#16a34a;font-weight:600;text-decoration:none">
                 🗺 Ver en Google Maps →</a>`
            : '';
          const tipoStr = lugar.tipo
            ? (Array.isArray(lugar.tipo) ? lugar.tipo.join(' · ') : lugar.tipo).toUpperCase()
            : '';
          const descripcion = lugar.descripcion
            ? `<p style="margin:.3rem 0 .2rem;font-size:.82rem;color:#555;font-style:italic">${lugar.descripcion}</p>`
            : '';
          const marker = L.marker(lugar.coordenadas, { icon: makeIcon(lugar.color) })
            .addTo(map)
            .bindPopup(`
              <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:190px; max-width:240px">
                <strong style="font-size:0.95rem;color:#0F172A">${lugar.nombre}</strong>
                ${descripcion}
                <p style="margin:.3rem 0 .1rem;font-size:.8rem;color:#475569">${lugar.nota}</p>
                ${gmapsLink}
                ${tipoStr ? `<div style="margin-top:.5rem;font-size:.6rem;color:#94a3b8;letter-spacing:.08em;font-weight:700">${tipoStr}</div>` : ''}
              </div>
            `);
          marker._color = lugar.color;
          allMarkers.push(marker);
        });
      })
      .catch(() => console.warn('No se pudo cargar maps/puntos.json'));

    // Filtros del mapa
    document.querySelectorAll('#filtros .filtro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#filtros .filtro-btn').forEach(b => b.classList.remove('active', 'ring-2', 'ring-utrecht-navy/40'));
        btn.classList.add('active', 'ring-2', 'ring-utrecht-navy/40');
        const color = btn.dataset.color;
        allMarkers.forEach(m => {
          if (color === 'all' || m._color === color) {
            m.addTo(map);
          } else {
            m.remove();
          }
        });
      });
    });

    // ── RUTAS GPX LÓGICA ──
    const rutaColors = ['#ea580c','#2563eb','#16a34a','#9333ea','#e11d48'];
    let rutaLayers = {};

    fetch('./rutas/index.json')
      .then(r => r.json())
      .then(rutas => {
        const lista = document.getElementById('rutas-list');
        lista.innerHTML = '';
        const nRutasEl = document.getElementById('n-rutas');
        if (nRutasEl) nRutasEl.textContent = rutas.length;

        rutas.forEach((ruta, i) => {
          const color = rutaColors[i % rutaColors.length];
          const card = document.createElement('div');
          card.className = 'bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-1 cursor-pointer transition-shadow hover:shadow-sm';
          card.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="text-xl">${ruta.emoji || '🚴'}</span>
              <p class="font-bold text-xs text-utrecht-navy">${ruta.nombre}</p>
            </div>
            <p class="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-0.5"><i class="ph ph-ruler"></i>${ruta.distancia}</span>
              <span class="inline-flex items-center gap-0.5"><i class="ph ph-clock"></i>${ruta.duracion}</span>
              <span class="inline-flex items-center gap-0.5"><i class="ph ph-mountains"></i>${ruta.dificultad}</span>
            </p>
            <p class="text-[11px] text-slate-600 mt-1 leading-normal mb-2">${ruta.descripcion}</p>
            <div class="flex gap-2 items-center flex-wrap mt-auto">
              <button onclick="event.stopPropagation(); toggleRuta('${ruta.archivo}', '${color}', this)"
                class="text-[10px] font-bold px-3 py-1 rounded-full border-2 transition-all inline-flex items-center gap-1"
                style="border-color:${color}; color:${color}">
                <i class="ph ph-map-trifold"></i> Ver en mapa
              </button>
              ${ruta.archivo
                ? `<a href="rutas/${ruta.archivo}" class="text-[10px] text-utrecht-brick font-bold hover:underline inline-flex items-center gap-0.5"><i class="ph ph-download-simple"></i> GPX</a>`
                : `<a href="${ruta.fuente}" target="_blank" rel="noopener" class="text-[10px] text-utrecht-brick font-bold hover:underline inline-flex items-center gap-0.5">Ver ruta <i class="ph ph-arrow-up-right"></i></a>`}
            </div>`;
          lista.appendChild(card);

          // Cargar capa GPX oculta por defecto en el mapa
          if (ruta.archivo) cargarGPX(ruta.archivo, color);
        });
      })
      .catch(() => {
        document.getElementById('rutas-list').innerHTML = `
          <div class="text-center py-6 text-slate-400 text-xs">
            Sin rutas en bici configuradas.
          </div>`;
      });

    function cargarGPX(archivo, color) {
      if (rutaLayers[archivo]) return;
      new L.GPX(`rutas/${archivo}`, {
        async: true,
        polyline_options: { color, weight: 4, opacity: .85 },
        marker_options: { startIconUrl: null, endIconUrl: null, shadowUrl: null }
      }).on('loaded', function(e) {
        rutaLayers[archivo] = e.target;
        e.target.remove(); // oculto inicialmente
      }).addTo(map);
    }

    function toggleRuta(archivo, color, btn) {
      const layer = rutaLayers[archivo];
      if (!layer) return;
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
        btn.innerHTML = '<i class="ph ph-map-trifold"></i> Ver en mapa';
        btn.style.background = '';
        btn.style.color = color;
      } else {
        layer.addTo(map);
        map.fitBounds(layer.getBounds(), { padding: [40, 40] });
        btn.innerHTML = '<i class="ph ph-eye-slash"></i> Ocultar';
        btn.style.background = color;
        btn.style.color = '#fff';
      }
    }

    // ── GALERÍA LÓGICA (Cloudinary) ──
    const CLOUD      = 'dkn49zkfr';
    const MESES      = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const PREVIEW_COUNT = 8;
    let lbItems = [];
    let lbIndex = 0;

    fetch(`https://res.cloudinary.com/${CLOUD}/image/list/gallery.json`)
      .then(r => {
        if (!r.ok) throw new Error(`Cloudinary list: ${r.status}`);
        return r.json();
      })
      .then(data => mostrarFotos(
        (data.resources || []).map(r => ({
          public_id:  r.public_id,
          created_at: r.created_at,
          _url: `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_600/${r.public_id}.${r.format}`
        }))
      ))
      .catch(err => {
        console.warn('Cloudinary falló, usando gallery.json alternativo:', err);
        fetch('./fotos/gallery.json')
          .then(r => r.json())
          .then(fotos => mostrarFotos(
            fotos.map(f => ({
              public_id:  f.public_id || f.archivo,
              created_at: f.fecha ? f.fecha + 'T00:00:00Z' : new Date().toISOString(),
              _url: f.url
            }))
          ))
          .catch(() => { 
            const nFotosEl = document.getElementById('n-fotos');
            if (nFotosEl) nFotosEl.textContent = '0'; 
          });
      });

    function mostrarFotos(fotos) {
      const all = fotos.filter(r => {
        const id = r.public_id.toLowerCase();
        return !id.includes('avatar') && !id.startsWith('samples/');
      });

      const nFotosEl = document.getElementById('n-fotos');
      if (nFotosEl) nFotosEl.textContent = all.length;

      const shuffled = [...all].sort(() => Math.random() - 0.5);
      const preview  = shuffled.slice(0, PREVIEW_COUNT);
      const rest     = shuffled.slice(PREVIEW_COUNT);

      renderGaleria(preview, false);

      if (rest.length > 0) {
        const btn = document.getElementById('btn-ver-todas');
        btn.textContent = `Ver todas las fotos (${all.length}) →`;
        btn.style.display = 'inline-block';
        btn.addEventListener('click', () => {
          renderGaleria(rest, true);
          btn.style.display = 'none';
        });
      }
    }

    function renderGaleria(resources, append = false) {
      if (!resources.length) return;
      const grid = document.getElementById('galeria');
      if (!append) grid.innerHTML = '';
      resources.forEach(r => {
        const src = r._url ||
          `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_600/${r.public_id}.jpg`;
        const dt    = r.created_at ? new Date(r.created_at) : new Date();
        const titulo = `Utrecht · ${MESES[dt.getMonth() + 1]} ${dt.getFullYear()}`;
        const div = document.createElement('div');
        div.className = 'foto-card bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 premium-card cursor-zoom-in';
        div.innerHTML = `
          <img src="${src}" alt="${titulo}" class="w-full h-44 object-cover block" loading="lazy" />
          <div class="p-2.5 text-[10px] text-slate-500 font-bold text-center tracking-tight bg-slate-50 border-t">${titulo}</div>
        `;
        const idx = lbItems.length;
        lbItems.push({ src, titulo });
        div.addEventListener('click', () => openLightbox(src, titulo, idx));
        grid.appendChild(div);
      });
    }

    // ── LIGHTBOX LÓGICA ──
    function openLightbox(src, titulo, index) {
      lbIndex = index;
      document.getElementById('lightbox-img').src = src.replace('w_600', 'w_1800');
      document.getElementById('lightbox-caption').textContent = titulo;
      document.getElementById('lightbox').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('open');
      document.getElementById('lightbox-img').src = '';
      document.body.style.overflow = '';
    }
    function moveLightbox(dir) {
      lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
      const item = lbItems[lbIndex];
      document.getElementById('lightbox-img').src = item.src.replace('w_600', 'w_1800');
      document.getElementById('lightbox-caption').textContent = item.titulo;
    }
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) closeLightbox();
      });

      // Animación de revelado al hacer scroll (Rutas y Bicis)
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -50px 0px' });
      
      document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    });
    document.addEventListener('keydown', e => {
      if (!document.getElementById('lightbox').classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft')  moveLightbox(-1);
      if (e.key === 'ArrowRight') moveLightbox(1);
    });

    // ── AGENDA LÓGICA ──
    let agendaTodos = [];
    fetch('./agenda/eventos.json')
      .then(r => r.json())
      .then(data => {
        agendaTodos = data;
        renderAgenda(agendaTodos);
        document.querySelectorAll('#agenda-filtros .filtro-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('#agenda-filtros .filtro-btn').forEach(b => b.classList.remove('active', 'ring-2', 'ring-utrecht-navy/40'));
            btn.classList.add('active', 'ring-2', 'ring-utrecht-navy/40');
            const tipo = btn.dataset.tipo;
            renderAgenda(tipo === 'todos' ? agendaTodos : agendaTodos.filter(e => e.tipo === tipo));
          });
        });
      })
      .catch(() => {
        document.getElementById('agenda-grid').innerHTML =
          '<p class="text-xs text-slate-400 col-span-3 text-center py-6">No se pudo cargar la agenda.</p>';
      });

    function makeAgendaCard(ev) {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl p-5 border border-slate-200 shadow-sm premium-card flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="text-3xl mb-2">${ev.emoji}</div>
          <h3 class="font-bold text-sm text-utrecht-navy mb-1">${ev.nombre}</h3>
          <p class="text-[10px] text-utrecht-red font-bold uppercase tracking-wider mb-2">${ev.cuando}</p>
          <p class="text-xs text-slate-600 leading-relaxed mb-4">${ev.descripcion}</p>
        </div>
        <div class="flex flex-col gap-1 text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-3">
          <span>🕐 ${ev.horario}</span>
          <span>📍 ${ev.lugar}</span>
        </div>
      `;
      return card;
    }

    function renderAgenda(eventos) {
      const LIMIT = 3;
      const grid = document.getElementById('agenda-grid');
      document.getElementById('agenda-ver-mas')?.remove();
      grid.innerHTML = '';
      if (!eventos.length) {
        grid.innerHTML = '<p class="text-xs text-slate-400 col-span-3 text-center py-6">Sin eventos en esta categoría.</p>';
        return;
      }
      const cards = eventos.map(makeAgendaCard);
      cards.slice(0, LIMIT).forEach(c => grid.appendChild(c));
      if (cards.length > LIMIT) {
        const extras = cards.slice(LIMIT);
        let expanded = false;
        const wrap = document.createElement('div');
        wrap.id = 'agenda-ver-mas';
        wrap.className = 'mt-4 text-center col-span-3';
        const btn = document.createElement('button');
        btn.className = 'text-xs text-utrecht-red font-bold hover:underline px-4 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm';
        btn.textContent = `Ver ${extras.length} más →`;
        btn.addEventListener('click', () => {
          expanded = !expanded;
          if (expanded) {
            extras.forEach(c => grid.appendChild(c));
            btn.textContent = 'Ver menos ↑';
          } else {
            extras.forEach(c => c.remove());
            btn.textContent = `Ver ${extras.length} más →`;
          }
        });
        wrap.appendChild(btn);
        grid.after(wrap);
      }
    }

    // ── FLORA LÓGICA ──
    let floraAll = [];
    fetch('./flora/plantas.json')
      .then(r => r.json())
      .then(data => {
        floraAll = data;
        renderFlora(floraAll);
        document.querySelectorAll('#flora-filtros .filtro-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('#flora-filtros .filtro-btn').forEach(b => b.classList.remove('active', 'ring-2', 'ring-utrecht-navy/40'));
            btn.classList.add('active', 'ring-2', 'ring-utrecht-navy/40');
            const temporada = btn.dataset.temporada;
            renderFlora(temporada === 'todas' ? floraAll : floraAll.filter(p => p.temporada === temporada));
          });
        });
      })
      .catch(() => {});

    function makePlanteCard(p) {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm premium-card';
      card.innerHTML = `
        <img src="${p.foto}" alt="${p.nombre}" class="w-full h-36 object-cover block" loading="lazy" onerror="this.style.display='none'" />
        <div class="p-4 flex flex-col justify-between h-auto">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-xl">${p.emoji}</span>
              <h3 class="font-bold text-sm text-utrecht-navy">${p.nombre}</h3>
            </div>
            <p class="text-[10px] text-slate-400 italic mb-2">${p.nombre_cientifico}</p>
            <p class="text-[10px] font-bold text-utrecht-red uppercase tracking-wider mb-2">${p.meses}</p>
            <p class="text-[11px] text-slate-600 leading-normal">${p.descripcion}</p>
          </div>
          <p class="text-[9px] text-slate-400 font-bold mt-4 pt-2 border-t border-slate-100">📍 ${p.donde_ver}</p>
        </div>
      `;
      return card;
    }

    function renderFlora(plantas) {
      const LIMIT = 4;
      const grid = document.getElementById('flora-grid');
      document.getElementById('flora-ver-mas')?.remove();
      grid.innerHTML = '';
      if (!plantas.length) {
        grid.innerHTML = '<p class="text-xs text-slate-400 col-span-4 text-center py-6">Sin plantas en esta temporada.</p>';
        return;
      }
      const cards = plantas.map(makePlanteCard);
      cards.slice(0, LIMIT).forEach(c => grid.appendChild(c));
      if (cards.length > LIMIT) {
        const extras = cards.slice(LIMIT);
        let expanded = false;
        const wrap = document.createElement('div');
        wrap.id = 'flora-ver-mas';
        wrap.className = 'mt-4 text-center col-span-4';
        const btn = document.createElement('button');
        btn.className = 'text-xs text-utrecht-red font-bold hover:underline px-4 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm';
        btn.textContent = `Ver ${extras.length} más →`;
        btn.addEventListener('click', () => {
          expanded = !expanded;
          if (expanded) {
            extras.forEach(c => grid.appendChild(c));
            btn.textContent = 'Ver menos ↑';
          } else {
            extras.forEach(c => c.remove());
            btn.textContent = `Ver ${extras.length} más →`;
          }
        });
        wrap.appendChild(btn);
        grid.after(wrap);
      }
    }

    // ===== EFECTOS INTERACTIVOS (Kaktus.dev) =====

    // 1. Text Scramble (ENCRYPT)
    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
      }
      setText(newText) {
        const oldText = this.el.innerText || '';
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor(Math.random() * 15);
          const end = start + Math.floor(Math.random() * 15);
          this.queue.push({ from, to, start, end, char: '' });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
      }
      update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i];
          if (this.frame >= end) {
            complete++;
            output += to;
          } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
              char = this.randomChar();
              this.queue[i].char = char;
            }
            output += `<span style="color: #c81919; font-family: monospace; font-weight: bold;">${char}</span>`;
          } else {
            output += from;
          }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
          this.resolve();
        } else {
          this.frameRequest = requestAnimationFrame(this.update);
          this.frame++;
        }
      }
      randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }
    }

    const titleEl = document.getElementById('scramble-title');
    if (titleEl) {
      const scrambler = new TextScramble(titleEl);
      const originalText = titleEl.textContent;
      
      // Al cargar
      setTimeout(() => {
        scrambler.setText(originalText);
      }, 500);

      // Al pasar el ratón (hover)
      titleEl.addEventListener('mouseenter', () => {
        scrambler.setText(originalText);
      });
    }


    // 3. Inclinación 3D (PERSPECTIVE)
    const tiltContainers = document.querySelectorAll('.tilt-container');
    tiltContainers.forEach(container => {
      const box = container.querySelector('.tilt-box');
      if (box) {
        container.addEventListener('mousemove', (e) => {
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const calcX = -(y - rect.height / 2) / 10;
          const calcY = (x - rect.width / 2) / 12;
          
          box.style.transform = `rotateX(${calcX}deg) rotateY(${calcY}deg)`;
        });
        container.addEventListener('mouseleave', () => {
          box.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
      }
    });

    // ── WEATHER AND ADVICE WIDGET LÓGICA (Open-Meteo API) ──
    function initWeather() {
      const iconEl = document.getElementById('weather-icon');
      const tempEl = document.getElementById('weather-temp');
      const timeEl = document.getElementById('weather-time');
      const descEl = document.getElementById('weather-desc');
      const adviceEl = document.getElementById('weather-advice');
      const forecastEl = document.getElementById('weather-forecast');

      if (!tempEl) return;

      // Emoji según el weather_code (WMO) de Open-Meteo — reutilizado por los días siguientes.
      function wIcon(code) {
        if (code === 0) return '☀️';
        if (code >= 1 && code <= 3) return '⛅';
        if (code === 45 || code === 48) return '🌫️';
        if (code >= 51 && code <= 57) return '🌧️';
        if (code >= 61 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '🌨️';
        if (code >= 80 && code <= 82) return '🌦️';
        if (code >= 95) return '🌩️';
        return '⛅';
      }

      const url = 'https://api.open-meteo.com/v1/forecast?latitude=52.0907&longitude=5.1214&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=Europe/Amsterdam';

      fetch(url)
        .then(res => res.json())
        .then(data => {
          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          
          tempEl.textContent = `${temp}°C`;
          timeEl.textContent = 'En tiempo real';

          let icon = '⛅';
          let desc = 'Parcialmente nublado';
          let advice = 'Cielo templado. Buen momento para caminar por el centro histórico y subir la Torre del Dom.';

          if (code === 0) {
            icon = '☀️';
            desc = 'Cielos despejados';
            advice = '¡Día espectacular! Ideal para alquilar una bicicleta, pasear por los canales y tomar algo en una terraza de los muelles (werven).';
          } else if (code >= 1 && code <= 3) {
            icon = '⛅';
            desc = 'Parcialmente despejado';
            advice = 'Cielo agradable. Buen momento para caminar por el centro histórico y explorar la plaza Domplein.';
          } else if (code === 45 || code === 48) {
            icon = '🌫️';
            desc = 'Niebla típica';
            advice = 'Utrecht misteriosa. La Torre del Dom lucirá espectacular entre la niebla. Perfecto para fotógrafos.';
          } else if (code >= 51 && code <= 55) {
            icon = '🌧️';
            desc = 'Llovizna (Motregen)';
            advice = 'Llovizna fina holandesa. Saca el chubasquero (evita paraguas en bici) y resguárdate en el Spoorwegmuseum o Speelklok.';
          } else if (code >= 61 && code <= 65) {
            icon = '🌧️';
            desc = 'Lluvia intensa';
            advice = 'Día lluvioso. Aprovecha para visitar el interior de la catedral o tomar una cerveza artesana en el Café Olivier.';
          } else if (code >= 80 && code <= 82) {
            icon = '🌦️';
            desc = 'Chubascos pasajeros';
            advice = 'Chubascos intermitentes. El cielo cambia rápido; combina paseos cortos al aire libre con paradas en cafés acogedores.';
          } else if (code >= 95) {
            icon = '🌩️';
            desc = 'Tormenta';
            advice = 'Clima adverso. Quédate a cubierto, explora los museos o relájate bajo las de madera del Café Olivier.';
          }

          iconEl.textContent = icon;
          descEl.textContent = desc;
          adviceEl.textContent = advice;

          // Pronóstico de mañana y pasado mañana (índices 1 y 2 del bloque diario)
          if (forecastEl && data.daily && data.daily.time) {
            const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            let html = '';
            for (let i = 1; i <= 2; i++) {
              if (data.daily.time[i] == null) continue;
              const d = new Date(data.daily.time[i] + 'T00:00:00');
              const nombre = i === 1 ? 'Mañana' : dias[d.getDay()];
              const max = Math.round(data.daily.temperature_2m_max[i]);
              const min = Math.round(data.daily.temperature_2m_min[i]);
              html += `<div class="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                <p class="text-[9px] uppercase tracking-wider text-slate-400">${nombre}</p>
                <p class="text-lg leading-none my-1">${wIcon(data.daily.weather_code[i])}</p>
                <p class="text-[10px] font-bold text-slate-100">${max}° <span class="text-slate-400 font-normal">${min}°</span></p>
              </div>`;
            }
            forecastEl.innerHTML = html;
          }
        })
        .catch(() => {
          // Fallback
          tempEl.textContent = '--°C';
          timeEl.textContent = 'Modo consulta';
          descEl.textContent = 'Templado típico';
          adviceEl.textContent = 'Utrecht suele tener un clima cambiante. Ten a mano siempre un cortavientos y disfruta del paseo.';
        });
    }

    // Inicializar clima
    initWeather();
  


  (function () {
    // #2 Comparador ilustrado (Catharijnesingel)
    const illuRange = document.getElementById('uv-illu-range');
    const illuOld = document.getElementById('uv-illu-old');
    const illuHandle = document.getElementById('uv-illu-handle');
    if (illuRange && illuOld && illuHandle) {
      illuRange.addEventListener('input', (e) => {
        const v = e.target.value;
        illuOld.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
        illuHandle.style.left = `${v}%`;
      });
    }

    // #1 Anatomía de la calle — hotspots
    const anatInfo = document.getElementById('uv-anat-info');
    const hotspots = document.querySelectorAll('.uv-hotspot.is-anat');
    hotspots.forEach((h) => {
      h.addEventListener('click', () => {
        hotspots.forEach((x) => x.classList.remove('is-active', 'ring-2', 'ring-utrecht-red', 'ring-offset-1', 'scale-110', 'z-10'));
        h.classList.add('is-active', 'ring-2', 'ring-utrecht-red', 'ring-offset-1', 'scale-110', 'z-10');
        if (anatInfo) {
          anatInfo.innerHTML =
            `<div class="font-bold text-utrecht-navy text-sm">${h.dataset.title}</div>` +
            `<div class="text-slate-600 text-xs mt-1">${h.dataset.text}</div>`;
        }
      });
    });

    // #3 Contadores animados (al entrar en viewport)
    function animateCount(el) {
      const target = parseFloat(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || '';
      const dur = 1400, start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const val = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = val.toLocaleString('es-ES') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
      const numObs = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.4 });
      document.querySelectorAll('.uv-num').forEach((n) => numObs.observe(n));

      // #6 Reveal on scroll
      const revObs = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); } });
      }, { threshold: 0.15 });
      document.querySelectorAll('.uv-reveal').forEach((r) => revObs.observe(r));
    } else {
      document.querySelectorAll('.uv-num').forEach((n) => { n.textContent = (parseFloat(n.dataset.target) || 0).toLocaleString('es-ES') + (n.dataset.suffix || ''); });
      document.querySelectorAll('.uv-reveal').forEach((r) => r.classList.add('is-in'));
    }

    // #8 Quiz
    document.querySelectorAll('#uv-quiz .uv-q').forEach((q) => {
      const opts = q.querySelectorAll('.uv-quiz-opt');
      const exp = q.querySelector('.uv-q-exp');
      opts.forEach((opt) => {
        opt.addEventListener('click', () => {
          if (q.dataset.done) return;
          q.dataset.done = '1';
          const correct = q.querySelector('.uv-quiz-opt[data-correct]');
          if (opt.hasAttribute('data-correct')) opt.classList.add('correct');
          else { opt.classList.add('wrong'); if (correct) correct.classList.add('correct'); }
          if (exp) exp.classList.remove('hidden');
          opts.forEach((o) => { o.disabled = true; });
        });
      });
    });

    // #10 Utrecht vs ciudad del coche
    
    function uvSetBtn(btn, active) {
      if (!btn) return;
      btn.classList.toggle('bg-utrecht-sage', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('border-utrecht-sage', active);
      btn.classList.toggle('shadow-sm', active);
      btn.classList.toggle('bg-white', !active);
      btn.classList.toggle('text-slate-600', !active);
      btn.classList.toggle('border-slate-200', !active);
    }
    window.uvSetVs = function (state) {
      const wrap = document.getElementById('uv-vs');
      if (!wrap) return;
      const data = UV_VS[state] || UV_VS.utr;
      wrap.dataset.state = state;
      wrap.innerHTML = data.rows.map((r) =>
        `<div>` +
          `<div class="flex justify-between items-baseline mb-1"><span class="text-xs font-bold text-utrecht-navy">${r.k}</span><span class="text-[11px] text-slate-500">${r.v}</span></div>` +
          `<div class="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full transition-all duration-500" style="width:${r.w}%;background:${r.c}"></div></div>` +
        `</div>`).join('');
      uvSetBtn(document.getElementById('uv-vs-car'), state === 'car');
      uvSetBtn(document.getElementById('uv-vs-utr'), state === 'utr');
    };
    if (document.getElementById('uv-vs')) window.uvSetVs('utr');
  })();

  // ── RUTAS A PIE MODAL ──
  
  const routeModal = document.getElementById('route-modal');
  const routeModalContent = document.getElementById('route-modal-content');
  const routeModalBackdrop = document.getElementById('route-modal-backdrop');

  function openRouteModal(element) {
    const id = element.getAttribute('data-route-id');
    const data = routeData[id];
    if(!data) return;

    // Poblar datos
    document.getElementById('rm-title').textContent = data.title;
    document.getElementById('rm-dist').textContent = data.dist;
    document.getElementById('rm-time').textContent = data.time;
    document.getElementById('rm-start').textContent = data.start;
    document.getElementById('rm-desc').innerHTML = data.desc;
    
    const tagsHtml = data.tags.map(t => `<span class="px-3 py-1 bg-utrecht-red/10 text-utrecht-red rounded-md text-xs font-bold uppercase tracking-wider">${t}</span>`).join('');
    document.getElementById('rm-tags').innerHTML = tagsHtml;

    // Mostrar modal
    routeModal.classList.remove('hidden');
    // Forzar reflow para animación
    void routeModal.offsetWidth;
    
    // Animar entrada
    routeModalContent.classList.remove('translate-y-full', 'md:translate-y-8', 'opacity-0');
    routeModalContent.classList.add('translate-y-0', 'opacity-100');
    document.body.style.overflow = 'hidden';
  }

  function closeRouteModal() {
    // Animar salida
    routeModalContent.classList.add('translate-y-full', 'md:translate-y-8', 'opacity-0');
    routeModalContent.classList.remove('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
      routeModal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300); // igual a duration-300
  }

  // Cerrar al clickear backdrop
  if (routeModalBackdrop) {
    routeModalBackdrop.addEventListener('click', closeRouteModal);
  }