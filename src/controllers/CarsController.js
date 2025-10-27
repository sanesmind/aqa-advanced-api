import BaseController from "./BaseController.js";
import {th} from "@faker-js/faker";


export default class CarsController extends BaseController {
    getBrands(){
        return this.client.get("/api/cars/brands");
    }

    getBrandById(id){
        return this.client.get(`/api/cars/brands/${id}`);
    }

    getModels(){
        return this.client.get("/api/cars/models");
    }

    getModelById(id){
        return this.client.get(`/api/cars/models/${id}`);
    }

    getCars(){
        return this.client.get("/api/cars");
    }

    createCar(carData){
        return this.client.post("/api/cars", carData);
    }

    getCarById(id){
        return this.client.get(`/api/cars/${id}`);
    }

    updateCarById(id, carData){
        return this.client.put(`/api/cars/${id}`, carData);
    }

    deleteCarById(id){
        return this.client.delete(`/api/cars/${id}`);
    }


}