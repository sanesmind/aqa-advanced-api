import {expect, describe, test} from '@jest/globals';
import axios from 'axios';
import {API_URL} from "../src/constants/api.js";

describe('postResource full and partial fill in', () => {
    test('POST resource', async () => {
        const apiClient = axios.create({baseURL: API_URL});
        const requestBody = {
            title: 'foo',
            body: 'bar',
            userId: 1,
        }

        const response = await apiClient.post(`/posts`, requestBody);
        expect(response.status).toBe(201);
        expect(response.data).toBeInstanceOf(Object);
        expect(response.data).toMatchObject({
            ...requestBody
        });
    })

    test('POST resource partial fill in', async () => {
        const apiClient = axios.create({baseURL: API_URL});
        const requestBody = {
            title: 'foo',
            userId: 1,
        }

        const response = await apiClient.post(`/posts`, requestBody);
        expect(response.status).toBe(201);
        expect(response.data).toBeInstanceOf(Object);
        expect(response.data).toMatchObject({
            ...requestBody
        });
    })
})