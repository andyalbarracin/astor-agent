# Astor — Referencia de tokens

> Documento vivo. Valores concretos que implementa `packages/design-tokens` (Fase 0b).
> Derivados de los fundamentos de Atlassian Design System. **Default: dark.**

## Color — semántico (light / dark)

| Token | Light | Dark |
|---|---|---|
| `surface.base` | `#FFFFFF` | `#101214` |
| `surface.raised` | `#FFFFFF` | `#161A1D` |
| `surface.overlay` | `#FFFFFF` | `#22272B` |
| `surface.sunken` | `#F7F8F9` | `#0D0F10` |
| `text.default` | `#172B4D` | `#E7EDF3` |
| `text.subtle` | `#44546F` | `#9FADBC` |
| `text.subtlest` | `#626F86` | `#7A8896` |
| `text.inverse` | `#FFFFFF` | `#1D2125` |
| `text.disabled` | `#8993A4` | `#5A6572` |
| `border.default` | `#DCDFE4` | `#2C333A` |
| `border.subtle` | `#EBECF0` | `#22272B` |
| `border.focus` | `#388BFF` | `#4C9AFF` |
| `brand.default` | `#0C66E4` | `#4C9AFF` |
| `brand.bold` | `#0055CC` | `#579DFF` |
| `brand.text` | `#0C66E4` | `#85B8FF` |
| `danger.default` | `#C9372C` | `#F87168` |
| `danger.text` | `#AE2A19` | `#FD9891` |
| `danger.subtle` | `#FFECEB` | `#42221F` |
| `success.default` | `#22A06B` | `#4BCE97` |
| `success.text` | `#216E4E` | `#7EE2B8` |
| `success.subtle` | `#DCFFF1` | `#1C3329` |
| `warning.default` | `#E2B203` | `#F5CD47` |
| `warning.text` | `#7F5F01` | `#F8E6A0` |
| `warning.subtle` | `#FFF7D6` | `#332E1B` |
| `discovery.default` | `#6E5DC6` | `#9F8FEF` |
| `discovery.text` | `#5E4DB2` | `#B8ACF6` |
| `discovery.subtle` | `#F3F0FF` | `#2B2451` |
| `signature.default` (ámbar pantera) | `#B45309` | `#F4B860` |
| `signature.text` | `#92400E` | `#F8CE97` |
| `signature.soft` | `#FBEBD2` | `#2A2013` |

## Espaciado (escala 4px)

| Token | px |
|---|---|
| `space.0` | 0 |
| `space.025` | 2 |
| `space.050` | 4 |
| `space.100` | 8 |
| `space.150` | 12 |
| `space.200` | 16 |
| `space.300` | 24 |
| `space.400` | 32 |
| `space.500` | 40 |
| `space.600` | 48 |
| `space.800` | 64 |

## Tipografía

| Token | Valor |
|---|---|
| `font.family.sans` | `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (web añade `Inter`) |
| `font.size.100` | 11 |
| `font.size.200` | 12 |
| `font.size.300` | 14 (body default) |
| `font.size.400` | 16 |
| `font.size.500` | 20 |
| `font.size.600` | 24 |
| `font.size.700` | 29 |
| `font.size.800` | 35 |
| `font.weight.regular` | 400 |
| `font.weight.medium` | 500 |
| `font.weight.semibold` | 600 |
| `font.weight.bold` | 700 |
| `font.lineHeight.tight` | 1.2 |
| `font.lineHeight.default` | 1.5 |

## Radios

| Token | px |
|---|---|
| `radius.sm` | 3 |
| `radius.md` | 6 |
| `radius.lg` | 8 |
| `radius.full` | 9999 |

## Elevación (sombras)

| Token | Light | Dark |
|---|---|---|
| `shadow.raised` | `0 1px 1px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.13)` | `0 1px 1px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.5)` |
| `shadow.overlay` | `0 8px 12px rgba(9,30,66,0.15), 0 0 1px rgba(9,30,66,0.31)` | `0 8px 12px rgba(0,0,0,0.55), 0 0 1px rgba(0,0,0,0.6)` |

> En dark, la elevación se comunica principalmente subiendo `surface.raised`/`surface.overlay`
> respecto de `surface.base`; las sombras son sutiles.
