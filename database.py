import pymysql

host = 'localhost'
user = 'root'
database = 'wahap'

def get_db_connection():
    try:
        connection = pymysql.connect(
            host=host,
            user=user,
            database=database
        )
        return connection
    except pymysql.MySQLError as e:
        print("Error de connexió amb la base de dades:", e)
        return None
    
