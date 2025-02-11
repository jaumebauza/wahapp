import pymysql

host = 'localhost'
user = 'root'
password = ''
database = 'whatsapp2425'

def get_db_connection():
    try:
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        return connection
    except pymysql.MySQLError as e:
        print("Error de connexió amb la base de dades:", e)
        return None
    
