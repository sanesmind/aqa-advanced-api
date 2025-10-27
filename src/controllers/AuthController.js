import BaseController from "./BaseController.js";
import {faker} from "@faker-js/faker";


export default class AuthController extends BaseController {

    signUp(userData) {
        return this.client.post("/api/auth/signup", userData);
    }

    signIn(credentials) {
        return this.client.post("/api/auth/signin", credentials);
    }

    randomUserData() {
        const passNums = faker.number.int({min: 200, max: 900})
        return {
            name: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: `Qwerty${passNums}`,
            repeatPassword: `Qwerty${passNums}`,
        }
    }
}