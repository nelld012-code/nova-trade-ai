export type CountryOption = { code: string; name: string; flag: string };

const rawCountries: [string, string, string][] = [
  ["AR", "Argentina", "🇦🇷"], ["BO", "Bolivia", "🇧🇴"], ["BR", "Brasil", "🇧🇷"], ["CL", "Chile", "🇨🇱"],
  ["CO", "Colombia", "🇨🇴"], ["CR", "Costa Rica", "🇨🇷"], ["CU", "Cuba", "🇨🇺"], ["DO", "República Dominicana", "🇩🇴"],
  ["EC", "Ecuador", "🇪🇨"], ["SV", "El Salvador", "🇸🇻"], ["GT", "Guatemala", "🇬🇹"], ["HN", "Honduras", "🇭🇳"],
  ["MX", "México", "🇲🇽"], ["NI", "Nicaragua", "🇳🇮"], ["PA", "Panamá", "🇵🇦"], ["PY", "Paraguay", "🇵🇾"],
  ["PE", "Perú", "🇵🇪"], ["PR", "Puerto Rico", "🇵🇷"], ["UY", "Uruguay", "🇺🇾"], ["VE", "Venezuela", "🇻🇪"],
  ["US", "Estados Unidos", "🇺🇸"], ["CA", "Canadá", "🇨🇦"], ["ES", "España", "🇪🇸"], ["PT", "Portugal", "🇵🇹"],
  ["FR", "Francia", "🇫🇷"], ["DE", "Alemania", "🇩🇪"], ["IT", "Italia", "🇮🇹"], ["GB", "Reino Unido", "🇬🇧"],
  ["NL", "Países Bajos", "🇳🇱"], ["BE", "Bélgica", "🇧🇪"], ["CH", "Suiza", "🇨🇭"], ["AT", "Austria", "🇦🇹"],
  ["SE", "Suecia", "🇸🇪"], ["NO", "Noruega", "🇳🇴"], ["DK", "Dinamarca", "🇩🇰"], ["FI", "Finlandia", "🇫🇮"],
  ["IE", "Irlanda", "🇮🇪"], ["AU", "Australia", "🇦🇺"], ["NZ", "Nueva Zelanda", "🇳🇿"], ["JP", "Japón", "🇯🇵"],
  ["KR", "Corea del Sur", "🇰🇷"], ["CN", "China", "🇨🇳"], ["IN", "India", "🇮🇳"], ["AE", "Emiratos Árabes Unidos", "🇦🇪"],
  ["ZA", "Sudáfrica", "🇿🇦"], ["EG", "Egipto", "🇪🇬"], ["MA", "Marruecos", "🇲🇦"], ["NG", "Nigeria", "🇳🇬"],
  ["RU", "Rusia", "🇷🇺"], ["TR", "Turquía", "🇹🇷"], ["IL", "Israel", "🇮🇱"], ["SG", "Singapur", "🇸🇬"],
];

export const countryOptions: CountryOption[] = rawCountries.map(([code, name, flag]) => ({ code, name, flag }));
