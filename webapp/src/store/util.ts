import { ActionTree, ActionContext } from 'vuex';
import { Auth } from '../services';
import router from '../router';
import { AppState } from '../types';
import Vue from 'vue';

/* eslint-disable */
function setErrorMessage (e: any, commit: any) {
  const message = (e.response && e.response.data && e.response.data.message) || e.message;
  commit('setMessage', {
    type: 'error',
    message
  });
}

/**
 * this function is meant to handle all errors thrown from actions, including API errors.
 * It displays the error in a toast message. If the error is an API error with status 401,
 * it redirects to the home page
 * @param error
 * @param context
 */
export function handleActionError (error: any, { commit, dispatch }: ActionContext<AppState, AppState>) {
  if (error.response && error.response.status === 401) {
    const data = error.response.data;
    if (data && /Invalid access token/.test(data.message)) {
      dispatch('clearData');
      Auth.deleteAccessToken();
      router.push({ name: 'sign-in'});
    }
  }
  setErrorMessage(error, commit);
}

/**
 * wraps the specified action function with the error handler.
 * returns an object where the action name is the key and the wrapped function is the value,
 * this allows you to easily inject the action in the state actions object using destructuring
 * @param name
 * @param action
 */
export function wrapAction (name: string, action: (context: ActionContext<AppState, AppState>, args: any) => any) {
  return {
    // tslint:disable-next-line: variable-name
    [name]: async (_context: ActionContext<AppState, AppState>, _args: any) => {
      try {
        await action(_context, _args);
      } catch (e) {
        handleActionError(e, _context);
      }
    }
  };
}

export function wrapActions (actions: ActionTree<AppState, AppState>): ActionTree<AppState, AppState> {
  return Object.keys(actions).reduce((wrappedActions, action) => {
    return {
      ...wrappedActions,
      // @ts-ignore
      ...wrapAction(action, actions[action])
    };
  }, {});
}

export function googleSignOut() {
  // @ts-ignore
  Vue.GoogleAuth.then( (auth2) => {
    auth2.signOut();
    });
}