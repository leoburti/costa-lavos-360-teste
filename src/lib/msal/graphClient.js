import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch'; // Required for the graph client
import { loginRequest } from './msalConfig';

let graphClient;

const getAuthenticatedClient = (msalInstance, account) => {
  if (graphClient) {
    return graphClient;
  }

  graphClient = Client.init({
    authProvider: async (done) => {
      try {
        const tokenRequest = {
          ...loginRequest,
          account: account,
        };
        const response = await msalInstance.acquireTokenSilent(tokenRequest);
        done(null, response.accessToken);
      } catch (error) {
        console.error('Silent token acquisition failed, acquiring token using popup', error);
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          done(null, response.accessToken);
        } catch (popupError) {
          done(popupError, null);
        }
      }
    },
  });

  return graphClient;
};

export const getTaskLists = async (msalInstance, account) => {
  const client = getAuthenticatedClient(msalInstance, account);
  return await client.api('/me/todo/lists').get();
};

export const getTasksInList = async (msalInstance, account, listId) => {
  const client = getAuthenticatedClient(msalInstance, account);
  return await client.api(`/me/todo/lists/${listId}/tasks`).get();
};

export const createTask = async (msalInstance, account, listId, task) => {
  const client = getAuthenticatedClient(msalInstance, account);
  return await client.api(`/me/todo/lists/${listId}/tasks`).post(task);
};

export const updateTask = async (msalInstance, account, listId, taskId, taskUpdate) => {
  const client = getAuthenticatedClient(msalInstance, account);
  return await client.api(`/me/todo/lists/${listId}/tasks/${taskId}`).patch(taskUpdate);
};

export const deleteTask = async (msalInstance, account, listId, taskId) => {
  const client = getAuthenticatedClient(msalInstance, account);
  return await client.api(`/me/todo/lists/${listId}/tasks/${taskId}`).delete();
};