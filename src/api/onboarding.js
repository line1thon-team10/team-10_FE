import { toCalendar, toOnboarding } from './adapters/onboarding.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getOnboarding = async () => toOnboarding(await http.get(EP.onboarding));
export const postMessage = async (text) =>
  toOnboarding(await http.post(EP.onboardingMessage, { text }));

export const getCalendar = async () => toCalendar(await http.get(EP.calendar));
export const createEvent = async (event) => toCalendar(await http.post(EP.events, event));
export const updateEvent = async ({ id, ...patch }) =>
  toCalendar(await http.patch(`${EP.events}/${id}`, patch));
export const deleteEvent = async (id) => toCalendar(await http.delete(`${EP.events}/${id}`));
export const addEventByVoice = async (text) =>
  toCalendar(await http.post(EP.eventsVoice, { text }));
