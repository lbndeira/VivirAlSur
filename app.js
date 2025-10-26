// app.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DEL MENÚ MÓVIL ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    const toggleMobileMenu = () => {
        mobileMenu.classList.toggle('hidden');
        document.body.style.overflow = mobileMenu.classList.contains('hidden') ? '' : 'hidden';
        mobileMenuButton.innerHTML = mobileMenu.classList.contains('hidden') ? '<i class="fas fa-bars fa-lg"></i>' : '<i class="fas fa-times fa-lg"></i>';
    };

    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    // Cierra el menú al hacer clic en un enlace (ya que cargará una nueva página)
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', toggleMobileMenu); 
    });

    // --- LÓGICA DE ENLACE ACTIVO (NUEVO) ---
    // Resalta el enlace de la página actual en el menú de escritorio
    const currentPath = window.location.pathname.split('/').pop();
    // Si el path es "" (la raíz), lo tratamos como "index.html"
    const currentLocation = (currentPath === '') ? 'index.html' : currentPath;
    
    const desktopLinks = document.querySelectorAll('#desktop-nav-links a.nav-link');
    
    desktopLinks.forEach(link => {
        const linkHref = link.getAttribute('href').split('/').pop();
        if (linkHref === currentLocation) {
            link.classList.add('text-verde-bahia', 'font-bold');
            link.classList.remove('text-gray-600');
        }
    });

    // --- LÓGICA DE ANIMACIÓN AL SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 });

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // --- LAZY-LOAD IMÁGENES ---
    // Observador que cargará imágenes con atributo data-src cuando entren en viewport
    const imageObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const dataSrc = img.getAttribute('data-src');
                if (dataSrc) {
                    img.src = dataSrc;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                imgObserver.unobserve(img);
            }
        });
    }, { rootMargin: '100px 0px', threshold: 0.01 });

    // --- LÓGICA DE ENVÍO DE FORMULARIOS ---
    const handleFormSubmit = (formId, successMessageId) => {
        const form = document.getElementById(formId);
        const successMessage = document.getElementById(successMessageId);
        
        if (form && successMessage) { 
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                // Aquí iría tu lógica de envío (ej. fetch, Netlify, etc.)
                console.log(`${formId} submitted:`, Object.fromEntries(formData)); 
                
                form.reset(); 
                form.style.display = 'none';
                successMessage.classList.remove('hidden');
            });
        } else {
            // No muestra error si el formulario no existe en esta página
            if (window.location.hash.includes(formId)) { // Solo avisa si se intentó ir a él
                 if (!form) console.warn(`Form not found for ID: ${formId}`);
                 if (!successMessage) console.warn(`Success message not found for ID: ${successMessageId}`);
            }
        }
    };
    // Registra los dos formularios
    handleFormSubmit('hero-form', 'hero-form-success');
    handleFormSubmit('contact-form', 'contact-form-success');

    // --- LÓGICA DE ACORDEÓN FAQ ---
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            const icon = toggle.querySelector('i');
            
            // Cierra todos los demás FAQs
            faqToggles.forEach(otherToggle => {
                if (otherToggle !== toggle) {
                    const otherContent = otherToggle.nextElementSibling;
                    const otherIcon = otherToggle.querySelector('i');
                    if (otherContent && otherContent.classList.contains('open')) { 
                        otherContent.style.maxHeight = null;
                        otherContent.classList.remove('open');
                        otherContent.style.paddingBottom = null; 
                        if (otherIcon) otherIcon.classList.remove('rotate-180');
                    }
                }
            });
            
            // Abre o cierra el FAQ actual
            if (content && content.classList.contains('open')) { 
                content.style.maxHeight = null;
                content.classList.remove('open');
                content.style.paddingBottom = null; 
                if (icon) icon.classList.remove('rotate-180');
            } else if (content) { 
                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.add('open');
                content.style.paddingBottom = '1.25rem'; 
                if (icon) icon.classList.add('rotate-180');
            }
        });
    });
    
    // =================================================================
    // --- LÓGICA DE CONTENIDO DINÁMICO (STORYBLOK) ---
    // =================================================================
    
    // 1. Inicializar el Cliente de Storyblok
    const storyblokClient = new storyblokClient({
        accessToken: '9PUIMVgwfQBH11qba7vzJgtt', // Tu Token de Vista Previa
        cache: {
            clear: 'auto',
            type: 'memory'
        }
    });

    // 2. Función Asistente para Pedir Datos
    async function fetchData(contentType) {
        try {
            const { data } = await storyblokClient.get('cdn/stories', {
                version: 'draft', // Cambia a 'published' para producción
                "content_type": contentType 
            });
            console.log(`Datos de Storyblok recibidos: ${contentType}`, data.stories);
            return data.stories;
        } catch (error) {
            console.error(`Error cargando ${contentType}:`, error);
            return []; // Devuelve un array vacío si falla
        }
    }
    
    // --- 3. FUNCIONES DE RENDERIZADO (HTML) ---
    // (Estas funciones crean el HTML para cada item de Storyblok)

    function renderPropiedad(prop) {
        const content = prop.content;
        const imageUrl = content.fotos && content.fotos.length > 0 
            ? `${content.fotos[0].filename}/m/600x400` 
            : 'https://placehold.co/600x400/2C6E49/FFFFFF?text=Vivir+al+Sur';
        const badge = content.badge || content.tipo || 'Exclusiva'; 

        return `
            <div class="bg-blanco rounded-lg shadow-lg overflow-hidden animate-on-scroll group">
                <div class="relative">
                    <img data-src="${imageUrl}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="${content.titulo || 'Propiedad'}" class="w-full aspect-3/2 object-cover group-hover:scale-105 transition-transform duration-300 lazy-img">
                    <span class="absolute top-4 left-4 bg-arena text-blanco text-xs font-semibold px-3 py-1 rounded-full">${badge}</span>
                </div>
                <div class="p-6">
                    <h3 class="font-serif font-semibold text-xl mb-2 hover:text-verde-bahia transition">${content.titulo || 'Propiedad sin título'}</h3>
                    <p class="text-sm text-gray-500 mb-4"><i class="fas fa-map-marker-alt mr-1 text-arena"></i> ${content.zona || 'Zona no especificada'}</p>
                    <div class="flex justify-between items-center text-sm mb-4 text-gray-600">
                        <span><i class="fas fa-ruler-combined mr-1 text-arena"></i> ${content.superficie || '0'} m²</span>
                        <span><i class="fas fa-bed mr-1 text-arena"></i> ${content.dormitorios || '0'} dorm.</span>
                        <span><i class="fas fa-bath mr-1 text-arena"></i> ${content.banos || '0'} baños</span>
                    </div>
                    <p class="text-2xl font-semibold text-verde-bahia mb-4">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(content.precio || 0)}</p>
                    <a href="#${prop.full_slug}" class="nav-link block w-full text-center bg-verde-bahia text-blanco px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition">Ver Detalles</a>
                </div>
            </div>
        `;
    }
    
    function renderCasoReal(caso) {
        const content = caso.content;
        const imageUrl = content.fotos && content.fotos.length > 0 
            ? `${content.fotos[0].filename}/m/600x400` 
            : 'https://placehold.co/600x400/C9A07A/3F4A4F?text=Caso+Real';
        
        let precioInfo = '';
        if(content.precio_cierre && content.precio_pedido) {
            const ratio = (content.precio_cierre / content.precio_pedido * 100).toFixed(0);
            precioInfo = `Precio pedido vs cierre: <span class="font-medium text-gris-puerto">${ratio}%</span>`
        } else {
            precioInfo = `Precio cierre: <span class="font-medium text-gris-puerto">${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(content.precio_cierre || 0)}</span>`
        }

        return `
            <div class="bg-blanco rounded-lg shadow-lg overflow-hidden animate-on-scroll group">
                <img data-src="${imageUrl}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="${content.titulo || 'Caso Real'}" class="w-full h-48 object-cover group-hover:opacity-90 transition-opacity lazy-img">
                <div class="p-6">
                    <span class="inline-block bg-verde-bahia/10 text-verde-bahia text-xs font-semibold px-3 py-1 rounded-full mb-3">Vendido en ${content.dias_en_mercado || 'X'} días</span>
                    <h3 class="font-serif font-semibold text-xl mb-2">${content.titulo || 'Caso de éxito'}</h3>
                    <p class="text-sm text-gray-500 mb-4">${precioInfo}</p>
                    <p class="text-sm text-gray-600 line-clamp-3">${content.testimonio_asociado || '¡Un éxito! Cliente muy satisfecho.'}</p>
                    <a href="#${caso.full_slug}" class="nav-link text-sm font-semibold text-verde-bahia hover:underline mt-3 inline-block">Leer historia completa <i class="fas fa-arrow-right ml-1 text-xs"></i></a>
                </div>
            </div>
        `;
    }

    function renderTestimonio(testimonio) {
        const content = testimonio.content;
        // Corregido: tu código original tenía 'zozna', lo cambiamos por 'zona' o usamos un valor por defecto
        const zona = content.zona || 'Algeciras'; 
        return `
            <div class="bg-blanco rounded-lg shadow-lg p-8 animate-on-scroll">
                <p class="text-gray-700 italic text-lg leading-relaxed">"${content.cita || 'Testimonio increíble.'}"</p>
                <div class="mt-6 border-t border-gray-200 pt-6">
                    <p class="font-semibold">${content.nombre || 'Cliente Anónimo'}</p>
                    <p class="text-sm text-gray-500">${content.rol || 'Cliente'} - ${zona}</p> 
                </div>
            </div>
        `;
    }

    function renderBlogPost(post) {
        const content = post.content;
        const imageUrl = content.portada && content.portada.filename 
            ? `${content.portada.filename}/m/600x400` 
            : 'https://placehold.co/600x400/3F4A4F/FFFFFF?text=Blog';

        return `
            <div class="bg-blanco rounded-lg shadow-lg overflow-hidden animate-on-scroll group">
                <img data-src="${imageUrl}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="${content.titulo || 'Artículo del blog'}" class="w-full aspect-3/2 object-cover group-hover:opacity-90 transition-opacity lazy-img">
                <div class="p-6">
                    <h3 class="font-serif font-semibold text-xl mb-3 hover:text-verde-bahia transition">${content.titulo || 'Artículo sin título'}</h3>
                    <p class="text-sm text-gray-600 line-clamp-3 mb-4">${content.resumen || 'Lee más para descubrir el contenido...'}</p>
                    <a href="#${post.full_slug}" class="nav-link text-sm font-semibold text-verde-bahia hover:underline">Leer más <i class="fas fa-arrow-right ml-1 text-xs"></i></a>
                </div>
            </div>
        `;
    }


    // --- 4. FUNCIÓN INICIAL (OPTIMIZADA) ---
    // Esta función comprueba qué página estamos viendo
    // y solo pide a Storyblok los datos que esa página necesita.
    
    async function initDynamicContent() {
        console.log("Iniciando carga de contenido dinámico...");
        
        // 1. Identifica los contenedores que existen en el HTML actual
        const propGrid = document.getElementById('propiedades-grid');
        const casosHomeGrid = document.getElementById('casos-reales-home-grid');
        const casosPageGrid = document.getElementById('casos-reales-page-grid');
        const testimoniosGrid = document.getElementById('testimonios-home-grid');
        const blogGrid = document.getElementById('blog-page-grid');
        
        // 2. Prepara un array de "trabajos" (peticiones a la API)
        const fetchJobs = []; 

        // 3. Añade trabajos al array SÓLO si el contenedor existe
        
        if (propGrid) {
            console.log("...Detectada página de Propiedades. Cargando propiedades.");
            fetchJobs.push(
                fetchData('propiedad').then(propiedades => {
                    propGrid.innerHTML = ''; // Limpiar placeholder
                    if (propiedades.length > 0) {
                        propiedades.forEach(prop => propGrid.innerHTML += renderPropiedad(prop));
                    } else {
                        propGrid.innerHTML = '<p class="text-center md:col-span-3 text-gray-500">No hay propiedades disponibles en este momento.</p>';
                    }
                })
            );
        }
        
        if (casosHomeGrid || casosPageGrid) {
            console.log("...Detectada Home o pág. Casos Reales. Cargando casos.");
            fetchJobs.push(
                fetchData('caso_real').then(casos => {
                    if (casosHomeGrid) { // Lógica para la Home (3 casos)
                        casosHomeGrid.innerHTML = '';
                        if (casos.length > 0) {
                            casos.slice(0, 3).forEach(caso => casosHomeGrid.innerHTML += renderCasoReal(caso));
                        } else {
                            casosHomeGrid.innerHTML = '<p class="text-center md:col-span-3 text-gray-500">Próximamente, aquí nuestros casos de éxito.</p>';
                        }
                    }
                    if (casosPageGrid) { // Lógica para la pág. Casos Reales (todos)
                        casosPageGrid.innerHTML = '';
                        if (casos.length > 0) {
                            casos.forEach(caso => casosPageGrid.innerHTML += renderCasoReal(caso));
                        } else {
                            casosPageGrid.innerHTML = '<p class="text-center md:col-span-3 text-gray-500">Próximamente, aquí nuestros casos de éxito.</p>';
                        }
                    }
                })
            );
        }

        if (testimoniosGrid) {
            console.log("...Detectada Home. Cargando testimonios.");
            fetchJobs.push(
                fetchData('testimonio').then(testimonios => {
                    testimoniosGrid.innerHTML = '';
                    if (testimonios.length > 0) {
                        testimonios.slice(0, 3).forEach(t => testimoniosGrid.innerHTML += renderTestimonio(t));
                    } else {
                        testimoniosGrid.innerHTML = '<p class="text-center md:col-span-3 text-gray-500">Próximamente, aquí las opiniones de nuestros clientes.</p>';
                    }
                })
            );
        }
        
        if (blogGrid) {
            console.log("...Detectada página de Blog. Cargando posts.");
            fetchJobs.push(
                fetchData('post').then(posts => {
                    blogGrid.innerHTML = '';
                    if (posts.length > 0) {
                        posts.forEach(post => blogGrid.innerHTML += renderBlogPost(post));
                    } else {
                        blogGrid.innerHTML = '<p class="text-center sm:col-span-2 text-gray-500">No hay artículos en el blog por el momento.</p>';
                    }
                })
            );
        }

        // 4. Espera a que todas las peticiones *necesarias* terminen
        await Promise.all(fetchJobs);
        console.log("Carga de contenido dinámico completa.");
        
        // 5. Re-activa el observador de animaciones
        // (Lo hacemos aquí para que detecte el contenido nuevo que acaba de añadirse)
        const dynamicElements = document.querySelectorAll('.animate-on-scroll');
        dynamicElements.forEach(el => {
            if (!el.classList.contains('is-visible')) {
                observer.observe(el);
            }
        });
        
            // 6. Observa imágenes lazy añadidas dinámicamente
            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => {
                // Si ya tiene src válido, marca como loaded; si no, observa
                if (img.getAttribute('src') && !img.getAttribute('data-src')) {
                    img.classList.add('loaded');
                } else {
                    imageObserver.observe(img);
                }
            });
    }
    
    // --- Ejecutar la función inicial ---
    initDynamicContent();

});