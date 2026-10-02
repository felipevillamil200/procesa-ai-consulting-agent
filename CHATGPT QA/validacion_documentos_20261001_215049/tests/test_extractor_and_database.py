"""
Pruebas Unitarias para Modelos, Extracción y Base de Datos SQLite.
Compatible con unittest y pytest.
"""

import json
import unittest
from pathlib import Path
import tempfile

from codigo.backend.database import DatabaseManager
from codigo.backend.models import KPIImpacto, ProyectoFicha
from codigo.backend.config import FICHAS_DIR


class TestExtractorAndDatabase(unittest.TestCase):
    """Batería de pruebas para modelos, persistencia y seguridad de base de datos."""

    def test_proyecto_ficha_model(self):
        """Verifica que el modelo Pydantic valida correctamente los datos."""
        ficha = ProyectoFicha(
            codigo_proyecto="PC-TEST-001",
            cliente="Cliente Prueba",
            sector="Tecnología",
            ubicacion="Quito",
            fecha_inicio="2025-01-01",
            fecha_fin="2025-06-01",
            duracion_semanas=22,
            gerente_proyecto="Consultor Test",
            objetivo_general="Probar validación",
            kpis_impacto=[
                KPIImpacto(
                    indicador="Tiempo de respuesta",
                    linea_base_antes="10 días",
                    resultado_despues="3 días",
                    variacion_porcentual="-70%"
                )
            ],
            beneficios_economicos="Ahorro de $50,000 USD"
        )
        self.assertEqual(ficha.codigo_proyecto, "PC-TEST-001")
        self.assertEqual(ficha.duracion_semanas, 22)
        self.assertEqual(len(ficha.kpis_impacto), 1)
        self.assertEqual(ficha.kpis_impacto[0].resultado_despues, "3 días")

    def test_sqlite_read_and_guardrails(self):
        """Verifica guardrails de seguridad y consultas de lectura en SQLite."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            test_db_path = Path(tmp_dir) / "test_proyectos.db"
            db = DatabaseManager(db_path=test_db_path)

            ficha = ProyectoFicha(
                codigo_proyecto="PC-2025-014",
                cliente="Cooperativa Horizonte Andino",
                sector="Servicios financieros",
                ubicacion="Sierra centro",
                fecha_inicio="2025-02-03",
                fecha_fin="2025-06-20",
                duracion_semanas=20,
                gerente_proyecto="Ing. Santiago Morales",
                objetivo_general="Optimizar aprobación de créditos",
                beneficios_economicos="$145,000 USD anuales"
            )
            db.upsert_proyecto(ficha)

            # Consulta SELECT permitida
            res = db.execute_read_query("SELECT codigo_proyecto, duracion_semanas FROM proyectos WHERE sector LIKE '%financieros%'")
            self.assertTrue(res["success"])
            self.assertEqual(res["row_count"], 1)
            self.assertEqual(res["rows"][0]["codigo_proyecto"], "PC-2025-014")

            # Intento de mutación bloqueado por guardrail
            res_drop = db.execute_read_query("DROP TABLE proyectos")
            self.assertFalse(res_drop["success"])
            self.assertIn("no permitida", res_drop["error"])

    def test_fichas_json_files_exist(self):
        """Verifica que las 4 fichas JSON oficiales fueron generadas."""
        expected_codes = ["PC-2025-014", "PC-2025-027", "PC-2025-033", "PC-2026-006"]
        for code in expected_codes:
            json_file = FICHAS_DIR / f"{code}.json"
            self.assertTrue(json_file.exists(), f"Falta el archivo JSON de {code}")
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.assertEqual(data["codigo_proyecto"], code)
                self.assertTrue(len(data["cliente"]) > 0)


if __name__ == "__main__":
    unittest.main()
