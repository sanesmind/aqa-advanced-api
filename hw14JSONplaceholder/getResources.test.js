import {expect, describe, test} from '@jest/globals';
import axios from 'axios';
import {API_URL} from "../src/constants/api.js";

describe.skip('getResourceId and getResourceId with userId filter', () => {
    test('getPosts', async () => {
        const apiClient = axios.create({baseURL: API_URL});

        const response = await apiClient.get(`/posts`);
        expect(response.status).toBe(200);
        expect(response.data).toBeInstanceOf(Array);
        expect(response.data[0]).toEqual({
            id: expect.any(Number),
            title: expect.any(String),
            body: expect.any(String),
            userId: expect.any(Number),
        });
    })

    test('getPosts?userId=id', async () => {
        const userId = 1;
        const apiClient = axios.create({baseURL: API_URL});

        const response = await apiClient.get(`/posts`);
        expect(response.status).toBe(200);
        expect(response.data).toBeInstanceOf(Array);
        expect(response.data[0]).toEqual({
            id: expect.any(Number),
            title: expect.any(String),
            body: expect.any(String),
            userId: userId,
        });
    })
})