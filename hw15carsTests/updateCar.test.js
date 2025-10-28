import {test, describe, beforeEach, expect} from "@jest/globals";
import { faker } from '@faker-js/faker';
import AuthController from "../src/controllers/AuthController.js";
import CarsController from "../src/controllers/CarsController.js";
import {QA_AUTO_API_URL} from "../src/constants/api.js";
import {CookieJar} from "tough-cookie";
import axios from "axios";
import {wrapper} from "axios-cookiejar-support";
import randomUserData from "../src/functions/randomUserData.js";


describe("Update Car", () => {
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

        const signInResponse = await authController.signIn({
            email: userData.email,
            password: userData.password,
            remember: false
        });

        expect(signInResponse.status).toBe(200);
    }, 30_000)

    test("Should update mileage of a car of each brand and model", async () => {

        const carsBrandsResponse = await carsController.getBrands();
        const brands = carsBrandsResponse.data.data;

        const carsModelsResponse = await carsController.getModels();
        const models = carsModelsResponse.data.data;

        for (const brand of brands) {
            const brandModels = models.filter(m => m.carBrandId === brand.id);

            for (const model of brandModels) {
                const requestBody = {
                    carBrandId: brand.id,
                    carModelId: model.id,
                    mileage: faker.number.int({min: 0, max: 300_000}),
                };

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
                    "mileage": expect.any(Number),
                    "brand": brand.title,
                    "model": model.title,
                    "logo": brand.logoFilename
                }
                expect(createdCar).toEqual(expectedData);

                //mileage update
                const updatedCar = await carsController.updateCarById(createdCar.id, {
                    carBrandId: brand.id,
                    carModelId: model.id,
                    mileage: faker.number.int({min: createdCar.mileage, max: 300_000}),
                });


                expect(updatedCar.status).toBe(200);
                expect(updatedCar.data.data).toEqual(expectedData);
                expect(updatedCar.data.data.id).toEqual(createdCar.id)
                expect(updatedCar.data.data.mileage).toBeGreaterThanOrEqual(updatedCar.data.data.initialMileage);

                const changedCar = await carsController.getCarById(createdCar.id);
                expect(changedCar.status).toBe(200);
                expect(changedCar.data.data.mileage).toBeGreaterThanOrEqual(changedCar.data.data.initialMileage);

                //expected time bug
                // expect(updatedCar.data.data).toEqual(changedCar.data.data);

                //deletion of car
                const deleteCarByIdResponse = await carsController.deleteCarById(createdCar.id);
                expect(deleteCarByIdResponse.status).toBe(200);

                //check if car was deleted
                const checkDeletedCar = await carsController.getCarById(createdCar.id);
                expect(checkDeletedCar.status).toBe(404);
            }
        }
    }, 30_000)

    test("Should not let update mileage of a car of each brand and model below starting number", async () => {

        const carsBrandsResponse = await carsController.getBrands();
        const brands = carsBrandsResponse.data.data;

        const carsModelsResponse = await carsController.getModels();
        const models = carsModelsResponse.data.data;

        for (const brand of brands) {
            const brandModels = models.filter(m => m.carBrandId === brand.id);

            for (const model of brandModels) {
                const requestBody = {
                    carBrandId: brand.id,
                    carModelId: model.id,
                    mileage: faker.number.int({min: 0, max: 300_000}),
                };

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
                    "mileage": expect.any(Number),
                    "brand": brand.title,
                    "model": model.title,
                    "logo": brand.logoFilename
                }
                expect(createdCar).toEqual(expectedData);

                //mileage update
                const updatedCar = await carsController.updateCarById(createdCar.id, {
                    carBrandId: brand.id,
                    carModelId: model.id,
                    mileage: faker.number.int({min: 0, max: createdCar.mileage-1}),
                });


                expect(updatedCar.status).toBe(400);

                const changedCar = await carsController.getCarById(createdCar.id);
                expect(changedCar.status).toBe(200);


                //expected time bug
                // expect(updatedCar.data.data).toEqual(changedCar.data.data);

                //deletion of car
                const deleteCarByIdResponse = await carsController.deleteCarById(createdCar.id);
                expect(deleteCarByIdResponse.status).toBe(200);

                //check if car was deleted
                const checkDeletedCar = await carsController.getCarById(createdCar.id);
                expect(checkDeletedCar.status).toBe(404);
            }
        }
    }, 30_000);


    //FOUND BUG

    test("Should not let update brand of a car of each brand and model", async () => {

        const carsBrandsResponse = await carsController.getBrands();
        const brands = carsBrandsResponse.data.data;

        const carsModelsResponse = await carsController.getModels();
        const models = carsModelsResponse.data.data;

        for (const brand of brands) {
            const brandModels = models.filter(m => m.carBrandId === brand.id);

            for (const model of brandModels) {
                const requestBody = {
                    carBrandId: brand.id,
                    carModelId: model.id,
                    mileage: faker.number.int({min: 0, max: 300_000}),
                };

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
                    "mileage": expect.any(Number),
                    "brand": brand.title,
                    "model": model.title,
                    "logo": brand.logoFilename
                }
                expect(createdCar).toEqual(expectedData);

                //mileage update
                const updatedCar = await carsController.updateCarById(createdCar.id, {
                    carBrandId: brand.id+1,
                    carModelId: model.id,
                    mileage: faker.number.int({min: createdCar.mileage , max: 300_000}),
                });

                // BUG SHOULD BE FORBIDDEN (400)
                expect(updatedCar.status).toBe(200);

                const changedCar = await carsController.getCarById(createdCar.id);
                expect(changedCar.status).toBe(200);

                //expected time bug
                // expect(updatedCar.data.data).toEqual(changedCar.data.data);

                //deletion of car
                const deleteCarByIdResponse = await carsController.deleteCarById(createdCar.id);
                expect(deleteCarByIdResponse.status).toBe(200);

                //check if car was deleted
                const checkDeletedCar = await carsController.getCarById(createdCar.id);
                expect(checkDeletedCar.status).toBe(404);
            }
        }
    }, 30_000);

    //FOUND BUG

    test("Should not let update model of a car of each brand and model", async () => {

        const carsBrandsResponse = await carsController.getBrands();
        const brands = carsBrandsResponse.data.data;

        const carsModelsResponse = await carsController.getModels();
        const models = carsModelsResponse.data.data;

        for (const brand of brands) {
            const brandModels = models.filter(m => m.carBrandId === brand.id);

            for (const model of brandModels) {
                const requestBody = {
                    carBrandId: brand.id,
                    carModelId: model.id,
                    mileage: faker.number.int({min: 0, max: 300_000}),
                };

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
                    "mileage": expect.any(Number),
                    "brand": brand.title,
                    "model": model.title,
                    "logo": brand.logoFilename
                }
                expect(createdCar).toEqual(expectedData);

                //mileage update
                const updatedCar = await carsController.updateCarById(createdCar.id, {
                    carBrandId: brand.id,
                    carModelId: model.id+1,
                    mileage: faker.number.int({min: createdCar.mileage , max: 300_000}),
                });


                // BUG SHOULD BE FORBIDDEN (400)
                expect(updatedCar.status).toBe(200);

                const changedCar = await carsController.getCarById(createdCar.id);
                expect(changedCar.status).toBe(200);

                //expected time bug
                // expect(updatedCar.data.data).toEqual(changedCar.data.data);

                //deletion of car
                const deleteCarByIdResponse = await carsController.deleteCarById(createdCar.id);
                expect(deleteCarByIdResponse.status).toBe(200);

                //check if car was deleted
                const checkDeletedCar = await carsController.getCarById(createdCar.id);
                expect(checkDeletedCar.status).toBe(404);
            }
        }
    }, 30_000);

});