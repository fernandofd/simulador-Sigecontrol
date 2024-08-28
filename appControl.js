document.addEventListener('DOMContentLoaded', function () {
    configurarAlternancia();
    configurarBotoes();
    configurarModal();
});

var estado = {
    simuladorLigado: false,
    lamp: [false, false, false, false, false, false, false, false], // Estado das lâmpadas
    funcao: [0, 0, 0, 0, 0, 0, 0, 0], // Modo de operação de cada canal
    tempoLampada: [0, 0, 0, 0, 0, 0, 0, 0] // Tempo configurado para cada canal
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
    if (!ativo) {
        // Apenas desliga as lâmpadas, mas mantém as configurações em memória
        estado.lamp.fill(false);
        atualizarTodasLampadas();
        esconderTodosCronometros(); // Esconde todos os cronômetros ao desligar o simulador
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
            atualizarVisualLampada(i);
        }
    }

    function atualizarVisualLampada(indice) {
        const led = document.getElementById(`led${indice + 1}`);
        if (led) {
            led.classList.toggle('ledOn', estado.lamp[indice]);
            led.classList.toggle('ledOff', !estado.lamp[indice]);
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

    function definirFuncao(indice, funcao) {
        if (estado.simuladorLigado) {
            let par = (indice % 2 === 0) ? indice + 1 : indice - 1;

            // Atualiza a função do canal atual
            estado.funcao[indice] = funcao;
            estado.lamp[indice] = false; // Desliga o canal ao trocar de função
            atualizarVisualLampada(indice);
            esconderCronometro(indice); // Esconde o cronômetro ao trocar de função

            // Verifica se a função anterior era "Nível" ou "Reversão"
            if (estado.funcao[par] === 3 || estado.funcao[par] === 7) {
                if (funcao !== 3 && funcao !== 7) {
                    // Se o novo modo não é "Nível" ou "Reversão", redefine o par para "Normal"
                    estado.funcao[par] = 0;
                    estado.lamp[par] = false;
                    atualizarVisualLampada(par);
                    esconderCronometro(par); // Esconde o cronômetro do par ao redefinir para "Normal"
                }
            }


            switch (funcao) {
                case 0:
                    configurarModoNormal(indice);
                    break;
                case 1:
                    configurarModoTimerminutos(indice);
                    break;
                case 2:
                    configurarModoTimersegundos(indice);
                    break;
                case 3:
                    configurarModoNivel(indice);
                    break;
                case 4:
                    configurarModoDeteccao(indice);
                    break;
                case 5:
                    configurarModoRetencao(indice);
                    break;
                case 6:
                    configurarModoContatora(indice);
                    break;
                case 7:
                    configurarModoReversao(indice);
                    break;
                case 8:
                    configurarModoRetardoMinutos(indice);
                    break;
                case 9:
                    configurarModoRetardoSegundos(indice);
                    break;
                default:
                    break;
            }
        } else {
            alert("O simulador está desligado.");
        }
    }

    // Configuração dos botões
    function configurarBotoes() {
        for (let i = 0; i < 8; i++) {
            let botao = document.getElementById(`bot${i + 1}`);
            if (botao) {
                botao.addEventListener('click', function () {
                    if (estado.simuladorLigado) {
                        switch (estado.funcao[i]) {
                            case 0:
                                executarModoNormal(i);
                                break;
                            case 1:
                                executarModoTimerminutos(i);
                                break;
                            case 2:
                                executarModoTimersegundos(i);
                                break;
                            case 3:
                                executarModoNivel(i);
                                break;
                            case 4:
                                executarModoDeteccao(i);
                                break;
                            case 5:
                                executarModoRetencao(i);
                                break;
                            case 6:
                                executarModoContatora(i);
                                break;
                            case 7:
                                executarModoReversao(i);
                                break;
                            case 8:
                                executarModoRetardoMinutos(i);
                                break;
                            case 9:
                                executarModoRetardoSegundos(i);
                                break;
                            default:
                                break;
                        }
                    } else {
                        alert("O simulador está desligado.");
                    }
                });

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

    // Função para configurar o modo Normal
    function configurarModoNormal(indice) {
        estado.funcao[indice] = 0; // Define o modo Normal

        // Desliga a lâmpada associada ao canal
        estado.lamp[indice] = false;

        // Cancela qualquer temporizador ou cronômetro ativo associado ao canal
        clearTimeout(estado[`temporizadorAtual_${indice}`]);
        clearInterval(estado[`intervaloCronometro_${indice}`]);

        // Remove eventos onmousedown e onmouseup que possam estar associados ao canal
        let botao = document.getElementById(`bot${indice + 1}`);
        botao.onmousedown = null;
        botao.onmouseup = null;

        // Garantir que não há eventos de clique ainda associados ao botão
        botao.replaceWith(botao.cloneNode(true));
        botao = document.getElementById(`bot${indice + 1}`);

        // Redefine o evento de clique padrão para o modo Normal
        botao.addEventListener('click', function () {
            executarModoNormal(indice);
        });

        // Zera o tempo configurado para o canal
        estado.tempoLampada[indice] = 0;

        // Esconde o cronômetro, caso esteja ativo
        esconderCronometro(indice);

        // Atualiza a visualização do LED para garantir que esteja desligado
        atualizarVisualLampada(indice);
    }

    // Função para executar o modo Normal
    function executarModoNormal(indice) {
        // Alterna o estado da lâmpada
        estado.lamp[indice] = !estado.lamp[indice];
        atualizarVisualLampada(indice);
        tocarSom();
    }






    function configurarModoTimerminutos(indice) {
        estado.funcao[indice] = 1;
        estado.lamp[indice] = false; // Desliga a lâmpada inicialmente
        atualizarVisualLampada(indice);
        esconderCronometro(indice)
    }




    // Função para executar o modo Timer Minutos
    function executarModoTimerminutos(indice) {
        if (!estado.lamp[indice]) {
            // Se a lâmpada está desligada, liga e inicia o timer
            clearTimeout(estado.temporizadorAtual); // Cancela o temporizador
            estado.lamp[indice] = true;
            atualizarVisualLampada(indice);
            tocarSom();

            const duracao = estado.tempoLampada[indice] * 60 * 1000;

            estado.temporizadorAtual = setTimeout(function () {
                estado.lamp[indice] = false;
                atualizarVisualLampada(indice);
                tocarSom();
                esconderCronometro(indice);
            }, duracao);

            mostrarCronometro(indice, duracao); // Mostra o cronômetro na tela
        } else {
            // Se a lâmpada está ligada, desliga e esconde o cronômetro
            estado.lamp[indice] = false;
            clearTimeout(estado.temporizadorAtual); // Cancela o temporizador
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        }
    }




    // Função para configurar o modo Timer Segundos
    function configurarModoTimersegundos(indice) {
        estado.funcao[indice] = 2;
        estado.lamp[indice] = false; // Desliga a lâmpada inicialmente
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice)
    }




    // Função para executar o modo Timer Segundos
    function executarModoTimersegundos(indice) {
        if (!estado.lamp[indice]) {
            clearTimeout(estado.temporizadorAtual); // Cancela o temporizador
            // Se a lâmpada está desligada, liga e inicia o timer
            estado.lamp[indice] = true;
            atualizarVisualLampada(indice);
            tocarSom();

            const duracao = estado.tempoLampada[indice] * 1000;

            estado.temporizadorAtual = setTimeout(function () {
                estado.lamp[indice] = false;
                atualizarVisualLampada(indice);
                tocarSom();
                esconderCronometro(indice);
            }, duracao);

            mostrarCronometro(indice, duracao); // Mostra o cronômetro na tela
        } else {
            // Se a lâmpada está ligada, desliga e esconde o cronômetro
            estado.lamp[indice] = false;
            clearTimeout(estado.temporizadorAtual); // Cancela o temporizador
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        }
    }






    // Função para configurar o modo Retardo Minutos
    function configurarModoRetardoMinutos(indice) {
        estado.funcao[indice] = 8;
        estado.lamp[indice] = false; // Desliga a lâmpada inicialmente
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice)
    }

    // Função para executar o modo Retardo Minutos
    function executarModoRetardoMinutos(indice) {
        if (!estado.lamp[indice]) {
            // Cancela qualquer timeout e intervalo anterior
            clearTimeout(estado.temporizadorAtual);
            clearInterval(estado.intervaloCronometro);

            // Inicia o retardo
            const duracao = estado.tempoLampada[indice] * 60 * 1000;

            // Mostrar o cronômetro
            mostrarCronometro(indice, duracao);

            // Define um novo timeout para ligar a lâmpada após o retardo
            estado.temporizadorAtual = setTimeout(function () {
                estado.lamp[indice] = true;
                atualizarVisualLampada(indice);
                tocarSom();
                esconderCronometro(indice); // Esconde o cronômetro após ligar a lâmpada
            }, duracao);

        } else {
            // Se a lâmpada está ligada, desliga e cancela o temporizador e o cronômetro
            estado.lamp[indice] = false;
            clearTimeout(estado.temporizadorAtual);
            clearInterval(estado.intervaloCronometro);
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        }
    }

    // Função para configurar o modo Retardo Segundos
    function configurarModoRetardoSegundos(indice) {
        estado.funcao[indice] = 9;
        estado.lamp[indice] = false; // Desliga a lâmpada inicialmente
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice)
    }

    // Função para executar o modo Retardo Segundos
    function executarModoRetardoSegundos(indice) {
        if (!estado.lamp[indice]) {
            // Cancela qualquer timeout e intervalo anterior
            clearTimeout(estado.temporizadorAtual);
            clearInterval(estado.intervaloCronometro);

            // Inicia o retardo
            const duracao = estado.tempoLampada[indice] * 1000;

            // Mostrar o cronômetro
            mostrarCronometro(indice, duracao);

            // Define um novo timeout para ligar a lâmpada após o retardo
            estado.temporizadorAtual = setTimeout(function () {
                estado.lamp[indice] = true;
                atualizarVisualLampada(indice);
                tocarSom();
                esconderCronometro(indice); // Esconde o cronômetro após ligar a lâmpada
            }, duracao);

        } else {
            // Se a lâmpada está ligada, desliga e cancela o temporizador e o cronômetro
            estado.lamp[indice] = false;
            clearTimeout(estado.temporizadorAtual);
            clearInterval(estado.intervaloCronometro);
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        }
    }



    /// Função para configurar o modo Retenção
    function configurarModoRetencao(indice) {
        estado.funcao[indice] = 5;
        estado.lamp[indice] = false; // Inicialmente, a lâmpada está desligada
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice);

        // Ativando eventos específicos de Retenção
        let botao = document.getElementById(`bot${indice + 1}`);

        // Limpa qualquer evento antigo para evitar duplicação
        botao.onmousedown = null;
        botao.onmouseup = null;
        botao.replaceWith(botao.cloneNode(true));
        botao = document.getElementById(`bot${indice + 1}`);

        // Reatribui eventos para Retenção
        botao.addEventListener('mousedown', function () {
            estado.lamp[indice] = true; // Liga a lâmpada enquanto o botão está pressionado
            atualizarVisualLampada(indice);
            tocarSom();
        });

        botao.addEventListener('mouseup', function () {
            estado.lamp[indice] = false; // Desliga a lâmpada ao soltar o botão
            atualizarVisualLampada(indice);
            tocarSom();
        });
    }


    function executarModoRetencao(indice) {
        const botao = document.getElementById(`bot${indice + 1}`);

        botao.addEventListener('mousedown', function () {
            estado.lamp[indice] = true; // Liga a lâmpada enquanto o botão está pressionado
            atualizarVisualLampada(indice);
            tocarSom();
        });

        botao.addEventListener('mouseup', function () {
            estado.lamp[indice] = false; // Desliga a lâmpada ao soltar o botão
            atualizarVisualLampada(indice);
            tocarSom();
        });
    }



    /// Função para configurar o modo Detecção
    function configurarModoDeteccao(indice) {
        estado.funcao[indice] = 4;
        estado.lamp[indice] = false; // Inicialmente, a lâmpada está desligada
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice);

        // Verifica se o botão está pressionado no momento da configuração
        const botao = document.getElementById(`bot${indice + 1}`);
        if (botao.matches(':active')) {
            estado.lamp[indice] = false; // Desliga a lâmpada se o botão está pressionado
            atualizarVisualLampada(indice);
            tocarSom();
        }
    }


    // Função para configurar o modo Detecção
    function configurarModoDeteccao(indice) {
        estado.funcao[indice] = 4;
        estado.lamp[indice] = false; // Inicialmente, a lâmpada está desligada
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice);

        // Reativar os eventos específicos de Detecção
        reativarEventosDeteccao(indice);
    }

    // Função para reativar os eventos de detecção
    function reativarEventosDeteccao(indice) {
        let botao = document.getElementById(`bot${indice + 1}`);

        // Limpa qualquer evento antigo para evitar duplicação
        botao.onmousedown = null;
        botao.onmouseup = null;
        botao.replaceWith(botao.cloneNode(true));
        botao = document.getElementById(`bot${indice + 1}`);

        // Reatribui eventos para Detecção
        botao.addEventListener('mousedown', function () {
            clearTimeout(estado[`temporizadorAtual_${indice}`]);
            clearInterval(estado[`intervaloCronometro_${indice}`]);

            estado.lamp[indice] = false; // Apaga a lâmpada enquanto o botão estiver pressionado
            atualizarVisualLampada(indice);
            tocarSom();
            esconderCronometro(indice);
        });

        botao.addEventListener('mouseup', function () {
            clearTimeout(estado[`temporizadorAtual_${indice}`]);
            clearInterval(estado[`intervaloCronometro_${indice}`]);

            const duracao = estado.tempoLampada[indice] * 1000; // Convertendo o tempo configurado em segundos

            if (duracao > 0) {
                mostrarCronometro(indice, duracao);

                estado[`temporizadorAtual_${indice}`] = setTimeout(function () {
                    estado.lamp[indice] = true;
                    atualizarVisualLampada(indice);
                    tocarSom();
                    esconderCronometro(indice);
                }, duracao);
            } else {
                estado.lamp[indice] = true;
                atualizarVisualLampada(indice);
                tocarSom();
            }
        });

        // Verificação contínua para o estado do botão
        verificarEstadoBotao(indice);
    }

    // Função para verificar o estado do botão continuamente
    function verificarEstadoBotao(indice) {
        let botao = document.getElementById(`bot${indice + 1}`);
        let mouseSobreBotao = false;

        // Evento para verificar se o mouse está sobre o botão
        botao.addEventListener('mouseenter', function () {
            mouseSobreBotao = true;
        });

        botao.addEventListener('mouseleave', function () {
            mouseSobreBotao = false;
        });

        // Verifica se o botão está pressionado e se o mouse está sobre a div
        estado[`intervaloVerificacao_${indice}`] = setInterval(() => {
            if (!botao.matches(':active') && !mouseSobreBotao) {
                // Se o botão não está pressionado e o mouse não está sobre o botão
                iniciarDeteccao(indice);
                clearInterval(estado[`intervaloVerificacao_${indice}`]); // Para a verificação contínua
            }
        }, 100); // Verifica o estado do botão a cada 100ms
    }

    // Função para iniciar a lógica de detecção
    function iniciarDeteccao(indice) {
        clearTimeout(estado[`temporizadorAtual_${indice}`]);
        clearInterval(estado[`intervaloCronometro_${indice}`]);

        const duracao = estado.tempoLampada[indice] * 1000; // Convertendo o tempo configurado em segundos

        if (duracao > 0) {
            mostrarCronometro(indice, duracao);

            estado[`temporizadorAtual_${indice}`] = setTimeout(function () {
                estado.lamp[indice] = true;
                atualizarVisualLampada(indice);
                tocarSom();
                esconderCronometro(indice);
            }, duracao);
        } else {
            estado.lamp[indice] = true;
            atualizarVisualLampada(indice);
            tocarSom();
        }
    }

    // Função para executar o modo Detecção
    function executarModoDeteccao(indice) {
        reativarEventosDeteccao(indice);
    }





    // Função para configurar o modo Nível
    function configurarModoNivel(indice) {
        estado.funcao[indice] = 3;
        estado.lamp[indice] = false; // Desliga a lâmpada inicialmente
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice);

        // Identifica o par correspondente
        let par = (indice % 2 === 0) ? indice + 1 : indice - 1;

        // Configura automaticamente o par para o modo nível
        estado.funcao[par] = 3;
        estado.lamp[par] = false; // Desliga a lâmpada do par
        atualizarVisualLampada(par);
        tocarSom();
    }


    // Função para executar o modo Nível
    function executarModoNivel(indice) {
        // Identifica o par correspondente
        let par = (indice % 2 === 0) ? indice + 1 : indice - 1;

        if (indice % 2 === 0) { // Porta Par (Liga ambos os LEDs)
            estado.lamp[indice] = false; // Desliga a lâmpada da porta par
            estado.lamp[par] = false; // Desliga a lâmpada do par correspondente
        } else { // Porta Ímpar (Desliga ambos os LEDs)
            estado.lamp[indice] = true; // liga a lâmpada da porta ímpar
            estado.lamp[par] = true; // liga a lâmpada do par correspondente
        }
        atualizarVisualLampada(indice);
        tocarSom();
        atualizarVisualLampada(par);
        tocarSom();
    }





    // Função para configurar o modo Reversão
    function configurarModoReversao(indice) {
        estado.funcao[indice] = 7;
        estado.lamp[indice] = false; // Desliga a lâmpada inicialmente
        atualizarVisualLampada(indice);
        tocarSom();
        esconderCronometro(indice);

        // Identifica o par correspondente
        let par = (indice % 2 === 0) ? indice + 1 : indice - 1;

        // Configura automaticamente o par para o modo reversão
        estado.funcao[par] = 7;
        estado.lamp[par] = false; // Desliga a lâmpada do par
        atualizarVisualLampada(par);
        tocarSom();
        esconderCronometro(par);

        // Copia o tempo configurado para o par correspondente após a configuração do modal
        setTimeout(() => {
            estado.tempoLampada[par] = estado.tempoLampada[indice];
        }, 100); // Define um pequeno atraso para garantir que o tempo tenha sido configurado
    }

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
    // Função para configurar o modal para o modo Reversão
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




    function abrirModal(indice) {
        const modal = document.getElementById("functionModal");
        modal.setAttribute('data-channel', indice);
        modal.style.display = "block";
    }




    function iniciarContagemRegressiva(indice, duracao, acaoFinal) {
        const display = document.getElementById(`timerDisplay${indice + 1}`);
        let tempoRestante = duracao;

        display.style.display = 'block'; // Mostra o cronômetro na tela
        display.textContent = `${tempoRestante} s`;

        const intervalo = setInterval(() => {
            tempoRestante--;
            if (tempoRestante > 0) {
                display.textContent = `${tempoRestante} s`;
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
        let tempoRestante = duracao / 1000;

        display.style.display = 'block';
        display.textContent = `${tempoRestante} s`;

        // Cancela qualquer cronômetro anterior para este índice
        clearInterval(estado[`intervaloCronometro_${indice}`]);

        // Cria um novo intervalo para o cronômetro deste índice
        const intervalo = setInterval(() => {
            tempoRestante--;
            if (tempoRestante > 0) {
                display.textContent = `${tempoRestante} s`;
            } else {
                clearInterval(intervalo);
                display.style.display = 'none';
            }
        }, 1000);

        // Armazena o identificador do intervalo no estado correspondente ao índice
        estado[`intervaloCronometro_${indice}`] = intervalo;
    }




    function esconderCronometro(indice) {
        clearInterval(estado.intervaloCronometro); // Cancela o intervalo do cronômetro
        const display = document.getElementById(`timerDisplay${indice + 1}`);
        display.style.display = 'none'; // Oculta o cronômetro
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