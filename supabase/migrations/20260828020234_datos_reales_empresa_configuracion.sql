-- Entrega a producción (2026-08-27): la cuenta de cobro (facturaPdf.ts) y la
-- plantilla factura-pictograficos.html dejaban como placeholder punteado la
-- dirección, el NIT, el representante legal y varias redes sociales porque
-- `configuracion` no tenía dónde guardarlos. Se agregan aquí y se cargan con
-- los datos reales de la empresa (ver ConfiguracionPage, sección "Datos de
-- la empresa").

alter table configuracion
  add column direccion text,
  add column ciudad varchar(100),
  add column nit varchar(30),
  add column representante_legal_nombre varchar(150),
  add column representante_legal_documento varchar(30),
  add column instagram varchar(100),
  add column facebook varchar(100),
  add column tiktok varchar(100),
  add column whatsapp varchar(30),
  add column sitio_web varchar(150);
