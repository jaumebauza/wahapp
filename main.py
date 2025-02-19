from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from database import get_db_connection
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from werkzeug.security import check_password_hash
from datetime import datetime
from fastapi.responses import RedirectResponse
import pymysql
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import sqlite3
import os

app = FastAPI()
SECRET_KEY = "mi_clave_secreta"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado o inválido")


class MarcarMensajesRequest(BaseModel):
    receptor: int
    emisor: int

class Mensaje(BaseModel):
    remitente: str
    destinatario: str
    mensaje: str

class UsuariGrup(BaseModel):
    usuari_id: int
    grup_id: int

class Grup(BaseModel):
    nom: str
    descripcio: str = None

class AbandonarGrupRequest(BaseModel):
    id_usuari: int
    id_grup: int
    
class UserLogin(BaseModel):
    usuari: str
    pwd: str

class MensajeGrup(BaseModel):
    id_grup: int
    missatge: str

class User:
    def __init__(self, username):
        self.username = username

    @classmethod
    def fromUsername(cls, username):
        return cls(username)

    def comprovaUsuari(self, pwd):
        try:
            with pymysql.connect(host='192.168.193.133',
                                 user='pereserra',
                                 password = '20550359C',
                                 db='wahap',
                                 charset='utf8mb4',
                                 autocommit=True,
                                 cursorclass=pymysql.cursors.DictCursor) as db:
                with db.cursor() as cursor:
                    sql = "SELECT password FROM usuarisclase WHERE username = %s"
                    cursor.execute(sql, (self.username,))
                    ResQuery = cursor.fetchone()
                    
                    if ResQuery:
                        return check_password_hash(ResQuery['password'], pwd)
        except Exception as e:
            print(f"Error en la conexión a la base de datos: {e}")
        
        return False



def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post('/login')
async def login(data: dict):  # Se cambió `UserLogin` por un diccionario para simplicidad
    if 'usuari' not in data or 'pwd' not in data:
        raise HTTPException(status_code=400, detail="Faltan credenciales")

    user = User.fromUsername(data['usuari'])

    if user.comprovaUsuari(data['pwd']):
        access_token = create_access_token(data={"username": user.username})
        return {"message": "Login correcto", "access_token": access_token}
    else:
        raise HTTPException(status_code=401, detail="Login incorrecto")


    
def get_db_connection():
    try:
        return pymysql.connect(host='192.168.193.133',
                               user='pereserra',
                               password = '20550359C',
                               db='wahap',
                               charset='utf8mb4',
                               autocommit=True,
                               cursorclass=pymysql.cursors.DictCursor)
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("username")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    
@app.get("/llistaamics", response_model=List[dict])
def llista_amics(username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        with conn.cursor() as cursor:
            # Obtener el ID del usuario logueado
            cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
            user_id = cursor.fetchone()['id']

            # Obtener los grupos en los que el usuario está presente
            cursor.execute("""
                SELECT g.id, g.nom 
                FROM grups g
                JOIN usuaris_grups ug ON g.id = ug.id_grup
                WHERE ug.id_usuari = %s
            """, (user_id,))
            grups = cursor.fetchall()
            grups_dict = [{"type": "group", "id": grup['id'], "nom": grup['nom']} for grup in grups]

            # Obtener los usuarios (excluyendo al usuario logueado)
            cursor.execute("SELECT id, username FROM usuarisclase WHERE username != %s", (username,))
            amics = cursor.fetchall()
            amics_dict = [{"type": "user", "id": amic['id'], "username": amic['username']} for amic in amics]

            # Obtener la fecha del último mensaje para cada usuario y grupo
            for item in amics_dict + grups_dict:
                if item['type'] == 'user':
                    # Para usuarios, obtener el último mensaje entre el usuario logueado y el amigo
                    cursor.execute("""
                        SELECT MAX(data_hora) as last_message
                        FROM missatgesamics
                        WHERE (emisor = %s AND receptor = %s) OR (emisor = %s AND receptor = %s)
                    """, (user_id, item['id'], item['id'], user_id))
                else:
                    # Para grupos, obtener el último mensaje en el grupo
                    cursor.execute("""
                        SELECT MAX(data_hora) as last_message
                        FROM missatgesgrup
                        WHERE id_grup = %s
                    """, (item['id'],))
                
                last_message = cursor.fetchone()['last_message']
                item['last_message'] = last_message if last_message else datetime.min  # Si no hay mensajes, usar una fecha mínima

        # Ordenar la lista por la fecha del último mensaje (de más reciente a más antiguo)
        sorted_list = sorted(amics_dict + grups_dict, key=lambda x: x['last_message'], reverse=True)

        return sorted_list  # Devuelve usuarios y grupos ordenados por último mensaje
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener la lista: {e}")
    finally:
        conn.close()

@app.get("/recibir_missatges")
def recibir_missatges(receptor: int, emisor: Optional[str] = None, offset: int = 0, limit: int = 10):
    try:
        conn = get_db_connection()
        if conn is None:
            raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

        cursor = conn.cursor()

        print(f"🔍 Parámetros recibidos - Receptor: {receptor}, Emisor: {emisor}, Offset: {offset}, Limit: {limit}")  # Depuración

        query = """
            SELECT m.id, u1.username as emisor, u2.username as receptor, m.missatge, m.data_hora, m.estat 
            FROM missatgesamics m
            JOIN usuarisclase u1 ON m.emisor = u1.id
            JOIN usuarisclase u2 ON m.receptor = u2.id
            WHERE (m.receptor = %s OR m.emisor = %s)
        """
        params = (receptor, receptor)

        if emisor:
            query += " AND (u1.username = %s OR u2.username = %s)"
            params += (emisor, emisor)

        query += " ORDER BY m.data_hora DESC LIMIT %s OFFSET %s"
        params += (limit, offset)

        print(f"📝 SQL: {query}")  # Depuración
        print(f"📌 Parámetros: {params}")  # Depuración

        cursor.execute(query, params)
        missatges = cursor.fetchall()

        # Depuración para verificar los mensajes obtenidos
        print(f"🔍 Mensajes obtenidos de la base de datos: {missatges}")

        if not missatges:
            print("⚠ No se encontraron mensajes")
            return []

        # Procesar los mensajes
        messages_list = []
        for msg in missatges:
            print(f"🔎 Procesando mensaje: {msg}")  # Depuración de cada mensaje
            try:
                # Verificar que data_hora sea un objeto datetime
                data_hora = msg['data_hora']
                if isinstance(data_hora, datetime):
                    data_hora = data_hora.strftime("%Y-%m-%d %H:%M:%S")
                else:
                    print(f"⚠ data_hora no es un datetime válido: {data_hora}")
                    data_hora = None

                # Añadir el mensaje a la lista
                messages_list.append({
                    "id": msg['id'],
                    "emisor": msg['emisor'],
                    "receptor": msg['receptor'],
                    "missatge": msg['missatge'],
                    "data_hora": data_hora,
                    "estat": msg['estat']
                })
            except Exception as e:
                print(f"❌ Error al procesar el mensaje: {e}")
                continue

        if not messages_list:
            print("⚠ No se pudo procesar ningún mensaje correctamente")
            return []

        print(f"✅ Mensajes procesados correctamente: {messages_list}")

        return messages_list

    except Exception as e:
        print(f"❌ Error en la consulta o en la conexión: {e}")  # Depuración
        raise HTTPException(status_code=500, detail=f"Error al rebre els missatges: {e}")
    finally:
        if conn:
            conn.close()


"""      
@app.post("/crear_grup")
def crear_grup(grup: Grup):

    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        query = "INSERT INTO grups (nom, descripcio) VALUES (%s, %s)"
        cursor.execute(query, (grup.nom, grup.descripcio))
        conn.commit()
        cursor.close()
        conn.close()
        return {"success": "Grup creat correctament", "grup_id": cursor.lastrowid}
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al crear el grup: {e}")

@app.get("/consultar_grups", response_model=List[dict])
def consultar_grups():

    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        query = "SELECT id, nom, descripcio, data_creacio FROM grups ORDER BY data_creacio DESC"
        cursor.execute(query)
        grups = cursor.fetchall()
        cursor.close()
        conn.close()

        # Convertir los resultados en una lista de diccionarios
        resultats = [
            {
                "id": grup[0],
                "nom": grup[1],
                "descripcio": grup[2],
                "data_creacio": grup[3].strftime("%Y-%m-%d %H:%M:%S")
            }
            for grup in grups
        ]

        return resultats
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al consultar els grups: {e}")
"""
@app.post("/crear_grup")
def crear_grup(grup: Grup, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        
        # Insertar el nuevo grupo
        query = "INSERT INTO grups (nom, descripcio) VALUES (%s, %s)"
        cursor.execute(query, (grup.nom, grup.descripcio))
        grup_id = cursor.lastrowid  # Obtener el ID del grupo recién creado
        
        # Obtener el ID del usuario que creó el grupo
        cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
        usuari_id = cursor.fetchone()['id']
        
        # Añadir al usuario como administrador del grupo
        query = "INSERT INTO usuaris_grups (id_usuari, id_grup, es_admin) VALUES (%s, %s, %s)"
        cursor.execute(query, (usuari_id, grup_id, True))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": "Grup creat correctament", "grup_id": grup_id}
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al crear el grup: {e}")
    
@app.get("/consultar_grups", response_model=List[dict])
def consultar_grups():

    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        query = "SELECT id, nom, descripcio, data_creacio FROM grups ORDER BY data_creacio DESC"
        cursor.execute(query)
        grups = cursor.fetchall()
        cursor.close()
        conn.close()

        # Convertir los resultados en una lista de diccionarios
        resultats = [
            {
                "id": grup[0],
                "nom": grup[1],
                "descripcio": grup[2],
                "data_creacio": grup[3].strftime("%Y-%m-%d %H:%M:%S")
            }
            for grup in grups
        ]

        return resultats
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al consultar els grups: {e}")
    
@app.post("/marcar_mensajes_como_leidos")
def marcar_mensajes_como_leidos(request: MarcarMensajesRequest, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No se puede conectar a la base de datos")

    try:
        cursor = conn.cursor()

        # Obtener el ID del usuario logueado (receptor)
        cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
        loggedInUserId = cursor.fetchone()['id']

        # Verificar que se ha recibido un emisor y receptor correctos
        if not request.emisor or not request.receptor:
            raise HTTPException(status_code=400, detail="Faltan los parámetros emisor o receptor")

        emisor_id = request.emisor
        receptor_id = request.receptor

        # Evitar que el usuario marque sus propios mensajes como leídos
        if emisor_id == loggedInUserId:
            raise HTTPException(status_code=400, detail="No puedes marcar tus propios mensajes como leídos")

        print(f"📌 Intentando marcar como leído mensajes de {emisor_id} a {loggedInUserId}")

        # Verificar cuántos mensajes están en estado 'enviat' antes de actualizarlos
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM missatgesamics
            WHERE emisor = %s AND receptor = %s AND estat = 'enviat'
        """, (emisor_id, loggedInUserId))

        mensajes_pendientes = cursor.fetchone()['total']
        if mensajes_pendientes == 0:
            raise HTTPException(status_code=404, detail="No hay mensajes pendientes para marcar como leídos")

        # Actualizar los mensajes como leídos
        query = """
            UPDATE missatgesamics 
            SET estat = 'llegit' 
            WHERE emisor = %s AND receptor = %s AND estat = 'enviat'
        """
        cursor.execute(query, (emisor_id, loggedInUserId))
        affected_rows = cursor.rowcount
        conn.commit()

        if affected_rows == 0:
            raise HTTPException(status_code=500, detail="No se pudieron actualizar los mensajes")

        return {"success": f"{affected_rows} mensajes marcados como leídos correctamente"}

    except Exception as e:
        conn.rollback()
        print(f"❌ Error al marcar mensajes como leídos: {e}")
        raise HTTPException(status_code=500, detail=f"Error al marcar los mensajes como leídos: {str(e)}")
    finally:
        cursor.close()
        conn.close()



@app.get("/obtener_id_usuario")
def obtener_id_usuario(username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return {"id": user['id']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el ID del usuario: {e}")
    finally:
        conn.close()

    
@app.post("/marcar_mensajes_como_leidos_grup")
def marcar_mensajes_como_leidos_grup(id_grup: int, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        cursor = conn.cursor()
        # Obtener el ID del usuario logueado
        cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
        loggedInUserId = cursor.fetchone()['id']

        # Actualizar todos los mensajes no leídos en el grupo
        query = """
            UPDATE missatgesgrup 
            SET estat = 'llegit' 
            WHERE id_grup = %s AND estat = 'enviat'
        """
        cursor.execute(query, (id_grup,))
        conn.commit()
        cursor.close()
        conn.close()
        return {"success": "Missatges marcats com a llegits correctament"}
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al marcar els missatges com a llegits: {e}")


@app.post("/check")
def check_missatge(id_missatge: int, estat: str):
    """
    Endpoint per actualitzar l'estat d'un missatge.
    Estat pot ser:
    - 'enviat': un check gris
    - 'llegit': dos checks blaus
    """
    if estat not in ["enviat", "llegit"]:
        raise HTTPException(
            status_code=400, detail="Estat no vàlid. Usa 'enviat' o 'llegit'."
        )
    
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        query = "UPDATE missatgesamics SET estat = %s WHERE id = %s"
        cursor.execute(query, (estat, id_missatge))
        conn.commit()
        cursor.close()
        conn.close()
        return {"success": "Estat del missatge actualitzat correctament"}
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al actualitzar l'estat: {e}")
    
@app.post("/abandonar_grup")
def abandonar_grup(request: AbandonarGrupRequest):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()

        # Verifiquem que l'usuari existeix
        cursor.execute("SELECT * FROM usuarisclase WHERE id = %s", (request.id_usuari,))
        usuari = cursor.fetchone()
        if not usuari:
            raise HTTPException(status_code=404, detail="L'usuari no existeix")

        # Verifiquem que el grup existeix
        cursor.execute("SELECT * FROM grups WHERE id = %s", (request.id_grup,))
        grup = cursor.fetchone()
        if not grup:
            raise HTTPException(status_code=404, detail="El grup no existeix")

        # Verifiquem que l'usuari pertany al grup
        cursor.execute(
            "SELECT * FROM usuaris_grups WHERE id_usuari = %s AND id_grup = %s",
            (request.id_usuari, request.id_grup)
        )
        usuari_grup = cursor.fetchone()

        if not usuari_grup:
            raise HTTPException(status_code=404, detail="L'usuari no pertany a aquest grup")

        # Eliminem l'usuari del grup
        cursor.execute(
            "DELETE FROM usuaris_grups WHERE id_usuari = %s AND id_grup = %s",
            (request.id_usuari, request.id_grup)
        )
        conn.commit()

        cursor.close()
        conn.close()
        return {"success": "L'usuari ha abandonat el grup correctament"}

    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error en abandonar el grup: {e}")
    
@app.post("/afegir_usuari")
def afegir_usuari(usuari_grup: UsuariGrup):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        cursor = conn.cursor()
        # Verificar si el grup existeix
        query = "SELECT * FROM grups WHERE id = %s"
        cursor.execute(query, (usuari_grup.grup_id,))
        grup_existeix = cursor.fetchone()

        if not grup_existeix:
            raise HTTPException(status_code=400, detail="El grup no existeix")

        # Comprovar si l'usuari ja està en el grup
        query = "SELECT * FROM usuaris_grups WHERE id_usuari = %s AND id_grup = %s"
        cursor.execute(query, (usuari_grup.usuari_id, usuari_grup.grup_id))
        ja_existeix = cursor.fetchone()

        if ja_existeix:
            raise HTTPException(status_code=400, detail="L'usuari ja és al grup")

        # Assignar com a admin si és el creador, sinó com a membre normal
        creador_id = grup_existeix[4]  # Asegúrate de que el índice es correcto
        es_admin = usuari_grup.usuari_id == creador_id

        query = "INSERT INTO usuaris_grups (id_usuari, id_grup, es_admin) VALUES (%s, %s, %s)"
        cursor.execute(query, (usuari_grup.usuari_id, usuari_grup.grup_id, es_admin))
        conn.commit()

        return {"success": "Usuari afegit correctament", "es_admin": es_admin}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al afegir usuari al grup: {e}")

    finally:
        cursor.close()
        conn.close()

@app.post("/enviar_missatge")
def enviar_missatge(mensaje: Mensaje):
    try:
        conn = get_db_connection()
        if conn is None:
            raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

        cursor = conn.cursor()

        query = """
            INSERT INTO missatgesamics (emisor, receptor, missatge, data_hora)
            VALUES ((SELECT id FROM usuarisclase WHERE username = %s), %s, %s, %s)
        """
        cursor.execute(query, (mensaje.remitente, mensaje.destinatario, mensaje.mensaje, datetime.now()))

        conn.commit()
        cursor.close()
        conn.close()

        return {"success": "Mensaje enviado correctamente"}

    except Exception as e:
        print(f"❌ Error enviando mensaje: {e}")
        raise HTTPException(status_code=500, detail=f"Error enviando mensaje: {e}")
    
@app.post("/enviar_missatge_grup")
def enviar_missatge_grup(mensaje: MensajeGrup, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        cursor = conn.cursor()

        # Obtener el ID del usuario que envía el mensaje
        cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
        usuari_id = cursor.fetchone()['id']

        # Verificar si el usuario pertenece al grupo
        cursor.execute("SELECT * FROM usuaris_grups WHERE id_usuari = %s AND id_grup = %s", (usuari_id, mensaje.id_grup))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No tens permisos per enviar missatges a aquest grup")

        # Insertar el mensaje en la tabla missatgesgrup
        query = "INSERT INTO missatgesgrup (id_grup, id_usuari, missatge) VALUES (%s, %s, %s)"
        cursor.execute(query, (mensaje.id_grup, usuari_id, mensaje.missatge))
        conn.commit()

        return {"success": "Missatge enviat correctament"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al enviar el missatge: {e}")
    finally:
        cursor.close()
        conn.close()

@app.get("/recibir_missatges_grup")
def recibir_missatges_grup(id_grup: int, last_message_timestamp: Optional[str] = None, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        cursor = conn.cursor()

        # Verificar si el usuario pertenece al grupo
        cursor.execute("SELECT * FROM usuaris_grups WHERE id_usuari = (SELECT id FROM usuarisclase WHERE username = %s) AND id_grup = %s", (username, id_grup))
        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="No tens permisos per veure els missatges d'aquest grup")

        # Obtener los mensajes del grupo que son más recientes que el último mensaje recibido
        query = """
            SELECT mg.id, u.username as emisor, mg.missatge, mg.data_hora 
            FROM missatgesgrup mg
            JOIN usuarisclase u ON mg.id_usuari = u.id
            WHERE mg.id_grup = %s
        """
        params = [id_grup]

        if last_message_timestamp:
            query += " AND mg.data_hora > %s"
            params.append(last_message_timestamp)

        query += " ORDER BY mg.data_hora ASC"

        cursor.execute(query, tuple(params))
        missatges = cursor.fetchall()

        return missatges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al rebre els missatges: {e}")
    finally:
        cursor.close()
        conn.close()

# Endpoint para obtener los miembros de un grupo
@app.get("/grups/{grup_id}/membres")
def obtenir_membres(grup_id: int, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        with conn.cursor() as cursor:
            # Verificar si el usuario está en el grupo
            cursor.execute("""
                SELECT u.username, ug.es_admin, u.id 
                FROM usuaris_grups ug
                JOIN usuarisclase u ON ug.id_usuari = u.id
                WHERE ug.id_grup = %s
            """, (grup_id,))
            membres = cursor.fetchall()

            if not membres:
                raise HTTPException(status_code=404, detail="No s'han trobat membres per aquest grup")

            return membres
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtenir els membres: {e}")
    finally:
        conn.close()

# Endpoint para añadir un usuario a un grupo (solo para administradores)
@app.get("/grups/{grup_id}/usuaris_disponibles")
def obtenir_usuaris_disponibles(grup_id: int, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        with conn.cursor() as cursor:
            # Obtener el ID del usuario logueado
            cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
            usuari_id = cursor.fetchone()['id']

            # Obtener los usuarios que ya están en el grupo
            cursor.execute("""
                SELECT id_usuari 
                FROM usuaris_grups 
                WHERE id_grup = %s
            """, (grup_id,))
            membres_grup = [row['id_usuari'] for row in cursor.fetchall()]

            # Obtener todos los usuarios excepto el logueado y los que ya están en el grupo
            query = """
                SELECT id, username 
                FROM usuarisclase 
                WHERE id != %s AND id NOT IN %s
            """
            cursor.execute(query, (usuari_id, tuple(membres_grup) if membres_grup else (0,)))
            usuaris_disponibles = cursor.fetchall()

            return usuaris_disponibles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtenir els usuaris disponibles: {e}")
    finally:
        conn.close()

@app.post("/grups/{grup_id}/afegir_usuari")
async def afegir_usuari_grup(grup_id: int, request: Request, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        data = await request.json()  # Obtener los datos del cuerpo de la solicitud
        nou_usuari = data.get("username")  # Obtener el nombre de usuario a añadir

        if not nou_usuari:
            raise HTTPException(status_code=400, detail="Falta el nombre de usuario")

        # Verificar que el usuario no esté intentando añadirse a sí mismo
        if nou_usuari == username:
            raise HTTPException(status_code=400, detail="No pots afegir-te a tu mateix")

        with conn.cursor() as cursor:
            # Verificar si el usuario que hace la solicitud es administrador del grupo
            cursor.execute("""
                SELECT es_admin 
                FROM usuaris_grups 
                WHERE id_usuari = (SELECT id FROM usuarisclase WHERE username = %s) 
                AND id_grup = %s
            """, (username, grup_id))
            es_admin = cursor.fetchone()

            if not es_admin or not es_admin['es_admin']:
                raise HTTPException(status_code=403, detail="No tens permisos per afegir usuaris")

            # Obtener el ID del usuario a añadir
            cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (nou_usuari,))
            usuari = cursor.fetchone()
            if not usuari:
                raise HTTPException(status_code=404, detail="L'usuari no existeix")

            usuari_id = usuari['id']

            # Verificar si el usuario ya está en el grupo
            cursor.execute("""
                SELECT * FROM usuaris_grups 
                WHERE id_usuari = %s AND id_grup = %s
            """, (usuari_id, grup_id))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="L'usuari ja és al grup")

            # Añadir el usuario al grupo
            cursor.execute("""
                INSERT INTO usuaris_grups (id_usuari, id_grup, es_admin)
                VALUES (%s, %s, %s)
            """, (usuari_id, grup_id, False))
            conn.commit()

            return {"success": "Usuari afegit correctament"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al afegir usuari: {e}")
    finally:
        conn.close()

# Endpoint para abandonar un grupo
@app.post("/grups/{grup_id}/abandonar")
def abandonar_grup(grup_id: int, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        with conn.cursor() as cursor:
            # Obtener el ID del usuario
            cursor.execute("SELECT id FROM usuarisclase WHERE username = %s", (username,))
            usuari_id = cursor.fetchone()['id']

            # Eliminar al usuario del grupo
            cursor.execute("""
                DELETE FROM usuaris_grups 
                WHERE id_usuari = %s AND id_grup = %s
            """, (usuari_id, grup_id))
            conn.commit()

            return {"success": "Has abandonat el grup correctament"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al abandonar el grup: {e}")
    finally:
        conn.close()

@app.post("/grups/{grup_id}/fer_admin")
async def fer_admin(grup_id: int, request: Request, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        data = await request.json()
        usuari_id = data.get("usuari_id")

        if not usuari_id:
            raise HTTPException(status_code=400, detail="Falta l'ID de l'usuari")

        with conn.cursor() as cursor:
            # Verificar si el usuario que hace la solicitud es administrador del grupo
            cursor.execute("""
                SELECT es_admin 
                FROM usuaris_grups 
                WHERE id_usuari = (SELECT id FROM usuarisclase WHERE username = %s) 
                AND id_grup = %s
            """, (username, grup_id))
            es_admin = cursor.fetchone()

            if not es_admin or not es_admin['es_admin']:
                raise HTTPException(status_code=403, detail="No tens permisos per fer admin a un usuari")

            # Actualizar el usuario a admin
            cursor.execute("""
                UPDATE usuaris_grups 
                SET es_admin = TRUE 
                WHERE id_usuari = %s AND id_grup = %s
            """, (usuari_id, grup_id))
            conn.commit()

            return {"success": "L'usuari ara és admin del grup"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al fer admin a l'usuari: {e}")
    finally:
        conn.close()

@app.get("/imagenes")
def listar_imagenes():
    try:
        imagenes_dir = os.path.join(os.getcwd(), 'imagenes')
        imagenes = [f for f in os.listdir(imagenes_dir) if os.path.isfile(os.path.join(imagenes_dir, f))]
        return imagenes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar las imágenes: {e}")
    
@app.post("/grups/{grup_id}/fer_admin")
async def fer_admin(grup_id: int, request: Request, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        data = await request.json()  # Parsear el cuerpo de la solicitud
        usuari_id = data.get("usuari_id")  # Obtener el usuari_id del cuerpo de la solicitud

        if not usuari_id:
            raise HTTPException(status_code=400, detail="Falta l'ID de l'usuari")

        if usuari_id == 0:
            raise HTTPException(status_code=400, detail="ID de usuari no válido")  # Validación del id = 0

        with conn.cursor() as cursor:
            # Verificar si el usuario que hace la solicitud es administrador del grupo
            cursor.execute(""" 
                SELECT es_admin 
                FROM usuaris_grups 
                WHERE id_usuari = (SELECT id FROM usuarisclase WHERE username = %s) 
                AND id_grup = %s
            """, (username, grup_id))
            es_admin = cursor.fetchone()

            if not es_admin or not es_admin['es_admin']:
                raise HTTPException(status_code=403, detail="No tens permisos per fer admin a un usuari")

            # Actualizar el usuario a admin
            cursor.execute("""
                UPDATE usuaris_grups 
                SET es_admin = TRUE 
                WHERE id_usuari = %s AND id_grup = %s
            """, (usuari_id, grup_id))
            conn.commit()

            return {"success": "L'usuari ara és admin del grup"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al fer admin a l'usuari: {e}")
    finally:
        conn.close()

@app.post("/grups/{grup_id}/quitar_admin")
async def quitar_admin(grup_id: int, request: Request, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        data = await request.json()
        usuari_id = data.get("usuari_id")

        if not usuari_id:
            raise HTTPException(status_code=400, detail="Falta l'ID de l'usuari")

        with conn.cursor() as cursor:
            # Verificar si el usuario que hace la solicitud es administrador del grupo
            cursor.execute("""
                SELECT es_admin 
                FROM usuaris_grups 
                WHERE id_usuari = (SELECT id FROM usuarisclase WHERE username = %s) 
                AND id_grup = %s
            """, (username, grup_id))
            es_admin = cursor.fetchone()

            if not es_admin or not es_admin['es_admin']:
                raise HTTPException(status_code=403, detail="No tens permisos per quitar admin a un usuari")

            # Quitar el rol de admin
            cursor.execute("""
                UPDATE usuaris_grups 
                SET es_admin = FALSE 
                WHERE id_usuari = %s AND id_grup = %s
            """, (usuari_id, grup_id))
            conn.commit()

            return {"success": "L'usuari ja no és admin del grup"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al quitar admin a l'usuari: {e}")
    finally:
        conn.close()

@app.post("/grups/{grup_id}/eliminar_usuario")
async def eliminar_usuario(grup_id: int, request: Request, username: str = Depends(get_current_user)):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")

    try:
        data = await request.json()
        usuari_id = data.get("usuari_id")

        if not usuari_id:
            raise HTTPException(status_code=400, detail="Falta l'ID de l'usuari")

        with conn.cursor() as cursor:
            # Verificar si el usuario que hace la solicitud es administrador del grupo
            cursor.execute("""
                SELECT es_admin 
                FROM usuaris_grups 
                WHERE id_usuari = (SELECT id FROM usuarisclase WHERE username = %s) 
                AND id_grup = %s
            """, (username, grup_id))
            es_admin = cursor.fetchone()

            if not es_admin or not es_admin['es_admin']:
                raise HTTPException(status_code=403, detail="No tens permisos per eliminar usuaris")

            # Eliminar al usuario del grupo
            cursor.execute("""
                DELETE FROM usuaris_grups 
                WHERE id_usuari = %s AND id_grup = %s
            """, (usuari_id, grup_id))
            conn.commit()

            return {"success": "L'usuari ha sigut eliminat del grup"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar l'usuari: {e}")
    finally:
        conn.close()