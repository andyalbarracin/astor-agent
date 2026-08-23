# Astor — Referencia de tokens

> Documento vivo. Valores concretos que implementa `packages/design-tokens`.
> Paleta: **Onyx** #0A171D · **Wheat** #FFF6E9 · **Oceanic** #003F47 · **Nectarine** #FFBD76
> + verde césped (success). **Default: dark.**

## Color — semántico (light / dark)

| Token | Light | Dark |
|---|---|---|
| `surface.base` | `#FFF6E9` (wheat) | `#0A171D` (onyx) |
| `surface.raised` | `#FFFFFF` | `#10222B` |
| `surface.overlay` | `#FFFFFF` | `#18303A` |
| `surface.sunken` | `#F6EAD5` | `#060F14` |
| `text.default` | `#0A171D` | `#EAF1F4` |
| `text.subtle` | `#45565E` | `#9FB2BC` |
| `text.subtlest` | `#6B7C84` | `#6E8591` |
| `text.inverse` | `#FFF6E9` | `#0A171D` |
| `text.disabled` | `#9AA7AD` | `#4E626D` |
| `border.default` | `#E4D8C2` | `#21343E` |
| `border.subtle` | `#EFE6D5` | `#152833` |
| `border.focus` | `#007A8A` | `#3FA9B8` |
| `brand.default` (oceanic) | `#005A66` | `#3FA9B8` |
| `brand.bold` | `#003F47` | `#5FC0CE` |
| `brand.text` | `#005A66` | `#8AD3DE` |
| `danger.default` | `#C9372C` | `#F87168` |
| `danger.text` | `#AE2A19` | `#FD9891` |
| `danger.subtle` | `#FFECEB` | `#42221F` |
| `success.default` (verde césped) | `#4E9A3E` | `#7CC96A` |
| `success.text` | `#2E6B26` | `#A7E09A` |
| `success.subtle` | `#E4F5DE` | `#14290F` |
| `warning.default` | `#E2B203` | `#F5CD47` |
| `warning.text` | `#7F5F01` | `#F8E6A0` |
| `warning.subtle` | `#FFF7D6` | `#332E1B` |
| `discovery.default` | `#6E5DC6` | `#9F8FEF` |
| `discovery.text` | `#5E4DB2` | `#B8ACF6` |
| `discovery.subtle` | `#F3F0FF` | `#2B2451` |
| `signature.default` (nectarine) | `#C77A22` | `#FFBD76` |
| `signature.text` | `#8A4E12` | `#FFD5A3` |
| `signature.soft` | `#FFEBD0` | `#2A1D0F` |

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
