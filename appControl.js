document.addEventListener('DOMContentLoaded', function () {
    configurarAlternancia();
    alternarSimulador(estado.simuladorLigado); // Verifica o estado inicial do simulador
    configurarBotoes();
    configurarModal();
});

var estado = {
    simuladorLigado: false,
    lamp: [false, false, false, false, false, false, false, false],
    funcao: [0, 0, 0, 0, 0, 0, 0, 0],
    tempoLampada: [0, 0, 0, 0, 0, 0, 0, 0],
    botao: []
};



//rst fábrica
const botaoRSTDefault = document.getElementById('rstdefaut');

if (botaoRSTDefault) {
    botaoRSTDefault.addEventListener('mousedown', function () {
        // Inicia o temporizador de 10 segundos
        estado.temporizadorReset = setTimeout(function () {
            resetarParaDefaut();
        }, 5000); // 5  000 ms = 5 segundos
    });

    botaoRSTDefault.addEventListener('mouseup', function () {
        // Cancela o temporizador se o botão for solto antes de 10 segundos
        clearTimeout(estado.temporizadorReset);
        estado.temporizadorReset = null;
    });

    botaoRSTDefault.addEventListener('mouseleave', function () {
        // Cancela o temporizador se o botão for solto fora da área do botão
        clearTimeout(estado.temporizadorReset);
        estado.temporizadorReset = null;
    });
}



function resetarParaDefaut() {
    estado.funcao.fill(0); // Reseta todas as funções para o modo normal
    estado.tempoLampada.fill(0); // Zera todos os tempos
    estado.lamp.fill(false); // Apaga todas as lâmpadas
    atualizarTodasLampadas(); // Atualiza a visualização dos LEDs
    esconderTodosCronometros(); // Esconde qualquer cronômetro que esteja sendo exibido
    alert("Reset de fábrica realizado. Todas as configurações foram restauradas.");
}



//para uso do power do simulador                                                                              
function configurarAlternancia() {
    const alternanciaPower = document.getElementById('powerToggle');
    alternanciaPower.addEventListener('change', function () {
        alternarSimulador(this.checked);
    });
}



function alternarSimulador(ativo) {
    estado.simuladorLigado = ativo;
    alternarLEDPower(ativo); // Liga ou desliga o LED de power

    const lampadas = document.querySelectorAll('.lampada');
    const inputs = document.querySelectorAll('.input');
    const controlButtons = document.querySelector('.control-buttons');
    const placa = document.getElementById('sigeImage'); // Seleciona a imagem da placa
    const itens = document.getElementById('itens');

    itens.style.display = ativo ? 'block' : 'none';

    lampadas.forEach(lampada => {
        lampada.style.display = ativo ? 'block' : 'none';
    });

    inputs.forEach(input => {
        input.style.display = ativo ? 'block' : 'none';
    });

    controlButtons.style.display = ativo ? 'flex' : 'none';

    // Aplica ou remove a classe ofuscado na imagem da placa
    if (ativo) {
        placa.classList.remove('ofuscado');
    } else {
        placa.classList.add('ofuscado');
    }

    if (!ativo) {
        estado.lamp.fill(false);
        atualizarTodasLampadas();
        esconderTodosCronometros();
    }
}




function alternarLEDPower(ativo) {
    const ledPower = document.getElementById('ledPower');
    if (ledPower) {
        ledPower.classList.toggle('ledOn', ativo);
        ledPower.classList.toggle('ledOff', !ativo);
    }
}



// rst básico, somente deliga tudo mas não perde as configurações
function rst() {
    for (let index = 0; index < estado.lamp.length; index++) {
        if (estado.lamp[index] == 1) {
            index = estado.lamp.length
            tocarSom()
        }
    }
    estado.lamp.fill(false);
    atualizarTodasLampadas();
    esconderTodosCronometros(); // Esconde todos os cronômetros ao resetar tudo
}



// Função para ligar todas as lâmpadas, respeitando as restrições de modo
function ligarTodasLampadas() {

    if (estado.simuladorLigado) {
        let temligado = 0

        for (let i = 0; i < estado.lamp.length; i++) {
            if ([0, 1, 2].includes(estado.funcao[i])) { // Apenas para modos Normal, Timer minutos e Timer segundos
                if (estado.lamp[i] == false) {
                    temligado = 1
                    estado.lamp[i] = true;
                }

                // Se for um modo com temporizador, reinicia o temporizador
                if ([1, 2].includes(estado.funcao[i])) {
                    clearTimeout(estado[`temporizadorAtual_${i}`]); // Cancela o temporizador anterior, se houver
                    clearInterval(estado[`intervaloCronometro_${i}`]); // Cancela o cronômetro anterior, se houver
                    const duracao = estado.tempoLampada[i] * (estado.funcao[i] === 1 ? 60 * 1000 : 1000); // Minutos ou segundos
                    estado[`temporizadorAtual_${i}`] = setTimeout(function () {
                        estado.lamp[i] = false;
                        atualizarVisualLampada(i);
                        esconderCronometro(i); // Esconde o cronômetro após o tempo terminar
                    }, duracao);
                    mostrarCronometro(i, duracao); // Mostra o cronômetro e inicia o intervalo
                }
            }
            atualizarVisualLampada(i);
        }
        if (temligado == 1) {
            tocarSom();
        }

    } else {
        alert("O simulador está desligado.");
    }
}

// Função para desligar todas as lâmpadas, respeitando as restrições de modo
function desligarTodasLampadas() {

    if (estado.simuladorLigado) {
        let temligado = 0
        for (let i = 0; i < estado.lamp.length; i++) {
            if ([0, 1, 2].includes(estado.funcao[i])) { // Apenas para modos Normal, Timer minutos e Timer segundos
                if (estado.lamp[i] == true) {
                    temligado = 1
                    estado.lamp[i] = false;
                }
                clearTimeout(estado[`temporizadorAtual_${i}`]); // Cancela qualquer temporizador ativo
                clearInterval(estado[`intervaloCronometro_${i}`]); // Cancela o cronômetro, se houver
                esconderCronometro(i); // Esconde o cronômetro
                atualizarVisualLampada(i);

            }
        }
        if (temligado == 1) {
            tocarSom();
        }
    } else {
        alert("O simulador está desligado.");
    }
}

function atualizarTodasLampadas() {
    for (let i = 0; i < estado.lamp.length; i++) {
        const interruptor = document.getElementById(`inp${i + 1}`);
        switch (estado.funcao[i]) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 7:
            case 8:
            case 9:
                interruptor.src = "interruptorP.png";
                break;
            case 4: // Detecção
            case 5: // Retenção
                interruptor.src = "interruptorOFF.png";
                break;
            case 6: // Contatora
                interruptor.src = "interruptorP.png";
                break;

            default:
                interruptor.src = "interruptorP.png"; // Imagem padrão
                break;
        }
        atualizarVisualLampada(i);

    }


}

function atualizarVisualLampada(indice) {
    const led = document.getElementById(`led${indice + 1}`);
    const lampada = document.getElementById(`lamp${indice + 1}`); // Seleciona a lâmpada correspondente
    if (led) {
        led.classList.toggle('ledOn', estado.lamp[indice]);
        led.classList.toggle('ledOff', !estado.lamp[indice]);
    }

    if (lampada) {
        // Altera a imagem da lâmpada com base no estado
        lampada.src = estado.lamp[indice] ? 'lampada ligada.png' : 'lampada desligada.png';
    }

    // Atualiza o status na tabela
    const statusElement = document.getElementById(`status-${indice + 1}`);
    if (estado.lamp[indice]) {
        statusElement.textContent = 'Ligado';
    } else {
        statusElement.textContent = 'Desligado';
    }

    // Atualiza o modo de operação na tabela
    const modoElement = document.getElementById(`modo-${indice + 1}`);
    switch (estado.funcao[indice]) {
        case 0:
            modoElement.textContent = 'Normal';
            break;
        case 1:
            modoElement.textContent = 'Timer minutos';
            break;
        case 2:
            modoElement.textContent = 'Timer segundos';
            break;
        case 3:
            modoElement.textContent = 'Nível';
            break;
        case 4:
            modoElement.textContent = 'Detecção';
            break;
        case 5:
            modoElement.textContent = 'Retenção';
            break;
        case 6:
            modoElement.textContent = 'Contatora';
            break;
        case 7:
            modoElement.textContent = 'Reversão';
            break;
        case 8:
            modoElement.textContent = 'Retardo minutos';
            break;
        case 9:
            modoElement.textContent = 'Retardo segundos';
            break;
        default:
            modoElement.textContent = 'Desconhecido';
            break;
    }

    // Atualiza o tempo na tabela
    const tempoElement = document.getElementById(`tempo-${indice + 1}`);
    tempoElement.textContent = `${estado.tempoLampada[indice]} s`;
}






function deteccaoMouseDown(indice) {


    clearTimeout(estado[`temporizadorAtual_${indice}`]);
    clearInterval(estado[`intervaloCronometro_${indice}`]);

    estado.lamp[indice] = false; // Apaga a lâmpada enquanto o botão está pressionado
    atualizarVisualLampada(indice);
    atualizarVisualInterruptor(indice)
    tocarSom();
    esconderCronometro(indice);
}

function deteccaoMouseUp(indice) {

    clearTimeout(estado[`temporizadorAtual_${indice}`]);
    clearInterval(estado[`intervaloCronometro_${indice}`]);

    const duracao = estado.tempoLampada[indice] * 1000; // Convertendo o tempo configurado em segundos

    if (duracao > 0) {
        mostrarCronometro(indice, duracao);

        estado[`temporizadorAtual_${indice}`] = setTimeout(function () {
            estado.lamp[indice] = true;
            atualizarVisualLampada(indice);
            atualizarVisualInterruptor(indice)
            tocarSom();
            esconderCronometro(indice);
        }, duracao);
    } else {
        estado.lamp[indice] = true;
        atualizarVisualLampada(indice);
        atualizarVisualInterruptor(indice)
        tocarSom();
    }
}

function executarModoDeteccao(indice) {
    let botaoNovo = document.getElementById(`bot${indice + 1}`);
    let interruptor = document.getElementById(`inp${indice + 1}`);

    // Limpa eventos anteriores antes de adicionar novos
    botaoNovo.removeEventListener('mousedown', estado[`mousedownHandler_${indice}`]);
    interruptor.removeEventListener('mousedown', estado[`mousedownHandler_${indice}`]);
    botaoNovo.removeEventListener('mouseup', estado[`mouseupHandler_${indice}`]);
    interruptor.removeEventListener('mouseup', estado[`mouseupHandler_${indice}`]);

    // Define os novos eventos
    const mouseDownHandler = () => deteccaoMouseDown(indice);
    const mouseUpHandler = () => deteccaoMouseUp(indice);

    // Armazena os eventos no estado para poder removê-los posteriormente
    estado[`mousedownHandler_${indice}`] = mouseDownHandler;
    estado[`mouseupHandler_${indice}`] = mouseUpHandler;

    // Adiciona os eventos ao botão
    botaoNovo.addEventListener('mousedown', mouseDownHandler);
    interruptor.addEventListener('mousedown', mouseDownHandler);
    botaoNovo.addEventListener('mouseup', mouseUpHandler);
    interruptor.addEventListener('mouseup', mouseUpHandler);
}

function limparEventosMouse(indice) {
    let botao = document.getElementById(`bot${indice + 1}`);
    let interruptor = document.getElementById(`inp${indice + 1}`);

    // Verifica se os handlers estão presentes e os remove
    if (estado[`mousedownHandler_${indice}`]) {
        // console.log(`Removendo mousedown para o botão ${indice + 1}`);
        botao.removeEventListener('mousedown', estado[`mousedownHandler_${indice}`]);
        interruptor.removeEventListener('mousedown', estado[`mousedownHandler_${indice}`]);
        delete estado[`mousedownHandler_${indice}`];
    }

    if (estado[`mouseupHandler_${indice}`]) {
        //console.log(`Removendo mouseup para o botão ${indice + 1}`);
        botao.removeEventListener('mouseup', estado[`mouseupHandler_${indice}`]);
        interruptor.removeEventListener('mouseup', estado[`mouseupHandler_${indice}`]);
        delete estado[`mouseupHandler_${indice}`];
    }
}







function definirFuncao(indice, funcao) {
    if (estado.simuladorLigado) {


        if (funcao !== 5 && funcao !== 4) {
            limparEventosMouse(indice);
        }



        if (funcao == 1 || funcao == 2 || funcao == 8 || funcao == 9) {
            if (estado.tempoLampada[indice] == 0 || estado.tempoLampada[indice] == "" || estado.tempoLampada[indice] == undefined || estado.tempoLampada[indice] == null) {
                estado.tempoLampada[indice] = 1
            }
        }

        if (funcao != 6) {
            clearTimeout(estado[`temporizadorAtual_${indice}`]);
            clearInterval(estado[`intervaloCronometro_${indice}`]);
            estado.funcao[indice] = funcao;
            esconderCronometro(indice); // Esconde o cronômetro ao trocar de função
            // Desliga a lâmpada associada ao canal
            if (estado.lamp[indice] == 1) {
                estado.lamp[indice] = 0;
                tocarSom()
            }
            let par = (indice % 2 === 0) ? indice + 1 : indice - 1;
            if (funcao == 3 || funcao == 7) {
                esconderCronometro(par); // Esconde o cronômetro ao trocar de função
                estado.funcao[par] = funcao
                estado.tempoLampada[par] = estado.tempoLampada[indice];
                if (estado.lamp[par] == 1) {
                    estado.lamp[par] = 0;
                    tocarSom()
                }
            }


            // Verifica se a função anterior era "Nível" ou "Reversão"
            if (estado.funcao[par] === 3 || estado.funcao[par] === 7) {
                if (funcao !== 3 && funcao !== 7) {
                    // Se o novo modo não é "Nível" ou "Reversão", redefine o par para "Normal"
                    estado.funcao[par] = 0;
                    if (estado.lamp[par] == 1) {
                        estado.lamp[par] = 0;
                        tocarSom()
                    }
                    esconderCronometro(par); // Esconde o cronômetro do par ao redefinir para "Normal"
                }
            }

            atualizarTodasLampadas()
        }

        if (funcao == 6) {
            construcao(indice)
        }
        if (funcao == 4) {
            executarModoDeteccao(indice)
        }
    } else {
        alert("O simulador está desligado.");
    }
}

// Configuração dos botões
function configurarBotoes() {
    for (let i = 0; i < 8; i++) {
        let botao = document.getElementById(`bot${i + 1}`);
        let interruptor = document.getElementById(`inp${i + 1}`);

        console.log("%c[executarModoRetencao] target: ", "color: cyan", botao);


        if (botao) {
            botao.addEventListener('click', function () {
                if (estado.simuladorLigado) {
                    switch (estado.funcao[i]) {
                        case 0:
                            executarModoNormal(i);
                            break;
                        case 1:
                            executarModoTimer(i, 'minutos');
                            break;
                        case 2:
                            executarModoTimer(i, 'segundos');
                            break;
                        case 3:
                            executarModoNivel(i);
                            break;
                        case 4:
                            executarModoDeteccao(i);
                            break;
                        case 5:
                            // construcao(i)
                            executarModoRetencao(i);
                            break;
                        case 6:
                            construcao(i)
                            // executarModoContatora(i);
                            break;
                        case 7:
                            executarModoReversao(i);
                            break;
                        case 8:
                            executarModoRetardo(i, 'minutos');
                            break;
                        case 9:
                            executarModoRetardo(i, 'segundos');
                            break;
                        default:
                            break;
                    }
                } else {
                    alert("O simulador está desligado.");
                }
            });

            if (interruptor) {
                interruptor.addEventListener('click', function () {
                    if (estado.simuladorLigado) {
                        switch (estado.funcao[i]) {
                            case 0:
                                executarModoNormal(i);
                                break;
                            case 1:
                                executarModoTimer(i, 'minutos');
                                break;
                            case 2:
                                executarModoTimer(i, 'segundos');
                                break;
                            case 3:
                                executarModoNivel(i);
                                break;
                            case 4:
                                executarModoDeteccao(i);
                                break;
                            case 5:
                                // construcao(i)
                                executarModoRetencao(i);
                                break;
                            case 6:
                                construcao(i)
                                // executarModoContatora(i);
                                break;
                            case 7:
                                executarModoReversao(i);
                                break;
                            case 8:
                                executarModoRetardo(i, 'minutos');
                                break;
                            case 9:
                                executarModoRetardo(i, 'segundos');
                                break;
                            default:
                                break;
                        }
                    } else {
                        alert("O simulador está desligado.");
                    }
                });
            }

            let botaoRele = document.getElementById(`rele${i + 1}`);
            if (botaoRele) {
                botaoRele.addEventListener('click', function () {
                    if (estado.simuladorLigado) {
                        abrirModal(i);
                    } else {
                        alert("O simulador está desligado.");
                    }
                });
            }
        }
    }

    const botaoRST = document.getElementById('rst');
    if (botaoRST) {
        botaoRST.addEventListener('click', function () {
            rst();
        });
    }

    const botaoLigarTudo = document.getElementById('turnOnAll');
    if (botaoLigarTudo) {
        botaoLigarTudo.addEventListener('click', function () {
            ligarTodasLampadas();
        });
    }

    const botaoDesligarTudo = document.getElementById('turnOffAll');
    if (botaoDesligarTudo) {
        botaoDesligarTudo.addEventListener('click', function () {
            desligarTodasLampadas();
        });
    }
}








function construcao(indice) {
    alert("Em construção, Depende do simulador com o APP.");

}


function executarModoNormal(indice) {
    // Alterna o estado da lâmpada
    estado.lamp[indice] = !estado.lamp[indice];
    atualizarVisualLampada(indice);
    tocarSom();
}




// Função genérica para executar o modo Timer (minutos ou segundos)
function executarModoTimer(indice, unidade) {
    if (!estado.lamp[indice]) {
        // Se a lâmpada está desligada, liga e inicia o timer
        clearTimeout(estado[`temporizadorAtual_${indice}`]); // Cancela o temporizador anterior
        estado.lamp[indice] = true
        atualizarVisualLampada(indice);
        tocarSom();
        const duracao = estado.tempoLampada[indice] * ((unidade === 'minutos') ? 60 * 1000 : 1000);

        estado[`temporizadorAtual_${indice}`] = setTimeout(function () {
            estado.lamp[indice] = false;
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        }, duracao);

        mostrarCronometro(indice, duracao); // Mostra o cronômetro na tela
    } else {
        // Se a lâmpada está ligada, desliga e esconde o cronômetro
        estado.lamp[indice] = false;
        clearTimeout(estado[`temporizadorAtual_${indice}`]); // Cancela o temporizador
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice);
    }
}




// Função para executar o modo Retardo Minutos
function executarModoRetardo(indice, unidade) {
    if (!estado.lamp[indice]) {
        // Cancela qualquer timeout e intervalo anterior
        clearTimeout(estado[`temporizadorAtual_${indice}`]); // Cancela o temporizador

        // Inicia o retardo
        const duracao = estado.tempoLampada[indice] * ((unidade === 'minutos') ? 60 * 1000 : 1000);
        estado[`temporizadorAtual_${indice}`] = setTimeout(function () {
            estado.lamp[indice] = true;
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        }, duracao);

        // Mostrar o cronômetro
        mostrarCronometro(indice, duracao);

    } else {
        // Se a lâmpada está ligada, desliga e cancela o temporizador e o cronômetro
        estado.lamp[indice] = false;
        clearTimeout(estado[`temporizadorAtual_${indice}`]); // Cancela o temporizador
        atualizarVisualLampada(indice);
        esconderCronometro(indice);
    }
}




function retencaoMouseDown(indice) {
    // console.log("%c[retencaoMouseDown] indice: ", "color: blue", indice);
    estado.lamp[indice] = true; // Liga a lâmpada enquanto o botão está pressionado
    atualizarVisualLampada(indice);
    atualizarVisualInterruptor(indice);
    tocarSom();
}

function retencaoMouseUp(indice) {
    // console.log("%c[retencaoMouseUp] indice: ", "color: blue", indice);
    estado.lamp[indice] = false; // Desliga a lâmpada ao soltar o botão
    atualizarVisualLampada(indice);
    atualizarVisualInterruptor(indice);
    tocarSom();
}

function executarModoRetencao(indice) {
    let botao = document.getElementById(`bot${indice + 1}`);
    let interruptor = document.getElementById(`inp${indice + 1}`);

    // Limpa eventos anteriores antes de adicionar novos
    botao.removeEventListener('mousedown', estado[`mousedownHandler_${indice}`]);
    botao.removeEventListener('mouseup', estado[`mouseupHandler_${indice}`]);

    interruptor.removeEventListener('mousedown', estado[`mousedownHandler_${indice}`]);
    interruptor.removeEventListener('mouseup', estado[`mouseupHandler_${indice}`]);

    // Define os novos eventos
    const mouseDownHandler = () => retencaoMouseDown(indice);
    const mouseUpHandler = () => retencaoMouseUp(indice);

    // Armazena os eventos no estado para poder removê-los posteriormente
    estado[`mousedownHandler_${indice}`] = mouseDownHandler;
    estado[`mouseupHandler_${indice}`] = mouseUpHandler;

    // Adiciona os eventos ao botão
    botao.addEventListener('mousedown', mouseDownHandler);
    interruptor.addEventListener('mousedown', mouseDownHandler);
    botao.addEventListener('mouseup', mouseUpHandler);
    interruptor.addEventListener('mouseup', mouseUpHandler);
}












// Função para executar o modo Nível
function executarModoNivel(indice) {
    // Identifica o par correspondente
    let par = (indice % 2 === 0) ? indice + 1 : indice - 1;

    if (indice % 2 === 0) { // Porta Par (Liga ambos os LEDs)
        if (estado.lamp[indice] == 1) {
            estado.lamp[indice] = false; // Desliga a lâmpada da porta par
            estado.lamp[par] = false; // Desliga a lâmpada do par correspondente
            atualizarVisualLampada(indice);
            atualizarVisualLampada(par);
            tocarSom();
        }

    } else { // Porta Ímpar (Desliga ambos os LEDs)
        if (estado.lamp[indice] == 0) {
            estado.lamp[indice] = true; // liga a lâmpada da porta ímpar
            estado.lamp[par] = true; // liga a lâmpada do par correspondente
            atualizarVisualLampada(indice);
            atualizarVisualLampada(par);
            tocarSom();
        }

    }




}





// Função para configurar o modo Reversão
// function configurarModoReversao(indice) {
//     estado.funcao[indice] = 7;
//     estado.lamp[indice] = false; // Desliga a lâmpada inicialmente
//     atualizarVisualLampada(indice);
//     tocarSom();
//     esconderCronometro(indice);

//     // Identifica o par correspondente
//     let par = (indice % 2 === 0) ? indice + 1 : indice - 1;

//     // Configura automaticamente o par para o modo reversão
//     estado.funcao[par] = 7;
//     estado.lamp[par] = false; // Desliga a lâmpada do par
//     atualizarVisualLampada(par);
//     tocarSom();
//     esconderCronometro(par);

//     // Copia o tempo configurado para o par correspondente após a configuração do modal
//     setTimeout(() => {
//         estado.tempoLampada[par] = estado.tempoLampada[indice];
//     }, 100); // Define um pequeno atraso para garantir que o tempo tenha sido configurado
// }

// Função para executar o modo Reversão
function executarModoReversao(indice) {
    let par = (indice % 2 === 0) ? indice + 1 : indice - 1;

    // Se qualquer canal estiver ligado, desliga ambos antes de ligar o solicitado
    if (estado.lamp[indice] || estado.lamp[par]) {
        // Desliga ambos os canais
        estado.lamp[indice] = false;
        estado.lamp[par] = false;

        // Cancela os temporizadores e esconde os cronômetros
        clearTimeout(estado[`temporizadorAtual_${indice}`]);
        clearTimeout(estado[`temporizadorAtual_${par}`]);
        esconderCronometro(indice);
        esconderCronometro(par);

        atualizarVisualLampada(indice);
        tocarSom();
        atualizarVisualLampada(par);
        tocarSom();

        // Retorna para impedir o re-ligamento imediato
        return;
    }

    // Se o canal não estiver ligado, ativa-o
    estado.lamp[indice] = true;
    atualizarVisualLampada(indice);
    tocarSom();

    const duracao = estado.tempoLampada[indice] * 1000; // Tempo em segundos

    if (duracao > 0) {
        mostrarCronometro(indice, duracao);

        estado[`temporizadorAtual_${indice}`] = setTimeout(function () {
            estado.lamp[indice] = false;
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        }, duracao);
    }
}









// Coisas sobre o modal

function configurarModal() {
    const modal = document.getElementById('functionModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const saveButton = document.getElementById('saveFunction');
    const functionSelect = document.getElementById('functionSelect');
    const timeInput = document.getElementById('timeInput');

    closeModal.onclick = function () {
        modal.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    functionSelect.addEventListener('change', function () {
        // Adicionando os modos que utilizam tempo para exibir o campo de tempo
        if (['1', '2', '4', '7', '8', '9'].includes(functionSelect.value)) {
            timeInput.style.display = 'block';
        } else {
            timeInput.style.display = 'none';
        }
    });

    saveButton.onclick = function () {
        const selectedFunction = functionSelect.value;
        const channel = modal.getAttribute('data-channel');

        // Atualizando para salvar o tempo configurado para os modos corretos
        if (['1', '2', '4', '7', '8', '9'].includes(selectedFunction)) {
            estado.tempoLampada[parseInt(channel)] = parseInt(timeInput.value) || 0;
        } else {
            estado.tempoLampada[parseInt(channel)] = 0
        }
        definirFuncao(parseInt(channel), parseInt(selectedFunction));
        modal.style.display = "none";
    };
}




// Abertura do modal
function abrirModal(indice) {
    const modal = document.getElementById("functionModal");
    modal.setAttribute('data-channel', indice);
    modal.style.display = "block";
}





function iniciarContagemRegressiva(indice, duracao, acaoFinal) {
    const display = document.getElementById(`timerDisplay${indice + 1}`);
    let tempoRestante = duracao;

    display.style.display = 'block'; // Mostra o cronômetro na tela
    display.textContent = `${tempoRestante}`;

    const intervalo = setInterval(() => {
        tempoRestante--;
        if (tempoRestante > 0) {
            display.textContent = `${tempoRestante}`;
        } else {
            clearInterval(intervalo);
            display.style.display = 'none'; // Oculta o cronômetro ao finalizar a contagem
            acaoFinal(); // Executa a ação final (desligar o LED)
        }
    }, 1000);

    estado.temporizadores[indice] = intervalo;
}



function mostrarCronometro(indice, duracao) {
    const display = document.getElementById(`timerDisplay${indice + 1}`);
    const displayLamp = document.getElementById(`timerDisplayLamp${indice + 1}`); // Novo cronômetro
    let tempoRestante = duracao / 1000;

    display.style.display = 'block';
    display.textContent = `${tempoRestante}`;

    if (displayLamp) {
        displayLamp.style.display = 'block';
        displayLamp.textContent = `${tempoRestante} s`;
    }

    // Cancela qualquer cronômetro anterior para este índice
    clearInterval(estado[`intervaloCronometro_${indice}`]);

    // Cria um novo intervalo para o cronômetro deste índice
    const intervalo = setInterval(() => {
        tempoRestante--;
        if (tempoRestante > 0) {
            display.textContent = `${tempoRestante}`;
            if (displayLamp) displayLamp.textContent = `${tempoRestante} s`;
        } else {
            clearInterval(intervalo);
            display.style.display = 'none';
            if (displayLamp) displayLamp.style.display = 'none';
        }
    }, 1000);

    // Armazena o identificador do intervalo no estado correspondente ao índice
    estado[`intervaloCronometro_${indice}`] = intervalo;
}




function esconderCronometro(indice) {
    clearInterval(estado.intervaloCronometro); // Cancela o intervalo do cronômetro
    const display = document.getElementById(`timerDisplay${indice + 1}`);
    const displayLamp = document.getElementById(`timerDisplayLamp${indice + 1}`); // Novo cronômetro
    display.style.display = 'none'; // Oculta o cronômetro
    if (displayLamp) displayLamp.style.display = 'none';

}


function esconderTodosCronometros() {
    for (let i = 0; i < estado.lamp.length; i++) {
        esconderCronometro(i);
    }
}



function tocarSom() {
    var som = document.getElementById('soundRele');
    if (som) {
        som.currentTime = 0; // Rewind to start
        som.play();
    }
}




function atualizarVisualInterruptor(indice) {
    const interruptor = document.getElementById(`inp${indice + 1}`);
    if (interruptor) {
        if (estado.lamp[indice]) {
            interruptor.src = "interruptorON.png";
        } else {
            interruptor.src = "interruptorOFF.png";
        }
    }
}