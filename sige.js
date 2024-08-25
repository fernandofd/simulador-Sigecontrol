document.getElementById('bot1').addEventListener('click', function() {
    toggleLed('led1');
});

document.getElementById('bot2').addEventListener('click', function() {
    toggleLed('led2');
});

document.getElementById('bot3').addEventListener('click', function() {
    toggleLed('led3');
});

document.getElementById('bot4').addEventListener('click', function() {
    toggleLed('led4');
});

document.getElementById('bot5').addEventListener('click', function() {
    toggleLed('led5');
});

document.getElementById('bot6').addEventListener('click', function() {
    toggleLed('led6');
});

document.getElementById('bot7').addEventListener('click', function() {
    toggleLed('led7');
});

document.getElementById('bot8').addEventListener('click', function() {
    toggleLed('led8');
});

// Adicione mais eventos conforme necessário...

function toggleLed(ledId) {
    var led = document.getElementById(ledId);
    if (led.classList.contains('ledOn')) {
        led.classList.remove('ledOn');
        led.classList.add('ledOff');
    } else {
        led.classList.remove('ledOff');
        led.classList.add('ledOn');
    }
}
