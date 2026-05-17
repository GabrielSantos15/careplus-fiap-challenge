document.addEventListener('DOMContentLoaded', function() {
    const botaoConfirmar = document.querySelector('.btn-confirmar');

    // Obtém a primeira consulta do localStorage
    function obterProximaConsulta() {
        const consultas = JSON.parse(localStorage.getItem('careplus_consultas')) || [];
        return consultas
            .filter((c) => new Date(c.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    }

    // Carrega o estado da consulta ao carregar a página
    function carregarEstado() {
        const consulta = obterProximaConsulta();
        
        if (consulta) {
            if (consulta.status === 'Confirmado') {
                botaoConfirmar.textContent = 'Confirmado';
                botaoConfirmar.classList.add('confirmado');
            } else {
                botaoConfirmar.textContent = 'Confirmar';
                botaoConfirmar.classList.remove('confirmado');
            }
        }
    }

    // Alterna entre confirmar e confirmado
    botaoConfirmar.addEventListener('click', function() {
        const consultas = JSON.parse(localStorage.getItem('careplus_consultas')) || [];
        const proximaConsulta = obterProximaConsulta();
        
        if (proximaConsulta) {
            const index = consultas.findIndex(c => c.id === proximaConsulta.id);
            
            if (index !== -1) {
                if (consultas[index].status === 'Confirmado') {
                    // Volta para "Agendado"
                    consultas[index].status = 'Agendado';
                    botaoConfirmar.textContent = 'Confirmar';
                    botaoConfirmar.classList.remove('confirmado');
                } else {
                    // Muda para "Confirmado"
                    consultas[index].status = 'Confirmado';
                    botaoConfirmar.textContent = 'Confirmado';
                    botaoConfirmar.classList.add('confirmado');
                }
                
                // Salva no localStorage
                localStorage.setItem('careplus_consultas', JSON.stringify(consultas));
                
                // Dispara evento para atualizar o home.js em tempo real
                window.dispatchEvent(new Event('consultasAtualizadas'));
            }
        }
    });

    // Carrega o estado inicial
    carregarEstado();
});
