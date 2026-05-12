/**
 * Declaração de tipos para CSS Modules.
 * Permite importar arquivos .module.css como objetos tipados no TypeScript.
 */
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
