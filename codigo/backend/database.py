"""
Módulo de Base de Datos Relacional (SQLite).
Gestiona la persistencia de las Fichas Estructuradas y la ejecución segura de consultas SQL.
"""

import json
import sqlite3
from typing import Any, Dict, List, Optional
from pathlib import Path

from codigo.backend.config import DATABASE_PATH
from codigo.backend.models import ProyectoFicha


class DatabaseManager:
    """Administrador de la base de datos relacional SQLite para Procesa Consultores."""

    def __init__(self, db_path: Path = DATABASE_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        """Obtiene una conexión a SQLite con filas formateadas como diccionarios."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self) -> None:
        """Inicializa las tablas relacionales de la base de datos."""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS proyectos (
                    codigo_proyecto VARCHAR(20) PRIMARY KEY,
                    cliente VARCHAR(150) NOT NULL,
                    sector VARCHAR(100) NOT NULL,
                    ubicacion VARCHAR(150),
                    fecha_inicio VARCHAR(50),
                    fecha_fin VARCHAR(50),
                    duracion_semanas INTEGER,
                    gerente_proyecto VARCHAR(150),
                    equipo_consultor TEXT,
                    objetivo_general TEXT,
                    metodologias_herramientas TEXT,
                    kpis_impacto TEXT,
                    beneficios_economicos TEXT,
                    principales_hitos TEXT,
                    lecciones_aprendidas TEXT,
                    factores_riesgo TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
        finally:
            conn.close()

    def upsert_proyecto(self, ficha: ProyectoFicha) -> None:
        """Inserta o actualiza una ficha estructurada de proyecto."""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO proyectos (
                    codigo_proyecto, cliente, sector, ubicacion, fecha_inicio, fecha_fin,
                    duracion_semanas, gerente_proyecto, equipo_consultor, objetivo_general,
                    metodologias_herramientas, kpis_impacto, beneficios_economicos,
                    principales_hitos, lecciones_aprendidas, factores_riesgo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(codigo_proyecto) DO UPDATE SET
                    cliente=excluded.cliente,
                    sector=excluded.sector,
                    ubicacion=excluded.ubicacion,
                    fecha_inicio=excluded.fecha_inicio,
                    fecha_fin=excluded.fecha_fin,
                    duracion_semanas=excluded.duracion_semanas,
                    gerente_proyecto=excluded.gerente_proyecto,
                    equipo_consultor=excluded.equipo_consultor,
                    objetivo_general=excluded.objetivo_general,
                    metodologias_herramientas=excluded.metodologias_herramientas,
                    kpis_impacto=excluded.kpis_impacto,
                    beneficios_economicos=excluded.beneficios_economicos,
                    principales_hitos=excluded.principales_hitos,
                    lecciones_aprendidas=excluded.lecciones_aprendidas,
                    factores_riesgo=excluded.factores_riesgo;
            """, (
                ficha.codigo_proyecto,
                ficha.cliente,
                ficha.sector,
                ficha.ubicacion,
                ficha.fecha_inicio,
                ficha.fecha_fin,
                ficha.duracion_semanas,
                ficha.gerente_proyecto,
                json.dumps(ficha.equipo_consultor, ensure_ascii=False),
                ficha.objetivo_general,
                json.dumps(ficha.metodologias_herramientas, ensure_ascii=False),
                json.dumps([k.model_dump() for k in ficha.kpis_impacto], ensure_ascii=False),
                ficha.beneficios_economicos,
                json.dumps(ficha.principales_hitos, ensure_ascii=False),
                json.dumps(ficha.lecciones_aprendidas, ensure_ascii=False),
                json.dumps(ficha.factores_riesgo, ensure_ascii=False)
            ))
            conn.commit()
        finally:
            conn.close()

    def execute_read_query(self, sql_query: str) -> Dict[str, Any]:
        """
        Ejecuta una consulta SQL segura de solo lectura sobre la base de datos.
        Aplica guardrails de seguridad y retorna los resultados como lista de dicts.
        """
        clean_query = sql_query.strip()

        # Guardrail de seguridad: Solo permitir sentencias SELECT o WITH
        forbidden_keywords = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "REPLACE"]
        first_word = clean_query.split()[0].upper() if clean_query.split() else ""

        if first_word not in ["SELECT", "WITH"] or any(kw in clean_query.upper().split() for kw in forbidden_keywords):
            return {
                "success": False,
                "error": "Operación no permitida. La herramienta SQL solo permite consultas de lectura (SELECT).",
                "rows": []
            }

        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(clean_query)
            rows = [dict(row) for row in cursor.fetchall()]
            return {
                "success": True,
                "row_count": len(rows),
                "rows": rows
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error de sintaxis SQL: {str(e)}",
                "rows": []
            }
        finally:
            conn.close()

    def delete_proyecto(self, codigo_proyecto: str) -> bool:
        """Elimina un proyecto de la base de datos SQLite por su código."""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM proyectos WHERE codigo_proyecto = ?", (codigo_proyecto,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

    def get_all_proyectos(self) -> List[Dict[str, Any]]:
        """Obtiene todas las fichas de proyectos registradas."""
        result = self.execute_read_query("SELECT * FROM proyectos ORDER BY codigo_proyecto ASC")
        return result.get("rows", [])


    def get_schema_description(self) -> str:
        """Devuelve el DDL y descripción de columnas para el system prompt del agente."""
        return """
TABLA: proyectos
COLUMNAS:
- codigo_proyecto (TEXT, PK): Identificador único (ej. 'PC-2025-014', 'PC-2025-027', 'PC-2025-033', 'PC-2026-006')
- cliente (TEXT): Nombre de la empresa cliente
- sector (TEXT): Sector económico ('Servicios financieros', 'Manufactura', 'Salud', 'Retail')
- ubicacion (TEXT): Ciudad o región de ejecución
- fecha_inicio (TEXT): Fecha inicio (ej. '2025-02-03')
- fecha_fin (TEXT): Fecha finalización (ej. '2025-06-20')
- duracion_semanas (INTEGER): Duración total en semanas (ej. 20, 24, 18, 25)
- gerente_proyecto (TEXT): Nombre del gerente consultor
- equipo_consultor (TEXT JSON): Lista de consultores participantes
- objetivo_general (TEXT): Meta principal de la intervención
- metodologias_herramientas (TEXT JSON): Métodos aplicados (Lean, SMED, 5S, etc.)
- kpis_impacto (TEXT JSON): Indicadores con valores antes y después
- beneficios_economicos (TEXT): Ahorros financieros anuales / ROI
- lecciones_aprendidas (TEXT JSON): Lecciones y recomendaciones clave
- factores_riesgo (TEXT JSON): Riesgos identificados y mitigación
        """.strip()
