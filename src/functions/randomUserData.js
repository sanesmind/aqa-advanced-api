export default function randomUserData() {
    const passNums = faker.number.int({min: 200, max: 900})
    return {
        name: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: `Qwerty${passNums}`,
        repeatPassword: `Qwerty${passNums}`,
    }
}