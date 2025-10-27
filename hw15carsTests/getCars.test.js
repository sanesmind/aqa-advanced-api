import {beforeEach, describe, expect, test, afterEach} from "@jest/globals";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QA_AUTO_API_URL} from "../src/constants/api.js";
import AuthController from "../src/controllers/AuthController.js";
import CarsController from "../src/controllers/CarsController.js";
import {faker} from "@faker-js/faker";
import moment from "moment/moment.js";

describe("Get Cars", () => {
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
        const userData = authController.randomUserData();
        const signUpResponse = await authController.signUp(userData);
        expect(signUpResponse.status).toBe(201);

        const signInResponse = await authController.signIn({
            email: userData.email,
            password: userData.password,
            remember: false
        });

        expect(signInResponse.status).toBe(200);
    }, 30_000)

    test("Should get list of cars each brand and model", async () => {


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

                const beforeCarCreatedTime = new Date();
                //console.log(beforeCarCreatedTime);

                const createdCar = await carsController.createCar(requestBody);
                expect(createdCar.status).toBe(201);
                expect(createdCar.data.status).toBe("ok");

                const response = await carsController.getCars();
                expect(response.status).toBe(200);
                expect(response.data.status).toBe("ok");

                const carsList = response.data.data;
                expect(carsList.length).toBeGreaterThan(0);
                for (const car of carsList) {
                    expect(car).toEqual({
                        id: expect.any(Number),
                        carBrandId: expect.any(Number),
                        carModelId: expect.any(Number),
                        initialMileage: expect.any(Number),
                        updatedMileageAt: expect.any(String),
                        carCreatedAt: expect.any(String),
                        mileage: expect.any(Number),
                        brand: expect.any(String),
                        model: expect.any(String),
                        logo: expect.any(String),
                    });

                    expect(car.mileage).toBeGreaterThanOrEqual(car.initialMileage);


                }
            }
        }
        const allCars = await carsController.getCars();
        const cars = allCars.data.data;
        for (const car of cars) {
            const deleteCarByIdResponse = await carsController.deleteCarById(car.id);
            expect(deleteCarByIdResponse.status).toBe(200);
        }
    }, 30_000)


})