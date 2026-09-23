const config = {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Brand
                primary: {
                    DEFAULT: '#2D6A4F',
                    light: '#52B788',
                    muted: '#B7E4C7',
                    dark: '#1B4332',
                    foreground: '#FFFFFF',
                },
                // Neutrals
                background: '#FAFAF9',
                surface: '#FFFFFF',
                border: '#E5E7EB',
                charcoal: '#374151',
                // Text
                text: {
                    DEFAULT: '#1C1C1E',
                    muted: '#6B7280',
                    light: '#9CA3AF',
                },
                // Status
                status: {
                    success: '#16A34A',
                    warning: '#D97706',
                    error: '#DC2626',
                    info: '#2563EB',
                    successBg: '#F0FDF4',
                    warningBg: '#FFFBEB',
                    errorBg: '#FEF2F2',
                    infoBg: '#EFF6FF',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Menlo', 'monospace'],
            },
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1rem' }],
                sm: ['0.875rem', { lineHeight: '1.25rem' }],
                base: ['1rem', { lineHeight: '1.5rem' }],
                lg: ['1.125rem', { lineHeight: '1.75rem' }],
                xl: ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            },
            borderRadius: {
                sm: '0.25rem',
                DEFAULT: '0.375rem',
                md: '0.5rem',
                lg: '0.625rem',
                xl: '0.75rem',
            },
            boxShadow: {
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
            },
        },
    },
    plugins: [],
};
export default config;
