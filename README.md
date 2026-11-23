# WAVE RUNNER

Arcade runner aquático 3D multiplayer, construído com Three.js, Express e WebSocket.

## Recursos da primeira versão
- Prancha e surfista procedurais em 3D
- Oceano animado, espuma e rastro
- Movimento lateral livre, salto e deslize
- Jet skis móveis e barcos como obstáculos
- Garrafas pressurizadas: 5 completam o turbo
- Moedas, distância, velocidade, ping e FPS
- Salas WebSocket com até 3 jogadores
- Interface adaptável para celular e PC

## Executar localmente
```bash
npm install
npm start
```
Abra http://localhost:3000

## Deploy no Render
Crie um Web Service apontando para este repositório. O arquivo render.yaml configura o serviço. Use Node 20 e o comando de início `npm start`.

## Controles
- A/D ou setas: mover lateralmente
- Espaço ou seta para cima: pular
- S ou seta para baixo: deslizar
- Shift ou botão TURBO: ativar turbo quando houver 5 garrafas

## Estado
Protótipo inicial. O multiplayer sincroniza jogadores e ping, mas ainda precisa de testes em rede real e validação autoritativa de corrida antes de uma competição ranqueada.
