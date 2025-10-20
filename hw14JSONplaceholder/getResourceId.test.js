import {expect, describe, test} from '@jest/globals';
import axios from 'axios';
import {API_URL} from "../src/constants/api.js";



test('getPostsId', async () => {
   const postsId = 1;
   const apiClient = axios.create({baseURL: API_URL});

   const response = await apiClient.get(`/posts/${postsId}`);
   expect(response.status).toBe(200);
   expect(response.data).toBeInstanceOf(Object);
   expect(response.data).toEqual({
       id: postsId,
       title: expect.any(String),
       body: expect.any(String),
       userId: expect.any(Number),
   });
})
