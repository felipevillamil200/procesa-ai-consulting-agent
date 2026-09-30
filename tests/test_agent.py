"""
Pruebas Unitarias y de Integración para el Agente Consultor (src/agent.py).
"""

import unittest
from src.agent import ConsultorAgent


class TestConsultorAgent(unittest.TestCase):
    """Batería de pruebas para la toma de decisiones, trazabilidad y confiabilidad del agente."""

    @classmethod
    def setUpClass(cls):
        cls.agent = ConsultorAgent()

    def test_sql_routing_quantitative_query(self):
        """Verifica que preguntas cuantitativas invoquen la herramienta SQL y retornen datos."""
        response = self.agent.ask("¿Qué proyectos se ejecutaron en el año 2025 y cuál duró más?")
        self.assertTrue(response.found_info)
        tool_names = [t.tool_name for t in response.tools_used]
        self.assertIn("query_project_database", tool_names)
        self.assertIn("PC-2025-014", response.sources)
        self.assertIn("PC-2025-027", response.sources)
        self.assertIn("PC-2025-033", response.sources)

    def test_rag_routing_qualitative_query(self):
        """Verifica que preguntas cualitativas invoquen la herramienta RAG."""
        response = self.agent.ask("¿Qué lecciones aprendidas tuvimos sobre mandos medios y resistencia al cambio?")
        self.assertTrue(response.found_info)
        tool_names = [t.tool_name for t in response.tools_used]
        self.assertIn("search_project_documents", tool_names)
        self.assertTrue(len(response.sources) > 0)
        self.assertIn("Fuente:", response.answer)

    def test_anti_hallucination_unsupported_domain(self):
        """Verifica que ante temas inexistentes no invente datos y retorne la advertencia estándar."""
        response = self.agent.ask("¿Qué proyectos de minería a cielo abierto o petróleo hemos cerrado?")
        self.assertFalse(response.found_info)
        self.assertEqual(len(response.sources), 0)
        self.assertIn("No se dispone de información", response.answer)

    def test_traceability_logging(self):
        """Verifica que cada respuesta del agente contenga el registro de trazabilidad de ejecución."""
        response = self.agent.ask("¿Cuál es el proyecto del sector retail?")
        self.assertTrue(len(response.tools_used) > 0)
        first_tool = response.tools_used[0]
        self.assertIsNotNone(first_tool.tool_name)
        self.assertIsNotNone(first_tool.result_summary)
        self.assertGreaterEqual(first_tool.execution_time_ms, 0)


if __name__ == "__main__":
    unittest.main()
