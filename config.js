/**
 * Configuração do café — editar apenas este ficheiro (e menu.json / imagens) para outro estabelecimento.
 * @type {import('./js/types').CafeConfig}
 */
window.CAFE_CONFIG = {
  name: "Café Avenida",
  logo: {
    src: "images/logo.png",
    alt: "Café Avenida",
  },
  tagline: {
    pt: "PLACEHOLDER — descrição curta do café em português",
    en: "PLACEHOLDER — short café tagline in English",
  },
  about: {
    pt: "PLACEHOLDER — texto sobre o café, ambiente e proposta. Substitua por conteúdo real.",
    en: "PLACEHOLDER — about the café, atmosphere and offer. Replace with real copy.",
  },
  email: "EMAIL_DO_CAFÉ@exemplo.pt",
  phone: "+351255619414",
  phoneDisplay: "255 619 414",
  address: {
    street: "Av. Francisco Sá Carneiro 760",
    postalCode: "4575-052",
    city: "Alpendurada e Matos",
    country: "PT",
    full: "Av. Francisco Sá Carneiro 760, 4575-052 Alpendurada e Matos",
  },
  coordinates: {
    lat: 41.0789,
    lng: -8.2956,
  },
  /** Domínio público do site (sem barra final) — usado em QR codes e meta tags */
  domain: "https://NOME_DO_DOMINIO.example",
  social: {
    instagram: "https://instagram.com/INSTAGRAM_DO_CAFÉ",
    facebook: "https://facebook.com/FACEBOOK_DO_CAFÉ",
  },
  colors: {
    primary: "#8B5A3C",
    secondary: "#4B2C20",
    accent: "#A67C52",
    background: "#FAF8F5",
    text: "#3D2914",
    surface: "#ffffff",
  },
  /**
   * Horário por dia (0 = domingo … 6 = sábado, alinhado com Date.getDay()).
   * closeNextDay: true quando o encerramento é na madrugada do dia seguinte.
   */
  openingHours: {
    0: { open: "08:00", close: "01:00", closeNextDay: true },
    1: null,
    2: { open: "08:00", close: "01:00", closeNextDay: true },
    3: { open: "08:00", close: "01:00", closeNextDay: true },
    4: { open: "08:00", close: "01:00", closeNextDay: true },
    5: { open: "08:00", close: "03:00", closeNextDay: true },
    6: { open: "08:00", close: "03:00", closeNextDay: true },
  },
  media: {
    hero: {
      image: "images/88939391-3819-49a1-8059-53c54fed2bff.JPG",
      alt: {
        pt: "Interior acolhedor do café com mesas de madeira e iluminação suave",
        en: "Welcoming café interior with wooden tables and soft lighting",
      },
    },
    gallery: [
      {
        type: "image",
        src: "images/4dbd67af-5220-44cf-9ddf-1b24b951ba5a.JPG",
        alt: { pt: "Ementa e pratos do café", en: "Café menu and dishes" },
      },
      {
        type: "image",
        src: "images/7390af13-76f1-4b95-9907-d18f478198c0.JPG",
        alt: { pt: "Prato servido no café", en: "Dish served at the café" },
      },
      {
        type: "image",
        src: "images/72a46fa8-8dee-4799-8f0f-1dbab267ffb4.JPG",
        alt: { pt: "Comida e bebidas na mesa", en: "Food and drinks on the table" },
      },
      {
        type: "image",
        src: "images/8bd4af37-b7bb-4681-8240-f76e725bbf6b.JPG",
        alt: { pt: "Ambiente do salão", en: "Dining room atmosphere" },
      },
      {
        type: "image",
        src: "images/c8b54b91-0967-413f-8d3b-4035be5596d3.JPG",
        alt: { pt: "Detalhe de refeição", en: "Meal detail" },
      },
      {
        type: "video",
        src: "images/1e9433cf-54d8-4264-912c-4081ec58ff68.MP4",
        poster: "images/3093472a-3822-42c9-b2d6-0d08839e3046.JPG",
        alt: { pt: "Vídeo do ambiente do café", en: "Café atmosphere video" },
      },
      {
        type: "image",
        src: "images/27a76e09-8d58-4fcf-9c90-6948e6c0efc5.JPG",
        alt: { pt: "Mesa preparada", en: "Set table" },
      },
      {
        type: "image",
        src: "images/3635ff54-5023-4c6c-9166-8f7f99f628f6.JPG",
        alt: { pt: "Vista do espaço", en: "View of the space" },
      },
    ],
  },
};
