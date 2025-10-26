// tailwind-config.js

// Personaliza Tailwind CSS con la paleta de marca y el sistema de diseño
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'verde-bahia': '#2C6E49',
                'gris-puerto': '#3F4A4F',
                'arena': '#C9A07A',
                'blanco': '#FFFFFF',
            },
            fontFamily: {
                'sans': ['Inter', 'sans-serif'],
                'serif': ['Fraunces', 'serif'],
            },
            container: {
                center: true,
                padding: '1.5rem',
                screens: {
                    '2xl': '1200px',
                },
            },
            borderRadius: {
                'lg': '8px',
            },
            aspectRatio: { // Añadido para las tarjetas de propiedades
                '3/2': '3 / 2',
            },
        }
    }
}