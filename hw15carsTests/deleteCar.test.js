import {test, describe, beforeEach, expect} from "@jest/globals";
import { faker } from '@faker-js/faker';
import AuthController from "../src/controllers/AuthController.js";
import CarsController from "../src/controllers/CarsController.js";
import {QA_AUTO_API_URL} from "../src/constants/api.js";
import {CookieJar} from "tough-cookie";
import axios from "axios";
import {wrapper} from "axios-cookiejar-support";
import randomUserData from "../src/functions/randomUserData.js";

describe("Delete a Car", () => {
    const jar = new CookieJar();
    const client = wrapper(axios.create({
        baseURL: QA_AUTO_API_URL,
        validateStatus: () => true,
        jar
    }))

    const authController = new AuthController(client)
    const carsController = new CarsController(client)


    //console.log(userData);

    beforeEach(async () => {
        const userData = randomUserData();
        const signUpResponse = await authController.signUp(userData);
        expect(signUpResponse.status).toBe(201);
        //console.log(signUpResponse.error);

        const signInResponse = await authController.signIn( {
            email: userData.email,
            password: userData.password,
            remember: false
        });
        expect(signInResponse.status).toBe(200);
    }, 30_000)

    test("Should delete a new car", async () => {


        const carsBrandsResponse = await carsController.getBrands();
        const brand = carsBrandsResponse.data.data[0];

        const carsModelsResponse = await carsController.getModels();
        const model = carsModelsResponse.data.data.find(model => model.carBrandId === brand.id);

        const requestBody = {
            carBrandId: brand.id,
            carModelId: model.id,
            mileage: faker.number.int({min: 0, max: 300_000})
        }

        //const beforeCarCreatedTime = new Date();
        //console.log(beforeCarCreatedTime);

        const response = await carsController.createCar(requestBody);
        expect(response.status).toBe(201);
        expect(response.data.status).toBe("ok");

        const createdCar = response.data.data;
        const expectedData = {
            "id": expect.any(Number),
            "carBrandId": requestBody.carBrandId,
            "carModelId": requestBody.carModelId,
            "initialMileage": requestBody.mileage,
            "carCreatedAt": expect.any(String),
            "updatedMileageAt": expect.any(String), //"2021-05-17T15:26:36.000Z",
            "mileage": requestBody.mileage,
            "brand": brand.title,
            "model": model.title,
            "logo": brand.logoFilename
        }
        expect(createdCar).toEqual(expectedData);

        const carByIdResponse = await carsController.getCarById(createdCar.id);
        expect(carByIdResponse.status).toBe(200);
        expect(carByIdResponse.data.data).toEqual(expectedData);


        //deletion of car
        const deleteCarByIdResponse = await carsController.deleteCarById(createdCar.id);
        expect(deleteCarByIdResponse.status).toBe(200);

        //check if car was deleted
        const checkDeletedCar = await carsController.getCarById(createdCar.id);
        expect(checkDeletedCar.status).toBe(404);

    }, 15_000)

    test("Try to delete a Car that was deleted", async () => {

        const carsBrandsResponse = await carsController.getBrands();
        const brand = carsBrandsResponse.data.data[0];

        const carsModelsResponse = await carsController.getModels();
        const model = carsModelsResponse.data.data.find(model => model.carBrandId === brand.id);

        const requestBody = {
            carBrandId: brand.id,
            carModelId: model.id,
            mileage: faker.number.int({min: 0, max: 300_000})
        }

        //const beforeCarCreatedTime = new Date();
        //console.log(beforeCarCreatedTime);

        const response = await carsController.createCar(requestBody);
        expect(response.status).toBe(201);
        expect(response.data.status).toBe("ok");

        const createdCar = response.data.data;
        const expectedData = {
            "id": expect.any(Number),
            "carBrandId": requestBody.carBrandId,
            "carModelId": requestBody.carModelId,
            "initialMileage": requestBody.mileage,
            "carCreatedAt": expect.any(String),
            "updatedMileageAt": expect.any(String), //"2021-05-17T15:26:36.000Z",
            "mileage": requestBody.mileage,
            "brand": brand.title,
            "model": model.title,
            "logo": brand.logoFilename
        }
        expect(createdCar).toEqual(expectedData);

        const carByIdResponse = await carsController.getCarById(createdCar.id);
        expect(carByIdResponse.status).toBe(200);
        expect(carByIdResponse.data.data).toEqual(expectedData);


        //deletion of car
        const deleteCarByIdResponse = await carsController.deleteCarById(createdCar.id);
        expect(deleteCarByIdResponse.status).toBe(200);

        //check if car was deleted
        const checkDeletedCar = await carsController.getCarById(createdCar.id);
        expect(checkDeletedCar.status).toBe(404);

        //deletion of deleted car
        const deletedCarByIdResponse = await carsController.deleteCarById(createdCar.id);
        expect(deletedCarByIdResponse.status).toBe(404);
    }, 15_000)

})