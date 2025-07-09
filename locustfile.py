from locust import HttpUser, task, between
import random


class UsuariosTest(HttpUser):
    wait_time = between(1, 3)

    admin_username = "admin"
    admin_password = "admin123"

    token = None
    usuario_ids_creados = []

    def on_start(self):
        """
        Login del admin antes de iniciar la prueba.
        """
        with self.client.post(
            "/api/v1/usuarios/usuarios/login",
            data={
                "username": self.admin_username,
                "password": self.admin_password,
            },
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data["access_token"]
                response.success()
            else:
                response.failure(f"Login fallido: {response.text}")

    @task(3)
    def crear_usuario(self):
        """
        POST /registro - Registro de usuario nuevo
        """
        payload = {
            "usuario": f"user_{random.randint(1, 100000)}",
            "email": f"user_{random.randint(1, 100000)}@example.com",
            "password": "password123"
        }
        with self.client.post(
            "/api/v1/usuarios/usuarios/registro",
            json=payload,
            catch_response=True,
        ) as response:
            if response.status_code == 201:
                user = response.json()
                self.usuario_ids_creados.append(user["id"])
                response.success()
            else:
                response.failure(f"Registro fallido: {response.text}")

    @task(2)
    def listar_usuarios(self):
        """
        GET /get-usuarios - Listado de usuarios (requiere token de admin)
        """
        headers = {"Authorization": f"Bearer {self.token}"}
        with self.client.get(
            "/api/v1/usuarios/usuarios/get-usuarios",
            headers=headers,
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                data = response.json()
                # Guardar algunos IDs por si no hemos creado usuarios aún
                if data:
                    ids = [u["id"] for u in data]
                    self.usuario_ids_creados.extend(ids)
                response.success()
            else:
                response.failure(f"Error listando usuarios: {response.text}")

    @task(2)
    def obtener_mi_perfil(self):
        """
        GET /get-mi-perfil - Perfil del usuario autenticado
        """
        headers = {"Authorization": f"Bearer {self.token}"}
        with self.client.get(
            "/api/v1/usuarios/usuarios/get-mi-perfil",
            headers=headers,
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error obteniendo perfil: {response.text}")

    @task(1)
    def obtener_usuario_por_id(self):
        """
        GET /get-usuario/{id} - Obtener un usuario específico
        """
        if not self.usuario_ids_creados:
            # Si no tenemos IDs aún, saltar esta tarea
            return

        user_id = random.choice(self.usuario_ids_creados)
        headers = {"Authorization": f"Bearer {self.token}"}
        with self.client.get(
            f"/api/v1/usuarios/usuarios/get-usuario/{user_id}",
            headers=headers,
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                response.failure("Usuario no encontrado")
            else:
                response.failure(f"Error obteniendo usuario: {response.text}")
"""
    @task(1)
    def actualizar_mis_datos(self):
        """
"""
        PUT /update-usuarios/{id} - Actualizar datos del usuario autenticado
        """
"""
        if not self.usuario_ids_creados:
            # Nada que actualizar si no hay usuarios
            return

        user_id = random.choice(self.usuario_ids_creados)
        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {
            "usuario": f"user_edit_{random.randint(1, 99999)}",
            "email": f"user_edit_{random.randint(1, 99999)}@example.com"
        }
        with self.client.put(
            f"/api/v1/usuarios/usuarios/update-usuarios/{user_id}",
            json=payload,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 403:
                response.failure("No autorizado a editar este usuario")
            elif response.status_code == 404:
                response.failure("Usuario no encontrado")
            else:
                response.failure(f"Error actualizando usuario: {response.text}")

    @task(1)
    def cambiar_password(self):
        """
"""
        PUT /update-password/{id} - Cambiar contraseña
        """
"""
        if not self.usuario_ids_creados:
            return

        user_id = random.choice(self.usuario_ids_creados)
        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {
            "actual": "password123",
            "nueva": "nueva1234"
        }
        with self.client.put(
            f"/api/v1/usuarios/usuarios/update-password/{user_id}",
            json=payload,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 400:
                response.failure("Contraseña actual incorrecta")
            elif response.status_code == 403:
                response.failure("No autorizado a cambiar contraseña")
            elif response.status_code == 404:
                response.failure("Usuario no encontrado")
            else:
                response.failure(f"Error cambiando contraseña: {response.text}")
"""




class EventosTest(HttpUser):
    wait_time = between(1, 3)

    admin_token = None
    evento_ids = []

    def on_start(self):
        """
        Login del admin para crear eventos.
        """
        with self.client.post(
            "/api/v1/usuarios/usuarios/login",
            data={
                "username": "admin",
                "password": "admin123"
            },
            catch_response=True
        ) as response:
            if response.status_code == 200:
                self.admin_token = response.json()["access_token"]
                response.success()
            else:
                response.failure(f"Login fallido: {response.text}")

    @task(2)
    def crear_evento(self):
        """
        POST /post-evento
        """
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        payload = {
            "titulo": f"Evento Test {random.randint(1, 99999)}",
            "descripcion": "Evento de prueba con Locust.",
            "fecha": "2025-12-31",
            "categoria": "concierto",
            "tipo": "presencial",
            "aforo": 100
        }
        with self.client.post(
            "/api/v1/eventos/eventos/post-evento",
            json=payload,
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                evento = response.json()
                self.evento_ids.append(evento["id"])
                response.success()
            else:
                response.failure(f"Error creando evento: {response.text}")

    @task(2)
    def get_eventos_publicados(self):
        """
        GET /get-eventospublicados
        """
        with self.client.get(
            "/api/v1/eventos/eventos/get-eventospublicados",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                ids = [e["id"] for e in response.json()]
                self.evento_ids.extend(ids)
                response.success()
            else:
                response.failure(f"Error listando publicados: {response.text}")

    @task(1)
    def get_todos_eventos(self):
        """
        GET /get-eventos
        """
        with self.client.get(
            "/api/v1/eventos/eventos/get-eventos",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                ids = [e["id"] for e in response.json()]
                self.evento_ids.extend(ids)
                response.success()
            else:
                response.failure(f"Error listando todos los eventos: {response.text}")

    @task(1)
    def get_evento_publicado_por_id(self):
        """
        GET /get-eventopublicado/{id}
        """
        if not self.evento_ids:
            return
        evento_id = random.choice(self.evento_ids)
        with self.client.get(
            f"/api/v1/eventos/eventos/get-eventopublicado/{evento_id}",
            catch_response=True
        ) as response:
            if response.status_code == 200 or response.status_code == 404:
                response.success()
            else:
                response.failure(f"Error obteniendo evento publicado: {response.text}")

    @task(1)
    def get_evento_por_id(self):
        """
        GET /get-evento/{id}
        """
        if not self.evento_ids:
            return
        evento_id = random.choice(self.evento_ids)
        with self.client.get(
            f"/api/v1/eventos/eventos/get-evento/{evento_id}",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error obteniendo evento: {response.text}")

    @task(1)
    def get_categorias(self):
        """
        GET /get-categorias
        """
        with self.client.get(
            "/api/v1/eventos/eventos/get-categorias",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error obteniendo categorías: {response.text}")

    @task(1)
    def buscar_eventos(self):
        """
        GET /buscar-eventos
        """
        with self.client.get(
            "/api/v1/eventos/eventos/buscar-eventos?categoria=concierto&palabra=Test",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error buscando eventos: {response.text}")

    @task(1)
    def obtener_estadisticas(self):
        """
        GET /estadisticas
        """
        with self.client.get(
            "/api/v1/eventos/eventos/estadisticas",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error obteniendo estadísticas: {response.text}")

    @task(1)
    def obtener_ventas(self):
        """
        GET /ventas
        """
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        # Usa un ID random o por defecto
        evento_id = self.evento_ids[0] if self.evento_ids else 1
        with self.client.get(
            f"/api/v1/eventos/eventos/ventas?evento_id={evento_id}",
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            else:
                response.failure(f"Error obteniendo ventas: {response.text}")





class EntradasTest(HttpUser):
    wait_time = between(1, 3)

    admin_token = None
    user_token = None
    usuario_ids = []
    entrada_ids_disponibles = []
    evento_ids = []

    def on_start(self):
        """
        Login de admin y creación de un usuario para comprar entradas.
        """
        # Login admin
        with self.client.post(
            "/api/v1/usuarios/usuarios/login",
            data={
                "username": "admin",
                "password": "admin123"
            },
            catch_response=True
        ) as response:
            if response.status_code == 200:
                self.admin_token = response.json()["access_token"]
                response.success()
            else:
                response.failure(f"Login admin fallido: {response.text}")

        # Registrar usuario normal
        username = f"user_{random.randint(1,9999)}"
        email = f"{username}@test.com"
        payload = {
            "usuario": username,
            "email": email,
            "password": "password123"
        }
        with self.client.post(
            "/api/v1/usuarios/usuarios/registro",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 201:
                user = response.json()
                self.usuario_ids.append(user["id"])
                response.success()
            else:
                response.failure(f"Registro usuario fallido: {response.text}")

        # Login usuario normal
        with self.client.post(
            "/api/v1/usuarios/usuarios/login",
            data={
                "username": username,
                "password": "password123"
            },
            catch_response=True
        ) as response:
            if response.status_code == 200:
                self.user_token = response.json()["access_token"]
                response.success()
            else:
                response.failure(f"Login usuario fallido: {response.text}")

        # Listar entradas disponibles de un evento (por defecto evento_id=1)
        with self.client.get(
            "/api/v1/entradas/entradas/get-disponibles/1",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                self.entrada_ids_disponibles = [e["id"] for e in response.json()]
                self.evento_ids.append(1)
                response.success()
            else:
                response.failure(f"No se pudo obtener entradas disponibles: {response.text}")

    
    @task(2)
    def mis_entradas(self):
        """
        GET /mis-entradas
        """
        headers = {"Authorization": f"Bearer {self.user_token}"}
        with self.client.get(
            "/api/v1/entradas/entradas/mis-entradas",
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error consultando mis entradas: {response.text}")

    @task(1)
    def historial_usuario(self):
        """
        GET /historial-usuario/{id}
        """
        if not self.usuario_ids:
            return
        user_id = random.choice(self.usuario_ids)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        with self.client.get(
            f"/api/v1/entradas/entradas/historial-usuario/{user_id}",
            headers=headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error consultando historial: {response.text}")

    @task(1)
    def get_entradas_disponibles(self):
        """
        GET /get-disponibles/{evento_id}
        """
        evento_id = self.evento_ids[0] if self.evento_ids else 1
        with self.client.get(
            f"/api/v1/entradas/entradas/get-disponibles/{evento_id}",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error listando disponibles: {response.text}")

    @task(1)
    def get_entradas_no_disponibles(self):
        """
        GET /get-nodisponibles/{evento_id}
        """
        evento_id = self.evento_ids[0] if self.evento_ids else 1
        with self.client.get(
            f"/api/v1/entradas/entradas/get-nodisponibles/{evento_id}",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error listando no disponibles: {response.text}")

    @task(1)
    def obtener_evento_por_entrada(self):
        """
        GET /evento-por-entrada/{id}
        """
        if not self.entrada_ids_disponibles:
            return
        entrada_id = random.choice(self.entrada_ids_disponibles)
        with self.client.get(
            f"/api/v1/entradas/entradas/evento-por-entrada/{entrada_id}",
            catch_response=True
        ) as response:
            if response.status_code in (200, 404):
                response.success()
            else:
                response.failure(f"Error obteniendo evento por entrada: {response.text}")
