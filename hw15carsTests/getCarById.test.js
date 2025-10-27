import {beforeEach, describe, expect, test} from "@jest/globals";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QA_AUTO_API_URL} from "../src/constants/api.js";
import AuthController from "../src/controllers/AuthController.js";
import CarsController from "../src/controllers/CarsController.js";
import {faker, ne} from "@faker-js/faker";



describe("Get car by ID", () => {
    const jar = new CookieJar();
    const client = wrapper(axios.create({
        baseURL: QA_AUTO_API_URL,
        validateStatus: () => true,
        jar
    }))

    const authController = new AuthController(client)
    const carsController = new CarsController(client)


    //console.log(userData);

    const expectedDataOfCar = {
        "id": expect.any(Number),
        "carBrandId": expect.any(Number),
        "carModelId": expect.any(Number),
        "initialMileage": expect.any(Number),
        "carCreatedAt": expect.any(String),
        "updatedMileageAt": expect.any(String), //"2021-05-17T15:26:36.000Z",
        "mileage": expect.any(Number),
        "brand": expect.any(String),
        "model": expect.any(String),
        "logo": expect.any(String),
    }

    beforeEach(async () => {
        const userData = authController.randomUserData()
        const signUpResponse = await authController.signUp(userData);
        expect(signUpResponse.status).toBe(201);

        const signInResponse = await authController.signIn( {
            email: userData.email,
            password: userData.password,
            remember: false
        });
        expect(signInResponse.status).toBe(200);
    }, 15_000)

    test("Should get car by Id from created car", async () => {
        const carsBrandsResponse = await carsController.getBrands();
        const brand = carsBrandsResponse.data.data[0];

        const carsModelsResponse = await carsController.getModels();
        const model = carsModelsResponse.data.data.find(model => model.carBrandId === brand.id);

        const requestBody = {
            carBrandId: brand.id,
            carModelId: model.id,
            mileage: faker.number.int({min: 0, max: 300_000})
        }

        const newCar = await carsController.createCar(requestBody);
        expect(newCar.status).toBe(201);

        const response = await carsController.getCarById(newCar.data.data.id);
        expect(response.status).toBe(200);

        expect(response.data.data).toEqual(expectedDataOfCar);


        //deletion of car
        const deleteCarByIdResponse = await carsController.deleteCarById(newCar.data.data.id);
        expect(deleteCarByIdResponse.status).toBe(200);

        //check if car was deleted
        const checkDeletedCar = await carsController.getCarById(newCar.data.data.id);
        expect(checkDeletedCar.status).toBe(404);
    }, 15_000)

    // test("Should get car by Id from list", async () => {
    //
    //     const carList = await carsController.getCars();
    //     expect(carList.status).toBe(200);
    //     expect(carList.data.status).toBe("ok");
    //
    //     const randomCar = await carsController.getCarById(faker.number.int({min: 1, max: carList.length}));
    //     expect(randomCar.status).toBe(200);
    //     expect(carList.data.status).toBe("ok");
    //
    //     const randomCarData = randomCar.data.data;
    //
    //
    //     expect(randomCarData).toEqual(expectedDataOfCar);
    //
    // }, 15_000)

})

