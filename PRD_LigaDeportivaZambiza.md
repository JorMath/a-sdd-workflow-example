

| ⚽ LIGA DEPORTIVA ZÁMBIZA Sistema Web de Gestión de Torneos y Partidos de Fútbol |
| :---: |
| **Parroquia de Zámbiza, Quito, Ecuador** |
| Versión: 1.0-draft    |    Autor: JorMath    |    Fecha: 2026-03-13    |    Estado: Draft |

| Campo | Valor |
| ----- | ----- |
| Versión | 1.0-draft |
| Producto | Liga Deportiva Zámbiza – Web App |
| Autor | Gentleman-Programming / AI Gentle Stack |
| Fecha | 2026-03-13 |
| Estado | Draft |
| Stack Técnico | Next.js 15, PostgreSQL \+ Drizzle ORM, TypeScript, Tailwind CSS 4, shadcn/ui, Zod 4 |
| Herramienta de Desarrollo | Claude Code \+ Cursor \+ AI Gentle Stack (SDD Workflow) |
| Metodología | Spec-Driven Development (SDD) — Gentleman-Programming |
| Revisión | Pendiente de aprobación del director deportivo |

# **1\. Planteamiento del Problema**

La parroquia de Zámbiza, en el nororiente de Quito, Ecuador, alberga una comunidad futbolística activa con múltiples equipos que participan en torneos inter-barriales de manera regular. Sin embargo, la organización de estos torneos se realiza completamente de forma manual: cuadernos físicos, grupos de WhatsApp, llamadas telefónicas y hojas de cálculo desconectadas.

**Este modelo manual genera una serie de problemas críticos:**

* Pérdida de información histórica: los resultados, estadísticas y sanciones de torneos anteriores se pierden o son inaccesibles.

* Falta de transparencia: los jugadores y equipos no tienen acceso en tiempo real a tablas de posiciones, resultados ni calendarios.

* Gestión ineficiente de sanciones: las tarjetas amarillas y rojas, las suspensiones y las multas se rastrean de manera informal, generando conflictos y falta de equidad.

* Sorteo manual de fixture: organizar un campeonato con 8 o más equipos de forma manual es propenso a errores y no garantiza imparcialidad.

* Registro de jugadores sin control: no existe un padrón oficial de jugadores habilitados, lo que permite inconsistencias como jugadores que participan en más de un equipo o jugadores no inscritos.

* Cero digitalización: no hay forma de compartir estadísticas públicamente, generar reportes ni mantener un historial deportivo de la comunidad.

| IMPACTO | La ausencia de un sistema digital genera desconfianza, conflictos entre equipos y una carga operativa enorme para los organizadores, que deben dedicar horas a tareas que un sistema automatizado resolvería en segundos. |
| :---: | :---- |

# **2\. Visión del Producto**

Una plataforma web moderna, accesible desde cualquier dispositivo, que digitalice completamente la gestión deportiva de la parroquia de Zámbiza: desde la inscripción de equipos y jugadores hasta la generación automática del fixture, el seguimiento en tiempo real de partidos, la gestión de sanciones, y la publicación de estadísticas históricas para toda la comunidad.

| ANTES del sistema |
| :---- |
| El organizador recibe llamadas, anota en un cuaderno quién ganó, calcula la tabla a mano, avisa resultados por WhatsApp, olvida quién tiene tarjetas acumuladas y al final del torneo nadie recuerda quién fue el goleador. |

| DESPUÉS del sistema |
| :---- |
| El organizador registra el resultado desde su celular en 2 minutos. La tabla se actualiza automáticamente. Los capitanes reciben notificación del próximo partido. Las sanciones vigentes se aplican sin discusión. Y al finalizar el torneo, la historia queda guardada para siempre. |

# **3\. Usuarios Objetivo**

## **3.1 Usuarios Primarios**

| Rol | Descripción | Necesidades Clave |
| ----- | ----- | ----- |
| Administrador / Organizador | Directivo de la Liga o árbitro principal. Gestiona todo el sistema. | CRUD completo de torneos, equipos, partidos, sanciones y jugadores. |
| Árbitro | Registra incidencias durante los partidos: goles, tarjetas, cambios. | Acceso rápido a formulario de acta desde móvil. |
| Capitán de Equipo | Responsable de su equipo: inscripción de jugadores, pagos. | Ver estado de su equipo, jugadores habilitados/sancionados, próximos partidos. |
| Jugador Registrado | Participante en torneos. | Ver su historial personal, tarjetas acumuladas, estadísticas. |

## **3.2 Usuarios Secundarios**

| Rol | Descripción |
| ----- | ----- |
| Público General / Aficionado | Vecinos de Zámbiza que siguen los torneos. Solo lectura: tablas, resultados, fixture. |
| Directivo de Parroquia | Autoridades locales que requieren reportes y estadísticas de actividad deportiva. |

# **4\. Stack Técnico — AI Gentle Stack**

Este proyecto se desarrolla íntegramente bajo el ecosistema AI Gentle Stack de Gentleman-Programming, utilizando Spec-Driven Development (SDD) como metodología principal. El stack ha sido seleccionado para maximizar la velocidad de desarrollo, la escalabilidad y la mantenibilidad a largo plazo.

| Capa | Tecnología | Versión | Justificación |
| ----- | ----- | ----- | ----- |
| Frontend / Full-Stack Framework | Next.js (App Router) | 15.x | SSR, RSC, rutas API integradas, ideal para SEO público de tablas y resultados. |
| Lenguaje | TypeScript | 5.x | Tipado estricto reduce bugs en lógica de torneos, fixtures y sanciones. |
| Base de Datos | PostgreSQL (producción) / SQLite (tests) | PG 16 / SQLite 3 | PostgreSQL para producción local. SQLite in-memory para tests unitarios e integración — mismo schema Drizzle, driver intercambiable. |
| ORM / Query | Drizzle ORM | Latest | ORM TypeScript-first, type-safe, zero-overhead. Schema compartido entre PG y SQLite. Migraciones con drizzle-kit. Queries sin magia: SQL explícito y predecible. |
| Estilos | Tailwind CSS | 4.x | Utility-first, responsive por defecto. Perfecto para móviles de los capitanes. |
| Componentes UI | shadcn/ui | Latest | Componentes accesibles y personalizables. Sin overhead de dependencias. |
| Autenticación | Auth.js (NextAuth v5) | Latest | Sesiones con JWT. Providers: credentials (email+password) \+ magic link. Middleware Next.js para proteger rutas por rol. |
| Formularios | React Hook Form \+ Zod | Latest | Validación de actas de partido, inscripciones, sanciones. |
| Estado Global | Zustand o Server State | Latest | Mínimo estado global; preferir Server Components con Drizzle queries directas. |
| Testing | Vitest \+ Playwright | Latest | Unit tests para lógica de torneo \+ E2E para flujos críticos. |
| CI/CD | GitHub Actions | Latest | Lint \+ Vitest \+ Playwright pipeline. Tests corren contra SQLite in-memory (sin BD externa requerida en CI). |
| AI Dev Tool | Opencode | Latest | Agentes con SDD workflow, skills, Engram memory y Context7 MCP. |
| Memoria de Agente | Engram (gentle-ai) | Latest | Memoria persistente cross-session de decisiones técnicas del proyecto. |
| Skills SDD | gentle-ai skills | Latest | Patrones curados para Next.js 15, Drizzle ORM, TypeScript strict. |

## **4.2 Estrategia de Base de Datos: Drizzle ORM \+ SQLite en Tests**

Una de las decisiones técnicas más importantes de este stack es el uso de Drizzle ORM con drivers intercambiables. El mismo schema TypeScript funciona contra PostgreSQL en desarrollo/producción y contra SQLite in-memory en los tests de integración.

| Entorno | Driver | BD | Cuándo |
| ----- | ----- | ----- | ----- |
| Desarrollo local | drizzle-orm/node-postgres | PostgreSQL 16 (Docker o local) | npm run dev |
| Tests unitarios | drizzle-orm/better-sqlite3 | SQLite :memory: | vitest — sin proceso externo, levanta en \<50ms |
| Tests de integración | drizzle-orm/better-sqlite3 | SQLite :memory: | vitest — seed \+ test \+ teardown por cada suite |
| Tests E2E | drizzle-orm/node-postgres | PostgreSQL (Docker Compose) | playwright — ambiente completo |
| Producción | drizzle-orm/node-postgres | PostgreSQL 16 | pm2 / docker run |

**Patrón de factory para tests:**

| Archivo | Responsabilidad |
| ----- | ----- |
| lib/db/schema.ts | Schema Drizzle único. Define todas las tablas, relaciones y tipos. 100% agnóstico al driver. |
| lib/db/client.ts | Exporta la instancia db. Lee DB\_DRIVER del env: 'pg' | 'sqlite'. En tests, siempre sqlite. |
| lib/db/migrations/ | Archivos SQL generados por drizzle-kit generate. Se aplican con drizzle-kit migrate. |
| tests/helpers/db.ts | createTestDb(): crea SQLite in-memory, aplica schema, retorna db \+ seed helpers. |
| tests/helpers/seed.ts | Factories para crear torneos, equipos, jugadores de prueba con datos mínimos válidos. |

| VENTAJA CLAVE | Los tests de integración NO requieren Docker, no requieren red, no requieren credenciales. Un nuevo desarrollador clona el repo, hace npm install y npm test — todo funciona inmediatamente. Tiempo de arranque de suite: \< 200ms. |
| :---: | :---- |

| SDD | Todo el desarrollo sigue el flujo: Constitution → Specify → Clarify → Plan → Tasks → Implement. Ninguna feature se codifica sin spec aprobada. El agente AI trabaja task a task con validación en cada paso. Los tests de integración usan SQLite in-memory: se levantan en milisegundos sin servicios externos. |
| :---: | :---- |

# **5\. Módulos Funcionales del Sistema**

El sistema se organiza en 10 módulos principales, cada uno con sus propias entidades, reglas de negocio y flujos de usuario.

| Módulo | Prioridad | Descripción |
| ----- | ----- | ----- |
| M1 — Gestión de Torneos | P0 — Crítico | Creación, configuración y administración del ciclo de vida de torneos. |
| M2 — Gestión de Equipos | P0 — Crítico | Alta, edición y seguimiento de equipos participantes. |
| M3 — Gestión de Jugadores | P0 — Crítico | Padrón de jugadores, inscripción por torneo, estado habilitado/sancionado. |
| M4 — Fixture y Sorteo | P0 — Crítico | Generación automática de calendarios de partidos y sorteos. |
| M5 — Registro de Partidos | P0 — Crítico | Acta digital: goles, tarjetas, cambios, resultado final. |
| M6 — Tablas de Posiciones | P0 — Crítico | Clasificación automática con criterios configurables. |
| M7 — Sanciones y Disciplina | P0 — Crítico | Control de tarjetas, suspensiones y multas económicas. |
| M8 — Estadísticas y Reportes | P1 — Importante | Goleadores, asistentes, fair play, historial histórico. |
| M9 — Notificaciones | P1 — Importante | Alertas de partidos, sanciones, resultados vía web/email. |
| M10 — Portal Público | P1 — Importante | Vista pública sin login: tablas, resultados, fixture, estadísticas. |

# **6\. Especificación Detallada de Módulos**

## **6.1 M1 — Gestión de Torneos**

El torneo es la entidad raíz del sistema. Cada torneo define el período, el formato de competición, el número de equipos y las reglas aplicables.

### **6.1.1 Entidad: Torneo**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) | Identificador único del torneo. |
| nombre | VARCHAR(150) | Ej: 'Copa Zámbiza 2026 — Apertura' |
| temporada | VARCHAR(20) | Ej: '2026', '2025-II' |
| categoria | ENUM | Libre, Sub-20, Sub-17, Femenino, Veteranos |
| formato | ENUM | Liga (todos vs todos), Copa (eliminación directa), Liga+Copa |
| estado | ENUM | Inscripciones / En Curso / Finalizado / Cancelado |
| fecha\_inicio | DATE | Fecha de inicio de la competición. |
| fecha\_fin | DATE | Fecha estimada/real de finalización. |
| max\_equipos | INTEGER | Número máximo de equipos admitidos (4-32). |
| partidos\_ida\_vuelta | BOOLEAN | Si hay partidos de ida y vuelta en la fase de liga. |
| puntos\_victoria | INTEGER | Default: 3 puntos por victoria. |
| puntos\_empate | INTEGER | Default: 1 punto por empate. |
| puntos\_derrota | INTEGER | Default: 0 puntos por derrota. |
| criterio\_desempate | JSON | Orden de criterios: DG, GF, GA, PD, sorteo... |
| tarjetas\_suspension | INTEGER | Número de tarjetas amarillas para suspensión automática. |
| inscripcion\_precio | DECIMAL(8,2) | Precio de inscripción por equipo (USD). |
| reglas\_descripcion | TEXT | Reglamento completo del torneo en texto libre. |
| created\_at | TIMESTAMPTZ | Fecha de creación del registro. |
| created\_by | UUID (FK) | Admin que creó el torneo. |

### **6.1.2 Flujos de Usuario — Torneos**

* ADMIN crea un nuevo torneo ingresando todos los parámetros de configuración.

* ADMIN abre inscripciones: los capitanes pueden inscribir sus equipos.

* ADMIN cierra inscripciones y ejecuta el sorteo de fixture.

* El torneo pasa a estado 'En Curso' automáticamente cuando se juega el primer partido.

* ADMIN puede cancelar o pausar un torneo con justificación obligatoria.

* Al registrar el último partido de la fase final, el sistema marca el torneo como 'Finalizado' y genera el reporte de campeón.

### **6.1.3 Reglas de Negocio — Torneos**

1. No se puede eliminar un torneo con partidos registrados. Solo se puede cancelar.

2. Un torneo en estado 'En Curso' no puede modificar sus parámetros de puntuación ni criterios de desempate.

3. El número de equipos debe ser par para generación de fixture. Si es impar, el sistema agrega un equipo 'BYE' fantasma.

4. Solo puede haber un torneo por categoría en estado 'En Curso' simultáneamente.

## **6.2 M2 — Gestión de Equipos**

Cada equipo tiene una identidad permanente en el sistema (trasciende torneos) y puede inscribirse en múltiples torneos a lo largo del tiempo.

### **6.2.1 Entidad: Equipo**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) | Identificador único del equipo. |
| nombre | VARCHAR(100) | Nombre oficial del equipo. |
| escudo\_url | TEXT | Ruta relativa de la imagen del escudo (almacenada en /public/uploads o bucket S3). |
| color\_principal | VARCHAR(7) | Color principal (HEX). Ej: '\#FF0000' |
| color\_secundario | VARCHAR(7) | Color secundario (HEX). |
| año\_fundacion | INTEGER | Año de fundación del equipo. |
| capitan\_id | UUID (FK) | Usuario con rol capitán asignado. |
| barrio | VARCHAR(100) | Barrio o sector de la parroquia al que representa. |
| activo | BOOLEAN | Si el equipo está activo en el sistema. |
| created\_at | TIMESTAMPTZ | Fecha de creación. |

### **6.2.2 Entidad: Inscripción de Equipo en Torneo**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| torneo\_id | UUID (FK) | Torneo al que se inscribe. |
| equipo\_id | UUID (FK) | Equipo que se inscribe. |
| fecha\_inscripcion | TIMESTAMPTZ | Cuándo se completó la inscripción. |
| estado\_pago | ENUM | Pendiente / Pagado / Exonerado |
| monto\_pagado | DECIMAL(8,2) | Monto efectivamente pagado. |
| numero\_dorsal\_reservado | INTEGER\[\] | Dorsales reservados para este torneo. |
| confirmado\_por | UUID (FK) | Admin que confirmó la inscripción. |

### **6.2.3 Reglas de Negocio — Equipos**

5. Un equipo no puede inscribirse a un torneo si no tiene al menos 7 jugadores inscritos en ese torneo.

6. La inscripción solo se confirma cuando el pago está marcado como 'Pagado' o 'Exonerado'.

7. Un equipo puede participar en múltiples categorías simultáneamente (ej: tiene equipo Libre y Sub-20).

8. El capitán puede modificar el roster hasta 24 horas antes del primer partido del torneo.

## **6.3 M3 — Gestión de Jugadores**

El padrón de jugadores es permanente y centralizado. Un jugador se inscribe UNA VEZ en el sistema y puede participar en múltiples torneos o equipos (con restricciones configurables por torneo).

### **6.3.1 Entidad: Jugador**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) | Identificador único. |
| nombres | VARCHAR(100) | Nombres completos. |
| apellidos | VARCHAR(100) | Apellidos completos. |
| cedula | VARCHAR(13) | Cédula de identidad ecuatoriana (único). Validación checksum. |
| fecha\_nacimiento | DATE | Para validar categorías (Sub-17, Sub-20, Veteranos). |
| foto\_url | TEXT | Ruta relativa de la foto del jugador. |
| telefono | VARCHAR(15) | Contacto opcional. |
| posicion\_habitual | ENUM | Portero / Defensa / Mediocampista / Delantero |
| numero\_dorsal\_preferido | INTEGER | Número preferido (1-99). |
| activo | BOOLEAN | Si el jugador está activo en el sistema. |
| user\_id | UUID (FK nullable) | Si el jugador tiene cuenta en el sistema. |
| created\_at | TIMESTAMPTZ |  |

### **6.3.2 Entidad: Jugador en Torneo (Roster)**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| jugador\_id | UUID (FK) | Jugador del padrón. |
| equipo\_id | UUID (FK) | Equipo para este torneo. |
| torneo\_id | UUID (FK) | Torneo en cuestión. |
| numero\_dorsal | INTEGER | Dorsal asignado para este torneo específico. |
| estado | ENUM | Habilitado / Suspendido / Lesionado / Inactivo |
| tarjetas\_amarillas\_acum | INTEGER | Amarillas acumuladas en el torneo actual. |
| partidos\_suspendido | INTEGER | Partidos de suspensión pendientes. |
| fecha\_habilitacion | DATE | Fecha a partir de la cual puede jugar (post-suspensión). |
| es\_capitan\_equipo | BOOLEAN | Si es el capitán del equipo en este torneo. |

### **6.3.3 Reglas de Negocio — Jugadores**

9. La cédula es el identificador único de un jugador en el sistema. No puede repetirse.

10. Un jugador no puede estar en dos equipos del MISMO torneo simultáneamente.

11. La validación de edad para categorías Sub-17 y Sub-20 se calcula automáticamente a la fecha de inicio del torneo.

12. Un jugador con 'partidos\_suspendido \> 0' aparece como SUSPENDIDO y no puede ser convocado.

13. El sistema reduce 'partidos\_suspendido' en 1 automáticamente después de cada jornada que el equipo juegue, aunque el jugador no haya participado.

14. El capitán puede solicitar la 'transferencia' de un jugador entre torneos, sujeta a aprobación del admin.

## **6.4 M4 — Fixture y Sorteo Automático**

Este módulo es uno de los más críticos del sistema. Genera automáticamente el calendario completo de partidos basándose en el formato y el número de equipos inscritos. El sorteo es trazable, verificable y reproducible.

### **6.4.1 Algoritmos de Generación de Fixture**

| Formato | Algoritmo | Descripción |
| ----- | ----- | ----- |
| Liga (Round-Robin) | Round-Robin con rotación circular | Garantiza que todos juegan contra todos. Con N equipos genera N-1 jornadas (ida) o 2(N-1) jornadas (ida y vuelta). Asignación de local/visitante balanceada. |
| Copa (Eliminación Directa) | Árbol de brackets con siembra | Genera el bracket desde octavos hasta final. Soporta siembra por posición de torneo anterior o sorteo aleatorio. Genera rondas automáticamente al registrar resultados. |
| Fase de Grupos \+ Eliminatoria | Combinado | Primera fase: grupos round-robin. Segunda fase: cruces entre clasificados generados automáticamente. |
| Sorteo de Grupos | Aleatorio con restricciones | Permite definir bombos/cabezas de serie antes del sorteo. Log del sorteo guardado y auditable. |

### **6.4.2 Entidad: Partido**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| torneo\_id | UUID (FK) | Torneo al que pertenece. |
| fase | ENUM | Grupos / Octavos / Cuartos / Semifinal / Final / Liga |
| jornada | INTEGER | Número de jornada (para formato liga). |
| equipo\_local\_id | UUID (FK) | Equipo local. |
| equipo\_visitante\_id | UUID (FK nullable) | Equipo visitante. NULL si es BYE. |
| fecha\_programada | TIMESTAMPTZ | Fecha y hora programada. |
| cancha | VARCHAR(100) | Cancha donde se juega. |
| arbitro\_id | UUID (FK nullable) | Árbitro asignado. |
| estado | ENUM | Programado / En Juego / Finalizado / Suspendido / Aplazado / W.O. |
| goles\_local | INTEGER | Goles del equipo local. NULL hasta que inicia. |
| goles\_visitante | INTEGER | Goles del equipo visitante. |
| minutos\_jugados | INTEGER | Minutos totales jugados (para partidos suspendidos). |
| observaciones | TEXT | Notas del árbitro o admin. |
| acta\_cerrada | BOOLEAN | Si el acta fue cerrada y validada definitivamente. |
| acta\_cerrada\_at | TIMESTAMPTZ | Cuándo se cerró el acta. |

### **6.4.3 Flujo de Generación de Fixture**

15. Admin confirma lista final de equipos inscritos.

16. Admin selecciona el formato y parámetros del fixture.

17. Sistema muestra preview del fixture generado con fechas tentativas.

18. Admin puede arrastrar y soltar partidos para ajustar fechas/canchas.

19. Admin confirma y publica el fixture. Todos los equipos/jugadores reciben notificación.

20. El fixture es inmutable una vez publicado. Solo se pueden modificar fechas/canchas con trazabilidad.

### **6.4.4 Reglas de Negocio — Fixture**

21. El sorteo se realiza con semilla aleatoria registrada y auditable (timestamp \+ hash).

22. No puede existir un mismo equipo en dos partidos de la misma jornada.

23. El sistema evita que el mismo equipo juegue más de 2 partidos consecutivos como local.

24. En caso de BYE, el equipo recibe los puntos por victoria automáticamente.

25. Un W.O. (walkover) se registra como 3-0 para el equipo presente o con puntaje configurable.

## **6.5 M5 — Registro de Partidos (Acta Digital)**

El corazón operativo del sistema. El árbitro o admin registra en tiempo real cada incidencia del partido desde su dispositivo móvil. El acta digital reemplaza completamente el papel.

### **6.5.1 Entidad: Gol**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| partido\_id | UUID (FK) |  |
| jugador\_id | UUID (FK) | Jugador que marcó. |
| equipo\_id | UUID (FK) | Equipo al que se acredita. |
| minuto | INTEGER | Minuto del gol (1-90+). |
| tipo | ENUM | Normal / Penal / Autogol / Cabeza |
| asistencia\_jugador\_id | UUID (FK nullable) | Jugador que dio la asistencia. |

### **6.5.2 Entidad: Tarjeta**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| partido\_id | UUID (FK) |  |
| jugador\_id | UUID (FK) | Jugador amonestado. |
| equipo\_id | UUID (FK) |  |
| tipo | ENUM | Amarilla / Roja / Roja por doble amarilla |
| minuto | INTEGER |  |
| motivo | TEXT | Descripción de la infracción. |
| suspension\_partidos | INTEGER | Calculado automáticamente según reglamento. |

### **6.5.3 Entidad: Cambio / Sustitución**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| partido\_id | UUID (FK) |  |
| equipo\_id | UUID (FK) |  |
| jugador\_sale\_id | UUID (FK) | Jugador que sale del campo. |
| jugador\_entra\_id | UUID (FK) | Jugador que entra. |
| minuto | INTEGER |  |

### **6.5.4 Entidad: Alineación**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| partido\_id | UUID (FK) |  |
| equipo\_id | UUID (FK) |  |
| jugador\_id | UUID (FK) |  |
| numero\_dorsal | INTEGER |  |
| es\_titular | BOOLEAN | TRUE si es titular, FALSE si es suplente. |
| posicion | ENUM | Portero / Defensa / Mediocampista / Delantero |

### **6.5.5 Flujo del Acta Digital**

26. Árbitro abre el partido en la app (estado: 'En Juego').

27. Registra alineaciones de ambos equipos (o las confirma si ya fueron precargadas).

28. Durante el partido: registra goles, tarjetas y cambios en tiempo real con el minuto.

29. Al finalizar: confirma el resultado final.

30. Cierra el acta (acción irreversible sin permiso de admin).

31. Sistema procesa automáticamente: actualiza tabla, aplica sanciones, recalcula estadísticas.

### **6.5.6 Reglas de Negocio — Partidos**

32. Solo jugadores en estado 'Habilitado' para ese torneo pueden aparecer en la alineación.

33. Una tarjeta roja directa genera suspensión mínima de 1 partido configurable.

34. Doble amarilla en el mismo partido \= expulsión \+ 1 partido de suspensión.

35. Al acumular N amarillas (configurable por torneo) → suspensión de 1 partido.

36. El acta no puede cerrarse si hay incidencias pendientes de validar.

37. Un partido en W.O. no genera estadísticas individuales (goles, tarjetas).

38. El sistema valida que el número de goles registrados coincida con el marcador final.

## **6.6 M6 — Tablas de Posiciones**

La tabla de posiciones se calcula en tiempo real a partir de los resultados de partidos finalizados. Los criterios de desempate son configurables por torneo.

### **6.6.1 Estructura de la Tabla**

| Columna | Fórmula |
| ----- | ----- |
| PJ (Partidos Jugados) | COUNT(partidos finalizados donde el equipo participó) |
| PG (Partidos Ganados) | COUNT(partidos donde goles\_propios \> goles\_rivales) |
| PE (Partidos Empatados) | COUNT(partidos donde goles\_propios \== goles\_rivales) |
| PP (Partidos Perdidos) | COUNT(partidos donde goles\_propios \< goles\_rivales) |
| GF (Goles a Favor) | SUM(goles marcados en todos los partidos) |
| GC (Goles en Contra) | SUM(goles recibidos en todos los partidos) |
| DG (Diferencia de Goles) | GF \- GC |
| PTS (Puntos) | PG \* pts\_victoria \+ PE \* pts\_empate \+ PP \* pts\_derrota |
| Forma (últimos 5\) | Array de G/E/P de los últimos 5 partidos |

### **6.6.2 Criterios de Desempate (configurables)**

Cuando dos o más equipos tienen igual cantidad de puntos, el sistema aplica los siguientes criterios en el orden configurado:

* Mayor diferencia de goles (DG)

* Mayor cantidad de goles a favor (GF)

* Resultado directo entre los equipos empatados (head-to-head)

* Menor cantidad de tarjetas amarillas

* Menor cantidad de tarjetas rojas

* Sorteo (con registro auditado)

| REAL-TIME | La tabla se actualiza mediante Server-Sent Events (SSE). Al cerrar un acta, el servidor emite un evento al canal del torneo. Los clientes conectados re-fetchean la tabla automáticamente sin recargar la página. |
| :---: | :---- |

## **6.7 M7 — Sistema de Sanciones y Disciplina**

El módulo de disciplina gestiona todas las sanciones: automáticas (generadas por tarjetas) y manuales (impuestas por el comité disciplinario).

### **6.7.1 Entidad: Sanción**

| Campo | Tipo | Descripción |
| ----- | ----- | ----- |
| id | UUID (PK) |  |
| jugador\_id | UUID (FK) | Jugador sancionado. |
| equipo\_id | UUID (FK) | Equipo del jugador. |
| torneo\_id | UUID (FK) | Torneo en el que aplica. |
| tipo | ENUM | Automatica\_Amarillas / Automatica\_Roja / Manual\_Comite / Multa\_Economica |
| origen\_partido\_id | UUID (FK nullable) | Partido que originó la sanción (si aplica). |
| origen\_tarjeta\_id | UUID (FK nullable) | Tarjeta específica que la generó. |
| partidos\_sancion | INTEGER | Número de partidos de suspensión. 0 si es solo multa. |
| monto\_multa | DECIMAL(8,2) | Monto de la multa en USD. 0 si es solo suspensión. |
| estado | ENUM | Vigente / Cumplida / Apelada / Revocada |
| descripcion | TEXT | Descripción del motivo (para sanciones manuales). |
| fecha\_imposicion | TIMESTAMPTZ |  |
| fecha\_cumplimiento | TIMESTAMPTZ nullable | Cuándo se cumplió la sanción. |
| apelacion\_texto | TEXT nullable | Texto de la apelación presentada. |
| apelacion\_estado | ENUM nullable | Pendiente / Aprobada / Rechazada |
| impuesta\_por | UUID (FK) | Admin que aplicó la sanción. |

### **6.7.2 Flujos de Sanciones**

**Sanción Automática (Tarjetas):**

39. Árbitro registra tarjeta en el acta.

40. Al cerrar el acta, sistema evalúa: ¿es roja directa? ¿es segunda amarilla? ¿acumula N amarillas?

41. Sistema crea la sanción automáticamente y actualiza estado del jugador en la tabla 'jugador en torneo'.

42. Capitán y jugador reciben notificación de la sanción y duración.

**Sanción Manual (Comité Disciplinario):**

43. Admin crea sanción manual con descripción y duración.

44. Jugador/Capitán puede presentar apelación dentro de las 48 horas.

45. Admin resuelve apelación (aprobada/rechazada).

46. Sistema actualiza automáticamente el estado del jugador.

**Sanción Económica (Multa):**

47. Admin impone multa a equipo o jugador.

48. Equipo/Capitán registra el pago de la multa.

49. Admin confirma el pago. Si no se paga, el equipo puede ser desclasificado.

### **6.7.3 Reglas de Negocio — Sanciones**

50. Una sanción revocada devuelve el estado anterior al jugador automáticamente.

51. Las multas no pagadas después de X partidos pueden escalar a exclusión del torneo (configurable).

52. El historial de sanciones de cada jugador es permanente y visible en su perfil.

53. El ranking de fair play del torneo se calcula inversamente proporcional a tarjetas acumuladas.

## **6.8 M8 — Estadísticas y Reportes**

El módulo de estadísticas convierte los datos operativos en inteligencia deportiva. Todos los cálculos son derivados de las entidades base (no se almacenan agregados, se calculan on-demand o con caché).

### **6.8.1 Estadísticas de Jugador**

* Goles totales por torneo y acumulado histórico.

* Asistencias totales por torneo y acumulado histórico.

* Partidos jugados, titularidades, entradas como suplente.

* Tarjetas amarillas, rojas y total de sanciones por temporada.

* Promedio de goles por partido.

* Rachas: máxima racha de partidos consecutivos marcando.

* Tabla de goleadores del torneo (ranking en tiempo real).

* Tabla de asistidores del torneo.

### **6.8.2 Estadísticas de Equipo**

* Historial completo: torneos jugados, ganados, posición final.

* Ratio de victorias/empates/derrotas histórico.

* Goleadores históricos del equipo.

* Promedio de goles a favor y en contra.

* Rendimiento por jornada (forma).

* Estadísticas de fair play: equipo con menos tarjetas.

### **6.8.3 Reportes Exportables (PDF)**

| Reporte | Destinatario | Contenido |
| ----- | ----- | ----- |
| Acta de Partido | Árbitro / Admin | Resultado, goles, tarjetas, alineaciones, firma digital. |
| Tabla de Posiciones | Público / Admin | Clasificación completa con todos los indicadores. |
| Nómina de Equipo | Capitán / Admin | Lista de jugadores habilitados con dorsales y fotos. |
| Boletín de Sanciones | Capitanes | Sanciones vigentes de todos los equipos. |
| Estadísticas de Torneo | Admin / Directivos | Resumen completo al final del torneo. |
| Historial de Jugador | Jugador | Toda la carrera deportiva registrada en el sistema. |

## **6.9 M9 — Sistema de Notificaciones**

El sistema envía notificaciones automáticas en eventos clave para mantener a todos los actores informados sin necesidad de consultar manualmente el sistema.

| Evento | Destinatarios | Canal | Prioridad |
| ----- | ----- | ----- | ----- |
| Partido programado (recordatorio 24h antes) | Capitán \+ Jugadores convocados | Web Push \+ Email | Alta |
| Resultado de partido registrado | Ambos capitanes \+ Árbitro | Web Push | Alta |
| Sanción aplicada (tarjeta/suspensión) | Jugador afectado \+ Capitán | Web Push \+ Email | Crítica |
| Tabla de posiciones actualizada | Todos los inscritos al torneo | Web Push | Media |
| Próxima jornada publicada | Todos los inscritos | Email | Media |
| Pago de inscripción confirmado | Capitán del equipo | Email | Alta |
| Multa impuesta | Capitán del equipo | Web Push \+ Email | Crítica |
| Apelación resuelta | Jugador \+ Capitán | Email | Alta |
| Torneo finalizado \+ campeón | Todos los inscritos | Web Push \+ Email | Alta |
| Nueva inscripción abierta | Equipos del sistema | Email | Baja |

## **6.10 M10 — Portal Público**

El portal público es la cara visible del sistema para la comunidad. No requiere login y está optimizado para SEO y acceso desde dispositivos móviles con conexión limitada.

### **6.10.1 Páginas del Portal Público**

| Ruta | Contenido | Descripción |
| ----- | ----- | ----- |
| / | Home | Torneo activo destacado, últimos resultados, próximos partidos. |
| /torneos | Lista de Torneos | Todos los torneos con filtro por estado y categoría. |
| /torneos/\[slug\] | Detalle de Torneo | Tabla de posiciones, fixture completo, goleadores. |
| /equipos | Galería de Equipos | Todos los equipos activos con escudo y estadísticas. |
| /equipos/\[slug\] | Perfil de Equipo | Historial, roster, estadísticas, títulos. |
| /jugadores/\[slug\] | Perfil de Jugador | Estadísticas personales, fotos, historial. |
| /goleadores | Tabla de Goleadores | Ranking de goleadores del torneo actual. |
| /sanciones | Boletín de Sanciones | Sanciones vigentes (público, sin datos sensibles). |
| /historico | Archivo Histórico | Campeones de todos los torneos anteriores. |

| SEO | Todas las páginas del portal público deben tener metadata dinámica (Open Graph, Twitter Cards) para compartir en redes sociales. El og:image de cada partido muestra el marcador con los escudos de ambos equipos. |
| :---: | :---- |

# **7\. Arquitectura del Sistema**

## **7.1 Arquitectura de Alto Nivel**

La arquitectura sigue el patrón BFF (Backend for Frontend) nativo de Next.js con App Router, aprovechando los Server Components para minimizar JavaScript en el cliente y maximizar el rendimiento.

| Capa | Responsabilidad | Tecnología |
| ----- | ----- | ----- |
| Frontend (UI) | Renderizado de componentes, formularios, navegación. | Next.js 15 App Router \+ React 19 \+ shadcn/ui \+ Tailwind 4 |
| Server Components | Fetch de datos desde servidor con Drizzle, sin exponer BD. | Next.js RSC \+ Drizzle ORM (PostgreSQL driver) |
| Server Actions | Mutaciones de datos con validación Zod \+ autorización RLS. | Next.js Server Actions |
| API Routes | Webhooks, endpoints públicos, generación de PDF. | Next.js Route Handlers |
| Base de Datos | PostgreSQL en producción, SQLite en tests. Mismo schema Drizzle. | Drizzle ORM \+ pg / better-sqlite3 |
| Autenticación | Sesiones JWT con roles, middleware de rutas. | Auth.js v5 \+ middleware Next.js |
| Storage | Imágenes: escudos, fotos de jugadores, PDFs. | Sistema de archivos local (dev) / S3-compatible (prod opcional) |
| Real-time | Actualizaciones en vivo de partidos y tabla. | Server-Sent Events (SSE) con Next.js Route Handler \+ polling fallback |
| Caché | Tablas de posiciones, estadísticas pesadas. | Next.js Full Route Cache \+ unstable\_cache |
| Jobs Programados | Recordatorios de partidos, reporte semanal. | node-cron dentro del proceso Next.js o script separado |

## **7.2 Modelo de Roles y Permisos (RLS)**

| Rol | Permisos |
| ----- | ----- |
| super\_admin | CRUD total en todas las tablas. Sin restricciones. |
| admin\_torneo | CRUD en torneos que administra, equipos, partidos, sanciones de sus torneos. |
| arbitro | INSERT/UPDATE en partidos asignados (acta). SELECT en todo lo público. |
| capitan | SELECT en sus equipos/torneos. UPDATE en roster de su equipo (dentro del plazo). |
| jugador | SELECT en su propio perfil y torneos donde participa. |
| publico (anon) | SELECT en tablas/resultados de torneos públicos. Sin acceso a datos sensibles. |

## **7.3 Esquema de Base de Datos — Tablas Principales**

| Tabla | PK | FKs Principales | Descripción |
| ----- | ----- | ----- | ----- |
| torneos | uuid | — | Configuración de cada torneo. |
| equipos | uuid | capitan\_id → users | Entidad permanente de cada equipo. |
| jugadores | uuid | user\_id → users (nullable) | Padrón centralizado de jugadores. |
| inscripciones\_equipo | uuid | torneo\_id, equipo\_id | Equipo inscrito en torneo. |
| roster\_jugadores | uuid | jugador\_id, equipo\_id, torneo\_id | Jugador en equipo+torneo. |
| partidos | uuid | torneo\_id, equipo\_local\_id, equipo\_visitante\_id, arbitro\_id | Fixture y acta. |
| goles | uuid | partido\_id, jugador\_id, equipo\_id | Registro de goles. |
| tarjetas | uuid | partido\_id, jugador\_id, equipo\_id | Registro de amonestaciones. |
| cambios | uuid | partido\_id, equipo\_id | Sustituciones de jugadores. |
| alineaciones | uuid | partido\_id, equipo\_id, jugador\_id | Formaciones de cada partido. |
| sanciones | uuid | jugador\_id, torneo\_id, partido\_id (nullable) | Historial disciplinario. |
| notificaciones | uuid | user\_id | Cola de notificaciones. |
| auditoria\_sorteo | uuid | torneo\_id | Log auditado de sorteos. |

# **8\. Flujos Críticos del Sistema**

## **8.1 Flujo: Apertura de Nuevo Torneo (E2E)**

54. Admin crea el torneo con todos sus parámetros.

55. Admin abre período de inscripciones. Sistema envía notificación a todos los equipos.

56. Capitanes inscriben sus equipos y registran el roster mínimo.

57. Capitanes adjuntan comprobantes de pago. Admin confirma pagos.

58. Admin cierra inscripciones. Sistema valida que todos los equipos tengan roster mínimo.

59. Admin ejecuta sorteo. Sistema genera fixture completo con fechas.

60. Admin publica fixture. Todos reciben notificación de su primer partido.

61. Torneo pasa a estado 'En Curso'.

## **8.2 Flujo: Registro de Partido (E2E)**

62. Árbitro abre el partido en la app 15 minutos antes del inicio.

63. Registra las alineaciones de ambos equipos (el sistema valida que no haya sancionados).

64. Marca inicio del partido.

65. En tiempo real: registra goles (minuto, jugador, tipo, asistente).

66. En tiempo real: registra tarjetas (amarilla/roja, jugador, motivo, minuto).

67. En tiempo real: registra cambios (jugador entra, jugador sale, minuto).

68. Al final: confirma el resultado. El sistema valida que goles \= marcador.

69. Árbitro cierra el acta.

70. Sistema actualiza tabla de posiciones, estadísticas, y aplica sanciones automáticas.

71. Sistema notifica resultados a capitanes y jugadores.

## **8.3 Flujo: Sorteo de Fixture (Detalle Técnico)**

72. Sistema obtiene lista de equipos inscritos y confirmados.

73. Genera semilla de sorteo: SHA-256(timestamp\_unix \+ torneo\_id).

74. Aplica algoritmo Round-Robin con rotación circular o sorteo de grupos.

75. Genera todas las jornadas con asignación balanceada de local/visitante.

76. Asigna fechas tentativas respetando intervalo mínimo entre partidos (configurable).

77. Guarda el log de sorteo en tabla 'auditoria\_sorteo' con la semilla y todos los pasos.

78. Admin puede ver la auditoría del sorteo para verificar imparcialidad.

# **9\. Requerimientos No Funcionales**

## **9.1 Rendimiento**

| Requerimiento | Target | Método de Medición |
| ----- | ----- | ----- |
| R-PERF-01: Carga inicial del portal público | \< 2 segundos (LCP) | Lighthouse CI en cada PR |
| R-PERF-02: Carga de tabla de posiciones | \< 500ms | Vitest benchmark \+ logs de Drizzle query time |
| R-PERF-03: Actualización en tiempo real al cerrar acta | \< 3 segundos | Test E2E con 2 clientes conectados |
| R-PERF-04: Generación de fixture para 16 equipos | \< 2 segundos | Jest performance test |
| R-PERF-05: Exportación de PDF de acta | \< 5 segundos | Playwright test |
| R-PERF-06: Búsqueda de jugador por cédula | \< 200ms | Índice en columna cedula |

## **9.2 Seguridad**

| Requerimiento | Descripción |
| ----- | ----- |
| R-SEC-01: Autorización en todas las rutas | Middleware Next.js valida sesión y rol en cada ruta privada. Las queries Drizzle solo se ejecutan en Server Actions/Route Handlers, nunca expuestas al cliente. |
| R-SEC-02: Validación Zod en cliente y servidor | Todo input de formulario validado con el mismo schema Zod en ambos lados. |
| R-SEC-03: CSRF Protection | Next.js Server Actions tienen protección CSRF integrada. Sin tokens manuales necesarios. |
| R-SEC-04: Sanitización de uploads | Imágenes validadas por tipo MIME y tamaño máximo (2MB escudo, 1MB foto jugador). |
| R-SEC-05: Rate limiting en acciones críticas | Máximo 10 intentos de login por IP por hora. 5 acciones de registro por minuto. |
| R-SEC-06: Auditoría de cambios críticos | Trigger PostgreSQL que registra cambios en sanciones, resultado de partidos y sorteos. |
| R-SEC-07: No exposición de datos sensibles en portal público | Cédulas, teléfonos y correos electrónicos nunca expuestos en la API pública. |

## **9.3 Disponibilidad y Confiabilidad**

| Requerimiento | Target |
| ----- | ----- |
| R-REL-01: Disponibilidad del sistema | 99.5% uptime mensual según infra elegida por el equipo |
| R-REL-02: Backup automático de BD | Script pg\_dump diario via cron. Retención de 7 copias. Almacenado localmente o en bucket S3. |
| R-REL-03: Recuperación ante fallo de red durante acta | El formulario del árbitro guarda borradores en localStorage. Sincroniza al reconectar. |
| R-REL-04: Idempotencia de cierre de acta | Cerrar el mismo acta dos veces produce el mismo resultado. No duplica estadísticas. |
| R-REL-05: Transacciones atómicas | El cierre de acta y la generación de sanciones ocurren en una sola transacción PG. |

## **9.4 Accesibilidad y Usabilidad**

| Requerimiento | Descripción |
| ----- | ----- |
| R-ACC-01: Responsive mobile-first | La interfaz del árbitro es 100% usable en smartphone con pantalla de 4.5 pulgadas. |
| R-ACC-02: Modo offline parcial | El árbitro puede registrar incidencias offline; se sincronizan al recuperar conectividad. |
| R-ACC-03: Soporte de idioma español | Toda la UI en español latinoamericano. Fechas en formato DD/MM/YYYY. |
| R-ACC-04: WCAG 2.1 AA | Componentes shadcn/ui son accesibles por defecto. Contraste mínimo 4.5:1. |
| R-ACC-05: Carga en conexión 3G | Bundle JS \< 150KB (comprimido). Imágenes con lazy loading y formatos WebP. |

# **10\. Esquema de Rutas de la Aplicación**

## **10.1 Rutas del Portal Público (sin auth)**

| Ruta | Componente | Descripción |
| ----- | ----- | ----- |
| / | HomePage | Landing con torneo activo, últimos resultados |
| /torneos | TorneosPage | Lista y filtro de torneos |
| /torneos/\[slug\] | TorneoDetailPage | Tabla, fixture, goleadores de un torneo |
| /equipos | EquiposPage | Galería de equipos |
| /equipos/\[slug\] | EquipoDetailPage | Perfil completo del equipo |
| /jugadores/\[slug\] | JugadorDetailPage | Perfil público del jugador |
| /goleadores | GoleadoresPage | Ranking de goleadores del torneo activo |
| /historico | HistoricoPage | Archivo de campeones históricos |

## **10.2 Rutas del Panel Administrativo (auth requerida)**

| Ruta | Roles | Descripción |
| ----- | ----- | ----- |
| /admin | admin | Dashboard principal con métricas del torneo activo |
| /admin/torneos | admin | CRUD de torneos |
| /admin/torneos/\[id\]/fixture | admin | Generación y gestión del fixture |
| /admin/torneos/\[id\]/sorteo | admin | Sorteo de grupos o equipos |
| /admin/equipos | admin | Gestión de equipos inscritos |
| /admin/jugadores | admin | Padrón de jugadores |
| /admin/partidos | admin, arbitro | Lista de partidos y gestión de actas |
| /admin/partidos/\[id\]/acta | admin, arbitro | Formulario del acta digital en tiempo real |
| /admin/sanciones | admin | Gestión de sanciones y apelaciones |
| /admin/reportes | admin | Generación y descarga de reportes PDF |
| /capitan | capitan | Panel del capitán: roster, partidos, sanciones |
| /capitan/jugadores | capitan | Gestión del roster del equipo |
| /perfil | todos | Perfil personal y estadísticas del jugador logueado |

# **11\. Flujo de Desarrollo — AI Gentle Stack SDD**

Este proyecto se desarrolla siguiendo el flujo SDD (Spec-Driven Development) de Gentleman-Programming, implementado con el ecosistema gentle-ai. El agente de IA no escribe código sin una spec aprobada.

## **11.1 Fases del Desarrollo**

| Fase | Herramienta | Output | Criterio de Salida |
| ----- | ----- | ----- | ----- |
| 1\. Constitution | gentle-ai / CLAUDE.md | constitution.md con principios del proyecto, stack, convenciones. | Aprobado por el desarrollador. |
| 2\. Specify | Claude Code (SDD skill) | spec.md por feature: requisitos, edge cases, criterios de aceptación. | Spec revisada y sin ambigüedades. |
| 3\. Clarify | Interacción humano-agente | Lista de preguntas y respuestas sobre la spec. | Cero ambigüedades en la spec. |
| 4\. Plan | Claude Code | technical-plan.md: arquitectura, tablas afectadas, servicios, tests. | Plan revisado por el desarrollador. |
| 5\. Tasks | Claude Code | tasks.md: lista de tareas atómicas, máx 3 archivos por task. | Tasks ordenadas por dependencia. |
| 6\. Implement | Claude Code \+ Cursor | Código, tests, migraciones SQL. | Tests pasan. PR creado. |

## **11.2 Estructura de Carpetas del Proyecto**

Organización del repositorio siguiendo las convenciones de Next.js App Router \+ Gentleman Stack:

| zambiza-liga/ ├── .specify/              \# SDD: constitution.md, specs, plans ├── app/                   \# Next.js App Router │   ├── (public)/          \# Portal público (sin auth) │   │   ├── page.tsx       \# Home │   │   ├── torneos/ │   │   ├── equipos/ │   │   └── jugadores/ │   ├── (dashboard)/       \# Panel privado │   │   ├── admin/ │   │   ├── capitan/ │   │   └── perfil/ │   └── api/               \# Route handlers (webhooks, PDF) ├── components/            \# React Components │   ├── ui/                \# shadcn/ui components │   ├── partido/           \# Acta, timeline, marcador │   ├── tabla/             \# Tabla de posiciones │   ├── fixture/           \# Calendario, bracket │   └── jugador/           \# Perfil, estadísticas ├── lib/                   \# Utilidades y lógica de negocio │   ├── db/                \# Drizzle client (server-only) │   ├── fixture/           \# Algoritmos de generación │   ├── sanciones/         \# Lógica de tarjetas y suspensiones │   ├── tabla/             \# Cálculo de posiciones │   └── validations/       \# Schemas Zod compartidos ├── drizzle/               \# Schema, migraciones y seeds │   ├── migrations/ │   └── seed/ └── tests/                 \# Vitest \+ Playwright |
| :---- |

# **12\. Plan de Implementación por Fases**

## **12.1 Fase 0 — Setup y Configuración (Semana 1\)**

* Inicialización del repositorio con Next.js 15 \+ PostgreSQL \+ Drizzle ORM \+ Tailwind 4 \+ shadcn/ui.

* Configuración del ecosistema gentle-ai: constitution.md, SDD workflow, Context7 MCP.

* Setup de CI/CD con GitHub Actions (lint \+ test \+ deploy a Vercel).

* Definición del schema Drizzle compartido (PG \+ SQLite). Migraciones con drizzle-kit. Seeds para desarrollo local.

* Configuración de Auth.js v5 con roles (admin, arbitro, capitan, jugador). Middleware de rutas.

* Setup de autenticación con Supabase Auth \+ middleware Next.js.

## **12.2 Fase 1 — Core (Semanas 2-5) — P0**

* M1: CRUD completo de Torneos.

* M2: CRUD de Equipos e inscripciones.

* M3: Padrón de Jugadores \+ inscripción en torneos.

* M4: Algoritmo de fixture Round-Robin \+ generación de calendario.

* M5: Acta digital básica (resultado \+ goles \+ tarjetas).

* M6: Tabla de posiciones automática.

* M7: Sanciones automáticas por tarjetas.

## **12.3 Fase 2 — Funcionalidades Avanzadas (Semanas 6-9) — P1**

* M4: Fixture de copa (brackets de eliminación directa).

* M4: Sorteo de grupos con bombos y siembra.

* M5: Registro en tiempo real (Supabase Realtime en acta).

* M7: Sanciones manuales \+ sistema de apelaciones.

* M7: Multas económicas con seguimiento de pagos.

* M8: Estadísticas de jugador y equipo.

* M8: Exportación de actas en PDF.

* M9: Notificaciones web push y email.

* M10: Portal público completo con SEO.

## **12.4 Fase 3 — Pulido y Lanzamiento (Semanas 10-12)**

* Modo offline para árbitro (Service Worker \+ IndexedDB).

* Optimización de rendimiento (Lighthouse \> 90 en todas las páginas).

* Tests E2E completos (Playwright).

* Auditoría de seguridad (RLS, OWASP Top 10).

* Documentación de usuario (guías para cada rol).

* Beta testing con organizadores y capitanes de Zámbiza.

* Lanzamiento oficial en la próxima temporada.

# **13\. Métricas de Éxito**

| Métrica | Target | Cómo Medir |
| ----- | ----- | ----- |
| Tiempo de registro de acta | \< 5 minutos por partido | Analytics de sesión en formulario de acta |
| Adopción por árbitros | 100% de partidos con acta digital en 2 meses | Conteo de actas registradas vs. partidos jugados |
| Adopción por capitanes | \> 80% de capitanes usan la app activamente | DAU en panel de capitanes |
| Errores de sanciones | 0 conflictos por sanciones mal aplicadas | Número de apelaciones aceptadas |
| Satisfacción de usuarios | NPS \> 60 | Encuesta al final del primer torneo |
| Disponibilidad del sistema | \> 99.5% durante días de partido | Uptime monitoring (Vercel Analytics) |
| Tiempo de carga portal público | \< 2s en 3G | Lighthouse CI \+ Web Vitals |
| Torneos digitalizados en año 1 | \> 4 torneos completos | Conteo en BD |
| Jugadores registrados en padrón | \> 100 en año 1 | Conteo en tabla jugadores |

# **14\. Preguntas Abiertas**

| \# | Pregunta | Responsable | Estado |
| ----- | ----- | ----- | ----- |
| Q1 | ¿El sistema manejará inscripciones y pagos de manera completamente digital, o el pago se registra manualmente tras realizarse en efectivo? | Admin Liga | Abierto |
| Q2 | ¿Se necesita soporte para fase de grupos \+ eliminatorias en el mismo torneo para la temporada actual? | Admin Liga | Abierto |
| Q3 | ¿Los árbitros tendrán acceso a internet durante los partidos o se necesita modo offline completo como requisito P0? | Árbitros | Abierto |
| Q4 | ¿Qué pasa con los jugadores menores de edad en términos de privacidad de datos y foto de carnet? | Legal / Admin | Abierto |
| Q5 | ¿Se integrará con algún sistema de la Junta Parroquial de Zámbiza para reportes oficiales? | Directivos | Abierto |
| Q6 | ¿Se manejará un sistema de categorías femeninas con reglas propias (ej: duración de partidos diferente)? | Admin Liga | Abierto |
| Q7 | ¿El sorteo de fixture se transmitirá en vivo (ej: Facebook Live) y necesita integración? | Admin Liga | Abierto |
| Q8 | ¿Se requiere multilenguaje (kichwa) considerando el contexto intercultural de Zámbiza? | Comunidad | Abierto |

# **15\. Consideraciones Futuras (Fuera de Alcance v1)**

Las siguientes funcionalidades NO son parte de la versión 1 pero deben tenerse en cuenta en las decisiones de arquitectura para no cerrar puertas:

* App móvil nativa (React Native / Expo) para árbitros y capitanes.

* Streaming en vivo de partidos con overlay de marcador.

* Sistema de votaciones de jugador del partido (mejor jugador) con participación del público.

* Integración con FIFA / FFF para reportes federativos.

* Módulo de finanzas completo: ingresos por torneos, gastos de canchas, balance económico de la liga.

* API pública para que otros desarrolladores consuman datos del torneo.

* Soporte multi-deporte: adaptar el sistema para básquet, voleibol, etc.

* Sistema de mensajería interna entre capitanes y admin.

* Galería multimedia: fotos y videos de partidos con gestión de álbumes.

* Módulo de árbitros: calificación de árbitros, asignación automática evitando conflictos de interés.

# **Apéndice A: Glosario**

| Término | Definición |
| ----- | ----- |
| Torneo | Competición deportiva con reglas, equipos, formato y duración definidos. |
| Fixture | Calendario completo de partidos de un torneo. |
| Jornada | Conjunto de partidos que se juegan en la misma fecha en formato liga. |
| Round-Robin | Formato donde todos los equipos juegan contra todos los demás al menos una vez. |
| BYE | Posición vacía en el fixture cuando hay número impar de equipos. El equipo frente a BYE descansa. |
| W.O. | Walk Over. Un equipo no se presenta y pierde el partido por incomparecencia. |
| Roster | Lista de jugadores inscritos en un equipo para un torneo específico. |
| Acta | Documento oficial de un partido con todos sus detalles e incidencias. |
| DG | Diferencia de Goles \= Goles a Favor \- Goles en Contra. |
| RLS | Row Level Security. Sistema de seguridad de PostgreSQL/Supabase a nivel de fila. |
| SDD | Spec-Driven Development. Metodología de desarrollo basada en specs previas al código. |
| Gentle Stack | Ecosistema de herramientas AI de Gentleman-Programming (gentle-ai, Engram, Context7, SDD). |
| RSC | React Server Components. Componentes de React ejecutados en el servidor. |
| Head-to-head | Resultado directo entre dos equipos empatados. Criterio de desempate. |

# **Apéndice B: Mockups de Pantallas Clave**

Los siguientes son los wireframes conceptuales de las pantallas más importantes del sistema (a desarrollar con mayor detalle en la fase de diseño):

| Pantalla | Elementos Clave |
| ----- | ----- |
| Dashboard Admin | Widgets: torneo activo, próximo partido, últimas sanciones, tabla resumida, accesos rápidos. |
| Acta Digital (Árbitro) | Marcador en tiempo real, botones grandes para gol/tarjeta/cambio, lista de jugadores en campo, timer del partido. |
| Tabla de Posiciones (Público) | Tabla con logo de equipo, todos los indicadores, highlight del equipo líder, indicadores de subida/bajada. |
| Perfil de Jugador (Público) | Foto, nombre, equipo actual, estadísticas del torneo activo, historial de torneos, tarjetas. |
| Fixture / Calendario | Vista por jornadas con fecha, hora, cancha, marcador (si ya se jugó) o estado. |
| Panel del Capitán | Estado del equipo, jugadores habilitados/sancionados, próximo partido, pagos pendientes. |

# **Apéndice C: Casos de Prueba Críticos**

| ID | Escenario | Expected Result |
| ----- | ----- | ----- |
| TC-01 | Registrar gol de jugador suspendido en acta. | Sistema rechaza y muestra alerta: 'Jugador sancionado no puede participar'. |
| TC-02 | Cerrar acta con goles\_local \= 3 pero solo 2 goles registrados. | Sistema rechaza: 'Los goles registrados no coinciden con el marcador'. |
| TC-03 | Sortear fixture con 7 equipos (número impar). | Sistema agrega equipo BYE y genera fixture de 8 equipos. |
| TC-04 | Jugador acumula 3 amarillas (límite configurado). | Sanción automática creada. Estado jugador: Suspendido. Partidos: 1\. |
| TC-05 | Dos equipos con los mismos puntos, aplicar desempate. | Sistema aplica criterios en orden configurado. Posición asignada correctamente. |
| TC-06 | Admin intenta modificar puntos de victoria con torneo En Curso. | Sistema rechaza: 'No se puede modificar parámetros de torneo en curso'. |
| TC-07 | Capitán intenta modificar roster a 12 horas del primer partido. | Sistema rechaza: 'El plazo de modificación de roster ha vencido'. |
| TC-08 | Árbitro pierde conexión durante registro de acta. | Formulario guarda estado en localStorage. Al reconectar, sincroniza sin pérdida de datos. |

| ⚽  Liga Deportiva Zámbiza  ⚽ Construido con AI Gentle Stack — Gentleman-Programming Spec-Driven Development  |  Opencode  |  Next.js 15   |
| :---: |

