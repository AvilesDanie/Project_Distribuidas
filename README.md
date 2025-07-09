# Proyecto de Microservicios - Guía de Ejecución y Rutas

Este proyecto implementa un sistema de microservicios para la gestión de usuarios, eventos, entradas y notificaciones, utilizando Docker Compose para orquestar los servicios. 

## Requisitos Previos
- **Docker** y **Docker Compose** instalados.


## Instrucciones de Ejecución
1. Clona el repositorio del proyecto:
   ```bash
   git clone https://github.com/AvilesDanie/Project_Distribuidas.git
   cd Project_Distribuidas
   ```
2. Asegúrate de que los directorios `ms-usuarios`, `ms-eventos`, `ms-entradas`, `ms-notificaciones` y `nginx` estén presentes con sus respectivos `Dockerfile` y código fuente.
3. Construye y ejecuta los servicios con Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
   - Esto construirá las imágenes de los microservicios y levantará los contenedores en segundo plano.
   - Los servicios incluyen: `usuarios`, `eventos`, `entradas`, `notificaciones`, `nginx`, `cockroach1`, `cockroach2`, `cockroach3`, `rabbitmq1` y `cockroach-init`.
4. Verifica que los servicios estén corriendo:
   ```bash
   docker ps
   ```
5. Accede al sistema a través del puerto `80` (NGINX actúa como API Gateway). Todas las rutas estarán disponibles en `http://localhost/api/v1/`.
6. Para detener los servicios:
   ```bash
   docker-compose down
   ```

## Guía de Rutas
El sistema expone rutas a través de NGINX, que actúa como API Gateway. Todas las rutas comienzan con `http://localhost/api/v1/`. A continuación, se describen las rutas por microservicio, su propósito, requisitos y flujo recomendado.

### Microservicio de Usuarios
Gestiona el registro, autenticación y perfiles de usuarios.

| Método | Ruta | Descripción | Requisitos |
|--------|------|-------------|------------|
| POST   | `/usuarios/usuarios/login` | Inicia sesión y obtiene un token JWT. | Body: `{ "username": "string", "password": "string" }` |
| POST   | `/usuarios/usuarios/registro` | Registra un nuevo usuario. | Body: `{ "usuario": "string", "email": "string", "password": "string" }` |
| GET    | `/usuarios/usuarios/get-usuarios` | Lista todos los usuarios (solo admin). | Header: `Authorization: Bearer <token>` |
| GET    | `/usuarios/usuarios/get-mi-perfil` | Obtiene el perfil del usuario autenticado. | Header: `Authorization: Bearer <token>` |
| GET    | `/usuarios/usuarios/get-usuario/{id}` | Obtiene un usuario por ID (solo admin). | Header: `Authorization: Bearer <token>`, Path: `id` (UUID) |
| PUT    | `/usuarios/usuarios/update-usuarios/{id}` | Actualiza datos de un usuario. | Header: `Authorization: Bearer <token>`, Path: `id` (UUID), Body: `{ "usuario": "string", "email": "string" }` |
| PUT    | `/usuarios/usuarios/update-password/{id}` | Cambia la contraseña de un usuario. | Header: `Authorization: Bearer <token>`, Path: `id` (UUID), Body: `{ "actual": "string", "nueva": "string" }` |

**Flujo recomendado para Usuarios:**
1. Registra un usuario (`/registro`).
2. Inicia sesión (`/login`) para obtener el token.
3. Consulta el perfil (`/get-mi-perfil`) o actualiza datos (`/update-usuarios/{id}`).
4. (Admin) Lista usuarios (`/get-usuarios`) o consulta un usuario específico (`/get-usuario/{id}`).

### Microservicio de Eventos
Gestiona la creación, consulta y estadísticas de eventos.

| Método | Ruta | Descripción | Requisitos |
|--------|------|-------------|------------|
| POST   | `/eventos/eventos/post-evento` | Crea un nuevo evento (solo admin). | Header: `Authorization: Bearer <token>`, Body: `{ "titulo": "string", "descripcion": "string", "fecha": "YYYY-MM-DD", "categoria": "string", "tipo": "presencial/virtual", "aforo": number }` |
| GET    | `/eventos/eventos/get-eventospublicados` | Lista eventos publicados. | Ninguno |
| GET    | `/eventos/eventos/get-eventos` | Lista todos los eventos (incluye no publicados). | Ninguno |
| GET    | `/eventos/eventos/get-eventopublicado/{id}` | Obtiene un evento publicado por ID. | Path: `id` (UUID) |
| GET    | `/eventos/eventos/get-evento/{id}` | Obtiene un evento por ID. | Path: `id` (UUID) |
| GET    | `/eventos/eventos/get-categorias` | Lista categorías de eventos. | Ninguno |
| GET    | `/eventos/eventos/buscar-eventos` | Busca eventos por categoría o palabra clave. | Query: `?categoria=string&palabra=string` |
| GET    | `/eventos/eventos/estadisticas` | Obtiene estadísticas de eventos. | Ninguno |
| GET    | `/eventos/eventos/ventas` | Obtiene ventas por evento (solo admin). | Header: `Authorization: Bearer <token>`, Query: `?evento_id=uuid` |

**Flujo recomendado para Eventos:**
1. (Admin) Inicia sesión (`/usuarios/usuarios/login`) y crea un evento (`/post-evento`).
2. Publica el evento (asegurándote de que esté en estado publicado para que sea accesible en `/get-eventospublicados`).
3. Consulta eventos publicados (`/get-eventospublicados`) o todos los eventos (`/get-eventos`).
4. Busca eventos por categoría o palabra clave (`/buscar-eventos`).
5. Obtiene detalles de un evento específico (`/get-eventopublicado/{id}` o `/get-evento/{id}`).
6. (Admin) Consulta estadísticas (`/estadisticas`) o ventas (`/ventas`).

### Microservicio de Entradas
Gestiona la compra y consulta de entradas para eventos. Los eventos deben estar publicados antes de que las entradas puedan ser accesibles o compradas.

| Método | Ruta | Descripción | Requisitos |
|--------|------|-------------|------------|
| GET    | `/entradas/entradas/mis-entradas` | Lista las entradas del usuario autenticado. | Header: `Authorization: Bearer <token>` |
| GET    | `/entradas/entradas/historial-usuario/{id}` | Consulta el historial de entradas de un usuario (solo admin). | Header: `Authorization: Bearer <token>`, Path: `id` (UUID) |
| GET    | `/entradas/entradas/get-disponibles/{evento_id}` | Lista entradas disponibles para un evento publicado. | Path: `evento_id` (UUID) |
| GET    | `/entradas/entradas/get-nodisponibles/{evento_id}` | Lista entradas no disponibles para un evento. | Path: `evento_id` (UUID) |
| GET    | `/entradas/entradas/evento-por-entrada/{entrada_id}` | Obtiene el evento asociado a una entrada. | Path: `entrada_id` |

**Flujo recomendado para Entradas:**
1. (Admin) Publica un evento en el microservicio de eventos (`/eventos/eventos/post-evento` y asegurarse de que esté publicado).
2. Registra un usuario (`/usuarios/usuarios/registro`) e inicia sesión (`/usuarios/usuarios/login`).
3. Consulta eventos publicados (`/eventos/eventos/get-eventospublicados`) y selecciona un evento.
4. Lista entradas disponibles para el evento publicado (`/get-disponibles/{evento_id}`).
5. Compra una entrada (no implementado en el código proporcionado, pero se espera en el flujo).
6. Consulta las entradas compradas (`/mis-entradas`).
7. (Admin) Consulta el historial de un usuario (`/historial-usuario/{id}`).

### Microservicio de Notificaciones
Este microservicio es responsable de enviar notificaciones a los usuarios y administradores en respuesta a eventos clave del sistema. Las notificaciones se gestionan mediante RabbitMQ y se registran en la base de datos CockroachDB. Opera como un microservicio independiente y se comunica con los demás mediante colas de eventos.

| Método | Ruta | Descripción | Requisitos |
|--------|------|-------------|------------|
| POST   | `/notificaciones/notificaciones-usuario` | Notifica a un administrador sobre la creación de otro admin. | Header: `Authorization: Bearer <token>`, Body: `{ "tipo": "admin", "mensaje": "string", "receptor": "string" }` |
| POST   | `/notificaciones/notificaciones-nuevoevento` | Informa a todos los usuarios sobre un nuevo evento publicado. | Header: `Authorization: Bearer <token>`, Body: `{ "tipo": "evento", "mensaje": "string", "receptor": "todos" }` |
| POST   | `/notificaciones/notificaciones-eventofinalizado` | Informa a todos los usuarios que un evento ha finalizado. | Header: `Authorization: Bearer <token>`, Body: `{ "tipo": "evento_finalizado", "mensaje": "string", "receptor": "todos" }` |
| POST   | `/notificaciones/notificaciones-compra-entrada` | Informa al comprador y al administrador sobre una compra exitosa. | Header: `Authorization: Bearer <token>`, Body: `{ "tipo": "compra", "mensaje": "string", "receptor": "usuario_id" }` |

### Estructura esperada del cuerpo (DTO) para todas las rutas:
```json
{
  "tipo": "string",         // Tipo de notificación: admin, evento, evento_finalizado, compra
  "mensaje": "string",      // Contenido de la notificación
  "receptor": "string"      // Usuario específico o 'todos'
}
```

### Flujo recomendado para Notificaciones:
1. Cada microservicio publica eventos a una cola de RabbitMQ cuando ocurre una acción relevante (ej: nuevo evento, compra de entrada, nuevo admin).
2. El microservicio de notificaciones escucha o recibe solicitudes y genera un registro en su base de datos.
3. Este microservicio actúa como un sistema central de alertas internas del sistema distribuido.

## Notas Adicionales
- **Puerto de acceso**: El puerto `80` es usado por NGINX. Todas las rutas son accesibles en `http://localhost/api/v1/`.
- **Autenticación**: Las rutas protegidas requieren un token JWT en el header `Authorization: Bearer <token>`. Obtén el token mediante `/usuarios/usuarios/login`.

- **Pruebas de carga**: El archivo de Locust proporcionado permite simular tráfico en las rutas. Para ejecutarlo:
  ```bash
  locust -f locustfile.py
  ```
  Accede a `http://localhost:8089` para configurar y ejecutar las pruebas.