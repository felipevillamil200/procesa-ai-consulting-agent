"""
Pruebas Unitarias para el Motor de Búsqueda RAG (src/rag.py).
"""

import unittest
from src.rag import DocumentSearchEngine, get_search_engine


class TestRAGEngine(unittest.TestCase):
    """Batería de pruebas para indexación y recuperación de fragmentos documentales."""

    @classmethod
    def setUpClass(cls):
        cls.engine = get_search_engine()

    def test_chunks_indexed(self):
        """Verifica que se hayan indexado fragmentos de los 4 informes."""
        self.assertGreater(len(self.engine.chunks), 0, "No se indexaron fragmentos de los informes.")
        
        # Verificar presencia de los 4 códigos de proyecto
        codigos = {c.codigo_proyecto for c in self.engine.chunks}
        self.assertIn("PC-2025-014", codigos)
        self.assertIn("PC-2025-027", codigos)
        self.assertIn("PC-2025-033", codigos)
        self.assertIn("PC-2026-006", codigos)

    def test_search_resistance_to_change(self):
        """Verifica la recuperación semántica sobre lecciones de resistencia al cambio."""
        results = self.engine.search("resistencia al cambio mandos medios jefes de agencia")
        self.assertGreater(len(results), 0)
        top_res = results[0]
        self.assertEqual(top_res["codigo_proyecto"], "PC-2025-014")
        self.assertIn("Cooperativa", top_res["cliente"])
        self.assertIn("Pág.", top_res["fuente"])

    def test_search_oee_and_smed(self):
        """Verifica la recuperación de metodologías SMED y TPM en manufactura."""
        results = self.engine.search("SMED cambio de formato inyectora OEE Durán")
        self.assertGreater(len(results), 0)
        top_res = results[0]
        self.assertEqual(top_res["codigo_proyecto"], "PC-2025-027")

    def test_search_with_project_filter(self):
        """Verifica que el filtro opcional de proyecto restrinja los resultados."""
        results = self.engine.search("tiempos de espera consulta", project_id="PC-2025-033")
        self.assertGreater(len(results), 0)
        for r in results:
            self.assertEqual(r["codigo_proyecto"], "PC-2025-033")


if __name__ == "__main__":
    unittest.main()
