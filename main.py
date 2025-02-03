
from fastapi import FastAPI, HTTPException, Depends, status, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from database import get_db_connection
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from fastapi.responses import RedirectResponse
import pymysql
import base64
from hashlib import scrypt
import psutil
import psycopg2
from passlib.hash import pbkdf2_sha256
from fastapi_login import LoginManager
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()
SECRET_KEY = "mi_clave_secreta"
ALGORITHM = "HS256"
# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Mensaje(BaseModel):
    remitente: str
    destinatario: str
    mensaje: str

class Grup(BaseModel):
    nom: str
    descripcio: str = None
    usuari_id: int


class UsuariGrup(BaseModel):
    usuari_id: int  # El usuario que lo añade
    grup_id: int  # El grupo al que se añade
    usuari_afegeix_id: int  # Usuario que hace la acción (quién lo añade)


class UserLogin(BaseModel):
    usuari: str
    pwd: str  

class User:
    def __init__(self, username=None):
        self.username = username

    def fromUsername(self, username):
        self.username = username

    def getId(self):
        pass  # Implementa esto si es necesario

    def comprovaUsuari(self, pwd):
        db = pymysql.connect(host='localhost',
                             user='root',
                             db='whatsapp2425',
                             charset='utf8mb4',
                             autocommit=True,
                             cursorclass=pymysql.cursors.DictCursor)
        cursor = db.cursor()
        sql = "SELECT password FROM usuarisclase WHERE username = %s"
        cursor.execute(sql, (self.username,))
        ResQuery = cursor.fetchone()

        resposta = False
        if ResQuery:
            resposta=check_password_hash(ResQuery['password'],pwd)            

        db.close()
        return resposta

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post('/login')
async def login(data: UserLogin):
    user = User()
    user.fromUsername(data.usuari)

    if user.comprovaUsuari(data.pwd):
        access_token = create_access_token(data={"username": user.username})
        return {"message": "Login correcto", "access_token": access_token}
    else:
        return {"message": "Login incorrecto"}

def get_current_user(authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    token = authorization.split(" ")[1]  # Asumiendo que el token está en el formato 'Bearer <token>'
    
    try:
        # Decodificar el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("username")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@app.get("/llistaamics", response_model=List[dict])
def llista_amics(authorization: str = Depends(get_current_user)):  # Obtenemos el username del token JWT
    username = authorization  # El username viene del JWT
    
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()

        # Imprimir el username para verificar que se pasa correctamente
        print(f"Username recibido: {username}")
        
        # Obtener la lista de usuarios, excluyendo al usuario autenticado
        cursor.execute("SELECT id, username FROM usuarisclase WHERE username != %s", (username,))
        amics = cursor.fetchall()
        
        # Verificar si la consulta ha devuelto resultados
        if not amics:
            print("No se encontraron usuarios.")
        
        amics_dict = [{"type": "user", "id": amic[0], "username": amic[1]} for amic in amics]
        
        # Obtener la lista de grupos
        cursor.execute("SELECT id, nom FROM grups")
        grups = cursor.fetchall()
        grups_dict = [{"type": "group", "id": grup[0], "nom": grup[1]} for grup in grups]
        
        # Combinar usuarios y grupos
        resultat = amics_dict + grups_dict

        cursor.close()
        conn.close()
        
        return resultat
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=f"Error al obtenir la llista: {e}")

@app.post("/enviar_missatge")
def enviar_missatge(missatge: Mensaje):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO missatgesamics (emisor, receptor, missatge) 
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (missatge.emisor, missatge.receptor, missatge.missatge))
        conn.commit()
        cursor.close()
        conn.close()
        return {"success": "Missatge enviat correctament"}
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al enviar el missatge: {e}")


@app.get("/recibir_missatges")
def recibir_missatges(receptor: int):
    
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        query = """
            SELECT id, emisor, missatge, data_hora 
            FROM missatgesamics 
            WHERE receptor = %s
            ORDER BY data_hora DESC
        """
        cursor.execute(query, (receptor,))
        missatges = cursor.fetchall()
        cursor.close()
        conn.close()

        # Convertimos los resultados a una lista de diccionarios
        resultats = [
            {
                "id": missatge[0],
                "emisor": missatge[1],
                "missatge": missatge[2],
                "data_hora": missatge[3].strftime("%Y-%m-%d %H:%M:%S")
            }
            for missatge in missatges
        ]

        return resultats
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al rebre els missatges: {e}")
    
@app.post("/crear_grup")
def crear_grup(grup: Grup):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="No es pot connectar a la base de dades")
    
    try:
        cursor = conn.cursor()
        # Insertar el grupo en la tabla `grups`
        query = "INSERT INTO grups (nom, descripcio, creador_id) VALUES (%s, %s, %s)"
        cursor.execute(query, (grup.nom, grup.descripcio, grup.usuari_id))  # Usamos grup.usuari_id
        
        grup_id = cursor.lastrowid
        
        # Asignar el usuario como administrador del grupo
        query = "INSERT INTO usuaris_grups (id_usuari, id_grup, es_admin) VALUES (%s, %s, %s)"
        cursor.execute(query, (grup.usuari_id, grup_id, True))  # Usamos grup.usuari_id
        
        # Verificar si el usuario es admin en el grupo
        query = "SELECT es_admin FROM usuaris_grups WHERE id_usuari = %s AND id_grup = %s"
        cursor.execute(query, (grup.usuari_id, grup_id))
        result = cursor.fetchone()
        
        # Verificar si el usuario es administrador
        if result and result[0]:
            is_admin = True
        else:
            is_admin = False

        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": "Grup creat correctament", "grup_id": grup_id, "es_admin": is_admin}
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
    
@app.post("/check")
def check_missatge(id_missatge: int, estat: str):
    """
    Endpoint per actualitzar l'estat d'un missatge.
    Estat pot ser:
    - 'enviat': un check gris
    - 'rebut': dos checks grisos
    - 'llegit': dos checks blaus
    """
    if estat not in ["enviat", "rebut", "llegit"]:
        raise HTTPException(
            status_code=400, detail="Estat no vàlid. Usa 'enviat', 'rebut' o 'llegit'."
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
    

    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al afegir usuari al grup: {e}")

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

        # Comprobar si l'usuari ja està en el grup
        query = "SELECT * FROM usuaris_grups WHERE id_usuari = %s AND id_grup = %s"
        cursor.execute(query, (usuari_grup.usuari_id, usuari_grup.grup_id))
        ja_existeix = cursor.fetchone()

        if ja_existeix:
            raise HTTPException(status_code=400, detail="L'usuari ja és al grup")

        # Assignar com a admin si és el creador, sinó com a membre normal
        creador_id = grup_existeix[4]  # Asegúrate de que el índice es correcto
        es_admin = usuari_grup.usuari_id == creador_id

        # Insertar el nuevo registro de usuario en el grupo
        query = "INSERT INTO usuaris_grups (id_usuari, id_grup, es_admin, usuari_afegeix_id) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (usuari_grup.usuari_id, usuari_grup.grup_id, es_admin, usuari_grup.usuari_afegeix_id))
        conn.commit()

        return {"success": "Usuari afegit correctament", "es_admin": es_admin}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al afegir usuari al grup: {e}")

    finally:
        cursor.close()
        conn.close()
