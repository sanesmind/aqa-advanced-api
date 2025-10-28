import {beforeEach, describe, expect, test} from "@jest/globals";
import {CookieJar} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import axios from "axios";
import {QA_AUTO_API_URL} from "../src/constants/api.js";
import AuthController from "../src/controllers/AuthController.js";
import CarsController from "../src/controllers/CarsController.js";
import { faker } from '@faker-js/faker';
import randomUserData from "../src/functions/randomUserData.js";

describe.only("Get brand", () => {
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
        }, 30_000);

        expect(signInResponse.status).toBe(200);
    },30_000)

    test("Should get single brand with valid structure", async () => {
        const allBrandsResponse = await carsController.getBrands();
        const randomBrandId = faker.number.int({min: 1, max: allBrandsResponse.data.data.length});

        const response = await carsController.getBrandById(randomBrandId);
        expect(response.status).toBe(200);
        expect(response.data.status).toBe("ok");

        const brand = response.data.data;
        expect(typeof brand).toBe("object");

        expect(brand).toEqual({
            id: randomBrandId,
            title: expect.any(String),
            logoFilename: expect.any(String),
        });

    }, 30_000)

    test("Should return error for invalid ID", async () => {
        const fakeId = 999999999999;
        const response = await carsController.getBrandById(fakeId);
        expect(response.status).toBe(404);
        expect(response.data.status).toBe("error");
    }, 30_000)
})