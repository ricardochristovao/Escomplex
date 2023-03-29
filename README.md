# Análise de Complexidade de Código em JavaScript

Este é um programa Node.js que analisa a complexidade do código JavaScript em um repositório do GitHub e gera um arquivo CSV com os resultados. Ele utiliza a biblioteca `escomplex` para fazer a análise da complexidade do código.

## Pré-requisitos

- Node.js instalado na sua máquina.
- Uma conta no GitHub e um token de acesso pessoal. Consulte a [documentação do GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) para obter mais informações sobre como criar um token de acesso pessoal.

## Instalação

1. Clone este repositório: `git clone https://github.com/seu-usuario/analisador-complexidade-js`.
2. Instale as dependências do projeto: `npm install`.

## Como usar

1. Defina a variável de ambiente `GITHUB_TOKEN` com o seu token de acesso pessoal do GitHub: `export GITHUB_TOKEN=seu-token`.
2. Edite o arquivo `github-escomplex.js` para configurar o proprietário e o repositório do GitHub que você deseja analisar.
3. Execute o comando `node github-escomplex.js` para iniciar a análise de complexidade de código.
4. Os resultados serão salvos em um arquivo CSV chamado `results.csv`.
