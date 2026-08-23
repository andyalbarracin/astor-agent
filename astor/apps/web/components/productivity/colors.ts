/**
 * Colores de acento por sección (Lunes ≠ Martes). Derivados de la paleta.
 * Se usan para la barra superior de la card y el check de sus ítems, sin romper
 * el sistema visual (near-black/wheat + estos acentos).
 */
export const SECTION_COLORS = [
  '#FFBD76', // nectarine
  '#3FA9B8', // oceanic
  '#7CC96A', // verde césped
  '#9F8FEF', // discovery
  '#F87168', // coral
  '#F5CD47', // ámbar
  '#6FC5D4', // teal claro
  '#C99BEC', // lila
] as const;

export function sectionColor(index: number): string {
  return SECTION_COLORS[index % SECTION_COLORS.length]!;
}
