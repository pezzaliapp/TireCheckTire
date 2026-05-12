// Default B2B deep-link templates. Placeholders {w}/{h}/{r}.

export const DEFAULT_SUPPLIERS = [
  { id: "eprel",       name: "EPREL · UE",     urlTpl: "https://eprel.ec.europa.eu/screen/product/tyres?size={w}%2F{h}R{r}" },
  { id: "ciavarella",  name: "Ciavarella B2B", urlTpl: "https://www.ciavarellapneumatici.com/?s={w}%2F{h}+R{r}" },
  { id: "intergomma",  name: "Intergomma B2B", urlTpl: "https://www.intergomma.it/?s={w}%2F{h}+R{r}" },
  { id: "googleshop",  name: "Google Shop",    urlTpl: "https://www.google.com/search?tbm=shop&q=pneumatici+{w}%2F{h}+R{r}" },
];

export function expand(urlTpl, size) {
  if (!urlTpl || !size) return null;
  return urlTpl
    .replaceAll("{w}", size.w)
    .replaceAll("{h}", size.h)
    .replaceAll("{r}", size.r);
}
