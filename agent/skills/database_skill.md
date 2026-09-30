# Skill: Base de Datos Relacional y Herramienta SQL (Database Skill)

## Propósito
Gestionar la base de datos SQLite de fichas estructuradas y ejecutar consultas analíticas de manera segura.

## Directrices de Implementación
1. **Conexión:** SQLite local en `data/proyectos.db`.
2. **Esquema de Tabla:** Tabla `proyectos` con tipado estricto para campos escalares y almacenamiento JSON para listas complejas (`metodologias`, `kpis_impacto`, `lecciones_aprendidas`).
3. **Seguridad en Tool SQL (`query_project_database`):**
   - Permitir **únicamente** sentencias que inicien con `SELECT` o `WITH`.
   - Bloquear cualquier comando DDL/DML destructivo (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`).
   - Capturar excepciones y devolver mensajes de error limpios al agente para que pueda autocorregir la consulta SQL si comete un error sintáctico.
