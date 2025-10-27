import {beforeEach, describe, expect, test} from "@jest/globals";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QA_AUTO_API_URL} from "../src/constants/api.js";
import AuthController from "../src/controllers/AuthController.js";
import CarsController from "../src/controllers/CarsController.js";
import { faker } from '@faker-js/faker';

describe.only("Get model", () => {
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

    test("Should get single model with valid structure", async () => {
        const allModelsResponse = await carsController.getModels();
        const randomModelId = faker.number.int({min: 1, max: allModelsResponse.data.data.length});

        const response = await carsController.getModelById(randomModelId);
        expect(response.status).toBe(200);
        expect(response.data.status).toBe("ok");

        const model = response.data.data;
        expect(typeof model).toBe("object");

        expect(model).toEqual({
            id: randomModelId,
            title: expect.any(String),
            carBrandId: expect.any(Number),
        });

    }, 15_000)

    test("Should return error for invalid ID", async () => {
        const fakeId = 999999999999;
        const response = await carsController.getModelById(fakeId);
        expect(response.status).toBe(404);
        expect(response.data.status).toBe("error");
    }, 15_000)
}, 30_000)