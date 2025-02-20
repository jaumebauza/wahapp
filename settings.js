function cargarAjustes() {
    const welcome = $('#welcome-container');
    const chatContainer = $('.chat-container');

    if ($(window).width() <= 768) {
        chatContainer.addClass('hide-on-mobile');
        welcome.addClass('show-on-mobile');
    }

    welcome.html('');

    const ajustesContainer = $('<div>', { id: 'ajustes-container' }).css({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        position: 'relative',
        opacity: '0',
        transition: 'opacity 0.5s ease'
    });

    const backButton = $('<button>', { text: 'Volver', class: 'back-button2' }).on('click', () => {
        welcome.html('');
        welcome.removeClass('show-on-mobile');
        chatContainer.removeClass('hide-on-mobile');
        if ($(window).width() > 768) {
            cargarBienvenida();
        }
    });

    const darkModeButton = $('<button>', { text: 'Activar Modo Oscuro' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '50px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#0056b3'); },
        function() { $(this).css('backgroundColor', '#007bff'); }
    ).on('click', toggleDarkMode);

    const highContrastButton = $('<button>', { text: 'Activar Alto Contraste' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#28a745',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#218838'); },
        function() { $(this).css('backgroundColor', '#28a745'); }
    ).on('click', toggleHighContrast);

    const changeBackgroundButton = $('<button>', { text: 'Cambiar Fondo' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#ffc107',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#e0a800'); },
        function() { $(this).css('backgroundColor', '#ffc107'); }
    ).on('click', mostrarDesplegableFondos);

    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    const fontSizeLabel = $('<label>', { text: 'Tamaño Mensajes:', for: 'font-size-select' }).css({
        marginTop: '20px',
        fontSize: '16px',
        fontWeight: 'bold'
    });
    const fontSizeSelect = $('<select>', { id: 'font-size-select' }).css({
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginTop: '10px',
        fontSize: '16px'
    }).append(
        $('<option>', { value: 'small', text: 'Small' }),
        $('<option>', { value: 'normal', text: 'Normal' }),
        $('<option>', { value: 'big', text: 'Big' }),
        $('<option>', { value: 'very-big', text: 'Very Big' })
    ).val(savedFontSize).on('change', ajustarTamanoFuente);

    const logoutButton = $('<button>', { text: 'Cerrar Sesión' }).css({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#dc3545',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
    }).hover(
        function() { $(this).css('backgroundColor', '#c82333'); },
        function() { $(this).css('backgroundColor', '#dc3545'); }
    ).on('click', cerrarSesion);

    ajustesContainer.append(backButton, darkModeButton, highContrastButton, changeBackgroundButton, fontSizeLabel, fontSizeSelect, logoutButton);
    welcome.append(ajustesContainer);

    setTimeout(() => {
        ajustesContainer.css('opacity', '1');
    }, 0);
}

function ajustarTamanoFuente() {
    const fontSize = $('#font-size-select').val();
    let size;

    switch (fontSize) {
        case 'small':
            size = '12px';
            break;
        case 'normal':
            size = '16px';
            break;
        case 'big':
            size = '20px';
            break;
        case 'very-big':
            size = '24px';
            break;
        default:
            size = '16px';
    }

    $('body').css('font-size', size);
    $('#chat-list').css('font-size', size);
    $('#chat-list .chat-item').css('font-size', size);
    $('#chat-list .chat-item .username').css('font-size', size);
    $('#chat-list .new-group-button').css('font-size', size);
    localStorage.setItem('fontSize', fontSize);
}

function aplicarTamanoFuenteGuardado() {
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    ajustarTamanoFuente(savedFontSize);
}

document.addEventListener('DOMContentLoaded', () => {
    aplicarTamanoFuenteGuardado();
    mostrarChats();

    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', handleSearch);
});

let fondoContainerExists = false;

function mostrarDesplegableFondos() {
    const existingContainer = $('#fondo-container');
    if (existingContainer.length) {
        existingContainer.remove();
        fondoContainerExists = false;
        return;
    }

    const ajustesContainer = $('#ajustes-container');

    const fondoContainer = $('<div>', { id: 'fondo-container' }).css({
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    });

    const select = $('<select>', { id: 'fondo-select' }).css({
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '10px',
        fontSize: '16px'
    });

    $.get('http://localhost:8000/imagenes', function(imagenes) {
        imagenes.forEach(imagen => {
            select.append($('<option>', {
                value: imagen,
                text: imagen
            }));
        });

        const confirmButton = $('<button>', { text: 'Aplicar Fondo' }).css({
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            marginBottom: '10px',
            borderRadius: '5px',
            backgroundColor: '#007bff',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease'
        }).hover(
            function() { $(this).css('backgroundColor', '#0056b3'); },
            function() { $(this).css('backgroundColor', '#007bff'); }
        ).on('click', function() {
            const selectedImage = select.val();
            cambiarFondoChat(selectedImage);
            localStorage.setItem('selectedBackgroundImage', selectedImage);
            fondoContainer.remove();
            fondoContainerExists = false;
            alert('Se ha cambiado el fondo correctamente');
        });

        const resetButton = $('<button>', { text: 'Restablecer Fondo' }).css({
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            border: 'none',
            marginBottom: '10px',
            borderRadius: '5px',
            backgroundColor: '#dc3545',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease'
        }).hover(
            function() { $(this).css('backgroundColor', '#c82333'); },
            function() { $(this).css('backgroundColor', '#dc3545'); }
        ).on('click', function() {
            cambiarFondoChat('');
            localStorage.removeItem('selectedBackgroundImage');
            fondoContainer.remove();
            fondoContainerExists = false;
            alert('Se ha restablecido el fondo a blanco');
        });

        fondoContainer.append(select, confirmButton, resetButton);

        const changeBackgroundButton = $('button').filter(function() {
            return $(this).text() === 'Cambiar Fondo';
        });
        if (changeBackgroundButton.length) {
            changeBackgroundButton.after(fondoContainer);
        } else {
            ajustesContainer.append(fondoContainer);
        }

        fondoContainerExists = true;
    }).fail(function(error) {
        console.error('Error al obtener las imágenes:', error);
    });
}

function cambiarFondoChat(imagen) {
    const chatMessages = document.getElementById('chat-messages-new');
    if (chatMessages) {
        chatMessages.style.backgroundImage = imagen ? `url('imagenes/${imagen}')` : 'none';
        chatMessages.style.backgroundColor = imagen ? 'transparent' : 'white';
        chatMessages.style.backgroundSize = 'cover';
        chatMessages.style.backgroundRepeat = 'no-repeat';
        chatMessages.style.backgroundPosition = 'center';
    }
}

function toggleDarkMode() {
    document.body.classList.add('transition');
    document.body.classList.toggle('dark-mode');
    setTimeout(() => document.body.classList.remove('transition'), 300);
}

function toggleHighContrast() {
    document.body.classList.add('transition');
    document.body.classList.toggle('high-contrast');
    setTimeout(() => document.body.classList.remove('transition'), 300);
}