import pymysql

host = '192.168.193.133'
user = 'pereserra'
password = '20550359C'
database = 'wahap'

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
    
