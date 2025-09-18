tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#8635fd',
                'primary-light': '#9d4eff',
                'primary-dark': '#7329e8',
                'black-300': '#1a1a1a',
                'black-100': '#333333',
                'gray-100': '#666666',
                'gray-200': '#999999',
                'gray-800': '#cccccc',
            },
            fontFamily: {
                'poppins': ['Poppins', 'sans-serif'],
            },
            animation: {
                'rightLeft': 'rightLeft 1s ease-in-out infinite alternate',
            },
            keyframes: {
                rightLeft: {
                    '0%': { transform: 'translateX(0px)' },
                    '100%': { transform: 'translateX(5px)' },
                }
            }
        }
    }
}
