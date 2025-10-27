import {beforeEach, describe, expect, test} from "@jest/globals";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QA_AUTO_API_URL} from "../src/constants/api.js";
import AuthController from "../src/controllers/AuthController.js";
import CarsController from "../src/controllers/CarsController.js";

describe.only("Get models", () => {
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
    },30_000)
    test("Should get all models wih valid structure", async () => {
        const response = await carsController.getModels();
        expect(response.status).toBe(200);
        expect(response.data.status).toBe("ok");
        expect(Array.isArray(response.data.data)).toBe(true);

        const models = response.data.data;
        expect(models.length).toBeGreaterThan(0);

        for (const model of models) {
            expect(model).toEqual({
                id: expect.any(Number),
                carBrandId: expect.any(Number),
                title: expect.any(String),
            });
        }

    })
})