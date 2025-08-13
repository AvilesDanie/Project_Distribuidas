# Constantes para los estados de las entradas

class EstadoEntrada:
    DISPONIBLE = "disponible"
    VENDIDA = "vendida" 
    CANCELADA = "cancelada"
    RESERVADA = "reservada"
    
    # Lista de todos los estados válidos
    TODOS = [DISPONIBLE, VENDIDA, CANCELADA, RESERVADA]
    
    # Estados que indican que la entrada está asignada a un usuario
    ASIGNADAS = [VENDIDA, RESERVADA]
    
    # Estados que permiten operaciones (no canceladas)
    ACTIVAS = [DISPONIBLE, VENDIDA, RESERVADA]
