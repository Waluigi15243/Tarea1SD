import search_pb2
import search_pb2_grpc
import time
import grpc

def run():
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = search_pb2_grpc.SearchCarsStub(channel)
        temp = input("Select a number from 1 to 23906: ")
        rpc_call = int(temp)
        
        if rpc_call >= 1 and rpc_call <= 23906:
            car_request = search_pb2.GetCarRequest(rpc_call)
            car_reply = stub.GetCar(car_request)
            print(car_reply)
        elif rpc_call < 1 or rpc_call > 23906:
            print("Número fuera de rango")


if __name__ == "__init__":
    run()