"""
Modelos de Datos y Esquemas de Validación (Pydantic v2).
Garantiza Structured Outputs y tipado estricto para las fichas de proyectos.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class KPIImpacto(BaseModel):
    """Métrica o indicador clave de rendimiento antes y después de la intervención."""
    indicador: str = Field(
        description="Nombre del indicador o métrica (ej. Tiempo de ciclo, OEE, Quiebre de stock)"
    )
    linea_base_antes: str = Field(
        description="Valor inicial o línea base antes de la intervención de consultoría"
    )
    resultado_despues: str = Field(
        description="Valor final obtenido tras la implementación de las mejoras"
    )
    variacion_porcentual: Optional[str] = Field(
        default=None,
        description="Mejora porcentual, reducción o incremento obtenido (ej. -68%, +17.6 pp)"
    )


class ProyectoFicha(BaseModel):
    """Esquema maestro de la Ficha Estructurada de Proyecto."""
    codigo_proyecto: str = Field(
        description="Código único de identificación del proyecto (ej: PC-2025-014)"
    )
    cliente: str = Field(
        description="Nombre de la empresa o institución cliente"
    )
    sector: str = Field(
        description="Sector económico o vertical (ej. Servicios financieros, Manufactura, Salud, Retail)"
    )
    ubicacion: str = Field(
        description="Ubicación geográfica de ejecución (ciudad, provincia o región)"
    )
    fecha_inicio: str = Field(
        description="Fecha de inicio del proyecto (formato YYYY-MM-DD o texto descriptivo)"
    )
    fecha_fin: str = Field(
        description="Fecha de finalización y entrega del informe"
    )
    duracion_semanas: int = Field(
        description="Duración total del proyecto expresada en número de semanas completas"
    )
    gerente_proyecto: str = Field(
        description="Nombre del gerente o líder del proyecto por parte de Procesa Consultores"
    )
    equipo_consultor: List[str] = Field(
        default_factory=list,
        description="Lista de consultores y especialistas que participaron en el proyecto"
    )
    objetivo_general: str = Field(
        description="Descripción clara y concisa del objetivo central del proyecto"
    )
    metodologias_herramientas: List[str] = Field(
        default_factory=list,
        description="Metodologías y herramientas aplicadas (ej. Lean Healthcare, SMED, 5S, DMAIC)"
    )
    kpis_impacto: List[KPIImpacto] = Field(
        default_factory=list,
        description="Lista de indicadores clave con sus valores antes y después"
    )
    beneficios_economicos: str = Field(
        description="Ahorros financieros anuales, retorno de inversión (ROI) o impacto económico estimado"
    )
    principales_hitos: List[str] = Field(
        default_factory=list,
        description="Entregables principales o fases completadas durante la consultoría"
    )
    lecciones_aprendidas: List[str] = Field(
        default_factory=list,
        description="Lecciones aprendidas críticas, gestión del cambio y recomendaciones futuras"
    )
    factores_riesgo: List[str] = Field(
        default_factory=list,
        description="Factores de riesgo identificados durante el proyecto y medidas de mitigación"
    )
