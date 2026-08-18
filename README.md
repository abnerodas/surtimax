# SurtiMax

Sistema de gestión para tiendas: inventario, ventas (ingresos), egresos y control de fechas de vencimiento. 100% local (los datos viven en el navegador, IndexedDB), instalable como app web (PWA) y desplegable en Firebase Hosting.

## Funcionalidades

- **Inicio**: resumen con ventas, utilidad y egresos del día, alertas de stock bajo y vencimientos, top de productos del mes.
- **Inventario**: alta/edición/baja de productos con categorías, código de barras, costo, precio, stock mínimo, unidad y fecha de vencimiento. Ajuste rápido de stock.
- **Vender**: punto de venta con búsqueda por nombre o código, carrito, métodos de pago, descuento manual de stock automático e historial con restauración de stock.
- **Egresos**: registro de gastos por categoría, filtros y exportación CSV.
- **Vencimientos**: productos vencidos, próximos a vencer (días configurables) y vigentes, con acción de descarte.
- **Reportes**: rangos (hoy, 7 días, mes, año, todo), utilidad bruta, balance neto, gráfico ingresos vs egresos, egresos por categoría, ventas por método de pago y exportación CSV.
- **Configuración**: nombre de tienda, moneda, días de alerta, categorías, respaldo/restauración JSON y restablecimiento total.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # build de producción + PWA
npm run lint
```

## Despliegue (Firebase Hosting)

```bash
firebase login              # una sola vez
firebase projects:create surtimax   # crea el proyecto (opcional)
firebase use --add surtimax --alias default
npm run deploy              # build + deploy
```

La app queda disponible en `https://surtimax.web.app`. En el navegador (Chrome/Edge/Safari) aparecerá la opción **Instalar app** para usarla como aplicación nativa, incluso sin conexión.

## Importante

Los datos son locales al dispositivo/navegador (IndexedDB). Usa **Configuración → Respaldo** para descargar copias JSON y guárdalas en un lugar seguro.