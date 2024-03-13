import 'dotenv/config';

export const getFilloutFormResponsesUrl = (formId) => `${process.env.FILLOUT_FORM_BASE_URL}forms/${formId}/submissions`;

export const mongoUri = process.env.MONGO_URI;

export const defaultLimit = 150;
export const defaultOffset = 0;
export const defaultStatus = 'finished';
export const defaultSort = 'asc';

export const minLimit = 1;
export const maxLimit = 150;
export const statusTypes = ['in_progress', 'finished'];
export const sortTypes = ['asc', 'desc'];
export const conditionTypes = ['equals', 'does_not_equal', 'greater_than', 'less_than'];

export const demoFormId = process.env.DEMO_FORM_ID;
export const demoFormAuth = `Bearer ${process.env.DEMO_FORM_API_KEY}`;