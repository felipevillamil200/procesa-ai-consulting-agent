import sys
from pathlib import Path

# Asegurar que el directorio raíz esté en sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from rich.prompt import Prompt

from codigo.backend.agent import ConsultorAgent
from codigo.backend.database import DatabaseManager


console = Console()


def display_welcome_banner(db_manager: DatabaseManager) -> None:
    """Muestra el banner de bienvenida y la tabla de proyectos cargados."""
    console.print()
    console.print(
        Panel.fit(
            "[bold cyan]PROCESA CONSULTORES[/bold cyan] | [bold white]Agente Inteligente de Consulta de Proyectos[/bold white]\n"
            "[dim]Sistema de consulta en lenguaje natural con soporte de SQL Relacional y RAG Documental[/dim]",
            border_style="cyan",
            title="[bold yellow]★ SISTEMA EXPERTO IA ★[/bold yellow]",
            subtitle="[dim]Escriba [bold white]/salir[/bold white] para terminar o [bold white]/ayuda[/bold white] para ver opciones[/dim]"
        )
    )

    proyectos = db_manager.get_all_proyectos()
    table = Table(title="📊 Proyectos Históricos Disponibles en Base de Datos", border_style="dim")
    table.add_column("Código", style="bold cyan", no_wrap=True)
    table.add_column("Cliente", style="white")
    table.add_column("Sector", style="green")
    table.add_column("Duración", style="yellow", justify="right")
    table.add_column("Gerente", style="magenta")

    for p in proyectos:
        table.add_row(
            p["codigo_proyecto"],
            p["cliente"],
            p["sector"],
            f"{p['duracion_semanas']} sem",
            p["gerente_proyecto"]
        )

    console.print(table)
    console.print()


def display_help() -> None:
    """Muestra comandos y preguntas de ejemplo recomendadas."""
    help_text = """
### 💡 Comandos Rápidos y Preguntas de Ejemplo:

* **Comandos del Sistema:**
  * `/proyectos`: Muestra la lista de proyectos cargados.
  * `/ayuda`: Muestra esta guía.
  * `/limpiar`: Limpia la pantalla de la consola.
  * `/salir` o `exit`: Cierra la aplicación.

* **Ejemplos de Preguntas Cuantitativas (Tool SQL):**
  * *"¿Qué proyectos se ejecutaron en el año 2025 y cuál duró más semanas?"*
  * *"¿En qué sectores tenemos proyectos y quiénes fueron los gerentes?"*
  * *"¿Cuánto fue el ahorro anual proyectado en Supermercados La Canasta?"*

* **Ejemplos de Preguntas Cualitativas (Tool RAG):**
  * *"¿Qué lecciones aprendimos sobre resistencia al cambio de mandos medios?"*
  * *"¿Qué metodología SMED se aplicó en Plásticos del Pacífico?"*
  * *"¿Cómo se redujo el tiempo de espera en la Clínica Santa Lucía?"*

* **Ejemplo Anti-Alucinación:**
  * *"¿Qué experiencia tenemos en proyectos de minería a cielo abierto?"*
    """
    console.print(Panel(Markdown(help_text), title="[bold cyan]Guía de Ayuda[/bold cyan]", border_style="cyan"))


def display_traceability(tools_used: list) -> None:
    """Muestra la tabla de trazabilidad con las herramientas que el agente invocó."""
    if not tools_used:
        return

    table = Table(title="🔧 Trazabilidad de Herramientas Invocadas por el Agente", border_style="yellow")
    table.add_column("Herramienta", style="bold yellow", no_wrap=True)
    table.add_column("Parámetros Enviados", style="white")
    table.add_column("Resultado", style="green")
    table.add_column("Latencia", style="cyan", justify="right")

    for log in tools_used:
        args_str = ", ".join(f"{k}='{v}'" for k, v in log.arguments.items())
        table.add_row(
            log.tool_name,
            args_str,
            log.result_summary,
            f"{log.execution_time_ms} ms"
        )

    console.print(table)
    console.print()


def main_cli():
    """Bucle interactivo principal de la consola."""
    db_manager = DatabaseManager()
    agent = ConsultorAgent(db_manager=db_manager)

    display_welcome_banner(db_manager)

    while True:
        try:
            user_input = Prompt.ask("\n[bold green]Consultor[/bold green]").strip()

            if not user_input:
                continue

            if user_input.lower() in ["/salir", "exit", "quit"]:
                console.print("\n[bold cyan]¡Hasta pronto! Sesión finalizada con éxito.[/bold cyan]\n")
                sys.exit(0)

            elif user_input.lower() in ["/ayuda", "help", "?"]:
                display_help()
                continue

            elif user_input.lower() in ["/proyectos", "projects"]:
                display_welcome_banner(db_manager)
                continue

            elif user_input.lower() in ["/limpiar", "clear", "cls"]:
                console.clear()
                display_welcome_banner(db_manager)
                continue

            # Procesar consulta con el agente
            with console.status("[bold yellow]🤖 El agente está analizando la pregunta y consultando herramientas...[/bold yellow]"):
                response = agent.ask(user_input)

            # 1. Mostrar Trazabilidad de Herramientas
            display_traceability(response.tools_used)

            # 2. Mostrar Fuentes Citadas
            if response.sources:
                fuentes_badges = "  ".join(f"[bold black on cyan] {s} [/bold black on cyan]" for s in response.sources)
                console.print(f"[bold white]📌 Fuentes Validadas:[/bold white] {fuentes_badges}\n")

            # 3. Mostrar Respuesta Final
            panel_style = "green" if response.found_info else "red"
            title_text = "[bold green]Respuesta del Agente[/bold green]" if response.found_info else "[bold red]Aviso Anti-Alucinación[/bold red]"

            console.print(
                Panel(
                    Markdown(response.answer),
                    title=title_text,
                    border_style=panel_style,
                    padding=(1, 2)
                )
            )

        except (KeyboardInterrupt, EOFError):
            console.print("\n\n[bold cyan]Sesión interrumpida por el usuario. Saliendo...[/bold cyan]\n")
            sys.exit(0)


if __name__ == "__main__":
    main_cli()
