# Contexto del Proyecto — IA Condo Web & Panel Corporativo (`iacondo-website`)

## Identidad Corporativa y Fiscal (Obligatorio)
- **Empresa:** `SOLUCIONES DIGITALES CREAPPTIVAS C.A.`
- **RIF:** `J508901061`
- **Pie de página estándar:** `© {año} SOLUCIONES DIGITALES CREAPPTIVAS C.A. — Todos los derechos reservados.` + `RIF: J508901061` (sin la etiqueta "IDENTIFICACIÓN DEL CONTRIBUYENTE").

## Reglas de Marca e Idioma
- Responder siempre en **español**.
- Referirse siempre a la marca como **IA Condo** (`iacondo.com`, `app.iacondo.com`, `panel.iacondo.com`). **Nunca** mostrar los nombres heredados `"Condopro"` ni `"ProFix"` en textos orientados al usuario final.

## Arquitectura y Despliegue
- **Stack:** React + Vite (`src/App.jsx` para `iacondo.com`, `src/IACondoPanel.jsx` para `panel.iacondo.com` / `soporte.iacondo.com`).
- **Repositorio:** `https://github.com/alejandrosaezh-bit/iacondo-website.git` (rama principal: `main`).
- **Despliegue:** Automático en **Vercel** al hacer `git push origin main`.
- **Validación obligatoria antes de push:** Ejecutar `npm run build` y confirmar 0 errores.
