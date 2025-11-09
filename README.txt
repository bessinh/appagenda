#navegue ate a pasta 
cd "C:\Users\ucado\OneDrive\Área de Trabalho\appAgenda\pi"
#verifique se o docker esta rodando
docker ps
# if nao Na pasta onde está o docker-compose.yml (provavelmente na raiz ou na pasta pi/)
docker-compose up -d

#Inicie o servidor:
cd pi/pi
npm install
node server.js



=-=-=-=-=-=-=-=-=-=================================-=-=-
atualizacao 2.0
cd "C:\Users\ucado\OneDrive\Área de Trabalho\appAgenda\backEnd"

docker-compose up -d

npm install

PS C:\Users\ucado\OneDrive\Área de Trabalho\appAgenda\backEnd> node src/server.js      
(node:20600) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
C:\Users\ucado\OneDrive\Área de Trabalho\appAgenda\backEnd\src\server.js:1
import express from 'express';
^^^^^^

SyntaxError: Cannot use import statement outside a module
    at wrapSafe (node:internal/modules/cjs/loader:1486:18)
    at Module._compile (node:internal/modules/cjs/loader:1528:20)
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.14.0


cd "C:\Users\ucado\OneDrive\Área de Trabalho\appAgenda\backEnd"

node src/server.js


#abra um novo editor de pawersheel 
cd "C:\Users\ucado\OneDrive\Área de Trabalho\appAgenda\frontEnd"
npm start

npx expo start --clear
=-=-=-----------------==-=--------------------------------------=-=-
Backend:
cd backEnd
node src/server.js
=-=-=---------------------------------------------===================
Frontend:
cd frontEnd
npx expo start --clear
=-=-===============================================================
Como Limpar o Cache no Sistema Expo/React Native
Existem várias maneiras de limpar o cache no seu projeto Expo/React Native. Vou listar os métodos mais eficientes:

1. Limpeza Básica (Recomendada para maioria dos casos)
bash
# Execute na pasta do projeto frontEnd:
npx expo start --clear
2. Limpeza Completa do Cache
bash
# Execute na pasta do projeto frontEnd:
expo r -c  # Atalho para expo start --clear
npx expo start -c  # Alternativa equivalente
3. Limpeza Profunda (Para problemas persistentes)
bash
# Pare o servidor Expo (Ctrl+C)
rm -rf .expo
rm -rf node_modules
npm install
npx expo start --clear
4. Limpeza Específica para Dispositivos
Android:
bash
npx react-native run-android --reset-cache
iOS:
bash
cd ios
pod deintegrate
pod install
cd ..
npx expo start --clear
5. Limpeza Global do Expo CLI
bash
expo install -g expo-cli@latest  # Atualiza o CLI
expo doctor  # Verifica problemas
expo r -c    # Limpeza global do cache
6. Métodos Alternativos
Via package.json (crie um script):
json
"scripts": {
  "clean": "rm -rf .expo && rm -rf node_modules && npm install",
  "fresh-start": "npm run clean && npx expo start -c"
}
Execute com:

bash
npm run fresh-start
Usando o Expo Dev Tools:
Abra o painel de desenvolvedor (Ctrl+M no emulador)

Vá em "More Tools" → "Clear Cache"

7. Limpeza Específica para Windows
powershell
# No PowerShell:
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules
npm install
npx expo start --clear
Quando Limpar o Cache
Faça limpeza de cache quando:

Encontrar erros de módulo não resolvido

Componentes não atualizarem após mudanças

Ver comportamentos estranhos no bundler

Atualizar versões de dependências

Mudar a estrutura de pastas do projeto