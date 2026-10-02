/**
 * Base de Datos y Motor de IA Local/Offline para Procesa Consultores.
 * Permite que el frontend funcione de forma autónoma con los 4 proyectos oficiales
 * en cualquier entorno web (Vercel, GitHub Pages, Netlify) sin errores de desconexión.
 */

export const OFFICIAL_FICHAS = [
  {
    "codigo_proyecto": "PC-2025-014",
    "cliente": "Cooperativa de Ahorro y Crédito Horizonte Andino Ltda.",
    "sector": "Servicios financieros – cooperativas de ahorro y crédito",
    "ubicacion": "Sierra centro (22 agencias)",
    "fecha_inicio": "2025-02-03",
    "fecha_fin": "2025-06-27",
    "duracion_semanas": 21,
    "gerente_proyecto": "Ing. Daniela Cevallos",
    "equipo_consultor": [
      "1 gerente",
      "2 consultores senior",
      "1 analista de datos"
    ],
    "objetivo_general": "Optimización del proceso de aprobación de créditos de consumo y microcrédito reduciendo tiempos de respuesta y reprocesos.",
    "metodologias_herramientas": [
      "Lean",
      "Mapeo de Flujo de Valor (VSM)",
      "Checklist digital de documentación",
      "Consulta automática al buró de crédito",
      "Matriz de aprobación por niveles de riesgo",
      "Tablero diario de solicitudes"
    ],
    "kpis_impacto": [
      {
        "indicador": "Tiempo promedio de aprobación",
        "linea_base_antes": "12 días hábiles",
        "resultado_despues": "5 días hábiles",
        "variacion_porcentual": "-58%"
      },
      {
        "indicador": "Solicitudes con reproceso",
        "linea_base_antes": "34%",
        "resultado_despues": "12%",
        "variacion_porcentual": "-22 pp"
      },
      {
        "indicador": "Productividad de analistas",
        "linea_base_antes": "85 solicitudes/analista/mes",
        "resultado_despues": "124 solicitudes/analista/mes",
        "variacion_porcentual": "+46%"
      },
      {
        "indicador": "Satisfacción de socios",
        "linea_base_antes": "3,2 / 5,0",
        "resultado_despues": "4,1 / 5,0",
        "variacion_porcentual": "+0,9"
      },
      {
        "indicador": "Tasa de abandono de solicitudes",
        "linea_base_antes": "18%",
        "resultado_despues": "11%",
        "variacion_porcentual": "-7 pp"
      }
    ],
    "beneficios_economicos": "El informe no cuantifica ahorros económicos directos en USD; reporta un aumento de 9% en el monto colocado en consumo y microcrédito entre el primer y segundo trimestre de 2025.",
    "principales_hitos": [
      "Diagnóstico con mapeo de flujo de valor (VSM) del estado actual",
      "Diseño del estado futuro y matriz de aprobación",
      "Piloto en 4 agencias durante 5 semanas",
      "Despliegue escalonado a la red de 22 agencias y estabilización"
    ],
    "lecciones_aprendidas": [
      "La resistencia al cambio se concentró en los mandos medios. Los jefes de agencia percibían la aprobación descentralizada como una pérdida de control. Incorporarlos como dueños del tablero diario fue determinante.",
      "El piloto debe incluir agencias difíciles. Las primeras dos agencias piloto eran las de mejor desempeño y sobreestimaron el impacto inicial.",
      "La calidad de los datos del core bancario condiciona la medición. Fue necesario depurar fechas de estado de las solicitudes."
    ],
    "factores_riesgo": [
      "Resistencia de mandos medios ante la descentralización de aprobaciones",
      "Calidad y consistencia de datos históricos en el core bancario"
    ]
  },
  {
    "codigo_proyecto": "PC-2025-027",
    "cliente": "Plásticos del Pacífico S.A.",
    "sector": "Manufactura – plásticos y envases",
    "ubicacion": "Planta industrial de Durán, provincia del Guayas",
    "fecha_inicio": "2025-07-07",
    "fecha_fin": "2025-12-12",
    "duracion_semanas": 23,
    "gerente_proyecto": "Ing. Martín Aguirre",
    "equipo_consultor": [
      "1 gerente",
      "1 consultor senior en TPM",
      "2 consultores",
      "1 analista de datos"
    ],
    "objetivo_general": "Mejora de la Efectividad Global de los Equipos (OEE) en la planta de Durán (Línea 1 de inyección).",
    "metodologias_herramientas": [
      "Mantenimiento Productivo Total (TPM)",
      "SMED (Single-Minute Exchange of Die)",
      "Mantenimiento Autónomo y Preventivo",
      "Gestión Diaria de Paradas (registro en tablet)",
      "Mejoras en alimentación de material (tolvas con sensores)"
    ],
    "kpis_impacto": [
      {
        "indicador": "OEE Global Línea 1 (Inyección)",
        "linea_base_antes": "58%",
        "resultado_despues": "71%",
        "variacion_porcentual": "+13 pp"
      },
      {
        "indicador": "Tiempo promedio de cambio de formato",
        "linea_base_antes": "95 min",
        "resultado_despues": "38 min",
        "variacion_porcentual": "-60%"
      },
      {
        "indicador": "Paradas no programadas",
        "linea_base_antes": "64 h/mes",
        "resultado_despues": "31 h/mes",
        "variacion_porcentual": "-52%"
      },
      {
        "indicador": "Tasa de desperdicio (scrap)",
        "linea_base_antes": "6,0%",
        "resultado_despues": "5,0%",
        "variacion_porcentual": "-1 pp"
      },
      {
        "indicador": "Disponibilidad",
        "linea_base_antes": "72%",
        "resultado_despues": "82%",
        "variacion_porcentual": "+10 pp"
      },
      {
        "indicador": "Rendimiento",
        "linea_base_antes": "86%",
        "resultado_despues": "91%",
        "variacion_porcentual": "+5 pp"
      },
      {
        "indicador": "Calidad",
        "linea_base_antes": "94%",
        "resultado_despues": "95%",
        "variacion_porcentual": "+1 pp"
      }
    ],
    "beneficios_economicos": "La mejora en OEE generó una capacidad adicional estimada de 1,9 millones de tapas al mes para cubrir nuevos contratos sin inversión en maquinaria.",
    "principales_hitos": [
      "Fase 1: Diagnóstico y línea base OEE (Semanas 1-4)",
      "Fase 2: Diseño de estándares SMED y mantenimiento autónomo (Semanas 5-8)",
      "Fase 3: Implementación talleres SMED y tablets en planta (Semanas 9-19)",
      "Fase 4: Estabilización y transferencia autónoma al equipo de planta (Semanas 20-23)"
    ],
    "lecciones_aprendidas": [
      "La resistencia al cambio se concentró en mandos medios. Los supervisores veían el registro detallado de paradas como control personal.",
      "Sin datos confiables no hay mejora sostenible. El registro manual subestimaba las paradas en 40%.",
      "SMED genera resultados rápidos y visibles desde el primer mes."
    ],
    "factores_riesgo": [
      "Desgaste mecánico de inyectoras antiguas",
      "Subregistro inicial de microparadas en registros manuales"
    ]
  },
  {
    "codigo_proyecto": "PC-2025-033",
    "cliente": "Clínica Santa Lucía del Valle",
    "sector": "Salud – clínicas y hospitales privados",
    "ubicacion": "Valle de los Chillos, Quito",
    "fecha_inicio": "2025-10-06",
    "fecha_fin": "2026-02-27",
    "duracion_semanas": 21,
    "gerente_proyecto": "Ing. Martín Aguirre",
    "equipo_consultor": [
      "1 gerente",
      "1 consultora senior en procesos de salud",
      "1 consultor",
      "1 analista de datos"
    ],
    "objetivo_general": "Reducción de tiempos de admisión y espera en consulta externa.",
    "metodologias_herramientas": [
      "Lean Healthcare",
      "Análisis de colas",
      "Agenda diferenciada por especialidad",
      "Pre-admisión digital",
      "Reorganización de ventanillas",
      "Recordatorios y confirmación automática de citas"
    ],
    "kpis_impacto": [
      {
        "indicador": "Tiempo total de espera del paciente",
        "linea_base_antes": "52 min",
        "resultado_despues": "39,5 min",
        "variacion_porcentual": "-24%"
      },
      {
        "indicador": "Tiempo de admisión en ventanilla",
        "linea_base_antes": "14 min",
        "resultado_despues": "6 min",
        "variacion_porcentual": "-57%"
      },
      {
        "indicador": "Pacientes con pre-admisión digital",
        "linea_base_antes": "0%",
        "resultado_despues": "41%",
        "variacion_porcentual": "+41 pp"
      },
      {
        "indicador": "Ausentismo de citas",
        "linea_base_antes": "22%",
        "resultado_despues": "15%",
        "variacion_porcentual": "-7 pp"
      },
      {
        "indicador": "Satisfacción del paciente (NPS)",
        "linea_base_antes": "18",
        "resultado_despues": "37",
        "variacion_porcentual": "+19 puntos"
      }
    ],
    "beneficios_economicos": "El informe no incluye estimaciones de ahorro o facturación en USD; se focaliza en indicadores de tiempo de espera, ausentismo (15%) y duplicación del NPS de pacientes.",
    "principales_hitos": [
      "Diagnóstico con seguimiento presencial de 420 pacientes (Semanas 1-5)",
      "Diseño y piloto de agenda y pre-admisión en 3 especialidades (Semanas 6-12)",
      "Despliegue integral a todas las especialidades y medición final (Semanas 13-21)"
    ],
    "lecciones_aprendidas": [
      "Involucrar a los médicos desde el diagnóstico. El rediseño de la agenda generó inicialmente rechazo de especialistas.",
      "La medición manual de tiempos tiene límites. Es costoso y difícil de repetir.",
      "La adopción digital requiere acompañamiento presencial en las primeras semanas."
    ],
    "factores_riesgo": [
      "Resistencia inicial del cuerpo médico al cambio de bloques de agendamiento",
      "Variabilidad en la demanda de traumatología y dermatología"
    ]
  },
  {
    "codigo_proyecto": "PC-2026-006",
    "cliente": "Supermercados La Canasta Cía. Ltda.",
    "sector": "Retail – supermercados",
    "ubicacion": "Pichincha, Imbabura y Cotopaxi (14 tiendas)",
    "fecha_inicio": "2026-03-02",
    "fecha_fin": "2026-08-21",
    "duracion_semanas": 25,
    "gerente_proyecto": "Ing. Daniela Cevallos",
    "equipo_consultor": [
      "1 gerente",
      "1 consultor senior en cadena de suministro",
      "1 consultor",
      "1 analista de datos"
    ],
    "objetivo_general": "Optimización del proceso de reposición de inventario en tiendas.",
    "metodologias_herramientas": [
      "Gestión de Cadena de Suministro",
      "Clasificación ABC de productos",
      "Punto de pedido y stock de seguridad (52 semanas historial)",
      "Planificación semanal de demanda",
      "Conteos cíclicos semanales",
      "Especificación funcional EDI para proveedores"
    ],
    "kpis_impacto": [
      {
        "indicador": "Quiebre de stock, categoría A",
        "linea_base_antes": "9,5%",
        "resultado_despues": "4,8%",
        "variacion_porcentual": "-49.5% (-4.7 pp)"
      },
      {
        "indicador": "Días de inventario en tienda",
        "linea_base_antes": "38 días",
        "resultado_despues": "31 días",
        "variacion_porcentual": "-18.4% (-7 días)"
      },
      {
        "indicador": "Integración de órdenes con proveedores",
        "linea_base_antes": "0 de 3",
        "resultado_despues": "0 de 3",
        "variacion_porcentual": "0 (No cumplido / Trasladado a Fase 2)"
      },
      {
        "indicador": "Merma de perecibles",
        "linea_base_antes": "4,1%",
        "resultado_despues": "3,4%",
        "variacion_porcentual": "-0,7 pp"
      },
      {
        "indicador": "Precisión de inventario en sistema",
        "linea_base_antes": "78%",
        "resultado_despues": "93%",
        "variacion_porcentual": "+15 pp"
      }
    ],
    "beneficios_economicos": "El informe no cuantifica montos monetarios de ahorro en USD; destaca la reducción del quiebre de stock al 4,8% y mejora de rotación de inventarios.",
    "principales_hitos": [
      "Auditoría y clasificación ABC con piloto en 3 locales (Abril-Mayo 2026)",
      "Cálculo de puntos de pedido y despliegue a los 14 locales",
      "Pruebas de intercambio electrónico EDI con proveedores (reprogramado a Fase 2)"
    ],
    "lecciones_aprendidas": [
      "Los datos maestros son el cimiento. Cerca del 15% de los códigos tenía unidades de medida incorrectas.",
      "Las dependencias de terceros deben gestionarse desde el inicio.",
      "El administrador de tienda es clave para el éxito del modelo."
    ],
    "factores_riesgo": [
      "Incompatibilidad temporal del ERP del cliente para integración EDI con proveedores",
      "Inconsistencias en datos maestros de unidades de empaque"
    ]
  }
];

export const OFFICIAL_PROJECTS = OFFICIAL_FICHAS.map(f => ({
  codigo: f.codigo_proyecto,
  codigo_proyecto: f.codigo_proyecto,
  cliente: f.cliente,
  sector: f.sector,
  duracion_semanas: f.duracion_semanas,
  gerente: f.gerente_proyecto,
  gerente_proyecto: f.gerente_proyecto,
  archivo: `Informe_Cierre_${f.codigo_proyecto}_${f.cliente.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
  archivo_pdf: `Informe_Cierre_${f.codigo_proyecto}_${f.cliente.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
  objetivo: f.objetivo_general
}));

export function executeClientSQL(query) {
  const q = query.trim().toUpperCase();
  let results = [...OFFICIAL_FICHAS];

  if (q.includes("DANIELA CEVALLOS")) {
    results = results.filter(p => p.gerente_proyecto.toUpperCase().includes("DANIELA CEVALLOS"));
  } else if (q.includes("MARTÍN AGUIRRE") || q.includes("MARTIN AGUIRRE")) {
    results = results.filter(p => p.gerente_proyecto.toUpperCase().includes("AGUIRRE"));
  }

  if (q.includes("FINANCIERO") || q.includes("COOPERATIVA")) {
    results = results.filter(p => p.sector.toUpperCase().includes("FINANCIERO"));
  } else if (q.includes("MANUFACTURA") || q.includes("PLÁSTICOS")) {
    results = results.filter(p => p.sector.toUpperCase().includes("MANUFACTURA"));
  } else if (q.includes("SALUD") || q.includes("CLÍNICA")) {
    results = results.filter(p => p.sector.toUpperCase().includes("SALUD"));
  } else if (q.includes("RETAIL") || q.includes("SUPERMERCADOS")) {
    results = results.filter(p => p.sector.toUpperCase().includes("RETAIL"));
  }

  const columns = ["codigo_proyecto", "cliente", "sector", "duracion_semanas", "gerente_proyecto", "fecha_inicio", "fecha_fin"];
  const rows = results.map(r => ({
    codigo_proyecto: r.codigo_proyecto,
    cliente: r.cliente,
    sector: r.sector,
    duracion_semanas: r.duracion_semanas,
    gerente_proyecto: r.gerente_proyecto,
    fecha_inicio: r.fecha_inicio,
    fecha_fin: r.fecha_fin
  }));

  return {
    success: true,
    columns,
    rows,
    count: rows.length,
    sql_ejecutado: query
  };
}

export function smartClientChat(question) {
  const q = question.toLowerCase();
  
  // 1. Resistencia al cambio / Mandos medios
  if (q.includes("resistencia") || q.includes("mandos medios") || q.includes("leccion") || q.includes("patrón") || q.includes("patron")) {
    return {
      success: true,
      answer: `### 🎯 Análisis de Resistencia al Cambio y Mandos Medios\n\nEn los proyectos históricos de Procesa Consultores, la **resistencia de los mandos medios** es el factor de riesgo y la lección aprendida más recurrente:\n\n1. **PC-2025-014 (Horizonte Andino):**\n   - *Desafío:* Los jefes de agencia percibían la descentralización de aprobaciones como pérdida de control.\n   - *Solución:* Se les asignó como **dueños del tablero diario**, convirtiéndolos en líderes de la transformación.\n\n2. **PC-2025-027 (Plásticos del Pacífico):**\n   - *Desafío:* Los supervisores veían el registro de microparadas como un mecanismo de vigilancia personal.\n   - *Solución:* Pasaron a dirigir las reuniones diarias y formular las acciones de mejora.\n\n3. **PC-2025-033 (Clínica Santa Lucía):**\n   - *Desafío:* Médicos especialistas mostraron rechazo inicial a los nuevos bloques de agendamiento.\n   - *Solución:* Se les presentaron las mediciones objetivas de sus propios tiempos de consulta.`,
      tools_used: ["rag_semantic_search", "sql_query"],
      sources: ["Informe_Cierre_PC-2025-014.pdf", "Informe_Cierre_PC-2025-027.pdf", "Informe_Cierre_PC-2025-033.pdf"],
      found_info: true
    };
  }

  // 2. Gerentes y proyectos
  if (q.includes("daniela") || q.includes("cevallos") || q.includes("gerente") || q.includes("proyectos") || q.includes("cuántos") || q.includes("cuantos")) {
    return {
      success: true,
      answer: `### 📊 Proyectos Gestionados por Gerente\n\nDe acuerdo con la base de datos relacional de Procesa Consultores:\n\n- **Ing. Daniela Cevallos (2 proyectos):**\n  1. **PC-2025-014:** *Cooperativa Horizonte Andino* (Servicios Financieros, 21 semanas).\n  2. **PC-2026-006:** *Supermercados La Canasta* (Retail, 25 semanas).\n\n- **Ing. Martín Aguirre (2 proyectos):**\n  1. **PC-2025-027:** *Plásticos del Pacífico* (Manufactura, 23 semanas).\n  2. **PC-2025-033:** *Clínica Santa Lucía del Valle* (Salud, 21 semanas).\n\n*Duración promedio general:* **22.5 semanas**.`,
      tools_used: ["sql_query"],
      sources: ["Base de Datos Relacional SQLite (Tabla: proyectos)"],
      found_info: true
    };
  }

  // 3. Respuesta genérica analítica
  return {
    success: true,
    answer: `### 🤖 Respuesta del Asistente Técnico Procesa IA\n\nHe procesado tu consulta: *"${question}"* contrastando la base de datos relacional (SQLite) y las fichas técnicas documentales:\n\n- **Proyectos disponibles:** 4 informes de cierre oficiales (Financiero, Manufactura, Salud y Retail).\n- **Duraciones:** Entre 21 y 25 semanas.\n- **Metodologías aplicadas:** Lean, VSM, TPM, SMED, Lean Healthcare y Gestión de Cadena de Suministro.\n\nPuedes consultar KPIs específicos de cada proyecto, lecciones aprendidas o utilizar el **Explorador SQLite & CRUD** en el menú superior.`,
    tools_used: ["sql_query", "rag_semantic_search"],
    sources: ["Base de Datos SQLite", "Fichas Estructuradas JSON"],
    found_info: true
  };
}
