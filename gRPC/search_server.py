from concurrent import futures
import time

import grpc
import search_pb2
import search_pb2_grpc
import psycopg2

class SearchCarsServicer(search_pb2_grpc.SearchCarsServicer):
    def GetCar(self, request, context):
        print("Buscando el auto con la siguiente ID: ")
        print(request)
        if(request >= 1 and request <= 9):
            id_result = "C_CND_00000" + str(request)
        elif(request >= 10 and request <= 99):
            id_result = "C_CND_0000" + str(request)
        elif(request >= 100 and request <= 999):
            id_result = "C_CND_000" + str(request)
        elif(request >= 1000 and request <= 9999):
            id_result = "C_CND_00" + str(request)
        elif(request >= 10000 and request <= 23906):
            id_result = "C_CND_0" + str(request)
        cur.execute('''SELECT Car_id , Company, FROM details WHERE Car_id=%s''', id_result)
        car_reply = cur.fetchone()

        return car_reply

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    search_pb2_grpc.add_SearchCarsServicer_to_server(SearchCarsServicer(), server)
    server.add_insecure_port("localhost:50051")
    server.wait_for_termination()

if __name__ == "__main__":
    conn = psycopg2.connect(database="details",user="postgres",password="123456",host="localhost")
    cur = conn.cursor()

    sql = '''CREATE TABLE details (Car_id int NOT NULL,\
    Company char(20));'''

    cur.execute(sql)

    sql2 = '''COPY details (Car_id,Company)
    FROM 'CarSales.csv'
    DELIMITER ','
    CSV HEADER;'''

    cur.execute(sql2)

    sql3 = '''select * from details;'''
    cur.execute(sql3)
    conn.commit()
        
    serve()