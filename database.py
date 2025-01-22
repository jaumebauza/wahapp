import pymysql

host = 'localhost'
user = 'pere'
password = 'pere'
database = 'whatsapp2425'

try:
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )
    print("Connexió exitosa amb la base de dades.")
    
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        for table in cursor.fetchall():
            print(table)

except pymysql.MySQLError as e:
    print("Error de connexió amb la base de dades:", e)

finally:
    if 'connection' in locals() and connection.open:
        connection.close()
        print("Connexió tancada.")