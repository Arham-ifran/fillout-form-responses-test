// sanitize API input using joi
import Joi from 'joi';
import { defaultLimit, defaultOffset, defaultStatus, defaultSort, minLimit, maxLimit, statusTypes, sortTypes, conditionTypes, demoFormId, demoFormAuth } from '../../config/config.mjs';

// validator to validate API query params and headers
export const validate = async (req, res, next) => {
    const { headers: { authorization }, params: { formId }, query } = req;

    // validate form Id received in params with the demo Form Id
    const formIdErr = await validateFormKey('formId', formId, demoFormId);
    if (formIdErr)
        return res.status(400).send({ success: false, message: formIdErr });

    // validate form auth for Fillout form API key received in headers with the demo Form API Key
    const formAuthErr = await validateFormKey('authorization', authorization, demoFormAuth);
    if (formAuthErr)
        return res.status(400).send({ success: false, message: formAuthErr });

    // validate requested API query params
    const { error: queryParamsErr, query: queryParams } = await validateQueryParams(query);
    if (queryParamsErr)
        return res.status(400).send({ success: false, message: queryParamsErr });

    req.query = queryParams;

    return next();
};

// validate form keys (i.d. Form ID and API Key) for Fillout forms
const validateFormKey = async (key, value, demoValue) => {
    const schema = Joi.object({
        [key]: Joi.string().required().valid(demoValue)
    });

    const { error } = schema.validate({ [key]: value });

    if (error) {
        const message = await getErrorMessage(error);
        return message;
    }
};

// validate request query params
const validateQueryParams = async (query) => {
    const querySchema = Joi.object({
        limit: Joi.number().integer().min(minLimit).max(maxLimit).default(defaultLimit),
        afterDate: Joi.date().iso().optional(),
        beforeDate: Joi.date().iso().optional(),
        offset: Joi.number().integer().default(defaultOffset),
        status: Joi.string().valid(...statusTypes).default(defaultStatus),
        includeEditLink: Joi.boolean().optional(),
        sort: Joi.string().valid(...sortTypes).default(defaultSort),
        filters: Joi.string().optional()
    });

    const { error, value } = querySchema.validate(query);
    if (error) {
        const message = await getErrorMessage(error);
        return { error: message };
    }

    query = value;

    /** 
     * check filters JSON stringified array format
     * on JSON parse, it must have at least one object having id in string, condition can be equals | does_not_equal | greater_than | less_than, and value either in number or string.
    */
    if (query?.filters) {
        const validationResult = await validateFilters(query.filters);
        if (validationResult.error) {
            const message = 'Invalid JSON string for filters. Filters must have JSON stringified array of objects containing at least one object with these properties: id in string, condition can be equals | does_not_equal | greater_than | less_than, and value either in number or string';
            return { error: message };
        }

        // replace JSON stringified with the parsed array
        query.filters = validationResult.value;
    }

    return {
        query
    }
};

// define the filter clause type
const filterClauseType = Joi.object({
    id: Joi.string().required(),
    condition: Joi.string().valid(...conditionTypes).required(),
    value: Joi.alternatives().try(Joi.number(), Joi.string()).required()
});

// define the response filters type
const responseFiltersType = Joi.array().items(filterClauseType).min(1);

// function to validate the filters array
const validateFilters = (filtersString) => {
    try {
        const filters = JSON.parse(filtersString);
        const { error, value } = responseFiltersType.validate(filters);
        if (error) {
            return { error: error.details[0].message };
        } else {
            return { value };
        }
    } catch (err) {
        return { error: 'Invalid JSON string' };
    }
};

// method for destructing error details to get the required error message received from Joi while validating request
const getErrorMessage = (error) => {
    const { details: [{ message: errMsg, context: { key } }] } = error;
    const errPattern = /\"/gi;
    let message = errMsg.replaceAll(errPattern, '');
    switch (key) {
        case 'authorization':
            message = 'Provide demo form API Key in headers as Authorization token e.g. Bearer <DEMO-FORM-API-KEY>';
            break;
        case 'formId':
            message = 'Provide demo form Id in request params';
            break;
        default:
            message = `${message.charAt(0).toUpperCase()}${message.slice(1)}`.replaceAll(/\[|\]/gi, '');
    };
    return message;
};