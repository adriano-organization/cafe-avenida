# Template de site para café local

Site estático (HTML/CSS/JS) reutilizável: todo o conteúdo do estabelecimento vive em **`config.js`**, **`menu.json`** e na pasta **`images/`**.

## Estrutura

```
├── index.html          # Página principal
├── ementa.html         # Ementa (otimizada para telemóvel / QR)
├── qr-print.html       # Cartão imprimível com QR
├── config.js           # Nome, morada, horário, cores, media, domínio
├── menu.json           # Categorias e itens da ementa (pt/en)
├── i18n/pt.js, en.js   # Textos da interface
├── css/                # Estilos
├── js/                 # i18n, horário, SEO, páginas
├── images/             # Fotos e vídeos do café
├── scripts/            # Geração de QR codes (Node)
└── qr/                 # QR gerados (SVG + PNG)
```

**Vite:** não é necessário — o site não tem bundling; servir os ficheiros tal como estão é suficiente para GitHub Pages ou Netlify.

## Editar a ementa

1. Abra `menu.json`.
2. Cada categoria tem `id`, `name.pt` / `name.en` e `items`.
3. Itens: `name`, `description`, `price`, `tags` opcionais (`vegetarian`, `glutenFree`), `allergens` opcional com `pt`/`en`.
4. Remova o prefixo `[EXEMPLO]` / `[SAMPLE]` quando tiver dados reais.

## Idioma (PT / EN)

- Botões **PT | EN** no header (sempre visíveis).
- Primeira visita: idioma do browser; fallback **PT**.
- Escolha guardada em `localStorage`.
- URLs: `?lang=pt` ou `?lang=en` (ex.: `ementa.html?lang=en`).
- Traduções da interface em `i18n/pt.js` e `i18n/en.js`.

## Horário

Definido em `config.js` → `openingHours`. O site mostra **Aberto agora** / **Fechado** com fuso `Europe/Lisbon`, incluindo encerramento após meia-noite.

## Regenerar o mapa ilustrado

O mapa da secção «Onde estamos» é um SVG gerado a partir do OpenStreetMap (como no Cafe-Preguiça):

```bash
cd scripts
npm run mapa
# se o Overpass falhar, repetir; ou usar dados em cache:
npm run mapa:cache
```

## Gerar QR codes

```bash
cd scripts
npm install
npm run generate-qr
# ou com domínio explícito:
node generate-qr.mjs --domain https://oseudominio.pt
```

Ficheiros em `qr/`: `ementa.svg/png`, `ementa-pt`, `ementa-en`. Imprima mesas via `qr-print.html`.

## Publicar

- **GitHub Pages:** repositório → Settings → Pages → branch `main`, pasta `/ (root)`.
- **Netlify:** arrastar a pasta ou ligar ao repo; sem comando de build.

Para testar localmente (necessário para `fetch` do `menu.json`):

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` (Vite só serve em desenvolvimento; em produção use GitHub Pages/Netlify sem build).

## Trocar de café

1. Editar `config.js` (nome, contactos, horário, `domain`, `social`, `media`).
2. Substituir `menu.json` e imagens em `images/`.
3. Regenerar QR com o novo domínio.

## Media encontrada

Na pasta `images/`: **31 fotografias JPG** (interior do Café Avenida, pratos, ementa física) e **1 vídeo MP4**. O `config.js` referencia um subconjunto para hero, galeria e vídeo; pode apontar outros ficheiros UUID conforme preferir.
